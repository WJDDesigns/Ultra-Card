import { TemplateResult, html } from 'lit';
import { ref, createRef, Ref } from 'lit/directives/ref.js';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BarModule, UltraCardConfig } from '../types';
import { FormUtils } from '../utils/form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import '../components/ultra-color-picker';
import '../components/uc-gradient-editor';
import '../components/ultra-template-editor';
import { formatEntityState } from '../utils/number-format';
import { TemplateService } from '../services/template-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { localize } from '../localize/localize';
import { buildEntityContext } from '../utils/template-context';
import { parseUnifiedTemplate, hasTemplateError } from '../utils/template-parser';
import {
  GradientStop,
  generateGradientString,
  createDefaultGradientStops,
} from '../components/uc-gradient-editor';

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

  private _templateService?: TemplateService;
  private _templateInputDebounce: any = null;

  createDefault(id?: string, hass?: HomeAssistant): BarModule {
    // Auto-detect suitable battery sensor
    const autoEntity = this.findSuitableBatterySensor(hass);

    return {
      id: id || this.generateId('bar'),
      type: 'bar',
      // Basic Configuration - use auto-detected entity or empty with placeholder
      entity: autoEntity || '',

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

      // Bar Appearance - Fix height default to be explicit
      height: 20, // Explicit default height in pixels
      bar_direction: 'left-to-right', // Default fill direction
      bar_size: 'medium',
      bar_radius: 'round',
      bar_style: 'flat',
      bar_width: 100,
      bar_alignment: 'center',
      border_radius: 10,
      glass_blur_amount: 8, // Default glass blur amount

      // Text Display
      label_alignment: 'space-between',
      show_percentage: true,
      show_value: false, // Default to percentage, not value
      percentage_text_size: 14,
      percentage_text_alignment: 'center',
      percentage_text_bold: false,
      percentage_text_italic: false,
      percentage_text_strikethrough: false,
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
      left_title_color: '',
      left_value_color: '',
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
      right_title_color: '',
      right_value_color: '',

      // Colors - use empty default so global design can control track bg by default
      bar_color: '',
      bar_background_color: '',
      bar_border_color: 'var(--divider-color)', // Show default border
      percentage_text_color: '',

      // Minimal style dot color
      dot_color: '',

      // Minimal style icon configuration
      minimal_icon_enabled: false,
      minimal_icon: '',
      minimal_icon_mode: 'icon-in-dot',
      minimal_icon_size: 24,
      minimal_icon_size_auto: true,
      minimal_icon_color: '',
      minimal_icon_use_dot_color: true,

      // Gradient Configuration
      use_gradient: false,
      gradient_display_mode: 'full',
      gradient_stops: createDefaultGradientStops(),

      // Limit Indicator
      limit_entity: '',
      limit_color: '',

      // Animation & Templates
      animation: true,
      template_mode: false,
      template: '',
      unified_template_mode: false,
      unified_template: '',

      // Bar Animation (state/attribute triggered)
      bar_animation_enabled: false,
      bar_animation_entity: '',
      bar_animation_trigger_type: 'state',
      bar_animation_attribute: '',
      bar_animation_value: '',
      bar_animation_type: 'none',

      // Bar Animation Override (takes precedence over regular)
      bar_animation_override_entity: '',
      bar_animation_override_trigger_type: 'state',
      bar_animation_override_attribute: '',
      bar_animation_override_value: '',
      bar_animation_override_type: 'none',

      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as BarModule, hass, updates => updateModule(updates));
  }

  // Helper method to find suitable battery sensors for auto-detection
  private findSuitableBatterySensor(hass?: HomeAssistant): string {
    if (!hass || !hass.states) {
      return '';
    }

    // List of battery-related patterns to search for
    const batteryPatterns = [
      'battery_level',
      'battery',
      'charge',
      'power_level',
      'fuel_level',
      'energy',
    ];

    // Device classes that indicate battery sensors
    const batteryDeviceClasses = ['battery', 'energy', 'power'];

    // Entity domains that commonly have battery sensors
    const suitableDomains = ['sensor', 'binary_sensor'];

    const candidates: Array<{ entity: string; score: number; friendlyName: string }> = [];

    // Search through all entities
    Object.keys(hass.states).forEach(entityId => {
      const state = hass.states[entityId];
      const domain = entityId.split('.')[0];

      // Skip if not a suitable domain
      if (!suitableDomains.includes(domain)) {
        return;
      }

      // Skip binary sensors (they don't have percentage values)
      if (domain === 'binary_sensor') {
        return;
      }

      const attributes = state.attributes || {};
      const friendlyName = attributes.friendly_name || entityId;
      const deviceClass = attributes.device_class;
      const unitOfMeasurement = attributes.unit_of_measurement;
      const stateValue = parseFloat(state.state);

      // Skip if state is not a valid number or outside 0-100 range
      if (isNaN(stateValue) || stateValue < 0 || stateValue > 100) {
        return;
      }

      // Skip unavailable/unknown states
      if (state.state === 'unavailable' || state.state === 'unknown') {
        return;
      }

      let score = 0;

      // High score for battery device class
      if (batteryDeviceClasses.includes(deviceClass)) {
        score += 100;
      }

      // High score for percentage unit
      if (unitOfMeasurement === '%') {
        score += 80;
      }

      // Medium score for battery-related patterns in entity ID
      batteryPatterns.forEach(pattern => {
        if (entityId.toLowerCase().includes(pattern)) {
          score += 50;
        }
      });

      // Medium score for battery-related patterns in friendly name
      batteryPatterns.forEach(pattern => {
        if (friendlyName.toLowerCase().includes(pattern)) {
          score += 40;
        }
      });

      // Bonus for common battery entity patterns
      if (entityId.includes('battery') && unitOfMeasurement === '%') {
        score += 60;
      }

      // Bonus for mobile device battery patterns
      if (
        (entityId.includes('phone') ||
          entityId.includes('mobile') ||
          entityId.includes('device')) &&
        (entityId.includes('battery') || deviceClass === 'battery')
      ) {
        score += 30;
      }

      // Only consider entities with some score
      if (score > 0) {
        candidates.push({
          entity: entityId,
          score,
          friendlyName,
        });
      }
    });

    // Sort by score (highest first) and return the best match
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      // Removed debug log: battery sensor candidates
      return candidates[0].entity;
    }

    // Removed debug log: no suitable battery sensor found
    return '';
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const barModule = module as BarModule;
    const lang = hass?.locale?.language || 'en';

    // Stable schema for percentage type select (memoized by language)
    const percentageTypeSchema = [
      this.selectField('percentage_type', [
        { value: 'entity', label: localize('editor.bar.perc_type.entity', lang, 'Entity (0-100)') },
        {
          value: 'attribute',
          label: localize('editor.bar.perc_type.attribute', lang, 'Entity Attribute'),
        },
        {
          value: 'difference',
          label: localize('editor.bar.perc_type.difference', lang, 'Difference'),
        },
        { value: 'template', label: localize('editor.bar.perc_type.template', lang, 'Template') },
      ]),
    ];

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Bar Settings -->
        ${this.renderSettingsSection(
          localize('editor.bar.bar_settings.title', lang, 'Bar Settings'),
          localize(
            'editor.bar.bar_settings.desc',
            lang,
            'Configure how the bar percentage is calculated and displayed.'
          ),
          []
        )}
        <div class="field-group percentage-type-group" style="margin-top: -16px; margin-bottom: 16px;">
          ${this.renderFieldSection(
            localize('editor.bar.percentage_type.title', lang, 'Percentage Type'),
            localize(
              'editor.bar.percentage_type.desc',
              lang,
              'Choose how the bar percentage is calculated'
            ),
            hass,
            { percentage_type: barModule.percentage_type || 'entity' },
            percentageTypeSchema,
            (e: CustomEvent) => {
              const next = e.detail.value?.percentage_type;
              if (next === undefined || next === barModule.percentage_type) return;

              updateModule({ percentage_type: next });
            }
          )}
        </div>

          <!-- Entity Attribute Fields -->
          ${
            barModule.percentage_type === 'attribute'
              ? this.renderConditionalFieldsGroup(
                  localize('editor.bar.attr_config.title', lang, 'Entity Attribute Configuration'),
                  html`
                    ${this.renderSettingsSection(
                      localize(
                        'editor.bar.attr_config.title',
                        lang,
                        'Entity Attribute Configuration'
                      ),
                      localize(
                        'editor.bar.attr_config.desc',
                        lang,
                        'Configure entity attribute settings'
                      ),
                      [
                        {
                          title: localize(
                            'editor.bar.attr_config.attribute_entity',
                            lang,
                            'Attribute Entity'
                          ),
                          description: localize(
                            'editor.bar.attr_config.attribute_entity_desc',
                            lang,
                            'Select the entity that contains the attribute with the percentage value'
                          ),
                          hass,
                          data: {
                            percentage_attribute_entity:
                              barModule.percentage_attribute_entity || '',
                          },
                          schema: [this.entityField('percentage_attribute_entity')],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              percentage_attribute_entity:
                                e.detail.value.percentage_attribute_entity,
                            }),
                        },
                        {
                          title: localize(
                            'editor.bar.attr_config.attribute_name',
                            lang,
                            'Attribute Name'
                          ),
                          description: localize(
                            'editor.bar.attr_config.attribute_name_desc',
                            lang,
                            'Enter the name of the attribute that contains the percentage value (e.g., "battery_level")'
                          ),
                          hass,
                          data: {
                            percentage_attribute_name: barModule.percentage_attribute_name || '',
                          },
                          schema: [this.textField('percentage_attribute_name')],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              percentage_attribute_name: e.detail.value.percentage_attribute_name,
                            }),
                        },
                      ]
                    )}
                  `
                )
              : ''
          }

          <!-- Difference Fields -->
          ${
            barModule.percentage_type === 'difference'
              ? this.renderConditionalFieldsGroup(
                  localize(
                    'editor.bar.diff_config.title',
                    lang,
                    'Difference Calculation Configuration'
                  ),
                  html`
                    ${this.renderSettingsSection(
                      localize(
                        'editor.bar.diff_config.title',
                        lang,
                        'Difference Calculation Configuration'
                      ),
                      localize(
                        'editor.bar.diff_config.desc',
                        lang,
                        'Configure difference calculation settings'
                      ),
                      [
                        {
                          title: localize(
                            'editor.bar.diff_config.current_entity',
                            lang,
                            'Current Value Entity'
                          ),
                          description: localize(
                            'editor.bar.diff_config.current_entity_desc',
                            lang,
                            'Entity representing the current/used amount (e.g., fuel used, battery consumed)'
                          ),
                          hass,
                          data: {
                            percentage_current_entity: barModule.percentage_current_entity || '',
                          },
                          schema: [this.entityField('percentage_current_entity')],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              percentage_current_entity: e.detail.value.percentage_current_entity,
                            }),
                        },
                        {
                          title: localize(
                            'editor.bar.diff_config.total_entity',
                            lang,
                            'Total Value Entity'
                          ),
                          description: localize(
                            'editor.bar.diff_config.total_entity_desc',
                            lang,
                            'Entity representing the total/maximum amount (e.g., fuel capacity, battery capacity)'
                          ),
                          hass,
                          data: {
                            percentage_total_entity: barModule.percentage_total_entity || '',
                          },
                          schema: [this.entityField('percentage_total_entity')],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              percentage_total_entity: e.detail.value.percentage_total_entity,
                            }),
                        },
                      ]
                    )}
                  `
                )
              : ''
          }

          <!-- Template Field -->
          ${
            barModule.percentage_type === 'template'
              ? this.renderConditionalFieldsGroup(
                  localize('editor.bar.template_config.title', lang, 'Template Configuration'),
                  html`
                    ${this.renderSettingsSection(
                      localize('editor.bar.template_config.title', lang, 'Template Configuration'),
                      localize(
                        'editor.bar.template_config.desc',
                        lang,
                        'Configure template settings'
                      ),
                      [
                        {
                          title: localize(
                            'editor.bar.template_config.percentage_template',
                            lang,
                            'Percentage Template'
                          ),
                          description: localize(
                            'editor.bar.template_config.percentage_template_desc',
                            lang,
                            "Enter a Jinja2 template that returns a number between 0-100 for the percentage. Example: {{ (states('sensor.battery_level') | float) * 100 }}"
                          ),
                          hass,
                          data: barModule,
                          schema: [this.textField('percentage_template', true)],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              percentage_template: e.detail.value.percentage_template,
                            }),
                        },
                      ]
                    )}
                  `
                )
              : ''
          }

          <!-- Bar Percentage Entity -->
          <div style="margin-top: 24px;">
            ${FormUtils.renderField(
              localize('editor.bar.entity.title', lang, 'Bar Percentage Entity'),
              barModule.entity
                ? localize(
                    'editor.bar.entity.desc_present',
                    lang,
                    'The entity that provides the percentage value for the bar.'
                  )
                : localize(
                    'editor.bar.entity.desc_empty',
                    lang,
                    'Select an entity that provides a percentage value (0-100). Battery sensors are ideal for bars.'
                  ),
              hass,
              { entity: barModule.entity || '' },
              [
                FormUtils.createSchemaItem('entity', {
                  entity: {
                    filter: [{ domain: 'sensor' }, { domain: 'input_number' }],
                  },
                }),
              ],
              (e: CustomEvent) => updateModule({ entity: e.detail.value.entity })
            )}
            ${
              !barModule.entity
                ? html`
                    <div
                      style="color: var(--warning-color); font-size: 12px; margin-top: 4px; font-style: italic;"
                    >
                      <ha-icon
                        icon="mdi:information-outline"
                        style="font-size: 14px; margin-right: 4px;"
                      ></ha-icon>
                      ${localize(
                        'editor.bar.entity.no_entity_warning',
                        lang,
                        'No entity selected - Please choose a sensor with values between 0-100'
                      )}
                    </div>
                  `
                : ''
            }
          </div>

          <!-- Limit Value Entity -->
          <div style="margin-top: 24px;">
            ${FormUtils.renderField(
              localize('editor.bar.limit_entity.title', lang, 'Limit Value Entity (optional)'),
              localize(
                'editor.bar.limit_entity.desc',
                lang,
                'Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).'
              ),
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
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${localize('editor.bar.appearance.title', lang, 'Bar Appearance')}
          </div>

          <!-- Bar Style -->
          <div class="field-group" style="margin-bottom: 16px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
            >
              ${localize('editor.bar.appearance.style', lang, 'Bar Style')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              ${localize(
                'editor.bar.appearance.style_desc',
                lang,
                'Choose the visual style of the progress bar.'
              )}
            </div>
            ${this.renderUcForm(
              hass,
              { bar_style: barModule.bar_style || 'flat' },
              [
                this.selectField('bar_style', [
                  {
                    value: 'flat',
                    label: localize('editor.bar.appearance.style_flat', lang, 'Flat (Default)'),
                  },
                  {
                    value: 'glossy',
                    label: localize('editor.bar.appearance.style_glossy', lang, 'Glossy'),
                  },
                  {
                    value: 'embossed',
                    label: localize('editor.bar.appearance.style_embossed', lang, 'Embossed'),
                  },
                  {
                    value: 'inset',
                    label: localize('editor.bar.appearance.style_inset', lang, 'Inset'),
                  },
                  {
                    value: 'gradient-overlay',
                    label: localize(
                      'editor.bar.appearance.style_gradient',
                      lang,
                      'Gradient Overlay'
                    ),
                  },
                  {
                    value: 'neon-glow',
                    label: localize('editor.bar.appearance.style_neon', lang, 'Neon Glow'),
                  },
                  {
                    value: 'outline',
                    label: localize('editor.bar.appearance.style_outline', lang, 'Outline'),
                  },
                  {
                    value: 'glass',
                    label: localize('editor.bar.appearance.style_glass', lang, 'Glass'),
                  },
                  {
                    value: 'metallic',
                    label: localize('editor.bar.appearance.style_metallic', lang, 'Metallic'),
                  },
                  {
                    value: 'neumorphic',
                    label: localize('editor.bar.appearance.style_neumorphic', lang, 'Neumorphic'),
                  },
                  {
                    value: 'dashed',
                    label: localize('editor.bar.appearance.style_dashed', lang, 'Dashed'),
                  },
                  {
                    value: 'dots',
                    label: localize('editor.bar.appearance.style_dots', lang, 'Dots'),
                  },
                  {
                    value: 'minimal',
                    label: localize('editor.bar.appearance.style_minimal', lang, 'Minimal'),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.bar_style;
                const prev = barModule.bar_style || 'flat';
                if (next === prev) return;
                updateModule({ bar_style: next });
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
              false
            )}
          </div>

          <!-- Bar Fill Direction -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              ${localize('editor.bar.appearance.direction', lang, 'Fill Direction')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              ${localize(
                'editor.bar.appearance.direction_desc',
                lang,
                'Choose which direction the bar fills from as the value increases.'
              )}
            </div>
            <div
              style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
            >
              <button
                type="button"
                style="padding: 8px 12px; border: 2px solid ${
                  (barModule.bar_direction || 'left-to-right') === 'left-to-right'
                    ? 'var(--primary-color)'
                    : 'var(--divider-color)'
                }; background: ${
                  (barModule.bar_direction || 'left-to-right') === 'left-to-right'
                    ? 'var(--primary-color)'
                    : 'transparent'
                }; color: ${
                  (barModule.bar_direction || 'left-to-right') === 'left-to-right'
                    ? 'white'
                    : 'var(--primary-text-color)'
                }; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                @click=${() => updateModule({ bar_direction: 'left-to-right' })}
              >
                <ha-icon
                  icon="mdi:arrow-right"
                  style="font-size: 16px; flex-shrink: 0;"
                ></ha-icon>
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >${localize('editor.bar.appearance.left_to_right', lang, 'Left to Right')}</span
                >
              </button>
              <button
                type="button"
                style="padding: 8px 12px; border: 2px solid ${
                  (barModule.bar_direction || 'left-to-right') === 'right-to-left'
                    ? 'var(--primary-color)'
                    : 'var(--divider-color)'
                }; background: ${
                  (barModule.bar_direction || 'left-to-right') === 'right-to-left'
                    ? 'var(--primary-color)'
                    : 'transparent'
                }; color: ${
                  (barModule.bar_direction || 'left-to-right') === 'right-to-left'
                    ? 'white'
                    : 'var(--primary-text-color)'
                }; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                @click=${() => updateModule({ bar_direction: 'right-to-left' })}
              >
                <ha-icon
                  icon="mdi:arrow-left"
                  style="font-size: 16px; flex-shrink: 0;"
                ></ha-icon>
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >${localize('editor.bar.appearance.right_to_left', lang, 'Right to Left')}</span
                >
              </button>
            </div>
          </div>

          <!-- Bar Height -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">${localize('editor.bar.appearance.height', lang, 'Bar Height')}</div>
            <div class="field-description">${localize('editor.bar.appearance.height_desc', lang, 'Adjust the thickness of the progress bar in pixels.')}</div>
            <div class="number-range-control">
              <input
                type="range"
                class="range-slider"
                min="8"
                max="60"
                step="2"
                .value="${(barModule as any).height ?? 20}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  updateModule({ height: value });
                }}
              />
              <input
                type="number"
                class="range-input"
                min="8"
                step="2"
                .value="${(barModule as any).height ?? 20}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  if (!isNaN(value)) {
                    updateModule({ height: value });
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = parseInt(target.value) || 20;
                    const increment = e.key === 'ArrowUp' ? 2 : -2;
                    const newValue = Math.max(8, currentValue + increment);
                    updateModule({ height: newValue });
                  }
                }}
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ height: 20 })}
                title="${localize('editor.fields.reset_default_value', lang, 'Reset to default ({value})').replace('{value}', '20px')}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Border Radius -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">${localize('editor.bar.appearance.border_radius', lang, 'Border Radius')}</div>
            <div class="field-description">${localize('editor.bar.appearance.border_radius_desc', lang, 'Control the rounded corners of the bar.')}</div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="0"
                max="50"
                step="1"
                .value="${barModule.border_radius ?? 10}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  updateModule({ border_radius: value });
                }}
              />
              <input
                type="number"
                class="gap-input"
                min="0"
                step="1"
                .value="${barModule.border_radius ?? 10}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  if (!isNaN(value)) {
                    updateModule({ border_radius: value });
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = parseInt(target.value) ?? 10;
                    const increment = e.key === 'ArrowUp' ? 1 : -1;
                    const newValue = Math.max(0, Math.min(50, currentValue + increment));
                    updateModule({ border_radius: newValue });
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => updateModule({ border_radius: 10 })}
                title="${localize('editor.fields.reset_default_value', lang, 'Reset to default ({value})').replace('{value}', '10')}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Bar Width -->
          <div class="field-container" style="margin-bottom: 24px;">
            <div class="field-title">${localize('editor.bar.appearance.width', lang, 'Bar Width')}</div>
            <div class="field-description">
              ${localize('editor.bar.appearance.width_desc', lang, 'Set the width of the bar as a percentage of the container.')}
            </div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="10"
                max="100"
                step="5"
                .value="${barModule.bar_width || 100}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  updateModule({ bar_width: value });
                }}
              />
              <input
                type="number"
                class="gap-input"
                min="10"
                step="5"
                .value="${barModule.bar_width || 100}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  if (!isNaN(value)) {
                    updateModule({ bar_width: value });
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = parseInt(target.value) || 100;
                    const increment = e.key === 'ArrowUp' ? 5 : -5;
                    const newValue = Math.max(10, Math.min(100, currentValue + increment));
                    updateModule({ bar_width: newValue });
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => updateModule({ bar_width: 100 })}
                title="${localize('editor.fields.reset_default_value', lang, 'Reset to default ({value})').replace('{value}', '100')}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>

          <!-- Bar Alignment with Icons -->
          ${
            (barModule.bar_width || 100) < 100
              ? html`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important;"
                    >
                      ${localize('editor.bar.appearance.alignment', lang, 'Bar Alignment')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.bar.appearance.alignment_desc',
                        lang,
                        "Choose how to align the bar when it's less than 100% width."
                      )}
                    </div>
                    <div
                      style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                    >
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                          'center') === 'left'
                          ? 'var(--primary-color)'
                          : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                          'center') === 'left'
                          ? 'var(--primary-color)'
                          : 'transparent'}; color: ${(barModule.bar_alignment || 'center') ===
                        'left'
                          ? 'white'
                          : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${() => updateModule({ bar_alignment: 'left' })}
                      >
                        <ha-icon
                          icon="mdi:format-align-left"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${localize('editor.common.left', lang, 'Left')}</span
                        >
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
                          : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${() => updateModule({ bar_alignment: 'center' })}
                      >
                        <ha-icon
                          icon="mdi:format-align-center"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${localize('editor.common.center', lang, 'Center')}</span
                        >
                      </button>
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                          'center') === 'right'
                          ? 'var(--primary-color)'
                          : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                          'center') === 'right'
                          ? 'var(--primary-color)'
                          : 'transparent'}; color: ${(barModule.bar_alignment || 'center') ===
                        'right'
                          ? 'white'
                          : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${() => updateModule({ bar_alignment: 'right' })}
                      >
                        <ha-icon
                          icon="mdi:format-align-right"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${localize('editor.common.right', lang, 'Right')}</span
                        >
                      </button>
                    </div>
                  </div>
                `
              : ''
          }

          <!-- Label Alignment -->
          ${
            barModule.left_enabled || barModule.right_enabled
              ? html`
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important;"
                    >
                      ${localize('editor.bar.labels.alignment', lang, 'Label Alignment')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.bar.labels.alignment_desc',
                        lang,
                        'Control how the left and right side labels are positioned.'
                      )}
                    </div>
                    ${this.renderUcForm(
                      hass,
                      { label_alignment: barModule.label_alignment || 'space-between' },
                      [
                        this.selectField('label_alignment', [
                          {
                            value: 'left',
                            label: localize('editor.common.left', lang, 'Left'),
                          },
                          {
                            value: 'center',
                            label: localize('editor.common.center', lang, 'Center'),
                          },
                          {
                            value: 'right',
                            label: localize('editor.common.right', lang, 'Right'),
                          },
                          {
                            value: 'space-between',
                            label: localize('editor.common.space_between', lang, 'Space Between'),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.label_alignment;
                        const prev = barModule.label_alignment || 'space-between';
                        if (next === prev) return;
                        updateModule({ label_alignment: next });
                        // Trigger re-render to update dropdown UI
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>
                `
              : ''
          }

          <!-- Glass Blur Amount (only show when glass style is selected) -->
          ${
            barModule.bar_style === 'glass'
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.bar.appearance.glass_blur', lang, 'Glass Blur Amount')}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.appearance.glass_blur_desc',
                        lang,
                        'Adjust the blur intensity of the glass effect.'
                      )}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="0"
                        max="20"
                        step="1"
                        .value="${barModule.glass_blur_amount || 8}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ glass_blur_amount: value });
                          }
                        }}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="0"
                        max="20"
                        step="1"
                        .value="${barModule.glass_blur_amount || 8}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ glass_blur_amount: value });
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = parseInt(target.value) || 8;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(0, Math.min(20, currentValue + increment));
                            updateModule({ glass_blur_amount: newValue });
                          }
                        }}
                      />
                      <button
                        class="reset-btn"
                        @click=${() => updateModule({ glass_blur_amount: 8 })}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '8')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `
              : ''
          }
        </div>

        <!-- Minimal Style Icon Configuration Section -->
        ${
          barModule.bar_style === 'minimal'
            ? html`
                <div
                  class="settings-section"
                  style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
                >
                  <div
                    class="section-title"
                    style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                  >
                    ${localize('editor.bar.minimal.icon_config', lang, 'Minimal Style Icon')}
                  </div>

                  <!-- Enable Icon Toggle -->
                  <div
                    class="field-group"
                    style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div>
                      <div
                        class="field-title"
                        style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        ${localize('editor.bar.minimal.icon_enabled', lang, 'Enable Icon')}
                      </div>
                    </div>
                    <ha-switch
                      .checked=${barModule.minimal_icon_enabled || false}
                      @change=${(e: Event) => {
                        const target = e.target as any;
                        updateModule({ minimal_icon_enabled: target.checked });
                      }}
                    ></ha-switch>
                  </div>

                  <div
                    class="field-description"
                    style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                  >
                    ${localize(
                      'editor.bar.minimal.icon_enabled_desc',
                      lang,
                      'Enable icon display to replace or enhance the dot indicator in minimal bar style.'
                    )}
                  </div>

                  ${barModule.minimal_icon_enabled
                    ? html`
                        <!-- Icon Picker -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                          >
                            ${localize('editor.bar.minimal.icon', lang, 'Icon')}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                          >
                            ${localize(
                              'editor.bar.minimal.icon_desc',
                              lang,
                              'Select the icon to display (e.g., mdi:battery).'
                            )}
                          </div>
                          <ha-icon-picker
                            .hass=${hass}
                            .value=${barModule.minimal_icon || ''}
                            .placeholder=${'mdi:circle'}
                            @value-changed=${(e: CustomEvent) =>
                              updateModule({ minimal_icon: e.detail.value })}
                          ></ha-icon-picker>
                        </div>

                        <!-- Icon Display Mode -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            ${localize('editor.bar.minimal.icon_mode', lang, 'Display Mode')}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                          >
                            ${localize(
                              'editor.bar.minimal.icon_mode_desc',
                              lang,
                              'Choose how the icon is displayed with the dot.'
                            )}
                          </div>
                          ${this.renderUcForm(
                            hass,
                            { minimal_icon_mode: barModule.minimal_icon_mode || 'icon-in-dot' },
                            [
                              this.selectField('minimal_icon_mode', [
                                {
                                  value: 'dot-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_dot_only',
                                    lang,
                                    'Dot Only'
                                  ),
                                },
                                {
                                  value: 'icon-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_only',
                                    lang,
                                    'Icon Only'
                                  ),
                                },
                                {
                                  value: 'icon-in-dot',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_in_dot',
                                    lang,
                                    'Icon in Dot'
                                  ),
                                },
                              ]),
                            ],
                            (e: CustomEvent) => {
                              const next = e.detail.value.minimal_icon_mode;
                              const prev = barModule.minimal_icon_mode || 'icon-in-dot';
                              if (next === prev) return;
                              updateModule({ minimal_icon_mode: next });
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                            false
                          )}
                        </div>

                        <!-- Icon Size Auto Toggle -->
                        <div
                          class="field-group"
                          style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                        >
                          <div>
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${localize('editor.bar.minimal.icon_size_auto', lang, 'Auto Size')}
                            </div>
                          </div>
                          <ha-switch
                            .checked=${barModule.minimal_icon_size_auto !== false}
                            @change=${(e: Event) => {
                              const target = e.target as any;
                              updateModule({ minimal_icon_size_auto: target.checked });
                            }}
                          ></ha-switch>
                        </div>

                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                        >
                          ${localize(
                            'editor.bar.minimal.icon_size_auto_desc',
                            lang,
                            'Automatically scale icon size based on bar height.'
                          )}
                        </div>

                        <!-- Manual Icon Size (only if auto is disabled) -->
                        ${barModule.minimal_icon_size_auto === false
                          ? html`
                              <div class="field-container" style="margin-bottom: 24px;">
                                <div class="field-title">
                                  ${localize('editor.bar.minimal.icon_size', lang, 'Icon Size')}
                                </div>
                                <div class="field-description">
                                  ${localize(
                                    'editor.bar.minimal.icon_size_desc',
                                    lang,
                                    'Manually set the icon size in pixels.'
                                  )}
                                </div>
                                <div class="number-range-control">
                                  <input
                                    type="range"
                                    class="range-slider"
                                    min="8"
                                    max="48"
                                    step="1"
                                    .value="${barModule.minimal_icon_size || 24}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const value = parseInt(target.value);
                                      updateModule({ minimal_icon_size: value });
                                    }}
                                  />
                                  <input
                                    type="number"
                                    class="range-input"
                                    min="8"
                                    step="1"
                                    .value="${barModule.minimal_icon_size || 24}"
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      const value = parseInt(target.value);
                                      if (!isNaN(value)) {
                                        updateModule({ minimal_icon_size: value });
                                      }
                                    }}
                                    @keydown=${(e: KeyboardEvent) => {
                                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                        e.preventDefault();
                                        const target = e.target as HTMLInputElement;
                                        const currentValue = parseInt(target.value) || 16;
                                        const increment = e.key === 'ArrowUp' ? 1 : -1;
                                        const newValue = Math.max(
                                          8,
                                          Math.min(48, currentValue + increment)
                                        );
                                        updateModule({ minimal_icon_size: newValue });
                                      }
                                    }}
                                  />
                                  <button
                                    class="range-reset-btn"
                                    @click=${() => updateModule({ minimal_icon_size: 24 })}
                                    title="${localize(
                                      'editor.fields.reset_default_value',
                                      lang,
                                      'Reset to default ({value})'
                                    ).replace('{value}', '24')}"
                                  >
                                    <ha-icon icon="mdi:refresh"></ha-icon>
                                  </button>
                                </div>
                              </div>
                            `
                          : ''}

                        <!-- Use Dot Color Toggle -->
                        <div
                          class="field-group"
                          style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                        >
                          <div>
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${localize('editor.bar.minimal.use_dot_color', lang, 'Use Dot Color')}
                            </div>
                          </div>
                          <ha-switch
                            .checked=${barModule.minimal_icon_use_dot_color !== false}
                            @change=${(e: Event) => {
                              const target = e.target as any;
                              updateModule({ minimal_icon_use_dot_color: target.checked });
                            }}
                          ></ha-switch>
                        </div>

                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                        >
                          ${localize(
                            'editor.bar.minimal.use_dot_color_desc',
                            lang,
                            'Use the dot color (including gradient colors) for the icon.'
                          )}
                        </div>

                        <!-- Custom Icon Color (only if use_dot_color is false) -->
                        ${barModule.minimal_icon_use_dot_color === false
                          ? html`
                              <div class="field-container" style="margin-bottom: 16px;">
                                <div class="field-title">
                                  ${localize('editor.bar.minimal.icon_color', lang, 'Icon Color')}
                                </div>
                                <div class="field-description">
                                  ${localize(
                                    'editor.bar.minimal.icon_color_desc',
                                    lang,
                                    'Set a custom color for the icon.'
                                  )}
                                </div>
                                <ultra-color-picker
                                  style="width: 100%;"
                                  .value=${barModule.minimal_icon_color || ''}
                                  .defaultValue=${'var(--primary-color)'}
                                  .hass=${hass}
                                  @value-changed=${(e: CustomEvent) =>
                                    updateModule({ minimal_icon_color: e.detail.value })}
                                ></ultra-color-picker>
                              </div>
                            `
                          : ''}
                      `
                    : html`
                        <div
                          style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${localize(
                            'editor.bar.minimal.enable_toggle',
                            lang,
                            'Enable the toggle above to configure icon settings'
                          )}
                        </div>
                      `}
                </div>
              `
            : ''
        }

        <!-- Percentage Text Display Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0;"
            >
              ${localize('editor.bar.text_display.title', lang, 'Text Display')}
            </div>
            <ha-switch
              .checked=${barModule.show_percentage !== false}
              @change=${(e: Event) => updateModule({ show_percentage: (e.target as HTMLInputElement).checked })}
            ></ha-switch>
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 16px;"
          >
            ${localize('editor.bar.text_display.desc', lang, 'Control the visibility and appearance of text values shown directly on the bar. For difference and template modes, you can choose to display raw entity values instead of percentages.')}
          </div>

          

          ${
            barModule.show_percentage !== false
              ? html`
                  <!-- Display Type Toggle - Only show for difference and template types -->
                  ${barModule.percentage_type === 'difference' ||
                  barModule.percentage_type === 'template'
                    ? html`
                        <div
                          class="field-group"
                          style="margin-bottom: 16px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                        >
                          <div
                            class="field-title"
                            style="font-size: 16px !important; font-weight: 600 !important; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                          >
                            ${localize(
                              'editor.bar.text_display.show_value',
                              lang,
                              'Show Value Instead of Percentage'
                            )}
                          </div>
                          <ha-switch
                            style="justify-self: end;"
                            .checked=${barModule.show_value || false}
                            @change=${(e: Event) =>
                              updateModule({
                                show_value: (e.target as HTMLInputElement).checked,
                              })}
                          ></ha-switch>
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
                        >
                          ${localize(
                            'editor.bar.text_display.show_value_desc',
                            lang,
                            'When enabled, shows the actual entity value instead of percentage. Useful for displaying raw sensor values like "45 kWh" instead of "75%".'
                          )}
                        </div>
                      `
                    : ''}

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.bar.text_display.text_size', lang, 'Text Size')}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.text_display.text_size_desc',
                        lang,
                        'Adjust the size of the text displayed on the bar.'
                      )}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="100"
                        step="1"
                        .value="${barModule.percentage_text_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          updateModule({ percentage_text_size: value });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${barModule.percentage_text_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ percentage_text_size: value });
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = parseInt(target.value) || 14;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(8, currentValue + increment);
                            updateModule({ percentage_text_size: newValue });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ percentage_text_size: 14 })}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '14')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${localize('editor.bar.text_display.text_alignment', lang, 'Text Alignment')}
                    </div>
                    ${this.renderUcForm(
                      hass,
                      {
                        percentage_text_alignment: barModule.percentage_text_alignment || 'center',
                      },
                      [
                        this.selectField('percentage_text_alignment', [
                          {
                            value: 'left',
                            label: localize('editor.common.left', lang, 'Left'),
                          },
                          {
                            value: 'center',
                            label: localize('editor.common.center', lang, 'Center'),
                          },
                          {
                            value: 'right',
                            label: localize('editor.common.right', lang, 'Right'),
                          },
                          {
                            value: 'follow-fill',
                            label: localize(
                              'editor.bar.text_display.follow_fill',
                              lang,
                              'Follow Fill'
                            ),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.percentage_text_alignment;
                        const prev = barModule.percentage_text_alignment || 'center';
                        if (next === prev) return;
                        updateModule({ percentage_text_alignment: next });
                        // Trigger re-render to update dropdown UI
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>

                  <!-- Text Formatting -->
                  <div class="field-container" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${localize(
                        'editor.bar.text_display.text_formatting',
                        lang,
                        'Text Formatting'
                      )}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.text_display.text_formatting_desc',
                        lang,
                        'Apply formatting styles to the percentage text.'
                      )}
                    </div>
                    <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <button
                        class="format-btn ${barModule.percentage_text_bold ? 'active' : ''}"
                        @click=${() =>
                          updateModule({ percentage_text_bold: !barModule.percentage_text_bold })}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${barModule.percentage_text_bold
                          ? 'var(--primary-color)'
                          : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${barModule.percentage_text_bold
                          ? 'var(--text-primary-color)'
                          : 'var(--primary-text-color)'};"
                        title="Bold"
                      >
                        <ha-icon icon="mdi:format-bold"></ha-icon>
                      </button>
                      <button
                        class="format-btn ${barModule.percentage_text_italic ? 'active' : ''}"
                        @click=${() =>
                          updateModule({
                            percentage_text_italic: !barModule.percentage_text_italic,
                          })}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${barModule.percentage_text_italic
                          ? 'var(--primary-color)'
                          : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${barModule.percentage_text_italic
                          ? 'var(--text-primary-color)'
                          : 'var(--primary-text-color)'};"
                        title="Italic"
                      >
                        <ha-icon icon="mdi:format-italic"></ha-icon>
                      </button>
                      <button
                        class="format-btn ${barModule.percentage_text_strikethrough
                          ? 'active'
                          : ''}"
                        @click=${() =>
                          updateModule({
                            percentage_text_strikethrough: !barModule.percentage_text_strikethrough,
                          })}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${barModule.percentage_text_strikethrough
                          ? 'var(--primary-color)'
                          : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${barModule.percentage_text_strikethrough
                          ? 'var(--text-primary-color)'
                          : 'var(--primary-text-color)'};"
                        title="Strikethrough"
                      >
                        <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Text Color -->
                  <div class="field-container" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${localize('editor.bar.colors.text_color', lang, 'Text Color')}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.colors.text_color_desc',
                        lang,
                        'Choose the color for the text displayed on the bar.'
                      )}
                    </div>
                    <ultra-color-picker
                      style="width: 100%;"
                      .value=${barModule.percentage_text_color || ''}
                      .defaultValue=${'var(--primary-text-color)'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ percentage_text_color: e.detail.value })}
                    ></ultra-color-picker>
                  </div>
                `
              : ''
          }
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
              ${localize('editor.bar.left.title', lang, 'Left Side')}
            </div>
            <ha-switch
              .checked=${barModule.left_enabled || false}
              @change=${(e: Event) => {
                const enabled = (e.target as HTMLInputElement).checked;
                if (enabled) {
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
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${localize('editor.bar.left.desc', lang, "Configure the title and entity value displayed on the left side of the bar. This is useful for showing labels like 'Range' or 'Battery' along with their values.")}
          </div>

          ${
            barModule.left_enabled
              ? html`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ left_title: barModule.left_title || '' }}
                      .schema=${[{ name: 'left_title', selector: { text: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ left_title: e.detail.value.left_title })}
                    ></ha-form>
                  </div>

                  <!-- Left Entity (value source) -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ left_entity: barModule.left_entity || '' }}
                      .schema=${[{ name: 'left_entity', selector: { entity: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ left_entity: e.detail.value.left_entity })}
                    ></ha-form>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.bar.left.title_size', lang, 'Title Size')}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${barModule.left_title_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          updateModule({ left_title_size: value });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${barModule.left_title_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ left_title_size: value });
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = parseInt(target.value) || 14;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(8, Math.min(32, currentValue + increment));
                            updateModule({ left_title_size: newValue });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ left_title_size: 14 })}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '14')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.bar.left.value_size', lang, 'Value Size')}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${barModule.left_value_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          updateModule({ left_value_size: value });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${barModule.left_value_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ left_value_size: value });
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = parseInt(target.value) || 14;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(8, Math.min(32, currentValue + increment));
                            updateModule({ left_value_size: newValue });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ left_value_size: 14 })}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '14')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                  <!-- Left Template Mode -->
                  <div
                    class="field-group"
                    style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      ${localize('editor.bar.left.template_mode', lang, 'Template Mode')}
                    </div>
                    <ha-switch
                      style="justify-self: end;"
                      .checked=${barModule.left_template_mode || false}
                      @change=${(e: Event) =>
                        updateModule({
                          left_template_mode: (e.target as HTMLInputElement).checked,
                        })}
                    ></ha-switch>
                  </div>
                  ${barModule.left_template_mode
                    ? html`
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                        >
                          ${localize(
                            'editor.bar.left.template_desc',
                            lang,
                            "Use a template to format the displayed value. Templates use Home Assistant's Jinja2 syntax."
                          )}
                        </div>
                        <div class="field-group" style="margin-bottom: 0;">
                          <ha-form
                            .hass=${hass}
                            .data=${{ left_template: barModule.left_template || '' }}
                            .schema=${[
                              {
                                name: 'left_template',
                                label: localize(
                                  'editor.bar.left.value_template',
                                  lang,
                                  'Value Template'
                                ),
                                description: localize(
                                  'editor.bar.left.value_template_desc',
                                  lang,
                                  'Template to format the left-side value using Jinja2 syntax'
                                ),
                                selector: { text: { multiline: true } },
                              },
                            ]}
                            .computeLabel=${(schema: any) => schema.label || schema.name}
                            .computeDescription=${(schema: any) => schema.description || ''}
                            @value-changed=${(e: CustomEvent) => {
                              updateModule({ left_template: e.detail.value.left_template });
                            }}
                          ></ha-form>
                        </div>
                      `
                    : ''}
                `
              : html`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${localize(
                      'editor.bar.left.enable_toggle',
                      lang,
                      'Enable the toggle above to configure left side settings'
                    )}
                  </div>
                `
          }
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
              ${localize('editor.bar.right.title', lang, 'Right Side')}
            </div>
            <ha-switch
              .checked=${barModule.right_enabled || false}
              @change=${(e: Event) => {
                const enabled = (e.target as HTMLInputElement).checked;
                if (enabled) {
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
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${localize('editor.bar.right.desc', lang, "Configure the title and entity value displayed on the right side of the bar. This is ideal for complementary information like 'Time to Full' or secondary measurements.")}
          </div>

          ${
            barModule.right_enabled
              ? html`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ right_title: barModule.right_title || '' }}
                      .schema=${[{ name: 'right_title', selector: { text: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ right_title: e.detail.value.right_title })}
                    ></ha-form>
                  </div>
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ right_entity: barModule.right_entity || '' }}
                      .schema=${[{ name: 'right_entity', selector: { entity: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ right_entity: e.detail.value.right_entity })}
                    ></ha-form>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.bar.right.title_size', lang, 'Title Size')}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${barModule.right_title_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          updateModule({ right_title_size: value });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${barModule.right_title_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ right_title_size: value });
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = parseInt(target.value) || 14;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(8, Math.min(32, currentValue + increment));
                            updateModule({ right_title_size: newValue });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ right_title_size: 14 })}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '14')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.bar.right.value_size', lang, 'Value Size')}
                    </div>
                    <div class="number-range-control">
                      <input
                        type="range"
                        class="range-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${barModule.right_value_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          updateModule({ right_value_size: value });
                        }}
                      />
                      <input
                        type="number"
                        class="range-input"
                        min="8"
                        step="1"
                        .value="${barModule.right_value_size || 14}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = parseInt(target.value);
                          if (!isNaN(value)) {
                            updateModule({ right_value_size: value });
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = parseInt(target.value) || 14;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(8, Math.min(32, currentValue + increment));
                            updateModule({ right_value_size: newValue });
                          }
                        }}
                      />
                      <button
                        class="range-reset-btn"
                        @click=${() => updateModule({ right_value_size: 14 })}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '14')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                  <div
                    class="field-group"
                    style="margin-bottom: 8px; display: grid !important; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px; width: 100%;"
                  >
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      ${localize('editor.bar.right.template_mode', lang, 'Template Mode')}
                    </div>
                    <ha-switch
                      style="justify-self: end;"
                      .checked=${barModule.right_template_mode || false}
                      @change=${(e: Event) =>
                        updateModule({
                          right_template_mode: (e.target as HTMLInputElement).checked,
                        })}
                    ></ha-switch>
                  </div>
                  ${barModule.right_template_mode
                    ? html`
                        <div
                          class="field-description"
                          style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                        >
                          ${localize(
                            'editor.bar.right.template_desc',
                            lang,
                            "Use a template to format the displayed value. Templates use Home Assistant's Jinja2 syntax."
                          )}
                        </div>
                        <div class="field-group" style="margin-bottom: 0;">
                          <div
                            class="field-title"
                            style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                          >
                            ${localize('editor.bar.right.value_template', lang, 'Value Template')}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                          >
                            ${localize(
                              'editor.bar.right.value_template_desc',
                              lang,
                              'Template to format the right-side value using Jinja2 syntax'
                            )}
                          </div>
                          <div
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
                              .value=${barModule.right_template || ''}
                              .placeholder=${"{{ states('sensor.example') }}"}
                              .minHeight=${100}
                              .maxHeight=${300}
                              @value-changed=${(e: CustomEvent) =>
                                updateModule({ right_template: e.detail.value })}
                            ></ultra-template-editor>
                          </div>
                        </div>
                      `
                    : ''}
                `
              : html`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${localize(
                      'editor.bar.right.enable_toggle',
                      lang,
                      'Enable the toggle above to configure right side settings'
                    )}
                  </div>
                `
          }
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
            ${localize('editor.bar.colors.title', lang, 'Colors')}
          </div>

          
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="colors-grid"
              style="display: grid; grid-template-columns: 1fr; gap: 16px;"
            >
              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${localize('editor.bar.colors.bar_color', lang, 'Bar Color')}
                </div>
                <ultra-color-picker style="width: 100%;"
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
                  ${localize('editor.bar.colors.background_color', lang, 'Background Color')}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${barModule.bar_background_color || ''}
                  .defaultValue=${'transparent'}
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
                  ${localize('editor.bar.colors.border_color', lang, 'Border Color')}
                </div>
                <ultra-color-picker style="width: 100%;"
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
                  ${localize('editor.bar.colors.limit_indicator', lang, 'Limit Indicator')}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${barModule.limit_color || ''}
                  .defaultValue=${'var(--warning-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ limit_color: e.detail.value })}
                ></ultra-color-picker>
              </div>


              ${
                barModule.bar_style === 'minimal'
                  ? html`
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.dot_color', lang, 'Dot Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${(barModule as any).dot_color || ''}
                          .defaultValue=${'var(--primary-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ dot_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    `
                  : ''
              }
            </div>
          </div>

          <!-- Minimal Style Icon Configuration -->
          ${
            barModule.bar_style === 'minimal'
              ? html`
                  <div class="field-group" style="margin-top: 24px;">
                    <div
                      style="display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px;"
                    >
                      <div class="field-title">
                        ${localize('editor.bar.minimal.icon_enabled', lang, 'Enable Icon')}
                      </div>
                      <ha-switch
                        .checked=${barModule.minimal_icon_enabled || false}
                        @change=${(e: Event) =>
                          updateModule({
                            minimal_icon_enabled: (e.target as HTMLInputElement).checked,
                          })}
                      ></ha-switch>
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.minimal.icon_enabled_desc',
                        lang,
                        'Show an icon on the minimal bar indicator'
                      )}
                    </div>
                  </div>

                  ${barModule.minimal_icon_enabled
                    ? html`
                        <!-- Icon Selection -->
                        <div class="field-group" style="margin-top: 16px;">
                          ${this.renderFieldSection(
                            localize('editor.bar.minimal.icon', lang, 'Icon'),
                            localize(
                              'editor.bar.minimal.icon_desc',
                              lang,
                              'Choose an icon to display (e.g., mdi:battery)'
                            ),
                            hass,
                            { minimal_icon: barModule.minimal_icon || '' },
                            [this.iconField('minimal_icon')],
                            (e: CustomEvent) => updateModule(e.detail.value)
                          )}
                        </div>

                        <!-- Icon Display Mode -->
                        <div class="field-group" style="margin-top: 16px;">
                          ${this.renderFieldSection(
                            localize('editor.bar.minimal.icon_mode', lang, 'Display Mode'),
                            localize(
                              'editor.bar.minimal.icon_mode_desc',
                              lang,
                              'How to display the icon'
                            ),
                            hass,
                            { minimal_icon_mode: barModule.minimal_icon_mode || 'icon-in-dot' },
                            [
                              this.selectField('minimal_icon_mode', [
                                {
                                  value: 'dot-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_dot_only',
                                    lang,
                                    'Dot Only'
                                  ),
                                },
                                {
                                  value: 'icon-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_only',
                                    lang,
                                    'Icon Only'
                                  ),
                                },
                                {
                                  value: 'icon-in-dot',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_in_dot',
                                    lang,
                                    'Icon in Dot'
                                  ),
                                },
                              ]),
                            ],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                              setTimeout(() => this.triggerPreviewUpdate(), 50);
                            }
                          )}
                        </div>

                        <!-- Icon Size Controls -->
                        <div class="field-group" style="margin-top: 16px;">
                          <div
                            style="display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px;"
                          >
                            <div class="field-title">
                              ${localize(
                                'editor.bar.minimal.icon_size_auto',
                                lang,
                                'Auto-Scale Icon'
                              )}
                            </div>
                            <ha-switch
                              .checked=${barModule.minimal_icon_size_auto !== false}
                              @change=${(e: Event) =>
                                updateModule({
                                  minimal_icon_size_auto: (e.target as HTMLInputElement).checked,
                                })}
                            ></ha-switch>
                          </div>
                          <div class="field-description">
                            ${localize(
                              'editor.bar.minimal.icon_size_auto_desc',
                              lang,
                              'Automatically scale icon with bar height'
                            )}
                          </div>
                        </div>

                        ${barModule.minimal_icon_size_auto === false
                          ? html`
                              <div class="field-container" style="margin-top: 16px;">
                                <div class="field-title">
                                  ${localize('editor.bar.minimal.icon_size', lang, 'Icon Size')}
                                </div>
                                <div class="field-description">
                                  ${localize(
                                    'editor.bar.minimal.icon_size_desc',
                                    lang,
                                    'Custom icon size in pixels'
                                  )}
                                </div>
                                <div class="number-range-control">
                                  <input
                                    type="range"
                                    class="range-slider"
                                    min="8"
                                    max="48"
                                    step="2"
                                    .value="${barModule.minimal_icon_size || 24}"
                                    @input=${(e: Event) =>
                                      updateModule({
                                        minimal_icon_size: parseInt(
                                          (e.target as HTMLInputElement).value
                                        ),
                                      })}
                                  />
                                  <input
                                    type="number"
                                    class="range-input"
                                    min="8"
                                    step="2"
                                    .value="${barModule.minimal_icon_size || 24}"
                                    @input=${(e: Event) => {
                                      const value = parseInt((e.target as HTMLInputElement).value);
                                      if (!isNaN(value)) updateModule({ minimal_icon_size: value });
                                    }}
                                  />
                                  <button
                                    class="range-reset-btn"
                                    @click=${() => updateModule({ minimal_icon_size: 24 })}
                                  >
                                    <ha-icon icon="mdi:refresh"></ha-icon>
                                  </button>
                                </div>
                              </div>
                            `
                          : ''}

                        <!-- Icon Color Controls -->
                        <div class="field-group" style="margin-top: 16px;">
                          <div
                            style="display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; column-gap: 12px;"
                          >
                            <div class="field-title">
                              ${localize('editor.bar.minimal.use_dot_color', lang, 'Use Dot Color')}
                            </div>
                            <ha-switch
                              .checked=${barModule.minimal_icon_use_dot_color !== false}
                              @change=${(e: Event) =>
                                updateModule({
                                  minimal_icon_use_dot_color: (e.target as HTMLInputElement)
                                    .checked,
                                })}
                            ></ha-switch>
                          </div>
                          <div class="field-description">
                            ${localize(
                              'editor.bar.minimal.use_dot_color_desc',
                              lang,
                              'Use the dot color for the icon (matches gradient)'
                            )}
                          </div>
                        </div>

                        ${barModule.minimal_icon_use_dot_color === false
                          ? html`
                              <div class="field-container" style="margin-top: 16px;">
                                <div class="field-title">
                                  ${localize('editor.bar.minimal.icon_color', lang, 'Icon Color')}
                                </div>
                                <div class="field-description">
                                  ${localize(
                                    'editor.bar.minimal.icon_color_desc',
                                    lang,
                                    'Custom color for the icon'
                                  )}
                                </div>
                                <ultra-color-picker
                                  style="width: 100%;"
                                  .value=${barModule.minimal_icon_color || ''}
                                  .defaultValue=${'var(--primary-color)'}
                                  .hass=${hass}
                                  @value-changed=${(e: CustomEvent) =>
                                    updateModule({ minimal_icon_color: e.detail.value })}
                                ></ultra-color-picker>
                              </div>
                            `
                          : ''}
                      `
                    : ''}
                `
              : ''
          }

          <!-- Left Side Colors -->
          ${
            barModule.left_enabled
              ? html`
                  <div class="field-group" style="margin-bottom: 24px;">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px; color: var(--primary-color);"
                    >
                      ${localize('editor.bar.colors.left_side', lang, 'Left Side Colors')}
                    </div>
                    <div
                      class="colors-grid"
                      style="display: grid; grid-template-columns: 1fr; gap: 16px;"
                    >
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.title_color', lang, 'Title Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
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
                          ${localize('editor.bar.colors.value_color', lang, 'Value Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
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
              : ''
          }

          <!-- Right Side Colors -->
          ${
            barModule.right_enabled
              ? html`
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px; color: var(--primary-color);"
                    >
                      ${localize('editor.bar.colors.right_side', lang, 'Right Side Colors')}
                    </div>
                    <div
                      class="colors-grid"
                      style="display: grid; grid-template-columns: 1fr; gap: 16px;"
                    >
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.title_color', lang, 'Title Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
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
                          ${localize('editor.bar.colors.value_color', lang, 'Value Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
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
              : ''
          }
        </div>

        <!-- Gradient Mode -->
        <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0;"
            >
              ${localize('editor.bar.gradient.title', lang, 'Gradient Mode')}
            </div>
            <ha-switch
              .checked=${barModule.use_gradient || false}
              @change=${(e: Event) => {
                const useGradient = (e.target as HTMLInputElement).checked;
                const updates: Partial<BarModule> = { use_gradient: useGradient };
                if (
                  useGradient &&
                  (!barModule.gradient_stops || barModule.gradient_stops.length === 0)
                ) {
                  updates.gradient_stops = createDefaultGradientStops();
                  updates.gradient_display_mode = barModule.gradient_display_mode || 'full';
                }
                updateModule(updates);
              }}
            ></ha-switch>
          </div>

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px;"
          >
            ${localize('editor.bar.gradient.desc', lang, 'Apply a color gradient to the bar fill. When enabled, choose how the gradient is displayed and customize the color stops below.')}
          </div>

          ${
            barModule.use_gradient
              ? html`
                  <div class="field-group" style="margin-bottom: 12px;">
                    ${this.renderUcForm(
                      hass,
                      { gradient_display_mode: barModule.gradient_display_mode || 'full' },
                      [
                        this.selectField('gradient_display_mode', [
                          {
                            value: 'full',
                            label: localize('editor.bar.gradient.full', lang, 'Full'),
                          },
                          {
                            value: 'cropped',
                            label: localize('editor.bar.gradient.cropped', lang, 'Cropped'),
                          },
                          {
                            value: 'value-based',
                            label: localize('editor.bar.gradient.value_based', lang, 'Value-Based'),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.gradient_display_mode;
                        const prev = barModule.gradient_display_mode || 'full';
                        if (next === prev) return;
                        updateModule({ gradient_display_mode: next });
                        // Trigger re-render to update dropdown UI
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>
                  <uc-gradient-editor
                    .stops=${barModule.gradient_stops || createDefaultGradientStops()}
                    .barSize=${this.getBarSizeFromHeight((barModule as any).height ?? 20)}
                    .barRadius=${this.getBarRadiusFromStyle(barModule.border_radius || 10)}
                    .barStyle=${barModule.bar_style || 'flat'}
                    @gradient-changed=${(e: CustomEvent) => {
                      updateModule({ gradient_stops: e.detail.stops });
                    }}
                  ></uc-gradient-editor>
                `
              : ''
          }
        </div>

        <!-- Bar Animation -->
        <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
            <div
              class="section-title"
              style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px; margin: 0;"
            >
              ${localize('editor.bar.animation.title', lang, 'Bar Animation')}
            </div>
            <ha-switch
              .checked=${(barModule as any).bar_animation_enabled || false}
              @change=${(e: Event) =>
                updateModule({ bar_animation_enabled: (e.target as HTMLInputElement).checked })}
            ></ha-switch>
          </div>
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px;"
          >
            ${localize('editor.bar.animation.desc', lang, "Animate the bar fill using presets like charging stripes, pulse, shimmer, and more. You can trigger animations based on an entity's state or attribute, and optionally override the animation when another condition is met.")}
          </div>
          ${
            (barModule as any).bar_animation_enabled
              ? html`
                  ${this.renderSettingsSection(
                    localize('editor.bar.animation.trigger.title', lang, 'Animation Trigger'),
                    localize(
                      'editor.bar.animation.trigger.desc',
                      lang,
                      'Select an entity to watch and define the value + animation to apply when it matches.'
                    ),
                    [
                      {
                        title: localize('editor.common.entity', lang, 'Entity'),
                        description: localize(
                          'editor.bar.animation.trigger.entity_desc',
                          lang,
                          'Entity to evaluate for animation trigger'
                        ),
                        hass,
                        data: {
                          bar_animation_entity: (barModule as any).bar_animation_entity || '',
                        },
                        schema: [this.entityField('bar_animation_entity')],
                        onChange: (e: CustomEvent) =>
                          updateModule({
                            bar_animation_entity: e.detail.value.bar_animation_entity,
                          }),
                      },
                      {
                        title: localize('editor.bar.animation.trigger.type', lang, 'Trigger Type'),
                        description: localize(
                          'editor.bar.animation.trigger.type_desc',
                          lang,
                          'Choose whether to compare the entity state or an attribute'
                        ),
                        hass,
                        data: {
                          bar_animation_trigger_type:
                            (barModule as any).bar_animation_trigger_type || 'state',
                        },
                        schema: [
                          this.selectField('bar_animation_trigger_type', [
                            {
                              value: 'state',
                              label: localize('editor.common.state', lang, 'State'),
                            },
                            {
                              value: 'attribute',
                              label: localize('editor.common.attribute', lang, 'Attribute'),
                            },
                          ]),
                        ],
                        onChange: (e: CustomEvent) => updateModule(e.detail.value),
                      },
                      ...(((barModule as any).bar_animation_trigger_type || 'state') === 'attribute'
                        ? [
                            {
                              title: localize(
                                'editor.common.attribute_name',
                                lang,
                                'Attribute Name'
                              ),
                              description: localize(
                                'editor.bar.animation.trigger.attribute_name_desc',
                                lang,
                                'Name of the attribute to compare (e.g., charging_status)'
                              ),
                              hass,
                              data: {
                                bar_animation_attribute:
                                  (barModule as any).bar_animation_attribute || '',
                              },
                              schema: [this.textField('bar_animation_attribute')],
                              onChange: (e: CustomEvent) =>
                                updateModule({
                                  bar_animation_attribute: e.detail.value.bar_animation_attribute,
                                }),
                            },
                          ]
                        : []),
                      ...(((barModule as any).bar_animation_entity || '').trim()
                        ? [
                            {
                              title: localize(
                                'editor.bar.animation.trigger.match_value',
                                lang,
                                'Match Value'
                              ),
                              description: localize(
                                'editor.bar.animation.trigger.match_value_desc',
                                lang,
                                'Text to compare against the state or attribute (comparison is string-based).'
                              ),
                              hass,
                              data: {
                                bar_animation_value: (barModule as any).bar_animation_value || '',
                              },
                              schema: [this.textField('bar_animation_value')],
                              onChange: (e: CustomEvent) =>
                                updateModule({
                                  bar_animation_value: e.detail.value.bar_animation_value,
                                }),
                            },
                          ]
                        : []),
                      {
                        title: localize('editor.bar.animation.type', lang, 'Animation Type'),
                        description: localize(
                          'editor.bar.animation.type_desc',
                          lang,
                          'Select how the bar should animate when triggered.'
                        ),
                        hass,
                        data: {
                          bar_animation_type: (barModule as any).bar_animation_type || 'none',
                        },
                        schema: [
                          this.selectField('bar_animation_type', [
                            { value: 'none', label: localize('editor.common.none', lang, 'None') },
                            {
                              value: 'charging',
                              label: localize(
                                'editor.bar.animation.types.charging',
                                lang,
                                'Charging (Diagonal Lines)'
                              ),
                            },
                            {
                              value: 'pulse',
                              label: localize('editor.bar.animation.types.pulse', lang, 'Pulse'),
                            },
                            {
                              value: 'blinking',
                              label: localize(
                                'editor.bar.animation.types.blinking',
                                lang,
                                'Blinking'
                              ),
                            },
                            {
                              value: 'bouncing',
                              label: localize(
                                'editor.bar.animation.types.bouncing',
                                lang,
                                'Bouncing'
                              ),
                            },
                            {
                              value: 'glow',
                              label: localize('editor.bar.animation.types.glow', lang, 'Glow'),
                            },
                            {
                              value: 'rainbow',
                              label: localize(
                                'editor.bar.animation.types.rainbow',
                                lang,
                                'Rainbow'
                              ),
                            },
                            {
                              value: 'bubbles',
                              label: localize(
                                'editor.bar.animation.types.bubbles',
                                lang,
                                'Bubbles'
                              ),
                            },
                            {
                              value: 'fill',
                              label: localize('editor.bar.animation.types.fill', lang, 'Fill'),
                            },
                            {
                              value: 'ripple',
                              label: localize('editor.bar.animation.types.ripple', lang, 'Ripple'),
                            },
                            {
                              value: 'traffic',
                              label: localize(
                                'editor.bar.animation.types.traffic',
                                lang,
                                'Traffic (Barber Pole)'
                              ),
                            },

                            {
                              value: 'heartbeat',
                              label: localize(
                                'editor.bar.animation.types.heartbeat',
                                lang,
                                'Heartbeat'
                              ),
                            },
                            {
                              value: 'flicker',
                              label: localize(
                                'editor.bar.animation.types.flicker',
                                lang,
                                'Flicker'
                              ),
                            },
                            {
                              value: 'shimmer',
                              label: localize(
                                'editor.bar.animation.types.shimmer',
                                lang,
                                'Shimmer'
                              ),
                            },
                            {
                              value: 'vibrate',
                              label: localize(
                                'editor.bar.animation.types.vibrate',
                                lang,
                                'Vibrate'
                              ),
                            },
                          ]),
                        ],
                        onChange: (e: CustomEvent) => updateModule(e.detail.value),
                      },
                    ]
                  )}
                  ${this.renderSettingsSection(
                    localize(
                      'editor.bar.animation.override.title',
                      lang,
                      'Action Animation Override'
                    ),
                    localize(
                      'editor.bar.animation.override.desc',
                      lang,
                      'Select an Action Entity and state to define when this animation should override the regular animation'
                    ),
                    [
                      {
                        title: localize('editor.common.entity', lang, 'Entity'),
                        description: localize(
                          'editor.bar.animation.override.entity_desc',
                          lang,
                          'Entity to evaluate for the override trigger'
                        ),
                        hass,
                        data: {
                          bar_animation_override_entity:
                            (barModule as any).bar_animation_override_entity || '',
                        },
                        schema: [this.entityField('bar_animation_override_entity')],
                        onChange: (e: CustomEvent) =>
                          updateModule({
                            bar_animation_override_entity:
                              e.detail.value.bar_animation_override_entity,
                          }),
                      },
                      {
                        title: localize('editor.bar.animation.trigger.type', lang, 'Trigger Type'),
                        description: localize(
                          'editor.bar.animation.override.type_desc',
                          lang,
                          'Compare the entity state or one of its attributes'
                        ),
                        hass,
                        data: {
                          bar_animation_override_trigger_type:
                            (barModule as any).bar_animation_override_trigger_type || 'state',
                        },
                        schema: [
                          this.selectField('bar_animation_override_trigger_type', [
                            {
                              value: 'state',
                              label: localize('editor.common.state', lang, 'State'),
                            },
                            {
                              value: 'attribute',
                              label: localize('editor.common.attribute', lang, 'Attribute'),
                            },
                          ]),
                        ],
                        onChange: (e: CustomEvent) => {
                          const next = e.detail.value.bar_animation_override_trigger_type;
                          const prev =
                            (barModule as any).bar_animation_override_trigger_type || 'state';
                          if (next === prev) return;
                          updateModule(e.detail.value);
                        },
                      },
                      ...(((barModule as any).bar_animation_override_trigger_type || 'state') ===
                      'attribute'
                        ? [
                            {
                              title: localize(
                                'editor.common.attribute_name',
                                lang,
                                'Attribute Name'
                              ),
                              description: localize(
                                'editor.bar.animation.override.attribute_name_desc',
                                lang,
                                'Name of the attribute to compare'
                              ),
                              hass,
                              data: {
                                bar_animation_override_attribute:
                                  (barModule as any).bar_animation_override_attribute || '',
                              },
                              schema: [this.textField('bar_animation_override_attribute')],
                              onChange: (e: CustomEvent) =>
                                updateModule({
                                  bar_animation_override_attribute:
                                    e.detail.value.bar_animation_override_attribute,
                                }),
                            },
                          ]
                        : []),
                      {
                        title: localize(
                          'editor.bar.animation.override.match_value',
                          lang,
                          'Override Match Value'
                        ),
                        description: localize(
                          'editor.bar.animation.override.match_value_desc',
                          lang,
                          'String comparison against state or attribute'
                        ),
                        hass,
                        data: {
                          bar_animation_override_value:
                            (barModule as any).bar_animation_override_value || '',
                        },
                        schema: [this.textField('bar_animation_override_value')],
                        onChange: (e: CustomEvent) =>
                          updateModule({
                            bar_animation_override_value:
                              e.detail.value.bar_animation_override_value,
                          }),
                      },
                      {
                        title: localize(
                          'editor.bar.animation.override.type',
                          lang,
                          'Override Animation Type'
                        ),
                        description: localize(
                          'editor.bar.animation.override.type_desc',
                          lang,
                          'Animation to use when override condition matches.'
                        ),
                        hass,
                        data: {
                          bar_animation_override_type:
                            (barModule as any).bar_animation_override_type || 'none',
                        },
                        schema: [
                          this.selectField('bar_animation_override_type', [
                            { value: 'none', label: localize('editor.common.none', lang, 'None') },
                            {
                              value: 'charging',
                              label: localize(
                                'editor.bar.animation.types.charging',
                                lang,
                                'Charging (Diagonal Lines)'
                              ),
                            },
                            {
                              value: 'pulse',
                              label: localize('editor.bar.animation.types.pulse', lang, 'Pulse'),
                            },
                            {
                              value: 'blinking',
                              label: localize(
                                'editor.bar.animation.types.blinking',
                                lang,
                                'Blinking'
                              ),
                            },
                            {
                              value: 'bouncing',
                              label: localize(
                                'editor.bar.animation.types.bouncing',
                                lang,
                                'Bouncing'
                              ),
                            },
                            {
                              value: 'glow',
                              label: localize('editor.bar.animation.types.glow', lang, 'Glow'),
                            },
                            {
                              value: 'rainbow',
                              label: localize(
                                'editor.bar.animation.types.rainbow',
                                lang,
                                'Rainbow'
                              ),
                            },
                            {
                              value: 'bubbles',
                              label: localize(
                                'editor.bar.animation.types.bubbles',
                                lang,
                                'Bubbles'
                              ),
                            },
                            {
                              value: 'fill',
                              label: localize('editor.bar.animation.types.fill', lang, 'Fill'),
                            },
                            {
                              value: 'ripple',
                              label: localize('editor.bar.animation.types.ripple', lang, 'Ripple'),
                            },
                            {
                              value: 'traffic',
                              label: localize(
                                'editor.bar.animation.types.traffic',
                                lang,
                                'Traffic (Barber Pole)'
                              ),
                            },

                            {
                              value: 'heartbeat',
                              label: localize(
                                'editor.bar.animation.types.heartbeat',
                                lang,
                                'Heartbeat'
                              ),
                            },
                            {
                              value: 'flicker',
                              label: localize(
                                'editor.bar.animation.types.flicker',
                                lang,
                                'Flicker'
                              ),
                            },
                            {
                              value: 'shimmer',
                              label: localize(
                                'editor.bar.animation.types.shimmer',
                                lang,
                                'Shimmer'
                              ),
                            },
                            {
                              value: 'vibrate',
                              label: localize(
                                'editor.bar.animation.types.vibrate',
                                lang,
                                'Vibrate'
                              ),
                            },
                          ]),
                        ],
                        onChange: (e: CustomEvent) => updateModule(e.detail.value),
                      },
                    ]
                  )}
                `
              : ''
          }
        </div>

        <!-- Action Animation Override removed as standalone: now included inside Bar Animation section above -->
      </div>
    `;
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as BarModule, hass, updates => updateModule(updates));
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const barModule = module as BarModule;

    // GRACEFUL RENDERING: Check for incomplete configuration
    if (!barModule.entity || barModule.entity.trim() === '') {
      return this.renderGradientErrorState(
        'Select Entity',
        'Choose an entity in the General tab',
        'mdi:chart-box-outline'
      );
    }

    // Resolve bar percentage based on selected percentage calculation mode
    let percentage = 0;
    let barColor: string | undefined;
    let barLabel: string | undefined;

    const clampPercent = (p: number) => Math.min(Math.max(p, 0), 100);

    // PRIORITY 1: Unified template (if enabled)
    if (barModule.unified_template_mode && barModule.unified_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }
      if (hass) {
        if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
        const templateHash = this._hashString(barModule.unified_template);
        const templateKey = `unified_bar_${barModule.id}_${templateHash}`;

        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          const context = buildEntityContext(barModule.entity, hass, {
            entity: barModule.entity,
          });
          this._templateService.subscribeToTemplate(
            barModule.unified_template,
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
                percentage = num <= 1 ? clampPercent(num * 100) : clampPercent(num);
              }
            }
            if (parsed.color) barColor = parsed.color;
            if (parsed.label) barLabel = parsed.label;
          }
        }
      }
    }

    // For preview purposes, if no entity is configured, show a demo bar with 65%
    const hasValidEntity = barModule.entity && hass?.states[barModule.entity];
    const isPreviewMode = !hasValidEntity;

    // PRIORITY 2: Legacy percentage calculations (only if unified template didn't set percentage)
    if (!barModule.unified_template_mode) {
      const pctType = (barModule as any).percentage_type || 'entity';
      if (pctType === 'template' && (barModule as any).percentage_template) {
        // Template-driven percentage
        if (!this._templateService && hass) {
          this._templateService = new TemplateService(hass);
        }
        if (hass) {
          if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
          const tpl = (barModule as any).percentage_template as string;
          const key = `bar_percentage_${barModule.id}_${this._hashString(tpl)}`;
          if (this._templateService && !this._templateService.hasTemplateSubscription(key)) {
            this._templateService.subscribeToTemplate(tpl, key, () => {
              if (typeof window !== 'undefined') {
                // Use global debounced update
                if (!window._ultraCardUpdateTimer) {
                  window._ultraCardUpdateTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                    window._ultraCardUpdateTimer = null;
                  }, 50);
                }
              }
            });
          }
          const rendered = hass.__uvc_template_strings?.[key];
          if (rendered !== undefined) {
            const num = parseFloat(String(rendered));
            if (!isNaN(num)) {
              // Accept 0..100 directly; if 0..1 assume fraction and upscale
              percentage = num <= 1 ? clampPercent(num * 100) : clampPercent(num);
            }
          }
        }
      } else if (pctType === 'attribute') {
        const entId = (barModule as any).percentage_attribute_entity || (barModule as any).entity;
        const attrName = (barModule as any).percentage_attribute_name || '';
        const st = entId ? hass?.states[entId] : undefined;
        const raw = attrName ? (st?.attributes as any)?.[attrName] : undefined;
        const unit = st?.attributes?.unit_of_measurement || '';
        const num = parseFloat(String(raw ?? '0'));
        if (!isNaN(num)) {
          if (unit === '%' || String(raw).toString().trim().endsWith('%')) {
            percentage = clampPercent(num);
          } else if (st?.attributes?.max) {
            const max = parseFloat(String(st.attributes.max));
            percentage = max > 0 ? clampPercent((num / max) * 100) : 0;
          } else {
            // Assume direct percent
            percentage = clampPercent(num);
          }
        }
      } else if (pctType === 'difference') {
        const currId = (barModule as any).percentage_current_entity;
        const totalId = (barModule as any).percentage_total_entity;
        const curr = currId ? parseFloat(String(hass?.states[currId]?.state ?? '0')) : 0;
        const total = totalId ? parseFloat(String(hass?.states[totalId]?.state ?? '0')) : 0;
        percentage = total > 0 ? clampPercent((curr / total) * 100) : 0;
      } else {
        // Entity-based percentage
        const entityState = hass?.states[barModule.entity];
        let value = 0;
        let maxValue = 100;
        let unit = '';

        if (entityState) {
          value = parseFloat(entityState.state) || 0;
          unit = entityState.attributes?.unit_of_measurement || '';

          if (entityState.attributes?.max) {
            maxValue = parseFloat(entityState.attributes.max);
          } else if (unit === '%') {
            maxValue = 100;
          } else if (entityState.attributes?.device_class === 'battery') {
            maxValue = 100;
          }
        }
        percentage = clampPercent((value / maxValue) * 100);
      }
    }

    // If in preview mode (no valid entity), show demo percentage
    if (isPreviewMode && !barModule.unified_template_mode) {
      percentage = 65; // Demo value for preview
    }

    // Get left side values with template support
    let leftDisplay = '';
    if (barModule.left_template_mode && barModule.left_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }
      if (hass) {
        if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
        const templateHash = this._hashString(barModule.left_template);
        const templateKey = `bar_left_${barModule.id}_${templateHash}`;
        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(barModule.left_template, templateKey, () => {
            if (typeof window !== 'undefined') {
              // Use global debounced update
              if (!window._ultraCardUpdateTimer) {
                window._ultraCardUpdateTimer = setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                  window._ultraCardUpdateTimer = null;
                }, 50);
              }
            }
          });
        }
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined && String(rendered).trim() !== '') {
          leftDisplay = String(rendered);
        }
      }
    }
    if (!leftDisplay && barModule.left_entity && hass?.states[barModule.left_entity]) {
      const leftState = hass.states[barModule.left_entity];
      try {
        leftDisplay = formatEntityState(hass, barModule.left_entity, { includeUnit: true });
      } catch (_e) {
        leftDisplay = `${leftState.state}${leftState.attributes?.unit_of_measurement || ''}`;
      }
    }

    // Get right side values with template support
    let rightDisplay = '';
    if (barModule.right_template_mode && barModule.right_template) {
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }
      if (hass) {
        if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
        const templateHash = this._hashString(barModule.right_template);
        const templateKey = `bar_right_${barModule.id}_${templateHash}`;
        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(barModule.right_template, templateKey, () => {
            if (typeof window !== 'undefined') {
              // Use global debounced update
              if (!window._ultraCardUpdateTimer) {
                window._ultraCardUpdateTimer = setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                  window._ultraCardUpdateTimer = null;
                }, 50);
              }
            }
          });
        }
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined && String(rendered).trim() !== '') {
          rightDisplay = String(rendered);
        }
      }
    }
    if (!rightDisplay && barModule.right_entity && hass?.states[barModule.right_entity]) {
      const rightState = hass.states[barModule.right_entity];
      try {
        rightDisplay = formatEntityState(hass, barModule.right_entity, { includeUnit: true });
      } catch (_e) {
        rightDisplay = `${rightState.state}${rightState.attributes?.unit_of_measurement || ''}`;
      }
    }

    // Get limit indicator value and percentage
    let limitPercentage = 0;
    if (barModule.limit_entity && hass?.states[barModule.limit_entity]) {
      const limitState = hass.states[barModule.limit_entity];
      const limitValue = parseFloat(limitState.state) || 0;
      // If the base percentage is template/attribute/difference, we don't know maxValue.
      // Assume limit values are already in percent unless an entity with max is provided.
      const baseMax = 100; // safe default
      limitPercentage = Math.min(Math.max((limitValue / baseMax) * 100, 0), 100);
    }

    // Apply design properties with priority - design properties override module properties
    const moduleWithDesign = barModule as any;
    const designProperties = (barModule as any).design || {};

    // Force update when design properties change by ensuring we use them
    const containerBackground =
      designProperties.background_color || moduleWithDesign.background_color || 'transparent';

    const containerWidth = designProperties.width || moduleWithDesign.width || '100%';

    // Track background (the bar track itself, not the container)
    // IMPORTANT: Do not use global design background here; it should render on the container,
    // and the track should default to transparent unless the module explicitly sets a bar background.
    const trackBackground = barModule.bar_background_color || 'transparent';

    // Calculate bar height from height property with proper default
    let barHeightValue = (barModule as any).height ?? 20;

    // For minimal style, ensure container is tall enough for the dot
    if (barModule.bar_style === 'minimal') {
      const lineHeight = Math.max(1, Math.floor(barHeightValue / 3));
      const dotSize = Math.max(8, Math.min(24, lineHeight * 3 + 6));
      // Container needs to be at least as tall as the dot plus some padding
      barHeightValue = Math.max(barHeightValue, dotSize + 8);
    }

    const barHeight = `${barHeightValue}px`;

    // Calculate total container height including text elements
    let totalContainerHeight = barHeightValue;

    // Note: Percentage text is now positioned absolutely on top of the bar for all styles
    // No need to add extra height for minimal style percentage text

    // Add space for left/right labels if enabled (below the bar)
    if (barModule.left_enabled || barModule.right_enabled) {
      const labelSize = Math.max(
        (barModule as any).left_title_size || 14,
        (barModule as any).left_value_size || 14,
        (barModule as any).right_title_size || 14,
        (barModule as any).right_value_size || 14
      );
      totalContainerHeight += labelSize + 16; // label height + margin
    }

    const totalContainerHeightPx = `${totalContainerHeight}px`;

    // Calculate border radius for the bar track. Prefer module value over global design so the slider takes effect immediately.
    const resolvedBorderRadius = (barModule.border_radius ??
      designProperties.border_radius ??
      10) as any;
    const borderRadius =
      typeof resolvedBorderRadius === 'string'
        ? parseInt(resolvedBorderRadius, 10) || 10
        : (resolvedBorderRadius as number);

    // Generate gradient or solid color for bar fill
    let barFillBackground =
      barColor || barModule.bar_color || moduleWithDesign.color || 'var(--primary-color)';

    // Resolve CSS variable colors (var(--...)) to computed RGB values when needed.
    // This ensures gradients and value-based colors render the same whether a hex or a CSS variable is provided.
    const resolveCSSColor = (inputColor: string): string => {
      if (!inputColor) return inputColor;
      const trimmed = String(inputColor).trim();
      // Fast-path: hex or rgb/rgba are already concrete colors
      if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) return trimmed;
      // Attempt to resolve CSS variables or named colors via a temporary element
      try {
        const probe = document.createElement('span');
        probe.style.backgroundColor = trimmed; // Use backgroundColor to preserve alpha
        // Use body for widest variable scope (HA themes apply at document level)
        document.body.appendChild(probe);
        const computed = getComputedStyle(probe).backgroundColor; // Preserves RGBA
        probe.remove();
        return computed && computed !== 'rgba(0, 0, 0, 0)' ? computed : trimmed;
      } catch {
        return trimmed;
      }
    };

    // Helper function to interpolate color at specific position with alpha preservation
    const interpolateColorAtPosition = (stops: any[], position: number): string => {
      const sortedStops = [...stops].sort((a, b) => a.position - b.position);

      // Find the stops surrounding our position
      let beforeStop = sortedStops[0];
      let afterStop = sortedStops[sortedStops.length - 1];

      for (let i = 0; i < sortedStops.length - 1; i++) {
        if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
          beforeStop = sortedStops[i];
          afterStop = sortedStops[i + 1];
          break;
        }
      }

      // If exact match, return that color
      if (beforeStop.position === position) return beforeStop.color;
      if (afterStop.position === position) return afterStop.color;

      // Interpolate between the two stops using the updated interpolateColor method
      const range = afterStop.position - beforeStop.position;
      const factor = range === 0 ? 0 : (position - beforeStop.position) / range;

      // Use the updated interpolateColor method which preserves alpha
      return this.interpolateColor(beforeStop.color, afterStop.color, factor);
    };

    // Determine bar direction for all styles
    const fillDirection = (barModule as any).bar_direction || 'left-to-right';

    const resolveFontSize = (value: any, fallback: number): string => {
      if (value === undefined || value === null || value === '') {
        return `${fallback}px`;
      }
      if (typeof value === 'number') {
        return `${value}px`;
      }
      const trimmed = String(value).trim();
      if (trimmed === '') {
        return `${fallback}px`;
      }
      const specialValues = ['inherit', 'initial', 'unset', 'auto'];
      if (specialValues.includes(trimmed.toLowerCase())) {
        return `${fallback}px`;
      }
      if (/^[0-9.]+$/.test(trimmed)) {
        return `${trimmed}px`;
      }
      return trimmed;
    };

    const percentageFontSize = (() => {
      const designSize = designProperties.font_size ?? moduleWithDesign.font_size;
      if (designSize !== undefined && designSize !== null && designSize !== '') {
        return resolveFontSize(designSize, barModule.percentage_text_size ?? 14);
      }
      return resolveFontSize(barModule.percentage_text_size ?? 14, 14);
    })();

    const followFillTransform =
      fillDirection === 'right-to-left'
        ? 'translate(-100%, -50%) translateX(4px)'
        : 'translate(-100%, -50%) translateX(-4px)';

    const showPercentageText = barModule.show_percentage !== false;
    const percentageTextAlignment = barModule.percentage_text_alignment || 'center';

    const percentageDisplayText = (() => {
      if (!showPercentageText) {
        return '';
      }

      if (barModule.show_value) {
        if (isPreviewMode) {
          return '65 kWh';
        }

        const pctType = (barModule as any).percentage_type || 'entity';

        if (pctType === 'difference') {
          const currentEntity = (barModule as any).percentage_current_entity;
          if (currentEntity && hass?.states[currentEntity]) {
            const currentState = hass.states[currentEntity];
            try {
              return formatEntityState(hass, currentEntity, {
                includeUnit: true,
              });
            } catch (_e) {
              return `${currentState.state}${currentState.attributes?.unit_of_measurement || ''}`;
            }
          }
        } else if (pctType === 'template') {
          const template = (barModule as any).percentage_template;
          if (template && hass) {
            if (!hass.__uvc_template_strings) hass.__uvc_template_strings = {};
            const key = `bar_percentage_${barModule.id}_${this._hashString(template)}`;
            const rendered = hass.__uvc_template_strings?.[key];
            if (rendered !== undefined) {
              return String(rendered);
            }
          }
        }

        const entityState = hass?.states[barModule.entity];
        if (entityState) {
          try {
            return formatEntityState(hass, barModule.entity, {
              includeUnit: true,
            });
          } catch (_e) {
            return `${entityState.state}${entityState.attributes?.unit_of_measurement || ''}`;
          }
        }
        return 'N/A';
      }

      return `${Math.round(percentage)}%`;
    })();

    if (barModule.use_gradient) {
      // Ensure gradient stops exist, create defaults if needed
      const gradientStops =
        barModule.gradient_stops && barModule.gradient_stops.length > 0
          ? barModule.gradient_stops
          : createDefaultGradientStops();

      // Determine gradient direction based on bar direction
      const gradientDirection = fillDirection === 'right-to-left' ? 'to left' : 'to right';

      // Build gradient string with resolved colors so CSS variables work reliably in all modes
      const gradientString = [...gradientStops]
        .sort((a, b) => a.position - b.position)
        .map(s => `${resolveCSSColor(s.color)} ${s.position}%`)
        .join(', ');

      if (barModule.gradient_display_mode === 'full') {
        // Full mode: Show entire gradient on the bar fill only
        barFillBackground = `linear-gradient(${gradientDirection}, ${gradientString})`;
      } else if (barModule.gradient_display_mode === 'value-based') {
        // Value-based mode: Show only the solid color that corresponds to the current percentage
        const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);
        const valueColor = interpolateColorAtPosition(sortedStops, percentage);
        barFillBackground = resolveCSSColor(valueColor);
      } else {
        // Cropped mode: show gradient only up to the current percentage.
        // 1) Include all stops <= percentage, normalized to 0..100
        // 2) Add an interpolated color at the exact percentage so the tip matches the true color
        const sortedStops = [...gradientStops].sort((a, b) => a.position - b.position);

        // If percentage is 0, use the first stop color only
        if (percentage <= 0) {
          const first = sortedStops[0];
          barFillBackground = first ? resolveCSSColor(first.color) : barFillBackground;
        } else {
          // Gather included stops and normalize their positions
          const included = sortedStops.filter(stop => stop.position <= percentage);
          const segments: string[] = [];

          if (included.length === 0) {
            // Between first stop and percentage before first stop: use first color
            const first = sortedStops[0];
            if (first) segments.push(`${first.color} 0%`, `${first.color} 100%`);
          } else {
            for (const stop of included) {
              const pos = (stop.position / percentage) * 100;
              const clamped = Math.max(0, Math.min(100, pos));
              segments.push(`${resolveCSSColor(stop.color)} ${clamped}%`);
            }

            // Interpolate the true color at the current percentage to use as the tip
            const tipColor = resolveCSSColor(interpolateColorAtPosition(sortedStops, percentage));
            if (segments.length === 0) {
              segments.push(`${tipColor} 0%`, `${tipColor} 100%`);
            } else {
              // Ensure a final segment at 100% for a clean edge
              segments.push(`${tipColor} 100%`);
            }
          }

          barFillBackground = `linear-gradient(${gradientDirection}, ${segments.join(', ')})`;
        }
      }
    }

    // Apply comprehensive bar style effects
    let barStyleCSS = '';
    let fillStyleCSS = '';
    let fillOverlayCSS = ''; // New: overlay effects that work with gradients
    let animationClass = '';

    // Helper function to extract base color from gradient or solid background
    const getBaseColorForStyle = (background: string): string => {
      // If it's a gradient, try to extract the primary color
      if (background.includes('linear-gradient')) {
        // For gradients, use the bar_color or fallback to primary color
        return barModule.bar_color || 'var(--primary-color)';
      }
      return background;
    };

    // Helper function to extract the appropriate color from a gradient for glow effects
    const getGlowColorFromGradient = (background: string): string => {
      if (
        background.includes('linear-gradient') &&
        barModule.use_gradient &&
        barModule.gradient_stops
      ) {
        const gradientMode = barModule.gradient_display_mode || 'full';

        if (gradientMode === 'value-based' || gradientMode === 'cropped') {
          // For value-based and cropped modes, use the color at the current percentage
          return interpolateColorAtPosition(barModule.gradient_stops, percentage);
        } else {
          // For full mode, use the last color (rightmost/last color)
          const sortedStops = [...barModule.gradient_stops].sort((a, b) => b.position - a.position);
          if (sortedStops.length > 0) {
            return sortedStops[0].color;
          }
        }
      }
      return getBaseColorForStyle(background);
    };

    const baseColor = getBaseColorForStyle(barFillBackground);

    switch (barModule.bar_style) {
      case 'flat':
        barStyleCSS = `box-shadow: none;`;
        break;
      case 'glossy':
        if (barModule.use_gradient) {
          // For gradients, use overlay approach
          fillOverlayCSS = `
            background-image: linear-gradient(to bottom, 
              rgba(255,255,255,0.3) 0%, 
              rgba(255,255,255,0.1) 50%, 
              rgba(0,0,0,0.1) 51%, 
              rgba(0,0,0,0.05) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          `;
        } else {
          fillStyleCSS = `
            background: linear-gradient(to bottom, ${barFillBackground}, ${barFillBackground} 50%, rgba(0,0,0,0.1) 51%, ${barFillBackground});
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
          `;
        }
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
        if (barModule.use_gradient) {
          // For gradients, add overlay on top
          fillOverlayCSS = `
            background-image: linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0) 100%);
          `;
        } else {
          fillStyleCSS = `
            background: linear-gradient(to bottom, 
              ${barFillBackground} 0%, 
              rgba(255,255,255,0) 100%
            );
          `;
        }
        break;
      case 'neon-glow':
        // For neon glow, we'll add the glow as a separate element positioned at the percentage
        // The glow element is added in the HTML template after the bar fill
        {
          // Get the base color for the glow effect (handles gradients intelligently)
          const glowColor = getGlowColorFromGradient(barFillBackground);

          // Helper to convert color to rgba with specific opacity
          const toRgbaWithOpacity = (color: string, opacity: number): string => {
            // If already rgba, replace the alpha value
            if (color.startsWith('rgba(')) {
              return color.replace(/,\s*[\d.]+\s*\)$/, `, ${opacity})`);
            }
            // If rgb, convert to rgba
            if (color.startsWith('rgb(')) {
              return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
            }
            // For hex colors, CSS variables, or named colors, use color-mix (modern CSS)
            // Fallback: just use the color as-is (browsers will handle it)
            return color.includes('#') || color.startsWith('var(') || color.match(/^[a-z]+$/i)
              ? `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`
              : color;
          };

          fillStyleCSS = `
            filter: brightness(1.2);
            box-shadow: 
              0 0 7px 2px ${toRgbaWithOpacity(glowColor, 0.7)},
              0 0 14px 6px ${toRgbaWithOpacity(glowColor, 0.5)},
              0 0 20px 10px ${toRgbaWithOpacity(glowColor, 0.3)},
              inset 0 0 10px rgba(255, 255, 255, 0.8);
          `;

          barStyleCSS = `
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
            overflow: hidden;
          `;
        }
        break;
      case 'outline':
        {
          // Outline style: Use same code for both solid and gradient modes
          const trackColor = trackBackground || 'rgba(255, 255, 255, 0.1)';
          const gapSize = 4;
          const borderWidth = 2;
          const outlineColor = resolveCSSColor(barModule.bar_color || 'var(--primary-color)');

          barStyleCSS = `
            border: ${borderWidth}px solid ${outlineColor};
            border-radius: ${borderRadius}px;
            background: ${trackColor};
            padding: ${gapSize}px;
          `;

          fillStyleCSS = `
            background: ${barFillBackground};
            border: none;
            box-sizing: border-box;
            position: relative;
            margin: 0;
            width: ${percentage}%;
            transition: width 0.3s ease;
          `;
        }
        break;
      case 'glass':
        {
          // Liquid Glass effect inspired by iOS 16
          // Creates a frosted glass appearance with subtle depth and translucency
          const glassOpacity = 0.15;
          const glassBorderOpacity = 0.25;
          const glassBlur = barModule.glass_blur_amount || 8;

          barStyleCSS = `
            backdrop-filter: blur(${glassBlur}px) saturate(180%);
            background: linear-gradient(
              135deg,
              rgba(255, 255, 255, ${glassOpacity * 0.8}) 0%,
              rgba(255, 255, 255, ${glassOpacity * 0.4}) 50%,
              rgba(255, 255, 255, ${glassOpacity}) 100%
            );
            border: 1px solid rgba(255, 255, 255, ${glassBorderOpacity});
            border-radius: ${borderRadius}px;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            position: relative;
          `;

          // Fill should be solid, not glass - only the track background has glass effect
          if (barModule.use_gradient) {
            fillOverlayCSS = `
              background: ${barFillBackground};
              border-radius: ${Math.max(0, borderRadius - 2)}px;
            `;
          } else {
            fillStyleCSS = `
              background: ${barFillBackground};
              border-radius: ${Math.max(0, borderRadius - 2)}px;
              position: relative;
            `;
          }
        }
        break;
      case 'metallic':
        if (barModule.use_gradient) {
          fillOverlayCSS = `
            background-image: linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0) 20%, 
              rgba(255,255,255,0) 80%, 
              rgba(0,0,0,0.2) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);
          `;
        } else {
          fillStyleCSS = `
            background: linear-gradient(to bottom, 
              rgba(255,255,255,0.4) 0%, 
              ${barFillBackground} 20%, 
              ${barFillBackground} 80%, 
              rgba(0,0,0,0.2) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.3);
          `;
        }
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
        // Create dashed segments with rounded last dash only at 100%
        const segmentWidth = 12;
        const gapWidth = 4;
        const totalWidth = segmentWidth + gapWidth;
        const isRightToLeft = fillDirection === 'right-to-left';

        if (percentage >= 99.5) {
          // At 100%, create rounded last dash
          const borderRadiusStyle = isRightToLeft
            ? `${borderRadius}px 0 0 ${borderRadius}px`
            : `0 ${borderRadius}px ${borderRadius}px 0`;

          fillStyleCSS = `
            mask-image: repeating-linear-gradient(
              90deg,
              black 0px,
              black ${segmentWidth}px,
              transparent ${segmentWidth}px,
              transparent ${totalWidth}px
            );
            -webkit-mask-image: repeating-linear-gradient(
              90deg,
              black 0px,
              black ${segmentWidth}px,
              transparent ${segmentWidth}px,
              transparent ${totalWidth}px
            );
            border-radius: ${borderRadiusStyle};
          `;
        } else {
          // Less than 100% - square dashes, force end with gap
          const maskDirection = isRightToLeft ? '270deg' : '90deg';

          fillStyleCSS = `
            mask-image: 
              repeating-linear-gradient(
                90deg,
                black 0px,
                black ${segmentWidth}px,
                transparent ${segmentWidth}px,
                transparent ${totalWidth}px
              ),
              linear-gradient(
                ${maskDirection},
                black 0%,
                black calc(100% - ${gapWidth + 2}px),
                transparent calc(100% - ${gapWidth + 2}px),
                transparent 100%
              );
            -webkit-mask-image: 
              repeating-linear-gradient(
                90deg,
                black 0px,
                black ${segmentWidth}px,
                transparent ${segmentWidth}px,
                transparent ${totalWidth}px
              ),
              linear-gradient(
                ${maskDirection},
                black 0%,
                black calc(100% - ${gapWidth + 2}px),
                transparent calc(100% - ${gapWidth + 2}px),
                transparent 100%
              );
            mask-composite: intersect;
            -webkit-mask-composite: source-in;
            border-radius: 0;
          `;
        }
        break;
      case 'dots':
        // Create individual circles at 10% intervals
        const dotRadius = 4;
        const positions = [];
        const gradients = [];

        // Create dots at 10% intervals from 10% to current percentage
        for (let pos = 10; pos <= percentage && pos <= 100; pos += 10) {
          positions.push(`${pos}%`);
          gradients.push(
            `radial-gradient(circle ${dotRadius}px at ${pos}% center, ${barFillBackground} 0%, ${barFillBackground} 100%, transparent 100%)`
          );
        }

        if (gradients.length > 0) {
          fillStyleCSS = `
            background-image: ${gradients.join(', ')};
            background-size: 100% 100%;
            background-repeat: no-repeat;
          `;
        } else {
          fillStyleCSS = `background: transparent;`;
        }
        break;
      case 'minimal':
        // Minimal style: thin line with dot indicator
        barStyleCSS = `
          background: transparent;
          border: none;
          box-shadow: none;
        `;
        fillStyleCSS = `
          background: transparent;
          border: none;
          position: relative;
        `;
        break;
    }

    // Determine bar animation trigger
    const animType = (barModule as any).bar_animation_type || 'none';
    const animEnabled = (barModule as any).bar_animation_enabled && animType !== 'none';
    let shouldAnimate = false;
    if (animEnabled) {
      const triggerType = (barModule as any).bar_animation_trigger_type || 'state';
      const targetEntity = (barModule as any).bar_animation_entity;
      const targetValue = ((barModule as any).bar_animation_value ?? '').toString();
      if (!targetEntity || targetEntity.trim() === '' || targetValue.trim() === '') {
        // Always on when entity or value not provided
        shouldAnimate = true;
      } else if (hass?.states[targetEntity]) {
        const st = hass.states[targetEntity];
        let compare = '';
        if (triggerType === 'attribute') {
          const attrName = (barModule as any).bar_animation_attribute || '';
          compare = attrName ? String((st.attributes as any)?.[attrName] ?? '') : '';
        } else {
          compare = String(st.state ?? '');
        }
        shouldAnimate = String(compare) === targetValue;
      }

      if (shouldAnimate) {
        switch (animType) {
          case 'charging':
            animationClass = 'bar-anim-charging';
            break;
          case 'pulse':
            animationClass = 'bar-anim-pulse';
            break;
          case 'blinking':
            animationClass = 'bar-anim-blink';
            break;
          case 'bouncing':
            animationClass = 'bar-anim-bounce';
            break;
          case 'glow':
            animationClass = 'bar-anim-glow';
            break;
          case 'rainbow':
            animationClass = 'bar-anim-rainbow';
            break;
          case 'bubbles':
            animationClass = 'bar-anim-bubbles';
            break;
          case 'fill':
            animationClass = 'bar-anim-fill';
            break;
          case 'ripple':
            animationClass = 'bar-anim-ripple';
            break;
          case 'traffic':
            animationClass = 'bar-anim-traffic';
            break;

          case 'heartbeat':
            animationClass = 'bar-anim-heartbeat';
            break;
          case 'flicker':
            animationClass = 'bar-anim-flicker';
            break;
          case 'shimmer':
            animationClass = 'bar-anim-shimmer';
            break;
          case 'vibrate':
            animationClass = 'bar-anim-vibrate';
            break;
        }
      }
    }

    // Apply override animation if configured and condition matches (takes precedence)
    const overrideType = (barModule as any).bar_animation_override_type || 'none';
    const hasOverride =
      overrideType !== 'none' &&
      ((barModule as any).bar_animation_override_entity || '').trim() !== '';
    if (hasOverride) {
      const trigType = (barModule as any).bar_animation_override_trigger_type || 'state';
      const ent = (barModule as any).bar_animation_override_entity;
      const matchVal = ((barModule as any).bar_animation_override_value ?? '').toString();
      let isMatch = false;
      if (hass?.states[ent]) {
        const st = hass.states[ent];
        if (trigType === 'attribute') {
          const attr = (barModule as any).bar_animation_override_attribute || '';
          const cmp = attr ? String((st.attributes as any)?.[attr] ?? '') : '';
          isMatch = cmp === matchVal;
        } else {
          isMatch = String(st.state ?? '') === matchVal;
        }
      }
      if (isMatch) {
        switch (overrideType) {
          case 'charging':
            animationClass = 'bar-anim-charging';
            break;
          case 'pulse':
            animationClass = 'bar-anim-pulse';
            break;
          case 'blinking':
            animationClass = 'bar-anim-blink';
            break;
          case 'bouncing':
            animationClass = 'bar-anim-bounce';
            break;
          case 'glow':
            animationClass = 'bar-anim-glow';
            break;
          case 'rainbow':
            animationClass = 'bar-anim-rainbow';
            break;
          case 'bubbles':
            animationClass = 'bar-anim-bubbles';
            break;
          case 'fill':
            animationClass = 'bar-anim-fill';
            break;
          case 'ripple':
            animationClass = 'bar-anim-ripple';
            break;
          case 'traffic':
            animationClass = 'bar-anim-traffic';
            break;

          case 'heartbeat':
            animationClass = 'bar-anim-heartbeat';
            break;
          case 'flicker':
            animationClass = 'bar-anim-flicker';
            break;
          case 'shimmer':
            animationClass = 'bar-anim-shimmer';
            break;
          case 'vibrate':
            animationClass = 'bar-anim-vibrate';
            break;
        }
      }
    }

    let normalizedWidthValue = Number(barModule.bar_width ?? 100);
    if (Number.isNaN(normalizedWidthValue)) {
      const normalizedBarWidth = this.normalizeSizeValue(barModule.bar_width ?? 100);
      if (normalizedBarWidth && normalizedBarWidth.unit === '%') {
        normalizedWidthValue = normalizedBarWidth.value;
      } else {
        normalizedWidthValue = 100;
      }
    }
    const normalizedWidth = Math.max(1, Math.min(100, normalizedWidthValue));
    const normalizedBarWidthForGrow = this.normalizeSizeValue(
      barModule.bar_width !== undefined && barModule.bar_width !== null ? barModule.bar_width : 100
    );

    const explicitWidthValue =
      designProperties.width !== undefined &&
      designProperties.width !== null &&
      String(designProperties.width).trim() !== ''
        ? designProperties.width
        : moduleWithDesign.width;
    const normalizedExplicitWidth =
      explicitWidthValue !== undefined &&
      explicitWidthValue !== null &&
      String(explicitWidthValue).trim() !== ''
        ? this.normalizeSizeValue(explicitWidthValue)
        : null;

    let shouldGrow = false;
    if (normalizedExplicitWidth) {
      shouldGrow = normalizedExplicitWidth.unit === '%' && normalizedExplicitWidth.value >= 100;
    } else if (normalizedBarWidthForGrow) {
      shouldGrow = normalizedBarWidthForGrow.unit === '%' && normalizedBarWidthForGrow.value >= 100;
    } else {
      shouldGrow = true;
    }

    const maxWidthCandidate =
      designProperties.max_width !== undefined &&
      designProperties.max_width !== null &&
      String(designProperties.max_width).trim() !== ''
        ? designProperties.max_width
        : moduleWithDesign.max_width;
    const normalizedMaxWidth =
      maxWidthCandidate !== undefined &&
      maxWidthCandidate !== null &&
      String(maxWidthCandidate).trim() !== ''
        ? this.normalizeSizeValue(maxWidthCandidate)
        : null;

    if (shouldGrow && normalizedMaxWidth) {
      if (normalizedMaxWidth.unit === '%') {
        shouldGrow = normalizedMaxWidth.value >= 100;
      } else {
        shouldGrow = false;
      }
    }

    // Use the actual bar_width setting from the module
    const barWidth = `${normalizedWidth}%`;
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

    const containerStyles = {
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
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '8px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '8px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '8px 0',
      background: containerBackground,
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${this.addPixelUnit(designProperties.border_width || moduleWithDesign.border_width) || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'relative',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      width: containerWidth,
      height: designProperties.height || moduleWithDesign.height || totalContainerHeightPx,
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || '100%',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth:
        designProperties.min_width || moduleWithDesign.min_width || (shouldGrow ? '0' : 'auto'),
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'visible',
      boxSizing: 'border-box',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        designProperties.box_shadow_h && designProperties.box_shadow_v
          ? `${designProperties.box_shadow_h || '0'} ${designProperties.box_shadow_v || '0'} ${designProperties.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || '0'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : moduleWithDesign.box_shadow_h && moduleWithDesign.box_shadow_v
            ? `${moduleWithDesign.box_shadow_h || '0'} ${moduleWithDesign.box_shadow_v || '0'} ${moduleWithDesign.box_shadow_blur || '0'} ${moduleWithDesign.box_shadow_spread || '0'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
            : 'none',
      color: designProperties.color || moduleWithDesign.color || 'var(--primary-text-color)',
      fontFamily: designProperties.font_family || moduleWithDesign.font_family || 'inherit',
      fontSize: (() => {
        if (
          designProperties.font_size &&
          typeof designProperties.font_size === 'string' &&
          designProperties.font_size.trim() !== ''
        ) {
          // If it already has units, use as-is; otherwise add px
          if (/[a-zA-Z%]/.test(designProperties.font_size)) {
            return designProperties.font_size;
          }
          return `${designProperties.font_size}px`;
        }
        if (moduleWithDesign.font_size !== undefined) return `${moduleWithDesign.font_size}px`;
        return 'inherit';
      })(),
      textAlign: designProperties.text_align || moduleWithDesign.text_align || 'inherit',
      lineHeight: designProperties.line_height || moduleWithDesign.line_height || 'inherit',
      letterSpacing: designProperties.letter_spacing || moduleWithDesign.letter_spacing || 'normal',
      textShadow:
        designProperties.text_shadow_h && designProperties.text_shadow_v
          ? `${designProperties.text_shadow_h || '0'} ${designProperties.text_shadow_v || '0'} ${designProperties.text_shadow_blur || '0'} ${designProperties.text_shadow_color || 'rgba(0,0,0,0.25)'}`
          : moduleWithDesign.text_shadow_h && moduleWithDesign.text_shadow_v
            ? `${moduleWithDesign.text_shadow_h || '0'} ${moduleWithDesign.text_shadow_v || '0'} ${moduleWithDesign.text_shadow_blur || '0'} ${moduleWithDesign.text_shadow_color || 'rgba(0,0,0,0.25)'}`
            : 'none',
    };

    // Gesture handling variables
    let clickTimeout: any = null;
    let holdTimeout: any = null;
    let isHolding = false;
    let clickCount = 0;
    let lastClickTime = 0;

    // Handle gesture events for tap, hold, double-tap actions
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isHolding = false;

      // Start hold timer
      holdTimeout = setTimeout(() => {
        isHolding = true;
        if (barModule.hold_action && barModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            barModule.hold_action as any,
            hass,
            e.target as HTMLElement,
            config
          );
        }
      }, 500); // 500ms hold threshold
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      // Clear hold timer
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }

      // If this was a hold gesture, don't process as click
      if (isHolding) {
        isHolding = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      // Double click detection (within 300ms)
      if (timeSinceLastClick < 300 && clickCount === 1) {
        // This is a double click
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickCount = 0;

        if (!barModule.double_tap_action || barModule.double_tap_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            (barModule.double_tap_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config,
            (barModule as any).entity
          );
        }
      } else {
        // This might be a single click, but wait to see if double click follows
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          // This is a single click
          clickCount = 0;

          // Execute tap action
          if (!barModule.tap_action || barModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (barModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config,
              (barModule as any).entity
            );
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    // Get hover effect configuration from module design
    const hoverEffect = (barModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        class="bar-module-preview"
        data-layout-grow="${shouldGrow ? 'true' : 'false'}"
        style=${this.styleObjectToCss(containerStyles)}
        ${ref((el?: Element) => {
          if (!el) return;
          
          // After render, check if parent wrapper has flex constraint
          // If constrained, ensure bar uses 100% to fill the constrained wrapper
          setTimeout(() => {
            const parent = el.parentElement;
            const isFlexConstrained = parent?.getAttribute('data-flex-constrained') === 'true';
            
            if (isFlexConstrained) {
              const barContainer = el.querySelector('.bar-container') as HTMLElement;
              if (barContainer) {
                // Parent wrapper has fixed width constraint (e.g., 80%)
                // Set bar to 100% to fill that constrained space
                barContainer.style.width = '100%';
              }
            }
          }, 0);
        })}
      >
        <!-- Bar Container -->
        <div 
          class="bar-flex-wrapper"
          style="display: flex; justify-content: ${barContainerAlignment}; width: 100%; min-height: ${barHeight}; align-items: center; min-width: 0; overflow: visible;">
          <div
            class="bar-container ${hoverEffectClass}"
            style="
            width: ${shouldGrow ? '100%' : barWidth};
            max-width: 100%;
            flex: ${shouldGrow ? '1 1 0' : '0 0 auto'};
            height: ${barHeight}; 
            background: ${trackBackground};
            ${shouldGrow ? 'min-width: 0;' : 'min-width: 80px;'}
            border-radius: ${borderRadius}px;
            overflow: 'visible';
            position: relative;
            transition: ${barModule.animation !== false ? 'all 0.3s ease' : 'none'};
            border: ${
              barModule.bar_style !== 'outline'
                ? `1px solid ${barModule.bar_border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
                : 'none'
            };
            ${barStyleCSS};
            cursor: ${
              (barModule.tap_action && barModule.tap_action.action !== 'nothing') ||
              (barModule.hold_action && barModule.hold_action.action !== 'nothing') ||
              (barModule.double_tap_action && barModule.double_tap_action.action !== 'nothing')
                ? 'pointer'
                : 'default'
            };
            z-index: 1;
          "
          @pointerdown=${handlePointerDown}
          @pointerup=${handlePointerUp}
        >
            <!-- Bar Fill / Dots Style / Minimal Style -->
            ${
              barModule.bar_style === 'minimal'
                ? (() => {
                    const isRightToLeft = fillDirection === 'right-to-left';
                    const dotPosition = isRightToLeft ? 100 - percentage : percentage;

                    // Handle gradient colors for minimal style
                    let trackColor = barModule.bar_color || 'var(--primary-color)';
                    let dotColor =
                      (barModule as any).dot_color || barModule.bar_color || 'var(--primary-color)';

                    if (
                      barModule.use_gradient &&
                      barModule.gradient_stops &&
                      barModule.gradient_stops.length > 0
                    ) {
                      const stops = [...barModule.gradient_stops].sort(
                        (a, b) => a.position - b.position
                      );
                      const gradientMode = barModule.gradient_display_mode || 'full';
                      const gradientDirection =
                        fillDirection === 'right-to-left' ? 'to left' : 'to right';

                      if (gradientMode === 'full') {
                        // Full mode: Show complete gradient on track, dot color at current position
                        const gradientString = stops
                          .map(s => `${resolveCSSColor(s.color)} ${s.position}%`)
                          .join(', ');
                        trackColor = `linear-gradient(${gradientDirection}, ${gradientString})`;
                        dotColor =
                          (barModule as any).dot_color ||
                          resolveCSSColor(interpolateColorAtPosition(stops, percentage));
                      } else if (gradientMode === 'cropped') {
                        // Cropped mode: Show gradient only up to current percentage
                        if (percentage <= 0) {
                          // At 0%, use first stop color for both track and dot
                          const firstColor = resolveCSSColor(stops[0].color);
                          trackColor = firstColor;
                          dotColor = (barModule as any).dot_color || firstColor;
                        } else {
                          // Build cropped gradient up to current percentage
                          const croppedStops = [
                            ...stops.filter(stop => stop.position <= percentage),
                          ];

                          // Always include the color at the exact percentage
                          const colorAtPercentage = interpolateColorAtPosition(stops, percentage);

                          // Only add the percentage stop if it's not already there
                          if (!croppedStops.some(stop => stop.position === percentage)) {
                            croppedStops.push({
                              id: `cropped_${percentage}`,
                              position: percentage,
                              color: colorAtPercentage,
                            });
                          }

                          // Sort and ensure we have at least one stop
                          croppedStops.sort((a, b) => a.position - b.position);

                          if (croppedStops.length === 0) {
                            // Fallback to first gradient color
                            const firstColor = resolveCSSColor(stops[0].color);
                            trackColor = firstColor;
                            dotColor = (barModule as any).dot_color || firstColor;
                          } else {
                            // Normalize positions to 0-100% range for the cropped section
                            const normalizedStops = croppedStops.map(stop => ({
                              ...stop,
                              position: percentage > 0 ? (stop.position / percentage) * 100 : 0,
                            }));

                            const croppedGradientString = normalizedStops
                              .map(
                                s =>
                                  `${resolveCSSColor(s.color)} ${Math.min(100, Math.max(0, s.position))}%`
                              )
                              .join(', ');

                            trackColor = `linear-gradient(${gradientDirection}, ${croppedGradientString})`;
                            dotColor =
                              (barModule as any).dot_color || resolveCSSColor(colorAtPercentage);
                          }
                        }
                      } else if (gradientMode === 'value-based') {
                        // Value-based mode: Single color based on current percentage
                        const colorAtPercentage = interpolateColorAtPosition(stops, percentage);
                        const resolvedColor = resolveCSSColor(colorAtPercentage);
                        trackColor = resolvedColor;
                        dotColor = (barModule as any).dot_color || resolvedColor;
                      }
                    }

                    // For cropped mode, we need separate track background and filled portion
                    const gradientMode = barModule.gradient_display_mode || 'full';
                    const needsSeparateTrack = gradientMode === 'cropped' && barModule.use_gradient;

                    // For minimal style, use bar height as line thickness (scale down from bar height)
                    const barHeightValue = (barModule as any).height ?? 20;
                    const lineHeight = Math.max(1, Math.floor(barHeightValue / 3)); // Scale down for line thickness

                    // Scale dot size with reasonable limits (minimum 8px, maximum 24px)
                    const dotSize = Math.max(8, Math.min(24, lineHeight * 3 + 6));

                    return html`
                      ${needsSeparateTrack
                        ? html`
                            <!-- Background track (unfilled portion) -->
                            <div
                              style="
                                position: absolute;
                                top: 50%;
                                left: 0;
                                right: 0;
                                height: ${lineHeight}px;
                            background: ${barModule.bar_background_color ||
                              'rgba(var(--rgb-primary-color), 0.2)'};
                            transform: translateY(-50%);
                            border-radius: ${Math.max(1, Math.floor(lineHeight / 2))}px;
                            opacity: 0.6;
                          "
                            ></div>

                            <!-- Filled track portion (with gradient) -->
                            <div
                              class="minimal-track ${animationClass}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${isRightToLeft ? `${100 - percentage}%` : '0'};
                                width: ${percentage}%;
                                height: ${lineHeight}px;
                            background: ${trackColor};
                            transform: translateY(-50%);
                            border-radius: ${Math.max(1, Math.floor(lineHeight / 2))}px;
                            opacity: 0.8;
                            transition: ${barModule.animation !== false ? 'all 0.3s ease' : 'none'};
                          "
                            ></div>
                          `
                        : html`
                            <!-- Track line (full/value-based modes) -->
                            <div
                              class="minimal-track ${animationClass}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: 0;
                                right: 0;
                                height: ${lineHeight}px;
                            background: ${trackColor};
                            transform: translateY(-50%);
                            border-radius: ${Math.max(1, Math.floor(lineHeight / 2))}px;
                            opacity: 0.8;
                            transition: ${barModule.animation !== false ? 'all 0.3s ease' : 'none'};
                          "
                            ></div>
                          `}

                      <!-- Dot/Icon indicator -->
                      ${(() => {
                        // Calculate icon size based on auto-scale setting
                        const iconSize =
                          barModule.minimal_icon_size_auto !== false
                            ? Math.max(16, Math.min(32, Math.max(24, barHeightValue * 1.2)))
                            : barModule.minimal_icon_size || 24;

                        // Determine icon color (dot color or custom color)
                        const iconColor =
                          barModule.minimal_icon_use_dot_color !== false
                            ? dotColor
                            : barModule.minimal_icon_color || dotColor;

                        // Render based on mode
                        const mode = barModule.minimal_icon_mode || 'icon-in-dot';
                        const hasIcon = barModule.minimal_icon_enabled && barModule.minimal_icon;

                        if (mode === 'icon-only' && hasIcon) {
                          // Icon only mode - replace dot with icon
                          return html`
                            <div
                              class="minimal-icon ${animationClass}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${dotPosition}%;
                                width: ${iconSize}px;
                                height: ${iconSize}px;
                                transform: translate(-50%, -50%);
                                transition: ${barModule.animation !== false
                                ? 'left 0.3s ease, color 0.3s ease'
                                : 'none'};
                                z-index: 3;
                                will-change: left, color;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                              "
                            >
                              <ha-icon
                                icon="${barModule.minimal_icon}"
                                style="
                                  color: ${iconColor};
                                  width: ${iconSize}px;
                                  height: ${iconSize}px;
                                  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                "
                              ></ha-icon>
                            </div>
                          `;
                        } else if (mode === 'icon-in-dot' && hasIcon) {
                          // Icon in dot mode - show dot with icon inside
                          return html`
                            <div
                              class="minimal-dot ${animationClass}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${dotPosition}%;
                                width: ${dotSize}px;
                                height: ${dotSize}px;
                                background: ${dotColor};
                                border: 2px solid var(--card-background-color);
                                border-radius: 50%;
                                transform: translate(-50%, -50%);
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                transition: ${barModule.animation !== false
                                ? 'left 0.3s ease, background 0.3s ease'
                                : 'none'};
                                z-index: 3;
                                will-change: left, background;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                              "
                            >
                              <ha-icon
                                icon="${barModule.minimal_icon}"
                                style="
                                  color: ${iconColor};
                                  width: ${Math.max(8, iconSize - 4)}px;
                                  height: ${Math.max(8, iconSize - 4)}px;
                                  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                "
                              ></ha-icon>
                            </div>
                          `;
                        } else {
                          // Dot only mode (default) - show just the dot
                          return html`
                            <div
                              class="minimal-dot ${animationClass}"
                              style="
                                position: absolute;
                                top: 50%;
                                left: ${dotPosition}%;
                                width: ${dotSize}px;
                                height: ${dotSize}px;
                                background: ${dotColor};
                                border: 2px solid var(--card-background-color);
                                border-radius: 50%;
                                transform: translate(-50%, -50%);
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                transition: ${barModule.animation !== false
                                ? 'left 0.3s ease, background 0.3s ease'
                                : 'none'};
                                z-index: 3;
                                will-change: left, background;
                              "
                            ></div>
                          `;
                        }
                      })()}
                    `;
                  })()
                : barModule.bar_style === 'dots'
                  ? (() => {
                      const dotCount = 20; // More dots with smaller gaps
                      const barH = ((barModule as any).height ?? 20) as number;
                      const dotSize = Math.max(6, Math.floor(barH - 8));
                      const trackBg = trackBackground;
                      const stops =
                        barModule.use_gradient &&
                        (barModule as any).gradient_stops &&
                        (barModule as any).gradient_stops.length > 0
                          ? [...(barModule as any).gradient_stops].sort(
                              (a: any, b: any) => a.position - b.position
                            )
                          : createDefaultGradientStops();
                      const getColorAt = (pos: number): string => {
                        const sorted = [...stops].sort((a: any, b: any) => a.position - b.position);
                        let before = sorted[0];
                        let after = sorted[sorted.length - 1];
                        for (let i = 0; i < sorted.length - 1; i++) {
                          if (pos >= sorted[i].position && pos <= sorted[i + 1].position) {
                            before = sorted[i];
                            after = sorted[i + 1];
                            break;
                          }
                        }
                        if (before.position === pos) return before.color;
                        if (after.position === pos) return after.color;
                        const range = after.position - before.position;
                        const factor = range === 0 ? 0 : (pos - before.position) / range;
                        return this.interpolateColor(before.color, after.color, factor);
                      };
                      const mode = (barModule as any).gradient_display_mode || 'full';
                      const dots = Array.from({ length: dotCount }, (_v, i) => {
                        const centerPct = Math.round(((i + 1) / (dotCount + 1)) * 100);
                        // For right-to-left, we need to calculate from the opposite end
                        const isActive =
                          fillDirection === 'right-to-left'
                            ? 100 - centerPct <= percentage
                            : centerPct <= percentage;
                        let color = barFillBackground as string;
                        if ((barModule as any).use_gradient) {
                          if (mode === 'full') {
                            // Full: Show gradient across all dots, but only fill active ones
                            if (isActive) {
                              // Normalize position to full gradient range (0-100)
                              const norm =
                                percentage > 0
                                  ? Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        Math.round((centerPct / Math.max(1, percentage)) * 100)
                                      )
                                    )
                                  : 0;
                              color = getColorAt(norm);
                            } else {
                              color = trackBg;
                            }
                          } else if (mode === 'cropped') {
                            // Cropped: Each dot shows its position color from the full gradient
                            color = isActive ? getColorAt(centerPct) : trackBg;
                          } else if (mode === 'value-based') {
                            const valColor = getColorAt(percentage);
                            color = isActive ? valColor : trackBg;
                          }
                        } else {
                          color = isActive
                            ? (barModule as any).bar_color ||
                              moduleWithDesign.color ||
                              'var(--primary-color)'
                            : trackBg;
                        }
                        return html`<div
                          style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${color};flex-shrink:0;"
                        ></div>`;
                      });

                      // Reverse dots order for right-to-left direction
                      const orderedDots = fillDirection === 'right-to-left' ? dots.reverse() : dots;

                      return html`<div
                        class="dots-container"
                        style="display:flex;align-items:center;justify-content:space-between;width:100%;height:100%;padding:0 ${Math.max(
                          2,
                          Math.floor(dotSize / 3)
                        )}px;box-sizing:border-box;flex-direction:${fillDirection ===
                        'right-to-left'
                          ? 'row-reverse'
                          : 'row'};"
                      >
                        ${orderedDots}
                      </div>`;
                    })()
                  : (() => {
                      const isRightToLeft = fillDirection === 'right-to-left';

                      // Default rendering for all other styles
                      // Calculate border radius based on direction and percentage
                      let fillBorderRadius = '';
                      if (percentage >= 99.5) {
                        fillBorderRadius = `${borderRadius}px`;
                      } else if (isRightToLeft) {
                        fillBorderRadius = `0 ${borderRadius}px ${borderRadius}px 0`;
                      } else {
                        fillBorderRadius = `${borderRadius}px 0 0 ${borderRadius}px`;
                      }

                      return html`
                        <div
                          class="bar-fill ${animationClass}"
                          style="
                        width: ${percentage}%;
                        height: 100%;
                        background: ${barFillBackground};
                        transition: ${barModule.animation !== false ? 'width 0.3s ease' : 'none'};
                        border-radius: ${fillBorderRadius};
                        position: absolute;
                        ${isRightToLeft ? 'right: 0;' : 'left: 0;'}
                        top: 0;
                        bottom: 0;
                        will-change: width;
                        backface-visibility: hidden;
                        ${fillStyleCSS}
                      "
                        >
                          ${fillOverlayCSS
                            ? html` <div
                                class="bar-fill-overlay"
                                style="
                                position: absolute;
                                inset: 0;
                                border-radius: inherit;
                                pointer-events: none;
                                ${fillOverlayCSS}
                              "
                              ></div>`
                            : ''}
                        </div>
                      `;
                    })()
            }

            <!-- Limit Indicator -->
            ${
              barModule.limit_entity && hass?.states[barModule.limit_entity] && limitPercentage >= 0
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
                      title="${(() => {
                        try {
                          const state = hass.states[barModule.limit_entity!]?.state;
                          const unitTitle = (async () => {
                            const { formatEntityState } = await import('../utils/number-format');
                            return `Limit: ${formatEntityState(hass, barModule.limit_entity!, {
                              state,
                              includeUnit: true,
                            })}`;
                          })();
                          // Note: cannot await inside template string; fall back to simple title
                          return `Limit: ${state}`;
                        } catch (_e) {
                          return `Limit`;
                        }
                      })()}"
                    ></div>
                  `
                : ''
            }

            <!-- Percentage Text (Inside Bar) -->
            <div
              class="percentage-text"
              style="
                display: ${showPercentageText ? 'block' : 'none'};
                position: absolute;
                top: 50%;
                left: ${
                  percentageTextAlignment === 'left'
                    ? '8px'
                    : percentageTextAlignment === 'right'
                      ? 'calc(100% - 32px)'
                      : percentageTextAlignment === 'follow-fill'
                        ? `${Math.min(percentage, 100)}%`
                        : '50%'
                };
                transform: ${
                  percentageTextAlignment === 'center'
                    ? 'translate(-50%, -50%)'
                    : percentageTextAlignment === 'follow-fill'
                      ? followFillTransform
                      : 'translate(0, -50%)'
                };
                text-align: ${percentageTextAlignment === 'follow-fill' ? 'right' : percentageTextAlignment};
                font-size: ${percentageFontSize};
                color: ${
                  barModule.percentage_text_color ||
                  designProperties.color ||
                  moduleWithDesign.color ||
                  'white'
                };
                font-weight: ${barModule.percentage_text_bold ? 'bold' : '600'};
                font-style: ${barModule.percentage_text_italic ? 'italic' : 'normal'};
                text-decoration: ${barModule.percentage_text_strikethrough ? 'line-through' : 'none'};
                z-index: 10;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
              "
            >
              ${percentageDisplayText}
            </div>
          </div>

          ${
            !hass?.states[barModule.entity] && barModule.entity
              ? html`
                  <div
                    class="entity-error"
                    style="color: var(--error-color); font-size: 12px; margin-top: 4px;"
                  >
                    Entity not found: ${barModule.entity}
                  </div>
                `
              : ''
          }
        </div>

        

        <!-- Left and Right Side Labels (Below Bar) -->
        ${
          barModule.left_enabled || barModule.right_enabled
            ? html`
                <div
                  class="bar-labels-below"
                  style="display: flex; justify-content: ${barModule.label_alignment ||
                  'space-between'}; align-items: center; margin-top: 8px; gap: 16px; width: 100%; overflow: hidden; box-sizing: border-box;"
                >
                  ${barModule.left_enabled
                    ? html`
                        <div
                          class="left-side-below"
                          style="text-align: left; flex: 1; min-width: 0; overflow: hidden;"
                        >
                          ${barModule.left_title && barModule.left_title.trim()
                            ? html`
                                <span
                                  style="font-size: ${designProperties.font_size
                                    ? `${Math.min(designProperties.font_size, 16)}px`
                                    : `${Math.min(barModule.left_title_size || 14, 16)}px`}; color: ${designProperties.color ||
                                  barModule.left_title_color ||
                                  moduleWithDesign.color ||
                                  'var(--primary-text-color)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                >
                                  ${barModule.left_title}:
                                </span>
                              `
                            : ''}
                          <span
                            style="font-size: ${designProperties.font_size
                              ? `${Math.min(designProperties.font_size, 16)}px`
                              : `${Math.min(barModule.left_value_size || 14, 16)}px`}; font-weight: 600; color: ${designProperties.color ||
                            barModule.left_value_color ||
                            moduleWithDesign.color ||
                            'var(--primary-text-color)'}; margin-left: ${barModule.left_title &&
                            barModule.left_title.trim()
                              ? '4px'
                              : '0'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >
                            ${leftDisplay}
                          </span>
                        </div>
                      `
                    : html`<div></div>`}
                  ${barModule.right_enabled
                    ? html`
                        <div
                          class="right-side-below"
                          style="text-align: right; flex: 1; min-width: 0; overflow: hidden;"
                        >
                          ${barModule.right_title && barModule.right_title.trim()
                            ? html`
                                <span
                                  style="font-size: ${designProperties.font_size
                                    ? `${Math.min(designProperties.font_size, 16)}px`
                                    : `${Math.min(barModule.right_title_size || 14, 16)}px`}; color: ${designProperties.color ||
                                  barModule.right_title_color ||
                                  moduleWithDesign.color ||
                                  'var(--primary-text-color)'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                                >
                                  ${barModule.right_title}:
                                </span>
                              `
                            : ''}
                          <span
                            style="font-size: ${designProperties.font_size
                              ? `${Math.min(designProperties.font_size, 16)}px`
                              : `${Math.min(barModule.right_value_size || 14, 16)}px`}; font-weight: 600; color: ${designProperties.color ||
                            barModule.right_value_color ||
                            moduleWithDesign.color ||
                            'var(--primary-text-color)'}; margin-left: ${barModule.right_title &&
                            barModule.right_title.trim()
                              ? '4px'
                              : '0'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >
                            ${rightDisplay}
                          </span>
                        </div>
                      `
                    : html`<div></div>`}
                </div>
              `
            : ''
        }
        </div>
      </div>
    `;
  }

  // Simple string hash function for stable template keys
  private _hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const barModule = module as BarModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow empty entity - UI will show placeholder
    // Only validate for truly breaking errors

    if (barModule.height && (barModule.height < 5 || barModule.height > 200)) {
      errors.push('Bar height must be between 5 and 200 pixels');
    }

    if (barModule.border_radius && (barModule.border_radius < 0 || barModule.border_radius > 100)) {
      errors.push('Border radius must be between 0 and 100 pixels');
    }

    // Validate limit entity if provided (only if it has content)
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
        display: block; /* ensure bar occupies width of its container */
        width: 100%;
        max-width: 100%;
        overflow: visible;
        box-sizing: border-box;
        min-width: 80px; /* keep a visible track inside flex rows */
        position: relative;
        z-index: 0; /* Establish stacking context */
      }
      
      /* When parent wrapper is flex-constrained, bar flex wrapper should be auto width */
      /* so justify-content: center/flex-end can position the bar correctly */
      [data-flex-constrained="true"] .bar-module-preview .bar-flex-wrapper {
        width: auto !important;
      }
      
      .bar-container {
        width: 100%;
        position: relative;
        display: block;
        box-sizing: border-box;
        min-width: 0; /* allow flex parent to size correctly */
        /* Ensure minimal style dots stay within container bounds */
        contain: layout style;
      }
      
      /* Minimal style specific containment */
      .bar-container.minimal-style {
        overflow: visible;
        isolation: isolate; /* Create new stacking context */
      }
      
      .bar-fill {
        position: relative;
        z-index: 1;
        overflow: hidden; /* Keep overlay animations clipped to rounded corners */
      }
      
      .bar-fill-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 2;
        overflow: hidden;
        mix-blend-mode: normal;
      }
      
      /* Ensure overlay inherits border radius properly */
      .bar-fill-overlay {
        border-radius: inherit;
      }
      
      /* Outline style animation */
      @keyframes outline-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
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
        /* Allow dropdown menus to render outside local containers */
        overflow: visible;
      }
      
      .module-general-settings { }
      /* Dropdown positioning fixes scoped to Bar module (defensive in case globals miss) */
      /* Let HA handle dropdown positioning naturally */
      .bar-module-preview .settings-section {
        overflow: visible;
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
      /* Give selects a consistent card background (scoped to bar module sections only) */
      .bar-module-preview .settings-section ha-select {
        background: var(--card-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        border-radius: 6px !important;
        padding: 4px 0 !important;
        /* MWC menu and text field surfaces */
        --mdc-theme-surface: var(--card-background-color);
        --mdc-text-field-fill-color: var(--card-background-color);
        --mdc-select-fill-color: var(--card-background-color);
        --mdc-menu-surface-fill-color: var(--card-background-color);
        --mdc-text-field-ink-color: var(--primary-text-color);
        --mdc-text-field-outline-color: var(--divider-color);
        --mdc-select-dropdown-icon-color: var(--secondary-text-color);
        --mdc-theme-text-primary-on-background: var(--primary-text-color);
        --mdc-theme-on-surface: var(--primary-text-color);
      }

      /* Ensure ha-form selects inherit same surface in all contexts */
      .bar-module-preview .settings-section ha-form ha-select {
        --mdc-theme-surface: var(--card-background-color);
        --mdc-text-field-fill-color: var(--card-background-color);
        --mdc-select-fill-color: var(--card-background-color);
        --mdc-menu-surface-fill-color: var(--card-background-color);
        --mdc-text-field-ink-color: var(--primary-text-color);
        --mdc-text-field-outline-color: var(--divider-color);
        --mdc-select-dropdown-icon-color: var(--secondary-text-color);
        --mdc-theme-text-primary-on-background: var(--primary-text-color);
        --mdc-theme-on-surface: var(--primary-text-color);
      }

      /* Give animation selects a proper background */
      .settings-section[data-animation] ha-select,
      .animation-select-group ha-select {
        background: var(--card-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        border-radius: 6px !important;
        padding: 4px 0 !important;
      }
      /* Ensure percentage type dropdown has standard background container */
      .percentage-type-group ha-select {
        background: var(--card-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        border-radius: 6px !important;
        padding: 4px 0 !important;
      }

      /* Fix slider and input field layouts */
      .settings-section .field-group {
        max-width: 100%;
        overflow: visible;
        align-items: stretch;
      }

      /* Ensure slider containers don't get cut off */
      .settings-section ha-form[style*="flex: 1"] {
        min-width: 200px;
        flex: 1 1 200px;
      }

      /* Fix input field containers */
      .settings-section input[type="number"] {
        width: 72px !important;
        max-width: 72px !important;
        min-width: 72px !important;
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

      /* Gap control styles - Standardized Slider Pattern */
      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gap-slider {
        flex: 1;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }

      .gap-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }

      .gap-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }

      .gap-input {
        width: 72px !important;
        max-width: 72px !important;
        min-width: 72px !important;
        padding: 4px 6px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .gap-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      /* Range input styling for number-range-control */
      .number-range-control {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .range-slider {
        flex: 1;
      }

      .range-input {
        width: 72px !important;
        max-width: 72px !important;
        min-width: 72px !important;
        padding: 4px 6px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .range-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .reset-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .reset-btn ha-icon {
        font-size: 16px;
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

      /* ==========================
         Bar Animations
         These classes animate the .bar-fill element when triggered
         ========================== */
      .bar-fill.bar-anim-charging::after {
        content: '';
        position: absolute; inset: 0; pointer-events: none;
        background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 10px, transparent 10px, transparent 20px);
        background-size: 28px 28px;
        animation: charging-stripes 1.2s linear infinite;
      }
      @keyframes charging-stripes { 0% { background-position: 0 0; } 100% { background-position: 28px 0; } }

      .bar-fill.bar-anim-pulse { animation: bar-pulse 1.6s ease-in-out infinite; }
      @keyframes bar-pulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }

      .bar-fill.bar-anim-blink { animation: bar-blink 1s steps(2, start) infinite; }
      @keyframes bar-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

      .bar-fill.bar-anim-bounce { animation: bar-bounce 1.2s ease-in-out infinite; transform-origin: center; }
      @keyframes bar-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }

      .bar-fill.bar-anim-glow { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; animation: bar-glow 1.5s ease-in-out infinite; }
      @keyframes bar-glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.4); } }

      .bar-fill.bar-anim-rainbow::after { 
        content:''; 
        position:absolute; 
        inset:0; 
        pointer-events:none; 
        background: linear-gradient(90deg, 
          red 0%, 
          orange 14.28%, 
          yellow 28.57%, 
          green 42.85%, 
          cyan 57.14%, 
          blue 71.42%, 
          violet 85.71%, 
          red 100%
        ); 
        background-size: 200% 100%; 
        mix-blend-mode: overlay; 
        opacity: 0.9; 
        animation: rainbow-shift 4s linear infinite; 
      }
      @keyframes rainbow-shift { 
        0% { background-position: 0% 0%; } 
        100% { background-position: 200% 0%; } 
      }

      /* Bubbles: two extended layers with discrete bubbles, animated bottom -> top */
      .bar-fill.bar-anim-bubbles::before,
      .bar-fill.bar-anim-bubbles::after {
        content: '';
        position: absolute;
        left: 0; right: 0;
        top: -220%;
        height: 440%;
        pointer-events: none;
        will-change: transform, opacity;
        background-repeat: no-repeat;
        filter: none;
      }
      /* Layer 1 (faster, fewer bubbles) */
      .bar-fill.bar-anim-bubbles::before {
        background:
          radial-gradient(circle at 8% 80%,  rgba(255,255,255,0.55) 0 6px, transparent 7px),
          radial-gradient(circle at 22% 55%, rgba(255,255,255,0.45) 0 5px, transparent 6px),
          radial-gradient(circle at 37% 72%, rgba(255,255,255,0.50) 0 7px, transparent 8px),
          radial-gradient(circle at 49% 60%, rgba(255,255,255,0.42) 0 5px, transparent 6px),
          radial-gradient(circle at 63% 82%, rgba(255,255,255,0.50) 0 6px, transparent 7px),
          radial-gradient(circle at 77% 68%, rgba(255,255,255,0.46) 0 5px, transparent 6px),
          radial-gradient(circle at 89% 78%, rgba(255,255,255,0.52) 0 6px, transparent 7px);
        animation: bubbles-rise-layer1 7s linear infinite;
        transform: translateY(0%);
      }
      /* Layer 2 (slower, different positions) */
      .bar-fill.bar-anim-bubbles::after {
        background:
          radial-gradient(circle at 14% 84%, rgba(255,255,255,0.48) 0 7px, transparent 8px),
          radial-gradient(circle at 30% 66%, rgba(255,255,255,0.40) 0 5px, transparent 6px),
          radial-gradient(circle at 55% 82%, rgba(255,255,255,0.50) 0 6px, transparent 7px),
          radial-gradient(circle at 71% 64%, rgba(255,255,255,0.44) 0 5px, transparent 6px),
          radial-gradient(circle at 84% 78%, rgba(255,255,255,0.50) 0 7px, transparent 8px);
        animation: bubbles-rise-layer2 10s linear infinite;
        animation-delay: 1.2s;
        transform: translateY(0%);
      }
      @keyframes bubbles-rise-layer1 {
        0%   { transform: translateY(0%); opacity: 0; }
        22%  { opacity: 1; }
        88%  { opacity: 1; }
        100% { transform: translateY(-58%); opacity: 0; }
      }
      @keyframes bubbles-rise-layer2 {
        0%   { transform: translateY(0%); opacity: 0; }
        26%  { opacity: 1; }
        88%  { opacity: 1; }
        100% { transform: translateY(-58%); opacity: 0; }
      }

      .bar-fill.bar-anim-fill { animation: bar-fill-wave 1.5s ease-in-out infinite; }
      @keyframes bar-fill-wave { 0%,100% { filter: saturate(1); } 50% { filter: saturate(1.4); } }

      .bar-fill.bar-anim-ripple::after {
        content: '';
        position: absolute; inset: 0; pointer-events: none;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 20%, transparent 40%);
        background-size: 200% 100%;
        animation: ripple-sweep 1.1s ease-in-out infinite;
        opacity: 0.9;
      }
      @keyframes ripple-sweep {
        0% { background-position-x: -50%; }
        100% { background-position-x: 150%; }
      }

      /* Traffic: moving hazard chevrons left->right to evoke flowing traffic lanes */
      .bar-fill.bar-anim-traffic::after {
        content:''; position:absolute; inset:0; pointer-events:none; opacity: 0.95;
        background-image:
          linear-gradient(135deg, rgba(255,255,255,0.00) 0 40%, rgba(255,255,255,0.25) 40% 60%, rgba(255,255,255,0.00) 60% 100%),
          linear-gradient(-135deg, rgba(255,255,255,0.00) 0 40%, rgba(255,255,255,0.25) 40% 60%, rgba(255,255,255,0.00) 60% 100%);
        background-size: 44px 100%, 44px 100%;
        background-position: 0 0, 22px 0;
        animation: traffic-chevrons 1s linear infinite;
        mix-blend-mode: screen;
      }
      @keyframes traffic-chevrons { 0% { background-position: 0 0, 22px 0; } 100% { background-position: 44px 0, 66px 0; } }

      /* Traffic Flow: thicker bands with alternating opacity, moving left->right */
      

      .bar-fill.bar-anim-heartbeat { animation: heartbeat 1.2s ease-in-out infinite; transform-origin: center; }
      @keyframes heartbeat { 0%,100% { transform: scale(1); } 20% { transform: scale(1.02); } 40% { transform: scale(0.99); } 60% { transform: scale(1.02); } 80% { transform: scale(1); } }

      .bar-fill.bar-anim-flicker { animation: flicker 2s infinite; }
      @keyframes flicker { 0%,19%,21%,23%,25%,54%,56%,100%{ opacity:1 } 20%,24%,55%{ opacity:0.4 } }

      .bar-fill.bar-anim-shimmer { position: relative; overflow: hidden; }
      .bar-fill.bar-anim-shimmer::after { content:''; position:absolute; top:0; bottom:0; width:40%; left:-40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); animation: shimmer-move 1.4s ease-in-out infinite; }
      @keyframes shimmer-move { 0% { left: -40%; } 100% { left: 120%; } }

      .bar-fill.bar-anim-vibrate { animation: vibrate 0.15s linear infinite; }
      @keyframes vibrate { 0% { transform: translate(0); } 25% { transform: translate(0.5px,-0.5px); } 50% { transform: translate(-0.5px,0.5px); } 75% { transform: translate(0.5px,0.5px); } 100% { transform: translate(0); } }

      /* Minimal Bar Animations */
      .minimal-track.bar-anim-pulse { animation: minimal-track-pulse 1.6s ease-in-out infinite; }
      @keyframes minimal-track-pulse { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }
      
      .minimal-dot.bar-anim-pulse { animation: minimal-dot-pulse 1.6s ease-in-out infinite; }
      @keyframes minimal-dot-pulse { 0%,100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.15); } }
      
      /* Minimal style z-index management */
      .minimal-track {
        z-index: 1;
        position: relative;
      }
      
      .minimal-dot {
        z-index: 3 !important;
        position: absolute;
        /* Ensure dot stays within reasonable bounds */
        max-width: 32px;
        max-height: 32px;
        /* Prevent dot from going outside card boundaries */
        contain: size layout style;
      }
      
      /* Percentage text positioning for minimal style */
      .bar-container .percentage-text {
        /* Ensure text doesn't interfere with HA header */
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .minimal-track.bar-anim-glow { box-shadow: 0 0 4px currentColor; animation: minimal-track-glow 1.5s ease-in-out infinite; }
      @keyframes minimal-track-glow { 0%,100% { box-shadow: 0 0 4px currentColor; } 50% { box-shadow: 0 0 8px currentColor; } }
      
      .minimal-dot.bar-anim-glow { animation: minimal-dot-glow 1.5s ease-in-out infinite; }
      @keyframes minimal-dot-glow { 0%,100% { box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 6px currentColor; } 50% { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 12px currentColor; } }
      
      .minimal-track.bar-anim-blink { animation: minimal-blink 1s steps(2, start) infinite; }
      .minimal-dot.bar-anim-blink { animation: minimal-blink 1s steps(2, start) infinite; }
      @keyframes minimal-blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
      
      .minimal-dot.bar-anim-bouncing { animation: minimal-dot-bounce 1.2s ease-in-out infinite; }
      @keyframes minimal-dot-bounce { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 4px)); } }
      
      .minimal-track.bar-anim-shimmer { position: relative; overflow: hidden; }
      .minimal-track.bar-anim-shimmer::after { content:''; position:absolute; top:-50%; bottom:-50%; width:40%; left:-40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: minimal-shimmer-move 1.4s ease-in-out infinite; }
      @keyframes minimal-shimmer-move { 0% { left: -40%; } 100% { left: 120%; } }
      
      .minimal-dot.bar-anim-vibrate { animation: minimal-dot-vibrate 0.15s linear infinite; }
      @keyframes minimal-dot-vibrate { 0% { transform: translate(-50%, -50%); } 25% { transform: translate(calc(-50% + 0.5px), calc(-50% - 0.5px)); } 50% { transform: translate(calc(-50% - 0.5px), calc(-50% + 0.5px)); } 75% { transform: translate(calc(-50% + 0.5px), calc(-50% + 0.5px)); } 100% { transform: translate(-50%, -50%); } }
    `;
  }

  private normalizeSizeValue(value: string | number): { value: number; unit: '%' | 'px' } | null {
    if (typeof value === 'number') {
      return { value, unit: '%' };
    }

    const str = String(value).trim();

    if (!str) {
      return null;
    }

    if (str.endsWith('%')) {
      const numeric = parseFloat(str.slice(0, -1));
      return Number.isNaN(numeric) ? null : { value: numeric, unit: '%' };
    }

    if (str.endsWith('px')) {
      const numeric = parseFloat(str.slice(0, -2));
      return Number.isNaN(numeric) ? null : { value: numeric, unit: 'px' };
    }

    const numeric = parseFloat(str);
    return Number.isNaN(numeric) ? null : { value: numeric, unit: '%' };
  }

  // Helper method to convert style object to CSS string
  private styleObjectToCss(styles: Record<string, string | number | undefined>): string {
    return Object.entries(styles)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
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

  // Helper method to interpolate between two colors with alpha preservation
  private interpolateColor(color1: string, color2: string, factor: number): string {
    // Parse both colors to RGBA format
    const rgba1 = this.parseColorToRGBA(color1);
    const rgba2 = this.parseColorToRGBA(color2);

    if (!rgba1 || !rgba2) return color1;

    // Interpolate RGB components
    const r = Math.round(rgba1.r + (rgba2.r - rgba1.r) * factor);
    const g = Math.round(rgba1.g + (rgba2.g - rgba1.g) * factor);
    const b = Math.round(rgba1.b + (rgba2.b - rgba1.b) * factor);

    // Interpolate alpha channel
    const a = rgba1.a + (rgba2.a - rgba1.a) * factor;

    // Return rgba() format to preserve alpha channel
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
  }

  // Helper method to convert hex color to RGB with alpha support
  private hexToRgb(hex: string): { r: number; g: number; b: number; a: number } | null {
    // Handle CSS variables and non-hex colors
    if (!hex.startsWith('#')) {
      // For CSS variables, return null to fallback to original color
      return null;
    }

    // Support both 6-digit (#RRGGBB) and 8-digit (#RRGGBBAA) hex colors
    const result6 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const result8 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result8) {
      // 8-digit hex with alpha
      return {
        r: parseInt(result8[1], 16),
        g: parseInt(result8[2], 16),
        b: parseInt(result8[3], 16),
        a: parseInt(result8[4], 16) / 255, // Convert 0-255 to 0-1
      };
    } else if (result6) {
      // 6-digit hex without alpha
      return {
        r: parseInt(result6[1], 16),
        g: parseInt(result6[2], 16),
        b: parseInt(result6[3], 16),
        a: 1, // Default to fully opaque
      };
    }

    return null;
  }

  // Helper method to convert RGB to hex with optional alpha support
  private rgbToHex(r: number, g: number, b: number, a?: number): string {
    const rInt = Math.round(Math.max(0, Math.min(255, r)));
    const gInt = Math.round(Math.max(0, Math.min(255, g)));
    const bInt = Math.round(Math.max(0, Math.min(255, b)));

    if (a !== undefined && a < 1) {
      // Include alpha channel for transparency
      const aInt = Math.round(Math.max(0, Math.min(255, a * 255)));
      return `#${((1 << 24) + (rInt << 16) + (gInt << 8) + bInt).toString(16).slice(1)}${aInt.toString(16).padStart(2, '0')}`;
    } else {
      // Standard 6-digit hex for opaque colors
      return `#${((1 << 24) + (rInt << 16) + (gInt << 8) + bInt).toString(16).slice(1)}`;
    }
  }

  // Helper method to parse any color format to RGBA with alpha preservation
  private parseColorToRGBA(color: string): { r: number; g: number; b: number; a: number } | null {
    if (!color) return null;

    // First resolve CSS variables using the existing resolveCSSColor function
    const resolvedColor = this.resolveCSSColor(color);

    // Handle rgba() format
    const rgbaMatch = resolvedColor.match(
      /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/i
    );
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1], 10),
        g: parseInt(rgbaMatch[2], 10),
        b: parseInt(rgbaMatch[3], 10),
        a: parseFloat(rgbaMatch[4]),
      };
    }

    // Handle rgb() format (assume alpha = 1)
    const rgbMatch = resolvedColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
        a: 1,
      };
    }

    // Handle hex colors (including 8-digit with alpha)
    const hexRgba = this.hexToRgb(resolvedColor);
    if (hexRgba) {
      return hexRgba;
    }

    // Handle transparent keyword
    if (resolvedColor.toLowerCase() === 'transparent') {
      return { r: 0, g: 0, b: 0, a: 0 };
    }

    // Fallback: try to resolve as CSS variable again and extract from computed style
    try {
      const probe = document.createElement('span');
      probe.style.color = resolvedColor;
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color;
      probe.remove();

      if (computed && computed !== 'rgba(0, 0, 0, 0)') {
        const computedRgba = computed.match(
          /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/i
        );
        if (computedRgba) {
          return {
            r: parseInt(computedRgba[1], 10),
            g: parseInt(computedRgba[2], 10),
            b: parseInt(computedRgba[3], 10),
            a: computedRgba[4] ? parseFloat(computedRgba[4]) : 1,
          };
        }
      }
    } catch {
      // Ignore errors and fall through to default
    }

    // Default fallback
    return { r: 128, g: 128, b: 128, a: 1 };
  }

  // Helper method to resolve CSS color (extracted from existing resolveCSSColor function)
  private resolveCSSColor(inputColor: string): string {
    if (!inputColor) return inputColor;
    const trimmed = String(inputColor).trim();
    // Fast-path: hex or rgb/rgba are already concrete colors
    if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) return trimmed;
    // Attempt to resolve CSS variables or named colors via a temporary element
    try {
      const probe = document.createElement('span');
      probe.style.backgroundColor = trimmed; // Use backgroundColor to preserve alpha
      // Use body for widest variable scope (HA themes apply at document level)
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).backgroundColor; // Preserves RGBA
      probe.remove();
      return computed && computed !== 'rgba(0, 0, 0, 0)' ? computed : trimmed;
    } catch {
      return trimmed;
    }
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
