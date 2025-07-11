import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BarModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import '../components/uc-gradient-editor';
import {
  GradientStop,
  generateGradientString,
  createDefaultGradientStops,
} from '../components/uc-gradient-editor';
import { FormUtils } from '../utils/form-utils';

export class UltraBarModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'bar',
    title: 'Bars',
    description: 'Progress bars for values',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:chart-bar',
    category: 'data',
    tags: ['bar', 'progress', 'chart', 'value', 'sensor'],
  };

  createDefault(id?: string): BarModule {
    return {
      id: id || this.generateId('bar'),
      type: 'bar',
      // Basic Configuration
      entity: '',
      name: 'My First Bar',

      // Percentage Calculation
      percentage_type: 'entity',
      percentage_entity: '',

      // Entity Attribute mode
      percentage_attribute_entity: '',
      percentage_attribute_name: '',

      // Difference mode
      percentage_current_entity: '',
      percentage_total_entity: '',

      // Template mode
      percentage_template: '',

      // Bar Appearance
      bar_size: 'medium',
      bar_radius: 'round',
      bar_style: 'flat',
      bar_width: 100,
      bar_alignment: 'center',
      height: 20,
      border_radius: 10,

      // Text Display
      label_alignment: 'space-between',
      show_percentage: true,
      percentage_text_size: 14,
      show_value: true,
      value_position: 'inside',

      // Left Side Configuration
      left_title: '',
      left_entity: '',
      left_condition_type: 'none',
      left_condition_entity: '',
      left_condition_state: '',
      left_template_mode: false,
      left_template: '',
      left_title_size: 14,
      left_value_size: 14,
      left_title_color: 'var(--primary-text-color)',
      left_value_color: 'var(--primary-text-color)',
      left_enabled: false,

      // Right Side Configuration
      right_title: '',
      right_entity: '',
      right_enabled: false,
      right_condition_type: 'none',
      right_condition_entity: '',
      right_condition_state: '',
      right_template_mode: false,
      right_template: '',
      right_title_size: 14,
      right_value_size: 14,
      right_title_color: 'var(--primary-text-color)',
      right_value_color: 'var(--primary-text-color)',

      // Colors
      bar_color: 'var(--primary-color)',
      bar_background_color: 'var(--secondary-background-color)',
      bar_border_color: 'var(--divider-color)',
      percentage_text_color: 'var(--primary-text-color)',

      // Gradient Configuration
      use_gradient: false,
      gradient_display_mode: 'cropped',
      gradient_stops: createDefaultGradientStops(),

      // Limit Indicator
      limit_entity: '',
      limit_color: 'var(--warning-color)',

      // Animation & Templates
      animation: true,
      template_mode: false,
      template: '',
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const barModule = module as BarModule;

    return html`
      ${FormUtils.injectCleanFormStyles()}
      <div class="module-general-settings">
        <!-- Bar Settings (consolidated) -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Bar Settings
          </div>

          <!-- Bar Name -->
          ${FormUtils.renderField(
            'Bar Name',
            'Give this bar a custom name to make it easier to identify in the editor and arrangement views.',
            hass,
            { name: barModule.name || '' },
            [FormUtils.createSchemaItem('name', { text: {} })],
            (e: CustomEvent) => updateModule({ name: e.detail.value.name })
          )}

          <!-- Percentage Calculation -->
          <div style="margin-top: 24px;">
            ${FormUtils.renderField(
              'Percentage Calculation',
              "Configure how the bar's percentage fill level is calculated using one of the options below.",
              hass,
              { percentage_type: barModule.percentage_type || 'entity' },
              [
                FormUtils.createSchemaItem('percentage_type', {
                  select: {
                    options: [
                      { value: 'entity', label: 'Entity (0-100)' },
                      { value: 'attribute', label: 'Entity Attribute' },
                      { value: 'difference', label: 'Difference' },
                      { value: 'template', label: 'Template' },
                    ],
                    mode: 'dropdown',
                  },
                }),
              ],
              (e: CustomEvent) => updateModule({ percentage_type: e.detail.value.percentage_type })
            )}
          </div>

          <!-- Entity Attribute Fields -->
          ${barModule.percentage_type === 'attribute'
            ? this.renderConditionalFieldsGroup(
                'Entity Attribute Configuration',
                html`
                  ${FormUtils.renderField(
                    'Attribute Entity',
                    'Select the entity that contains the attribute with the percentage value.',
                    hass,
                    {
                      percentage_attribute_entity: barModule.percentage_attribute_entity || '',
                    },
                    [FormUtils.createSchemaItem('percentage_attribute_entity', { entity: {} })],
                    (e: CustomEvent) =>
                      updateModule({
                        percentage_attribute_entity: e.detail.value.percentage_attribute_entity,
                      })
                  )}

                  <div style="margin-top: 16px;">
                    ${FormUtils.renderField(
                      'Attribute Name',
                      'Enter the name of the attribute that contains the percentage value (e.g., "battery_level").',
                      hass,
                      {
                        percentage_attribute_name: barModule.percentage_attribute_name || '',
                      },
                      [FormUtils.createSchemaItem('percentage_attribute_name', { text: {} })],
                      (e: CustomEvent) =>
                        updateModule({
                          percentage_attribute_name: e.detail.value.percentage_attribute_name,
                        })
                    )}
                  </div>
                `
              )
            : ''}

          <!-- Difference Fields -->
          ${barModule.percentage_type === 'difference'
            ? this.renderConditionalFieldsGroup(
                'Difference Calculation Configuration',
                html`
                  ${FormUtils.renderField(
                    'Current Value Entity',
                    'Entity representing the current/used amount (e.g., fuel used, battery consumed).',
                    hass,
                    {
                      percentage_current_entity: barModule.percentage_current_entity || '',
                    },
                    [FormUtils.createSchemaItem('percentage_current_entity', { entity: {} })],
                    (e: CustomEvent) =>
                      updateModule({
                        percentage_current_entity: e.detail.value.percentage_current_entity,
                      })
                  )}

                  <div style="margin-top: 16px;">
                    ${FormUtils.renderField(
                      'Total Value Entity',
                      'Entity representing the total/maximum amount (e.g., fuel capacity, battery capacity).',
                      hass,
                      { percentage_total_entity: barModule.percentage_total_entity || '' },
                      [FormUtils.createSchemaItem('percentage_total_entity', { entity: {} })],
                      (e: CustomEvent) =>
                        updateModule({
                          percentage_total_entity: e.detail.value.percentage_total_entity,
                        })
                    )}
                  </div>
                `
              )
            : ''}

          <!-- Template Field -->
          ${barModule.percentage_type === 'template'
            ? this.renderConditionalFieldsGroup(
                'Template Configuration',
                html`
                  ${FormUtils.renderField(
                    'Percentage Template',
                    "Enter a Jinja2 template that returns a number between 0-100 for the percentage. Example: {{ (states('sensor.battery_level') | float) * 100 }}",
                    hass,
                    { percentage_template: barModule.percentage_template || '' },
                    [
                      FormUtils.createSchemaItem('percentage_template', {
                        text: {
                          multiline: true,
                          type: 'text',
                        },
                      }),
                    ],
                    (e: CustomEvent) =>
                      updateModule({ percentage_template: e.detail.value.percentage_template })
                  )}
                `
              )
            : ''}

          <!-- Bar Percentage Entity -->
          <div style="margin-top: 24px;">
            ${FormUtils.renderField(
              'Bar Percentage Entity',
              'Select the entity that provides the percentage value for the bar.',
              hass,
              { entity: barModule.entity || '' },
              [FormUtils.createSchemaItem('entity', { entity: {} })],
              (e: CustomEvent) => updateModule({ entity: e.detail.value.entity })
            )}
          </div>

          <!-- Limit Value Entity -->
          <div style="margin-top: 24px;">
            ${FormUtils.renderField(
              'Limit Value Entity (optional)',
              'Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).',
              hass,
              { limit_entity: barModule.limit_entity || '' },
              [FormUtils.createSchemaItem('limit_entity', { entity: {} })],
              (e: CustomEvent) => updateModule({ limit_entity: e.detail.value.limit_entity })
            )}
          </div>
        </div>

        <!-- Bar Appearance Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Bar Appearance
          </div>

          <!-- Bar Size -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Bar Size',
              'Adjust the thickness of the progress bar.',
              hass,
              { height: barModule.height || 20 },
              [
                FormUtils.createSchemaItem('height', {
                  number: { min: 8, max: 60, step: 2, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ height: e.detail.value.height })
            )}
          </div>

          <!-- Border Radius -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Border Radius',
              'Control the rounded corners of the bar.',
              hass,
              { border_radius: barModule.border_radius || 10 },
              [
                FormUtils.createSchemaItem('border_radius', {
                  number: { min: 0, max: 50, step: 1, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ border_radius: e.detail.value.border_radius })
            )}
          </div>

          <!-- Bar Style -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Bar Style',
              'Choose the visual style of the progress bar.',
              hass,
              { bar_style: barModule.bar_style || 'flat' },
              [
                FormUtils.createSchemaItem('bar_style', {
                  select: {
                    options: [
                      { value: 'flat', label: 'Flat' },
                      { value: 'raised', label: 'Raised' },
                      { value: 'inset', label: 'Inset' },
                    ],
                    mode: 'dropdown',
                  },
                }),
              ],
              (e: CustomEvent) => updateModule({ bar_style: e.detail.value.bar_style })
            )}
          </div>

          <!-- Bar Width -->
          <div class="field-group" style="margin-bottom: 16px;">
            ${FormUtils.renderField(
              'Bar Width',
              'Set the width of the bar as a percentage of the container.',
              hass,
              { bar_width: barModule.bar_width || 100 },
              [
                FormUtils.createSchemaItem('bar_width', {
                  number: { min: 10, max: 100, step: 5, mode: 'slider' },
                }),
              ],
              (e: CustomEvent) => updateModule({ bar_width: e.detail.value.bar_width })
            )}
          </div>

          <!-- Bar Alignment with Icons -->
          ${(barModule.bar_width || 100) < 100
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Bar Alignment
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Choose how to align the bar when it's less than 100% width.
                  </div>
                  <div style="display: flex; gap: 8px; justify-content: flex-start;">
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                        'center') === 'left'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                        'center') === 'left'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(barModule.bar_alignment || 'center') === 'left'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${() => updateModule({ bar_alignment: 'left' })}
                    >
                      <ha-icon icon="mdi:format-align-left" style="font-size: 16px;"></ha-icon>
                      Left
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                        'center') === 'center'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                        'center') === 'center'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(barModule.bar_alignment || 'center') ===
                      'center'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${() => updateModule({ bar_alignment: 'center' })}
                    >
                      <ha-icon icon="mdi:format-align-center" style="font-size: 16px;"></ha-icon>
                      Center
                    </button>
                    <button
                      type="button"
                      style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                        'center') === 'right'
                        ? 'var(--primary-color)'
                        : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                        'center') === 'right'
                        ? 'var(--primary-color)'
                        : 'transparent'}; color: ${(barModule.bar_alignment || 'center') === 'right'
                        ? 'white'
                        : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      @click=${() => updateModule({ bar_alignment: 'right' })}
                    >
                      <ha-icon icon="mdi:format-align-right" style="font-size: 16px;"></ha-icon>
                      Right
                    </button>
                  </div>
                </div>
              `
            : ''}

          <!-- Label Alignment -->
          <div class="field-group">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              Label Alignment
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              Control how the left and right side labels are positioned.
            </div>
            <ha-form
              .hass=${hass}
              .data=${{ label_alignment: barModule.label_alignment || 'space-between' }}
              .schema=${[
                {
                  name: 'label_alignment',
                  selector: {
                    select: {
                      options: [
                        { value: 'left', label: 'Left' },
                        { value: 'center', label: 'Center' },
                        { value: 'right', label: 'Right' },
                        { value: 'space-between', label: 'Space Between' },
                      ],
                      mode: 'dropdown',
                    },
                  },
                  label: '',
                },
              ]}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ label_alignment: e.detail.value.label_alignment })}
            ></ha-form>
          </div>
        </div>

        <!-- Percentage Text Display Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Percentage Text Display
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            Control the visibility and appearance of percentage values shown directly on the bar.
            These numbers provide a clear visual indicator of the current level.
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              Show Percentage
            </div>
            <ha-form
              .hass=${hass}
              .data=${{ show_percentage: barModule.show_percentage !== false }}
              .schema=${[{ name: 'show_percentage', selector: { boolean: {} }, label: '' }]}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ show_percentage: e.detail.value.show_percentage })}
            ></ha-form>
          </div>

          ${barModule.show_percentage !== false
            ? html`
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Text Size
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Adjust the size of the percentage text displayed on the bar.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ percentage_text_size: barModule.percentage_text_size || 14 }}
                    .schema=${[
                      {
                        name: 'percentage_text_size',
                        selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ percentage_text_size: e.detail.value.percentage_text_size })}
                  ></ha-form>
                </div>
              `
            : ''}
        </div>

        <!-- Left Side Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Left Side
            </div>
            <ha-form
              .hass=${hass}
              .data=${{ enable_left: barModule.left_enabled || false }}
              .schema=${[{ name: 'enable_left', selector: { boolean: {} }, label: '' }]}
              @value-changed=${(e: CustomEvent) => {
                if (e.detail.value.enable_left) {
                  updateModule({
                    left_enabled: true,
                    left_title: barModule.left_title || 'Fuel',
                    left_entity: barModule.left_entity || '',
                    left_template_mode: barModule.left_template_mode || false,
                    left_title_size: barModule.left_title_size || 14,
                    left_value_size: barModule.left_value_size || 14,
                    left_title_color: barModule.left_title_color || 'var(--primary-text-color)',
                    left_value_color: barModule.left_value_color || 'var(--primary-text-color)',
                  });
                } else {
                  updateModule({
                    left_enabled: false,
                    left_title: '',
                    left_entity: '',
                    left_template_mode: false,
                    left_template: '',
                  });
                }
              }}
            ></ha-form>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            Configure the title and entity value displayed on the left side of the bar. This is
            useful for showing labels like 'Range' or 'Battery' along with their values.
          </div>

          ${barModule.left_enabled
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Left Title
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ left_title: barModule.left_title || '' }}
                    .schema=${[{ name: 'left_title', selector: { text: {} }, label: '' }]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ left_title: e.detail.value.left_title })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Left Entity
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ left_entity: barModule.left_entity || '' }}
                    .schema=${[{ name: 'left_entity', selector: { entity: {} }, label: '' }]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ left_entity: e.detail.value.left_entity })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Template Mode
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Use a template to format the displayed text, convert units, or display
                    calculated values.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ left_template_mode: barModule.left_template_mode || false }}
                    .schema=${[
                      { name: 'left_template_mode', selector: { boolean: {} }, label: '' },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ left_template_mode: e.detail.value.left_template_mode })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Title Size
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ left_title_size: barModule.left_title_size || 14 }}
                    .schema=${[
                      {
                        name: 'left_title_size',
                        selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ left_title_size: e.detail.value.left_title_size })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Value Size
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ left_value_size: barModule.left_value_size || 14 }}
                    .schema=${[
                      {
                        name: 'left_value_size',
                        selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ left_value_size: e.detail.value.left_value_size })}
                  ></ha-form>
                </div>
              `
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure left side settings
                </div>
              `}
        </div>

        <!-- Right Side Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 0; border-bottom: none;"
          >
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); letter-spacing: 0.5px;"
            >
              Right Side
            </div>
            <ha-form
              .hass=${hass}
              .data=${{ enable_right: barModule.right_enabled || false }}
              .schema=${[{ name: 'enable_right', selector: { boolean: {} }, label: '' }]}
              @value-changed=${(e: CustomEvent) => {
                if (e.detail.value.enable_right) {
                  updateModule({
                    right_enabled: true,
                    right_title: barModule.right_title || 'Range',
                    right_entity: barModule.right_entity || '',
                    right_template_mode: barModule.right_template_mode || false,
                    right_title_size: barModule.right_title_size || 14,
                    right_value_size: barModule.right_value_size || 14,
                    right_title_color: barModule.right_title_color || 'var(--primary-text-color)',
                    right_value_color: barModule.right_value_color || 'var(--primary-text-color)',
                  });
                } else {
                  updateModule({
                    right_enabled: false,
                    right_title: '',
                    right_entity: '',
                    right_template_mode: false,
                    right_template: '',
                  });
                }
              }}
            ></ha-form>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            Configure the title and entity value displayed on the right side of the bar. This is
            ideal for complementary information like 'Time to Full' or secondary measurements.
          </div>

          ${barModule.right_enabled
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Right Title
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ right_title: barModule.right_title || '' }}
                    .schema=${[{ name: 'right_title', selector: { text: {} }, label: '' }]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ right_title: e.detail.value.right_title })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Right Entity
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ right_entity: barModule.right_entity || '' }}
                    .schema=${[{ name: 'right_entity', selector: { entity: {} }, label: '' }]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ right_entity: e.detail.value.right_entity })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Template Mode
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                  >
                    Use a template to format the displayed text, convert units, or display
                    calculated values.
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ right_template_mode: barModule.right_template_mode || false }}
                    .schema=${[
                      { name: 'right_template_mode', selector: { boolean: {} }, label: '' },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ right_template_mode: e.detail.value.right_template_mode })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Title Size
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ right_title_size: barModule.right_title_size || 14 }}
                    .schema=${[
                      {
                        name: 'right_title_size',
                        selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ right_title_size: e.detail.value.right_title_size })}
                  ></ha-form>
                </div>

                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important;"
                  >
                    Value Size
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ right_value_size: barModule.right_value_size || 14 }}
                    .schema=${[
                      {
                        name: 'right_value_size',
                        selector: { number: { min: 8, max: 32, step: 1, mode: 'slider' } },
                        label: '',
                      },
                    ]}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ right_value_size: e.detail.value.right_value_size })}
                  ></ha-form>
                </div>
              `
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  Enable the toggle above to configure right side settings
                </div>
              `}
        </div>

        <!-- Colors Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Colors
          </div>

          <!-- Bar Colors -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              Bar Colors
            </div>
            <div
              class="colors-grid"
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;"
            >
              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Bar Color
                </div>
                <ultra-color-picker
                  .value=${barModule.bar_color || ''}
                  .defaultValue=${'var(--primary-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => updateModule({ bar_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Background Color
                </div>
                <ultra-color-picker
                  .value=${barModule.bar_background_color || ''}
                  .defaultValue=${'var(--secondary-background-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ bar_background_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Border Color
                </div>
                <ultra-color-picker
                  .value=${barModule.bar_border_color || ''}
                  .defaultValue=${'var(--divider-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ bar_border_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Limit Indicator
                </div>
                <ultra-color-picker
                  .value=${barModule.limit_color || ''}
                  .defaultValue=${'var(--warning-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ limit_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  Percentage Text
                </div>
                <ultra-color-picker
                  .value=${barModule.percentage_text_color || ''}
                  .defaultValue=${'var(--primary-text-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ percentage_text_color: e.detail.value })}
                ></ultra-color-picker>
              </div>
            </div>
          </div>

          <!-- Left Side Colors -->
          ${barModule.left_enabled
            ? html`
                <div class="field-group" style="margin-bottom: 24px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    Left Side Colors
                  </div>
                  <div
                    class="colors-grid"
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
                  >
                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Title Color
                      </div>
                      <ultra-color-picker
                        .value=${barModule.left_title_color || ''}
                        .defaultValue=${'var(--primary-text-color)'}
                        .hass=${hass}
                        @value-changed=${(e: CustomEvent) =>
                          updateModule({ left_title_color: e.detail.value })}
                      ></ultra-color-picker>
                    </div>

                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Value Color
                      </div>
                      <ultra-color-picker
                        .value=${barModule.left_value_color || ''}
                        .defaultValue=${'var(--primary-text-color)'}
                        .hass=${hass}
                        @value-changed=${(e: CustomEvent) =>
                          updateModule({ left_value_color: e.detail.value })}
                      ></ultra-color-picker>
                    </div>
                  </div>
                </div>
              `
            : ''}

          <!-- Right Side Colors -->
          ${barModule.right_enabled
            ? html`
                <div class="field-group">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    Right Side Colors
                  </div>
                  <div
                    class="colors-grid"
                    style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
                  >
                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Title Color
                      </div>
                      <ultra-color-picker
                        .value=${barModule.right_title_color || ''}
                        .defaultValue=${'var(--primary-text-color)'}
                        .hass=${hass}
                        @value-changed=${(e: CustomEvent) =>
                          updateModule({ right_title_color: e.detail.value })}
                      ></ultra-color-picker>
                    </div>

                    <div class="color-item">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        Value Color
                      </div>
                      <ultra-color-picker
                        .value=${barModule.right_value_color || ''}
                        .defaultValue=${'var(--primary-text-color)'}
                        .hass=${hass}
                        @value-changed=${(e: CustomEvent) =>
                          updateModule({ right_value_color: e.detail.value })}
                      ></ultra-color-picker>
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Gradient Mode -->
        <div class="settings-section" style="margin-bottom: 0;">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            Gradient Mode
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important;"
          >
            Create beautiful color transitions across your progress bars. Ideal for showing battery
            levels, fuel gauges, or any status indicator requiring visual emphasis.
          </div>

          <div class="field-title" style="font-size: 16px !important; font-weight: 600 !important;">
            Use Gradient
          </div>
          <ha-form
            .hass=${hass}
            .data=${{ use_gradient: barModule.use_gradient || false }}
            .schema=${[
              {
                name: 'use_gradient',
                selector: { boolean: {} },
                label: '',
              },
            ]}
            @value-changed=${(e: CustomEvent) =>
              updateModule({ use_gradient: e.detail.value.use_gradient })}
          ></ha-form>

          ${barModule.use_gradient
            ? html`
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Gradient Display Mode
                </div>
                <ha-form
                  .hass=${hass}
                  .data=${{ gradient_display_mode: barModule.gradient_display_mode || 'cropped' }}
                  .schema=${[
                    {
                      name: 'gradient_display_mode',
                      selector: {
                        select: {
                          options: [
                            { value: 'full', label: 'Full' },
                            { value: 'cropped', label: 'Cropped' },
                          ],
                          mode: 'dropdown',
                        },
                      },
                      label: '',
                    },
                  ]}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ gradient_display_mode: e.detail.value.gradient_display_mode })}
                ></ha-form>

                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important;"
                >
                  Gradient Editor
                </div>
                <uc-gradient-editor
                  .stops=${barModule.gradient_stops || createDefaultGradientStops()}
                  .barSize=${this.getBarSizeFromHeight(barModule.height || 20)}
                  .barRadius=${this.getBarRadiusFromStyle(barModule.border_radius || 10)}
                  .barStyle=${barModule.bar_style || 'flat'}
                  @gradient-changed=${(e: CustomEvent) => {
                    updateModule({ gradient_stops: e.detail.stops });
                  }}
                ></uc-gradient-editor>
              `
            : ''}
        </div>
      </div>
    `;
  }

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const barModule = module as BarModule;

    // Get entity value for main bar
    const entityState = hass?.states[barModule.entity];
    let value = 0;
    let maxValue = 100;
    let unit = '';

    if (entityState) {
      value = parseFloat(entityState.state) || 0;
      unit = entityState.attributes?.unit_of_measurement || '';

      // Try to determine max value from attributes
      if (entityState.attributes?.max) {
        maxValue = parseFloat(entityState.attributes.max);
      } else if (unit === '%') {
        maxValue = 100;
      } else if (entityState.attributes?.device_class === 'battery') {
        maxValue = 100;
      }
    }

    const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

    // Get left side values
    let leftValue = '';
    let leftUnit = '';
    if (barModule.left_entity && hass?.states[barModule.left_entity]) {
      const leftState = hass.states[barModule.left_entity];
      leftValue = leftState.state;
      leftUnit = leftState.attributes?.unit_of_measurement || '';
    }

    // Get right side values
    let rightValue = '';
    let rightUnit = '';
    if (barModule.right_entity && hass?.states[barModule.right_entity]) {
      const rightState = hass.states[barModule.right_entity];
      rightValue = rightState.state;
      rightUnit = rightState.attributes?.unit_of_measurement || '';
    }

    // Get limit indicator value and percentage
    let limitPercentage = 0;
    if (barModule.limit_entity && hass?.states[barModule.limit_entity]) {
      const limitState = hass.states[barModule.limit_entity];
      const limitValue = parseFloat(limitState.state) || 0;
      limitPercentage = Math.min(Math.max((limitValue / maxValue) * 100, 0), 100);
    }

    // Apply design properties with priority - design tab overrides module-specific properties
    const moduleWithDesign = barModule as any;

    // Calculate bar height from height property
    const barHeight = barModule.height || 20;

    // Calculate border radius from border_radius property
    const borderRadius = barModule.border_radius || 10;

    // Generate gradient or solid color for bar fill
    let barFillBackground = barModule.bar_color || 'var(--primary-color)';
    let barBackgroundGradient = '';

    if (barModule.use_gradient && barModule.gradient_stops && barModule.gradient_stops.length > 0) {
      const gradientString = generateGradientString(barModule.gradient_stops);

      if (barModule.gradient_display_mode === 'full') {
        // Full mode: Show entire gradient in background, filled portion shows same gradient
        barBackgroundGradient = `linear-gradient(to right, ${gradientString})`;
        barFillBackground = `linear-gradient(to right, ${gradientString})`;
      } else {
        // Cropped mode: Only show gradient portion that corresponds to current value
        const sortedStops = [...barModule.gradient_stops].sort((a, b) => a.position - b.position);
        const currentStops = sortedStops
          .filter(stop => stop.position <= percentage)
          .map((stop, index, array) => {
            // Adjust positions to fit within the filled area
            const adjustedPosition = array.length === 1 ? 0 : (stop.position / percentage) * 100;
            return `${stop.color} ${Math.min(adjustedPosition, 100)}%`;
          });

        if (currentStops.length > 0) {
          barFillBackground = `linear-gradient(to right, ${currentStops.join(', ')})`;
        }
      }
    }

    // Apply comprehensive bar style effects
    let barStyleCSS = '';
    let fillStyleCSS = '';

    switch (barModule.bar_style) {
      case 'flat':
        barStyleCSS = `box-shadow: none;`;
        break;
      case 'glossy':
        fillStyleCSS = `
          background: linear-gradient(to bottom, ${barFillBackground}, ${barFillBackground} 50%, rgba(0,0,0,0.1) 51%, ${barFillBackground});
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        `;
        break;
      case 'embossed':
        barStyleCSS = `
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.8);
          border: 1px solid rgba(0,0,0,0.1);
        `;
        fillStyleCSS = `
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1);
        `;
        break;
      case 'inset':
        barStyleCSS = `
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.2);
        `;
        break;
      case 'gradient-overlay':
        fillStyleCSS = `
          background: linear-gradient(to bottom, 
            ${barFillBackground} 0%, 
            rgba(255,255,255,0) 100%
          );
        `;
        break;
      case 'neon-glow':
        fillStyleCSS = `
          box-shadow: 0 0 10px ${barFillBackground}, 0 0 20px ${barFillBackground}, 0 0 30px ${barFillBackground};
          filter: brightness(1.2);
        `;
        barStyleCSS = `
          box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
        `;
        break;
      case 'outline':
        barStyleCSS = `
          border: 2px solid ${barModule.bar_border_color || 'var(--primary-color)'};
          background-color: transparent !important;
        `;
        fillStyleCSS = `
          border: 2px solid ${barFillBackground};
          background-color: transparent !important;
        `;
        break;
      case 'glass':
        barStyleCSS = `
          backdrop-filter: blur(10px);
          background-color: rgba(255,255,255,0.1) !important;
          border: 1px solid rgba(255,255,255,0.2);
        `;
        fillStyleCSS = `
          backdrop-filter: blur(5px);
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) !important;
        `;
        break;
      case 'metallic':
        fillStyleCSS = `
          background: linear-gradient(to bottom, 
            rgba(255,255,255,0.4) 0%, 
            ${barFillBackground} 20%, 
            ${barFillBackground} 80%, 
            rgba(0,0,0,0.2) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);
        `;
        break;
      case 'neumorphic':
        barStyleCSS = `
          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.1);
        `;
        fillStyleCSS = `
          box-shadow: 2px 2px 4px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.1);
        `;
        break;
      case 'dashed':
        fillStyleCSS = `
          background-image: repeating-linear-gradient(
            90deg,
            ${barFillBackground} 0px,
            ${barFillBackground} 8px,
            transparent 8px,
            transparent 12px
          );
        `;
        break;
    }

    const containerStyles = {
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '16px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '16px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '16px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '16px'}`
          : '16px',
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${this.addPixelUnit(moduleWithDesign.margin_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '16px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`
          : '0 0 16px 0',
      background: moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(moduleWithDesign, hass),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius: this.addPixelUnit(moduleWithDesign.border_radius) || '0',
      position: moduleWithDesign.position || 'relative',
      top: moduleWithDesign.top || 'auto',
      bottom: moduleWithDesign.bottom || 'auto',
      left: moduleWithDesign.left || 'auto',
      right: moduleWithDesign.right || 'auto',
      zIndex: moduleWithDesign.z_index || 'auto',
      width: moduleWithDesign.width || '100%',
      height: moduleWithDesign.height || 'auto',
      maxWidth: moduleWithDesign.max_width || '100%',
      maxHeight: moduleWithDesign.max_height || 'none',
      minWidth: moduleWithDesign.min_width || 'none',
      minHeight: moduleWithDesign.min_height || 'auto',
      clipPath: moduleWithDesign.clip_path || 'none',
      backdropFilter: moduleWithDesign.backdrop_filter || 'none',
      boxSizing: 'border-box',
    };

    // Calculate bar container alignment and width
    const barWidth = `${barModule.bar_width || 100}%`;
    let barContainerAlignment = 'flex-start';
    switch (barModule.bar_alignment) {
      case 'left':
        barContainerAlignment = 'flex-start';
        break;
      case 'center':
        barContainerAlignment = 'center';
        break;
      case 'right':
        barContainerAlignment = 'flex-end';
        break;
    }

    return html`
      <div class="bar-module-preview" style=${this.styleObjectToCss(containerStyles)}>
        ${barModule.name
          ? html`<div
              class="bar-name"
              style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; display: block;"
            >
              ${barModule.name}
            </div>`
          : ''}

        <!-- Bar Container -->
        <div style="display: flex; justify-content: ${barContainerAlignment}; width: 100%;">
          <div
            class="bar-container"
            style="
              width: ${barWidth}; 
              height: ${barHeight}px; 
              background: ${barBackgroundGradient ||
            barModule.bar_background_color ||
            'var(--secondary-background-color)'};
              border-radius: ${borderRadius}px;
              overflow: hidden;
              position: relative;
              transition: ${barModule.animation !== false ? 'all 0.3s ease' : 'none'};
              border: ${barModule.bar_border_color && barModule.bar_style !== 'outline'
              ? `1px solid ${barModule.bar_border_color}`
              : 'none'};
              ${barStyleCSS}
            "
          >
            <!-- Bar Fill -->
            <div
              class="bar-fill"
              style="
                width: ${percentage}%;
                height: 100%;
                background: ${barFillBackground};
                transition: ${barModule.animation !== false ? 'width 0.3s ease' : 'none'};
                border-radius: ${borderRadius}px;
                position: relative;
                ${fillStyleCSS}
              "
            ></div>

            <!-- Limit Indicator -->
            ${barModule.limit_entity && hass?.states[barModule.limit_entity] && limitPercentage >= 0
              ? html`
                  <div
                    class="bar-limit-line"
                    style="
                    position: absolute; 
                    top: 0; 
                    bottom: 0; 
                    left: ${limitPercentage}%; 
                    width: 2px; 
                    background-color: ${barModule.limit_color || 'var(--warning-color)'}; 
                    z-index: 5; 
                    transform: translateX(-50%);
                  "
                    title="Limit: ${hass.states[barModule.limit_entity]?.state || 'N/A'}${hass
                      .states[barModule.limit_entity]?.attributes?.unit_of_measurement || ''}"
                  ></div>
                `
              : ''}

            <!-- Percentage Text (Inside Bar) -->
            ${barModule.show_percentage
              ? html`
                  <div
                    class="percentage-text"
                    style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: ${barModule.percentage_text_size || 14}px;
                    color: ${barModule.percentage_text_color || 'white'};
                    font-weight: 600;
                    z-index: 10;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                    white-space: nowrap;
                  "
                  >
                    ${Math.round(percentage)}%
                  </div>
                `
              : ''}
          </div>

          ${!entityState && barModule.entity
            ? html`
                <div
                  class="entity-error"
                  style="color: var(--error-color); font-size: 12px; margin-top: 4px;"
                >
                  Entity not found: ${barModule.entity}
                </div>
              `
            : ''}
        </div>

        <!-- Left and Right Side Labels (Below Bar) -->
        ${barModule.left_enabled || barModule.right_enabled
          ? html`
              <div
                class="bar-labels-below"
                style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; gap: 16px;"
              >
                ${barModule.left_enabled
                  ? html`
                      <div class="left-side-below" style="text-align: left;">
                        <span
                          style="font-size: ${barModule.left_title_size ||
                          14}px; color: ${barModule.left_title_color ||
                          'var(--primary-text-color)'};"
                        >
                          ${barModule.left_title}:
                        </span>
                        <span
                          style="font-size: ${barModule.left_value_size ||
                          14}px; font-weight: 600; color: ${barModule.left_value_color ||
                          'var(--primary-text-color)'}; margin-left: 4px;"
                        >
                          ${leftValue}${leftUnit}
                        </span>
                      </div>
                    `
                  : html`<div></div>`}
                ${barModule.right_enabled
                  ? html`
                      <div class="right-side-below" style="text-align: right;">
                        <span
                          style="font-size: ${barModule.right_title_size ||
                          14}px; color: ${barModule.right_title_color ||
                          'var(--primary-text-color)'};"
                        >
                          ${barModule.right_title}:
                        </span>
                        <span
                          style="font-size: ${barModule.right_value_size ||
                          14}px; font-weight: 600; color: ${barModule.right_value_color ||
                          'var(--primary-text-color)'}; margin-left: 4px;"
                        >
                          ${rightValue}${rightUnit}
                        </span>
                      </div>
                    `
                  : html`<div></div>`}
              </div>
            `
          : ''}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const barModule = module as BarModule;
    const errors = [...baseValidation.errors];

    if (!barModule.entity || barModule.entity.trim() === '') {
      errors.push('Entity ID is required');
    }

    if (barModule.height && (barModule.height < 5 || barModule.height > 200)) {
      errors.push('Bar height must be between 5 and 200 pixels');
    }

    if (barModule.border_radius && (barModule.border_radius < 0 || barModule.border_radius > 100)) {
      errors.push('Border radius must be between 0 and 100 pixels');
    }

    // Validate limit entity if provided
    if (barModule.limit_entity && barModule.limit_entity.trim() !== '') {
      // Basic entity ID format validation
      if (!barModule.limit_entity.includes('.')) {
        errors.push('Limit entity must be a valid entity ID (e.g., sensor.battery_limit)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .bar-module-preview {
        max-width: 100%;
        overflow: hidden;
        box-sizing: border-box;
      }
      
      .bar-container {
        width: 100%;
        position: relative;
        display: block;
        box-sizing: border-box;
      }
      
      .bar-fill {
        position: relative;
        z-index: 1;
      }
      
      .bar-limit-line {
        opacity: 0.9;
        transition: opacity 0.2s ease;
      }
      
      .bar-limit-line:hover {
        opacity: 1;
      }
      
      .bar-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 8px;
        user-select: none;
        word-wrap: break-word;
      }
      
      .bar-value {
        user-select: none;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .bar-value-outside {
        user-select: none;
        text-align: center;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      
      .entity-error {
        font-size: 12px;
        color: var(--error-color);
        margin-top: 6px;
        font-style: italic;
        opacity: 0.8;
      }
      
      .settings-section {
        margin-bottom: 16px;
        max-width: 100%;
        box-sizing: border-box;
      }
      
      .settings-section * {
        box-sizing: border-box;
      }
      
      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        margin-bottom: 12px !important;
        padding-bottom: 0 !important;
        border-bottom: none !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      
      .settings-section label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }
      
      .settings-section input,
      .settings-section select {
        width: 100%;
        max-width: 100%;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }
      
      .settings-section .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
      
      .settings-section .checkbox-wrapper input[type="checkbox"] {
        width: auto;
        margin: 0;
      }
      
      .help-text {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 4px 0 0 0;
        opacity: 0.8;
        word-wrap: break-word;
      }
      
      .number-input,
      .text-input,
      .entity-input,
      .select-input {
        transition: border-color 0.2s ease;
      }
      
      .number-input:focus,
      .text-input:focus,
      .entity-input:focus,
      .select-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }
      
      /* Fix padding overflow */
      .module-general-settings {
        max-width: 100%;
        overflow: hidden;
      }
      
      .module-general-settings > * {
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Conditional Fields Grouping CSS */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
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

      /* Proper form field arrangement: Title -> Description -> Field */
      .settings-section ha-form {
        --ha-form-field-margin: 8px 0;
      }

      .settings-section ha-form::part(field) {
        margin-bottom: 8px;
      }

      .settings-section ha-form .ha-form-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
        display: block;
      }

      .settings-section ha-form .ha-form-description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-bottom: 8px;
        display: block;
        opacity: 0.8;
        line-height: 1.4;
      }

      .settings-section ha-form mwc-formfield {
        --mdc-typography-body2-font-size: 14px;
      }

      .settings-section ha-form ha-switch {
        --switch-checked-color: var(--primary-color);
        --switch-unchecked-color: var(--disabled-color);
      }

      /* Field arrangement styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--primary-text-color) !important;
        margin-bottom: 4px !important;
        padding-bottom: 0 !important;
        border-bottom: none !important;
        display: block !important;
        line-height: 1.2 !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        display: block !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
        font-weight: 400 !important;
      }

      /* Remove labels from ultra-color-picker when using external titles */
      .settings-section ultra-color-picker .color-label {
        display: none;
      }

      /* Prevent form fields from going off screen */
      .property-input, .property-select {
        max-width: 500px;
      }

      /* Apply max-width to ha-form elements */
      .settings-section ha-form {
        max-width: 500px;
      }

      /* Apply max-width to form inputs and selects */
      .settings-section input,
      .settings-section select,
      .settings-section ha-textfield,
      .settings-section ha-select {
        max-width: 500px;
      }

      /* Fix slider and input field layouts */
      .settings-section .field-group {
        max-width: 100%;
        overflow: visible;
      }

      /* Ensure slider containers don't get cut off */
      .settings-section ha-form[style*="flex: 1"] {
        min-width: 200px;
        flex: 1 1 200px;
      }

      /* Fix input field containers */
      .settings-section input[type="number"] {
        min-width: 60px;
        max-width: 80px;
        flex-shrink: 0;
      }

      /* Ensure proper spacing for slider + input combos */
      .settings-section div[style*="display: flex; gap: 8px"] {
        gap: 8px !important;
        align-items: center !important;
        flex-wrap: nowrap !important;
        min-width: 0;
      }

      .settings-section div[style*="display: flex; gap: 12px"] {
        gap: 12px !important;
        align-items: center !important;
        flex-wrap: nowrap !important;
        min-width: 0;
      }

      /* Prevent overflow in gradient editor */
      .gradient-editor {
        max-width: 100%;
        overflow: visible;
      }

      .gradient-stop {
        max-width: 100%;
        overflow: visible;
        position: relative;
      }

      /* Gradient stop drag handle styling */
      .gradient-stop .drag-handle {
        transition: all 0.2s ease;
      }

      .gradient-stop:hover .drag-handle {
        color: var(--primary-color) !important;
        transform: scale(1.1);
      }

      /* Ultra color picker sizing */
      ultra-color-picker {
        min-width: 40px;
        max-width: 60px;
        flex-shrink: 0;
      }

      /* Ensure gradient controls don't overflow */
      .gradient-stops {
        max-width: 100%;
        overflow: visible;
      }

      /* Hide automatic value displays from ha-form sliders to prevent cut-off */
      .settings-section ha-form ha-slider::part(value-display),
      .settings-section ha-form mwc-slider::part(value-display),
      .settings-section ha-form ha-slider .value-display,
      .settings-section ha-form mwc-slider .value-display {
        display: none !important;
      }

      /* Hide any automatic number displays that might appear next to sliders */
      .settings-section ha-form .slider-value,
      .settings-section ha-form .current-value,
      .settings-section ha-form .number-display {
        display: none !important;
      }

      /* Override any default slider value display styles */
      .settings-section ha-form[data-field*="size"] .mdc-slider-value-indicator,
      .settings-section ha-form[data-field*="size"] .value-indicator {
        display: none !important;
      }

      /* More comprehensive hiding of slider value displays */
      .settings-section ha-form ha-textfield[type="number"],
      .settings-section ha-form mwc-textfield[type="number"],
      .settings-section ha-form .number-input-display {
        display: none !important;
      }

      /* Target specific Home Assistant slider value containers */
      .settings-section ha-form .form-group .number-display,
      .settings-section ha-form .ha-form-number .display-value,
      .settings-section ha-form [role="slider"] + *:not(.mdc-slider-track),
      .settings-section ha-form .mdc-slider + .value-display {
        display: none !important;
      }

      /* Ensure sliders take full width without value displays */
      .settings-section ha-form .mdc-slider,
      .settings-section ha-form ha-slider {
        width: 100% !important;
        max-width: 100% !important;
      }

      /* Hide any text elements that might display current values */
      .settings-section ha-form .field-wrapper > span:last-child,
      .settings-section ha-form .form-control > span:last-child,
      .settings-section ha-form .slider-container > span:last-child {
        display: none !important;
      }

      /* Specifically target number displays in form groups */
      .settings-section ha-form .form-group > *:last-child:not(ha-slider):not(.mdc-slider):not(input[type="range"]) {
        display: none !important;
      }

      /* Conditional Fields Grouping - Reusable Pattern */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
        border-left-color: var(--primary-color);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
      }

      .conditional-fields-content {
        padding: 16px;
        background: transparent;
      }

      /* Remove top margin from first field in conditional groups */
      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
      }

      /* Ensure proper spacing within conditional field groups */
      .conditional-fields-content .field-title {
        color: var(--primary-text-color);
      }

      .conditional-fields-content .field-description {
        color: var(--secondary-text-color);
        opacity: 0.9;
      }

      /* Animation for conditional fields appearing */
      .conditional-fields-group {
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

      /* Make conditional fields responsive */
      @media (max-width: 768px) {
        .conditional-fields-group {
          border-left-width: 3px;
        }
        
        .conditional-fields-header {
          padding: 10px 12px;
          font-size: 13px;
        }
        
        .conditional-fields-content {
          padding: 12px;
        }
      }
    `;
  }

  // Helper method to convert style object to CSS string
  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  // Helper method to convert camelCase to kebab-case
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    switch (imageType) {
      case 'upload':
        if (backgroundImage) {
          // For uploaded images, wrap in url() and get the full URL
          if (backgroundImage.startsWith('/api/image/serve/')) {
            // Use image upload utility to get full URL
            return `url("${this.getImageUrl(hass, backgroundImage)}")`;
          } else if (backgroundImage.startsWith('data:image/')) {
            // Data URL, use as-is
            return `url("${backgroundImage}")`;
          } else {
            // Other upload paths
            return `url("${backgroundImage}")`;
          }
        }
        break;

      case 'entity':
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            // Try entity_picture first, then other image attributes
            const imageUrl =
              entityState.attributes.entity_picture ||
              entityState.attributes.image ||
              entityState.state;
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              return `url("${imageUrl}")`;
            }
          }
        }
        break;

      case 'url':
        if (backgroundImage) {
          // Direct URL, wrap in url()
          return `url("${backgroundImage}")`;
        }
        break;

      default:
        // No background image or 'none' type
        return 'none';
    }

    return 'none';
  }

  private getImageUrl(hass: HomeAssistant, path: string): string {
    if (!path) return '';

    if (path.startsWith('http')) return path;
    if (path.startsWith('data:image/')) return path;

    if (path.includes('/api/image/serve/')) {
      const matches = path.match(/\/api\/image\/serve\/([^\/]+)/);
      if (matches && matches[1]) {
        const imageId = matches[1];
        try {
          const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
          return `${baseUrl.replace(/\/$/, '')}/api/image/serve/${imageId}/original`;
        } catch (e) {
          return path;
        }
      }
      return path;
    }

    // Handle relative URLs
    if (path.startsWith('/')) {
      const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
      return `${baseUrl.replace(/\/$/, '')}${path}`;
    }

    return path;
  }

  // Helper method to convert bar height to size category for gradient editor
  private getBarSizeFromHeight(height: number): 'thin' | 'regular' | 'thick' | 'thiccc' {
    if (height <= 12) return 'thin';
    if (height <= 20) return 'regular';
    if (height <= 30) return 'thick';
    return 'thiccc';
  }

  // Helper method to convert border radius to radius style for gradient editor
  private getBarRadiusFromStyle(borderRadius: number): 'round' | 'square' | 'rounded-square' {
    if (borderRadius === 0) return 'square';
    if (borderRadius < 8) return 'rounded-square';
    return 'round';
  }

  // Helper method to ensure border radius values have proper units
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;

    // If value is just a number or contains only numbers, add px
    if (/^\d+$/.test(value)) {
      return `${value}px`;
    }

    // If value is a multi-value (like "5 10 15 20"), add px to each number
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }

    // Otherwise return as-is (already has units like px, em, %, etc.)
    return value;
  }
}
