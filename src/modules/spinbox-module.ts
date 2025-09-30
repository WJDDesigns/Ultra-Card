import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, SpinboxModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { TemplateService } from '../services/template-service';
import '../components/ultra-color-picker';
import { getImageUrl } from '../utils/image-upload';

export class UltraSpinboxModule extends BaseUltraModule {
  private _templateService?: TemplateService;

  metadata: ModuleMetadata = {
    type: 'spinbox',
    title: 'Spinbox',
    description: 'Number input with increment/decrement buttons',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:numeric',
    category: 'interactive',
    tags: ['spinbox', 'number', 'increment', 'decrement', 'input', 'stepper'],
  };

  createDefault(id?: string, hass?: HomeAssistant): SpinboxModule {
    return {
      id: id || this.generateId('spinbox'),
      type: 'spinbox',
      min_value: 0,
      max_value: 100,
      step: 1,
      value: 50,
      layout: 'horizontal',
      show_value: true,
      value_position: 'center',
      show_unit: false,
      unit: '',
      button_style: 'flat',
      button_shape: 'rounded',
      button_size: 40,
      button_spacing: 12,
      button_gap: 8,
      increment_icon: 'mdi:plus',
      decrement_icon: 'mdi:minus',
      button_background_color: 'var(--primary-color)',
      button_text_color: 'white',
      value_color: 'var(--primary-text-color)',
      value_font_size: 18,
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
      // Template support
      template_mode: false,
      template: '',
    };
  }

  private getButtonStyles(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'flat', label: localize('editor.spinbox.styles.flat', lang, 'Flat (Default)') },
      { value: 'glossy', label: localize('editor.spinbox.styles.glossy', lang, 'Glossy') },
      { value: 'embossed', label: localize('editor.spinbox.styles.embossed', lang, 'Embossed') },
      { value: 'inset', label: localize('editor.spinbox.styles.inset', lang, 'Inset') },
      {
        value: 'gradient-overlay',
        label: localize('editor.spinbox.styles.gradient_overlay', lang, 'Gradient Overlay'),
      },
      { value: 'neon-glow', label: localize('editor.spinbox.styles.neon_glow', lang, 'Neon Glow') },
      { value: 'outline', label: localize('editor.spinbox.styles.outline', lang, 'Outline') },
      { value: 'glass', label: localize('editor.spinbox.styles.glass', lang, 'Glass') },
      { value: 'metallic', label: localize('editor.spinbox.styles.metallic', lang, 'Metallic') },
    ];
  }

  private getButtonShapeOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      {
        value: 'rounded',
        label: localize('editor.spinbox.shapes.rounded', lang, 'Rounded Square (Default)'),
      },
      { value: 'square', label: localize('editor.spinbox.shapes.square', lang, 'Square') },
      { value: 'circle', label: localize('editor.spinbox.shapes.circle', lang, 'Circle') },
    ];
  }

  private getLayoutOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      {
        value: 'horizontal',
        label: localize('editor.spinbox.layout_options.horizontal', lang, 'Horizontal'),
      },
      {
        value: 'vertical',
        label: localize('editor.spinbox.layout_options.vertical', lang, 'Vertical'),
      },
    ];
  }

  private getValuePositionOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      {
        value: 'center',
        label: localize(
          'editor.spinbox.value_position_options.center',
          lang,
          'Center (Between Buttons)'
        ),
      },
      {
        value: 'top',
        label: localize(
          'editor.spinbox.value_position_options.top',
          lang,
          'Top (Above Both Buttons)'
        ),
      },
      {
        value: 'bottom',
        label: localize(
          'editor.spinbox.value_position_options.bottom',
          lang,
          'Bottom (Below Both Buttons)'
        ),
      },
      {
        value: 'left',
        label: localize(
          'editor.spinbox.value_position_options.left',
          lang,
          'Left (Before Buttons)'
        ),
      },
      {
        value: 'right',
        label: localize(
          'editor.spinbox.value_position_options.right',
          lang,
          'Right (After Buttons)'
        ),
      },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const spinboxModule = module as SpinboxModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Entity Configuration -->
        ${this.renderSettingsSection(
          localize('editor.spinbox.entity.title', lang, 'Entity Configuration'),
          localize(
            'editor.spinbox.entity.desc',
            lang,
            'Optional: Link to a Home Assistant entity for synced values (e.g., input_number, climate temperature).'
          ),
          [
            {
              title: localize('editor.spinbox.entity_field', lang, 'Entity'),
              description: localize(
                'editor.spinbox.entity_field_desc',
                lang,
                'Select an entity to sync the spinbox value (optional). Supports input_number, number, climate entities.'
              ),
              hass,
              data: { entity: spinboxModule.entity || '' },
              schema: [this.entityField('entity')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ]
        )}

        <!-- Value Configuration -->
        ${this.renderSettingsSection(
          localize('editor.spinbox.value.title', lang, 'Value Configuration'),
          localize(
            'editor.spinbox.value.desc',
            lang,
            'Configure the numeric range, step size, and default value.'
          ),
          [
            {
              title: localize('editor.spinbox.min_value', lang, 'Minimum Value'),
              description: localize(
                'editor.spinbox.min_value_desc',
                lang,
                'The minimum allowed value'
              ),
              hass,
              data: { min_value: spinboxModule.min_value ?? 0 },
              schema: [this.numberField('min_value')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
            {
              title: localize('editor.spinbox.max_value', lang, 'Maximum Value'),
              description: localize(
                'editor.spinbox.max_value_desc',
                lang,
                'The maximum allowed value'
              ),
              hass,
              data: { max_value: spinboxModule.max_value ?? 100 },
              schema: [this.numberField('max_value')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
            {
              title: localize('editor.spinbox.step', lang, 'Step Size'),
              description: localize(
                'editor.spinbox.step_desc',
                lang,
                'How much the value changes with each button press'
              ),
              hass,
              data: { step: spinboxModule.step ?? 1 },
              schema: [this.numberField('step')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
            {
              title: localize('editor.spinbox.value', lang, 'Default Value'),
              description: localize(
                'editor.spinbox.value_desc',
                lang,
                'The initial value (only used when no entity is linked)'
              ),
              hass,
              data: { value: spinboxModule.value ?? 50 },
              schema: [this.numberField('value')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ]
        )}

        <!-- Display Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.spinbox.display.title', lang, 'Display Configuration')}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.layout_title', lang, 'Layout'),
              localize('editor.spinbox.layout_desc', lang, 'Arrangement of buttons and value'),
              hass,
              { layout: spinboxModule.layout || 'horizontal' },
              [this.selectField('layout', this.getLayoutOptions(lang))],
              (e: CustomEvent) => {
                const next = e.detail.value.layout;
                const prev = spinboxModule.layout || 'horizontal';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${localize('editor.spinbox.show_value', lang, 'Show Value')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0;"
                >
                  ${localize(
                    'editor.spinbox.show_value_desc',
                    lang,
                    'Display the current numeric value'
                  )}
                </div>
              </div>
              <ha-switch
                .checked=${spinboxModule.show_value ?? true}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ show_value: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>

          ${spinboxModule.show_value
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.spinbox.value_position_title', lang, 'Value Position'),
                    localize(
                      'editor.spinbox.value_position_desc',
                      lang,
                      'Where to display the value relative to buttons'
                    ),
                    hass,
                    { value_position: spinboxModule.value_position || 'center' },
                    [this.selectField('value_position', this.getValuePositionOptions(lang))],
                    (e: CustomEvent) => {
                      const next = e.detail.value.value_position;
                      const prev = spinboxModule.value_position || 'center';
                      if (next === prev) return;
                      updateModule(e.detail.value);
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  )}
                </div>
              `
            : ''}

          <div class="field-group" style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${localize('editor.spinbox.show_unit', lang, 'Show Unit')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0;"
                >
                  ${localize(
                    'editor.spinbox.show_unit_desc',
                    lang,
                    'Display a unit label (e.g., °C, %)'
                  )}
                </div>
              </div>
              <ha-switch
                .checked=${spinboxModule.show_unit ?? false}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ show_unit: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>

          ${spinboxModule.show_unit
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.spinbox.unit', lang, 'Unit'),
                    localize('editor.spinbox.unit_desc', lang, 'Unit to display (e.g., °C, %, km)'),
                    hass,
                    { unit: spinboxModule.unit || '' },
                    [this.textField('unit')],
                    (e: CustomEvent) => updateModule(e.detail.value)
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Button Configuration -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.spinbox.buttons.title', lang, 'Button Configuration')}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.button_style', lang, 'Button Style'),
              localize('editor.spinbox.button_style_desc', lang, 'Visual style for buttons'),
              hass,
              { button_style: spinboxModule.button_style || 'flat' },
              [this.selectField('button_style', this.getButtonStyles(lang))],
              (e: CustomEvent) => {
                const next = e.detail.value.button_style;
                const prev = spinboxModule.button_style || 'flat';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.button_shape', lang, 'Button Shape'),
              localize('editor.spinbox.button_shape_desc', lang, 'Shape of the buttons'),
              hass,
              { button_shape: spinboxModule.button_shape || 'rounded' },
              [this.selectField('button_shape', this.getButtonShapeOptions(lang))],
              (e: CustomEvent) => {
                const next = e.detail.value.button_shape;
                const prev = spinboxModule.button_shape || 'rounded';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.button_size', lang, 'Button Size'),
              localize(
                'editor.spinbox.button_size_desc',
                lang,
                'Size of the buttons in pixels (width and height)'
              ),
              hass,
              { button_size: spinboxModule.button_size ?? 40 },
              [this.numberField('button_size')],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.button_spacing', lang, 'Value Spacing'),
              localize(
                'editor.spinbox.button_spacing_desc',
                lang,
                'Space between buttons and value display in pixels'
              ),
              hass,
              { button_spacing: spinboxModule.button_spacing ?? 12 },
              [this.numberField('button_spacing')],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.button_gap', lang, 'Button Gap'),
              localize(
                'editor.spinbox.button_gap_desc',
                lang,
                'Space between increment and decrement buttons in pixels'
              ),
              hass,
              { button_gap: spinboxModule.button_gap ?? 8 },
              [this.numberField('button_gap')],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.increment_icon', lang, 'Increment Icon'),
              localize(
                'editor.spinbox.increment_icon_desc',
                lang,
                'Icon for the increment button (e.g., mdi:plus, mdi:chevron-up)'
              ),
              hass,
              { increment_icon: spinboxModule.increment_icon || 'mdi:plus' },
              [this.iconField('increment_icon')],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.spinbox.decrement_icon', lang, 'Decrement Icon'),
              localize(
                'editor.spinbox.decrement_icon_desc',
                lang,
                'Icon for the decrement button (e.g., mdi:minus, mdi:chevron-down)'
              ),
              hass,
              { decrement_icon: spinboxModule.decrement_icon || 'mdi:minus' },
              [this.iconField('decrement_icon')],
              (e: CustomEvent) => updateModule(e.detail.value)
            )}
          </div>

          <!-- Button Colors -->
          <div class="color-controls" style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize(
                'editor.spinbox.button_background_color',
                lang,
                'Button Background'
              )}
              .value=${spinboxModule.button_background_color || 'var(--primary-color)'}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ button_background_color: e.detail.value })}
            ></ultra-color-picker>
          </div>

          <div class="color-controls">
            <ultra-color-picker
              .label=${localize('editor.spinbox.button_text_color', lang, 'Button Icon Color')}
              .value=${spinboxModule.button_text_color || 'white'}
              .defaultValue=${'white'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ button_text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Value Display Styling -->
        ${spinboxModule.show_value
          ? html`
              <div class="settings-section">
                <div class="section-title">
                  ${localize('editor.spinbox.value_style.title', lang, 'Value Display Styling')}
                </div>

                <div class="color-controls" style="margin-bottom: 16px;">
                  <ultra-color-picker
                    .label=${localize('editor.spinbox.value_color', lang, 'Value Color')}
                    .value=${spinboxModule.value_color || 'var(--primary-text-color)'}
                    .defaultValue=${'var(--primary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) =>
                      updateModule({ value_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>

                <div class="field-group">
                  ${this.renderFieldSection(
                    localize('editor.spinbox.value_font_size', lang, 'Value Font Size'),
                    localize(
                      'editor.spinbox.value_font_size_desc',
                      lang,
                      'Font size for the value display (in pixels)'
                    ),
                    hass,
                    { value_font_size: spinboxModule.value_font_size ?? 18 },
                    [this.numberField('value_font_size')],
                    (e: CustomEvent) => updateModule(e.detail.value)
                  )}
                </div>
              </div>
            `
          : ''}

        <!-- Template Mode -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.spinbox.template.title', lang, 'Template Mode')}
          </div>

          <div class="field-group" style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${localize('editor.spinbox.template_mode', lang, 'Enable Template Mode')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 0;"
                >
                  ${localize(
                    'editor.spinbox.template_mode_desc',
                    lang,
                    'Use Jinja2 templates to dynamically compute the displayed value'
                  )}
                </div>
              </div>
              <ha-switch
                .checked=${spinboxModule.template_mode || false}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ template_mode: target.checked });
                }}
              ></ha-switch>
            </div>
          </div>

          ${spinboxModule.template_mode
            ? html`
                <div class="field-group" style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                  >
                    ${localize('editor.spinbox.template', lang, 'Value Template')}
                  </div>
                  <div
                    class="field-description"
                    style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
                  >
                    ${localize(
                      'editor.spinbox.template_desc',
                      lang,
                      'Jinja2 template for value (e.g., {{ states("input_number.temperature") }})'
                    )}
                  </div>
                  <ha-form
                    .hass=${hass}
                    .data=${{ template: spinboxModule.template || '' }}
                    .schema=${[
                      {
                        name: 'template',
                        label: '',
                        selector: { text: { multiline: true } },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) => updateModule(e.detail.value)}
                  ></ha-form>
                </div>

                <div class="template-examples">
                  <div
                    class="field-title"
                    style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                  >
                    ${localize('editor.spinbox.template_examples', lang, 'Common Examples:')}
                  </div>
                  <div class="example-item" style="margin-bottom: 12px;">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 11px; color: #d4d4d4; margin-bottom: 4px;"
                    >
                      {{ states('input_number.temperature') | float }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 11px; color: var(--secondary-text-color);"
                    >
                      Read value from input_number entity
                    </div>
                  </div>
                  <div class="example-item">
                    <div
                      class="example-code"
                      style="background: var(--code-editor-background-color, #1e1e1e); padding: 8px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 11px; color: #d4d4d4; margin-bottom: 4px;"
                    >
                      {{ state_attr('climate.thermostat', 'temperature') }}
                    </div>
                    <div
                      class="example-description"
                      style="font-size: 11px; color: var(--secondary-text-color);"
                    >
                      Read temperature from climate entity
                    </div>
                  </div>
                </div>
              `
            : html`
                <div
                  style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${localize(
                    'editor.spinbox.template_disabled',
                    lang,
                    'Enable template mode to use dynamic values'
                  )}
                </div>
              `}
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
    const spinboxModule = module as SpinboxModule;
    return GlobalActionsTab.render(spinboxModule as any, hass, updates => updateModule(updates));
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult {
    const spinboxModule = module as SpinboxModule;

    // Get current value (from entity, template, or default)
    let currentValue = spinboxModule.value ?? 50;
    let entityDomain = '';

    if (spinboxModule.template_mode && spinboxModule.template) {
      // Initialize template service
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      // Ensure template string cache exists on hass
      if (hass) {
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {};
        }
        const templateHash = this._hashString(spinboxModule.template);
        const templateKey = `spinbox_value_${spinboxModule.id}_${templateHash}`;

        // Subscribe if needed
        if (this._templateService && !this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(spinboxModule.template, templateKey, () => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
            }
          });
        }

        // Use latest rendered string if available
        const rendered = hass.__uvc_template_strings?.[templateKey];
        if (rendered !== undefined) {
          const parsed = parseFloat(String(rendered));
          if (!isNaN(parsed)) {
            currentValue = parsed;
          }
        }
      }
    } else if (spinboxModule.entity && hass) {
      // Get value from entity
      const entityState = hass.states[spinboxModule.entity];
      entityDomain = spinboxModule.entity.split('.')[0];

      if (entityState) {
        // Handle different entity types
        if (entityDomain === 'climate') {
          // For climate entities, use temperature attribute
          if (entityState.attributes?.temperature !== undefined) {
            const tempValue = parseFloat(String(entityState.attributes.temperature));
            if (!isNaN(tempValue)) {
              currentValue = tempValue;
            }
          } else {
            // Fallback to state value
            const stateValue = parseFloat(entityState.state);
            if (!isNaN(stateValue)) {
              currentValue = stateValue;
            }
          }
        } else {
          // For input_number and number entities, use state
          const stateValue = parseFloat(entityState.state);
          if (!isNaN(stateValue)) {
            currentValue = stateValue;
          }
        }
      }
    }

    // Ensure value is within bounds
    currentValue = Math.max(
      spinboxModule.min_value,
      Math.min(spinboxModule.max_value, currentValue)
    );

    // Apply design properties
    const moduleWithDesign = spinboxModule as any;
    const designProperties = (spinboxModule as any).design || {};

    // Button styling
    const buttonBackground =
      designProperties.button_background_color ||
      spinboxModule.button_background_color ||
      'var(--primary-color)';
    const buttonTextColor =
      designProperties.button_text_color || spinboxModule.button_text_color || 'white';

    const styleClass = spinboxModule.button_style || 'flat';
    const buttonSize = spinboxModule.button_size ?? 40;
    const buttonShape = spinboxModule.button_shape || 'rounded';
    const buttonSpacing = spinboxModule.button_spacing ?? 12;
    const buttonGap = spinboxModule.button_gap ?? 8;

    // Calculate border radius based on shape
    let borderRadius = '8px'; // default rounded
    if (buttonShape === 'circle') {
      borderRadius = '50%';
    } else if (buttonShape === 'square') {
      borderRadius = '0';
    }

    const buttonBaseStyle = `
      background: ${buttonBackground};
      color: ${buttonTextColor};
      padding: 0;
      border-radius: ${borderRadius};
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: ${buttonSize}px;
      min-height: ${buttonSize}px;
      width: ${buttonSize}px;
      height: ${buttonSize}px;
      border: none;
    `;

    const styleOverrides: Record<string, string> = {
      flat: `box-shadow: none;`,
      glossy: `background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0)), ${buttonBackground}; border: none;`,
      embossed: `border: 1px solid rgba(0,0,0,0.15); box-shadow: inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.15);`,
      inset: `box-shadow: inset 0 2px 6px rgba(0,0,0,0.35);`,
      'gradient-overlay': `background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(0,0,0,0.15)), ${buttonBackground};`,
      'neon-glow': `box-shadow: 0 0 10px ${buttonBackground}, 0 0 20px ${buttonBackground};`,
      outline: `background: transparent; border: 2px solid ${buttonBackground}; color: ${buttonBackground};`,
      glass: `backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.25);`,
      metallic: `background: linear-gradient(90deg, #d7d7d7, #f0f0f0 50%, #d7d7d7); color: #333; border: 1px solid #bbb;`,
    };

    const buttonStyle = `${buttonBaseStyle} ${styleOverrides[styleClass] || styleOverrides.flat}`;

    // Value display styling
    const valueColor =
      designProperties.value_color || spinboxModule.value_color || 'var(--primary-text-color)';
    const valueFontSize = designProperties.value_font_size || spinboxModule.value_font_size || 18;
    const valueStyle = `
      color: ${valueColor};
      font-size: ${valueFontSize}px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60px;
    `;

    // Container styles from Global Design
    const containerStyles = {
      width: '100%',
      height: 'auto',
      maxWidth: 'none',
      maxHeight: 'none',
      minWidth: 'auto',
      minHeight: 'auto',
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right
          ? `${designProperties.padding_top || '0px'} ${designProperties.padding_right || '0px'} ${designProperties.padding_bottom || '0px'} ${designProperties.padding_left || '0px'}`
          : '0',
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right
          ? `${designProperties.margin_top || '8px'} ${designProperties.margin_right || '0px'} ${designProperties.margin_bottom || '8px'} ${designProperties.margin_left || '0px'}`
          : '8px 0',
      background: designProperties.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      'background-size': 'cover',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
      'border-radius': designProperties.border_radius || '8px',
      border:
        designProperties.border_style && designProperties.border_style !== 'none'
          ? `${designProperties.border_width || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
          : 'none',
      'box-shadow':
        designProperties.box_shadow_h ||
        designProperties.box_shadow_v ||
        designProperties.box_shadow_blur ||
        designProperties.box_shadow_spread
          ? `${designProperties.box_shadow_h || '0px'} ${designProperties.box_shadow_v || '0px'} ${designProperties.box_shadow_blur || '0px'} ${designProperties.box_shadow_spread || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,.2)'}`
          : 'none',
      'box-sizing': 'border-box',
    } as Record<string, string>;

    // Handle increment/decrement
    const handleIncrement = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      if (spinboxModule.entity && hass) {
        // Call service to update entity
        const newValue = Math.min(spinboxModule.max_value, currentValue + spinboxModule.step);
        this.callEntityService(spinboxModule.entity, newValue, hass, entityDomain);
      }
    };

    const handleDecrement = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
      if (spinboxModule.entity && hass) {
        // Call service to update entity
        const newValue = Math.max(spinboxModule.min_value, currentValue - spinboxModule.step);
        this.callEntityService(spinboxModule.entity, newValue, hass, entityDomain);
      }
    };

    // Get hover effect
    const hoverEffect = (spinboxModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Layout rendering
    const isVertical = spinboxModule.layout === 'vertical';
    const showValue = spinboxModule.show_value !== false;
    const valuePosition = spinboxModule.value_position || 'center';
    const showUnit = spinboxModule.show_unit && spinboxModule.unit;

    const valueDisplay = showValue
      ? html`
          <div class="spinbox-value" style="${valueStyle}">
            ${currentValue.toFixed(this.getDecimalPlaces(spinboxModule.step))}${showUnit
              ? html`<span style="margin-left: 4px; font-size: ${valueFontSize * 0.8}px;"
                  >${spinboxModule.unit}</span
                >`
              : ''}
          </div>
        `
      : '';

    const decrementButton = html`
      <button
        class="spinbox-button decrement ${hoverEffectClass}"
        style="${buttonStyle}"
        @click=${handleDecrement}
        ?disabled=${currentValue <= spinboxModule.min_value}
      >
        <ha-icon icon="${spinboxModule.decrement_icon || 'mdi:minus'}"></ha-icon>
      </button>
    `;

    const incrementButton = html`
      <button
        class="spinbox-button increment ${hoverEffectClass}"
        style="${buttonStyle}"
        @click=${handleIncrement}
        ?disabled=${currentValue >= spinboxModule.max_value}
      >
        <ha-icon icon="${spinboxModule.increment_icon || 'mdi:plus'}"></ha-icon>
      </button>
    `;

    // Render layout based on value position
    // Note: CSS gap doesn't support negative values, so we use margin for negative spacing
    const useButtonGap = buttonGap >= 0;
    const useValueSpacing = buttonSpacing >= 0;

    const buttonsGroupStyle = useButtonGap
      ? `display: flex; gap: ${buttonGap}px; ${isVertical ? 'flex-direction: column;' : 'flex-direction: row;'}`
      : `display: flex; ${isVertical ? 'flex-direction: column;' : 'flex-direction: row;'}`;

    const renderLayout = () => {
      const buttonsGroup = html`
        <div style="${buttonsGroupStyle}">
          ${isVertical
            ? html` <div style="${!useButtonGap ? `margin-bottom: ${buttonGap}px;` : ''}">
                  ${incrementButton}
                </div>
                <div>${decrementButton}</div>`
            : html` <div style="${!useButtonGap ? `margin-right: ${buttonGap}px;` : ''}">
                  ${decrementButton}
                </div>
                <div>${incrementButton}</div>`}
        </div>
      `;

      const spacingStyle = useValueSpacing ? `gap: ${buttonSpacing}px;` : '';

      switch (valuePosition) {
        case 'top':
          return html`
            <div
              style="display: flex; flex-direction: column; align-items: center; ${spacingStyle}"
            >
              <div style="${!useValueSpacing ? `margin-bottom: ${buttonSpacing}px;` : ''}">
                ${valueDisplay}
              </div>
              ${buttonsGroup}
            </div>
          `;
        case 'bottom':
          return html`
            <div
              style="display: flex; flex-direction: column; align-items: center; ${spacingStyle}"
            >
              <div style="${!useValueSpacing ? `margin-bottom: ${buttonSpacing}px;` : ''}">
                ${buttonsGroup}
              </div>
              ${valueDisplay}
            </div>
          `;
        case 'left':
          return html`
            <div style="display: flex; flex-direction: row; align-items: center; ${spacingStyle}">
              <div style="${!useValueSpacing ? `margin-right: ${buttonSpacing}px;` : ''}">
                ${valueDisplay}
              </div>
              ${buttonsGroup}
            </div>
          `;
        case 'right':
          return html`
            <div style="display: flex; flex-direction: row; align-items: center; ${spacingStyle}">
              <div style="${!useValueSpacing ? `margin-right: ${buttonSpacing}px;` : ''}">
                ${buttonsGroup}
              </div>
              ${valueDisplay}
            </div>
          `;
        case 'center':
        default:
          // Center = value between buttons
          if (isVertical) {
            return html`
              <div
                style="display: flex; flex-direction: column; align-items: center; ${spacingStyle}"
              >
                <div style="${!useValueSpacing ? `margin-bottom: ${buttonSpacing}px;` : ''}">
                  ${incrementButton}
                </div>
                <div style="${!useValueSpacing ? `margin-bottom: ${buttonSpacing}px;` : ''}">
                  ${valueDisplay}
                </div>
                ${decrementButton}
              </div>
            `;
          } else {
            return html`
              <div style="display: flex; flex-direction: row; align-items: center; ${spacingStyle}">
                <div style="${!useValueSpacing ? `margin-right: ${buttonSpacing}px;` : ''}">
                  ${decrementButton}
                </div>
                <div style="${!useValueSpacing ? `margin-right: ${buttonSpacing}px;` : ''}">
                  ${valueDisplay}
                </div>
                ${incrementButton}
              </div>
            `;
          }
      }
    };

    return html`
      <style>
        .spinbox-button {
          flex-shrink: 0;
        }
        .spinbox-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .spinbox-button:not(:disabled):hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
      </style>
      <div class="spinbox-module-container" style=${this.styleObjectToCss(containerStyles)}>
        <div
          class="spinbox-container"
          style="display: flex; align-items: center; justify-content: center;"
        >
          ${renderLayout()}
        </div>
      </div>
    `;
  }

  private async callEntityService(
    entity: string,
    value: number,
    hass: HomeAssistant,
    domain?: string
  ): Promise<void> {
    const entityDomain = domain || entity.split('.')[0];
    const entityState = hass.states[entity];

    console.log(`[Spinbox] Calling service for ${entity} with value ${value}`);

    // Determine the appropriate service based on entity domain
    let service = '';
    let serviceData: any = {};

    try {
      switch (entityDomain) {
        case 'input_number':
        case 'number':
          service = `${entityDomain}.set_value`;
          serviceData = {
            entity_id: entity,
            value: value,
          };
          break;
        case 'climate':
          service = 'climate.set_temperature';

          // Check if entity supports HVAC mode-specific temperature settings
          const hvacMode = entityState?.state;
          const hasTargetHigh = entityState?.attributes?.target_temp_high !== undefined;
          const hasTargetLow = entityState?.attributes?.target_temp_low !== undefined;

          serviceData = {
            entity_id: entity,
          };

          // For heat_cool mode with separate high/low targets
          if (hvacMode === 'heat_cool' && (hasTargetHigh || hasTargetLow)) {
            // When in heat_cool mode, maintain the other target and only adjust the one being changed
            const currentTemp = entityState?.attributes?.temperature;
            const targetHigh = entityState?.attributes?.target_temp_high;
            const targetLow = entityState?.attributes?.target_temp_low;

            // Determine which target to adjust based on proximity to current value
            if (currentTemp !== undefined && targetHigh !== undefined && targetLow !== undefined) {
              const distToHigh = Math.abs(value - targetHigh);
              const distToLow = Math.abs(value - targetLow);

              if (distToHigh < distToLow) {
                // Adjust high target
                serviceData.target_temp_high = value;
                serviceData.target_temp_low = targetLow;
              } else {
                // Adjust low target
                serviceData.target_temp_low = value;
                serviceData.target_temp_high = targetHigh;
              }
            } else {
              // Fallback: set both to same value (will be adjusted by thermostat)
              serviceData.target_temp_high = value + 2;
              serviceData.target_temp_low = value - 2;
            }

            console.log(`[Spinbox] Climate heat_cool mode - serviceData:`, serviceData);
          } else {
            // Single temperature target (heat, cool, or auto modes)
            serviceData.temperature = value;
            console.log(`[Spinbox] Climate single temp mode - temperature: ${value}`);
          }
          break;
        default:
          console.warn(`[Spinbox] Unsupported entity domain: ${entityDomain}`);
          return;
      }

      console.log(`[Spinbox] Calling service ${service} with data:`, serviceData);
      await hass.callService(service.split('.')[0], service.split('.')[1], serviceData);
      console.log(`[Spinbox] Service call successful`);
    } catch (error) {
      console.error(`[Spinbox] Failed to call service for ${entity}:`, error);
      console.error('[Spinbox] Service data was:', serviceData);
    }
  }

  private getDecimalPlaces(step: number): number {
    const stepStr = step.toString();
    if (stepStr.includes('.')) {
      return stepStr.split('.')[1].length;
    }
    return 0;
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  private triggerPreviewUpdate(): void {
    const event = new CustomEvent('ultra-card-template-update', {
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(event);
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload': {
        if (backgroundImage) {
          const resolved = getImageUrl(hass, backgroundImage);
          return `url("${resolved}")`;
        }
        break;
      }
      case 'url': {
        if (backgroundImage) {
          return `url("${backgroundImage}")`;
        }
        break;
      }
      case 'entity': {
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            const imageUrl =
              (entityState.attributes as any)?.entity_picture ||
              (entityState.attributes as any)?.image ||
              (typeof entityState.state === 'string' ? entityState.state : '');
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              const resolved = getImageUrl(hass, imageUrl);
              return `url("${resolved}")`;
            }
          }
        }
        break;
      }
    }

    return 'none';
  }

  private _hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      const chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
