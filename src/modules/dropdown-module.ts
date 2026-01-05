import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DropdownModule, DropdownOption, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { TemplateService } from '../services/template-service';
import {
  parseUnifiedTemplate,
  hasTemplateError,
  isStringResult,
} from '../utils/template-parser';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';

export class UltraDropdownModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'dropdown',
    title: 'Dropdown',
    description: 'Interactive dropdown selector with Home Assistant actions',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:menu-down',
    category: 'interactive',
    tags: ['dropdown', 'select', 'menu', 'scene', 'service', 'interactive'],
  };

  private expandedOptions: Set<string> = new Set();
  private dropdownOpenStates: Map<string, boolean> = new Map(); // moduleId -> isOpen
  private currentSelection: Map<string, string> = new Map(); // moduleId -> selectedOption
  private clickOutsideHandler: ((e: Event) => void) | null = null;
  private scrollHandler: ((e: Event) => void) | null = null;
  private resizeHandler: ((e: Event) => void) | null = null;
  private portaledDropdowns: Map<string, HTMLElement> = new Map(); // moduleId -> portaled element
  private portaledDropdownTriggers: Map<string, HTMLElement> = new Map(); // moduleId -> trigger element
  private scrollListenerParents: Map<string, HTMLElement[]> = new Map(); // instanceId -> array of parent elements with scroll listeners
  private activeScrollHandlers: Set<string> = new Set(); // Track which instances have active scroll handlers
  private moduleContexts: Map<
    string,
    { module: DropdownModule; hass: HomeAssistant; config?: UltraCardConfig }
  > = new Map(); // Store module contexts for event handling
  private _templateService?: TemplateService;
  private chevronClickHandling: Set<string> = new Set(); // Track modules currently handling chevron clicks

  // Trigger preview update for reactive UI

  createDefault(id?: string, hass?: HomeAssistant): DropdownModule {
    return {
      id: id || this.generateId('dropdown'),
      type: 'dropdown',
      source_mode: 'manual', // Default to manual mode
      source_entity: undefined, // No entity selected by default
      placeholder: 'Choose an option...',
      options: [
        {
          id: this.generateId('option'),
          label: 'Turn On Lights',
          action: {
            action: 'perform-action',
            service: 'light.turn_on',
            target: { entity_id: ['light.living_room'] },
          },
        },
        {
          id: this.generateId('option'),
          label: 'Turn Off Lights',
          action: {
            action: 'perform-action',
            service: 'light.turn_off',
            target: { entity_id: ['light.living_room'] },
          },
        },
      ],
      entity_option_customization: {}, // Empty customization by default
      current_selection: 'Turn On Lights', // Default to first option
      track_state: true, // Enable state tracking by default
      closed_title_mode: 'last_chosen', // Default to showing last chosen option
      closed_title_entity: undefined,
      closed_title_custom: '',
      unified_template_mode: false,
      unified_template: '',
      control_icon: 'mdi:chevron-down',
      control_alignment: 'apart',
      control_icon_side: 'right',
      visible_items: 5, // Number of items visible before scrolling
      // label removed
      // Global actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
      // Hover configuration
      enable_hover_effect: false,
      hover_background_color: 'var(--primary-color)',
    };
  }

  // Helper method to get options from entity
  private getOptionsFromEntity(module: DropdownModule, hass: HomeAssistant): string[] {
    if (!module.source_entity || !hass) return [];

    const entityState = hass.states[module.source_entity];
    if (!entityState) return [];

    // Get options from entity attributes
    const options = entityState.attributes?.options;
    if (Array.isArray(options)) {
      return options;
    }

    return [];
  }

  // Helper method to format option labels as friendly names
  private formatOptionLabel(optionValue: string | undefined | null, entityState: any, hass: HomeAssistant): string {
    if (optionValue === undefined || optionValue === null) {
      return '';
    }

    // Try Home Assistant's formatEntityState if available
    if (entityState && (hass as any).formatEntityState) {
      try {
        // Create a temporary state object with the option value
        const tempState = { ...entityState, state: optionValue };
        const formatted = (hass as any).formatEntityState(tempState, optionValue);
        if (formatted && formatted !== optionValue) {
          return formatted;
        }
      } catch (e) {
        // Fall through to manual formatting
      }
    }
    
    // Manual formatting: capitalize words and replace underscores
    return String(optionValue)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // Helper method to get current state from entity
  private getCurrentStateFromEntity(
    module: DropdownModule,
    hass: HomeAssistant
  ): string | undefined {
    if (!module.source_entity || !hass) return undefined;

    const entityState = hass.states[module.source_entity];
    if (!entityState) return undefined;

    return entityState.state;
  }

  // Helper method to render entity source preview info
  private renderEntitySourcePreview(
    module: DropdownModule,
    hass: HomeAssistant,
    lang: string
  ): TemplateResult {
    const options = this.getOptionsFromEntity(module, hass);
    const currentState = this.getCurrentStateFromEntity(module, hass);

    if (options.length === 0) {
      return html`
        <div style="font-size: 12px; color: var(--secondary-text-color); font-style: italic;">
          ${localize('editor.dropdown.no_options_found', lang, 'No options found for this entity')}
        </div>
      `;
    }

    return html`
      <div style="font-size: 12px; margin-top: 8px;">
        <div style="font-weight: 600; margin-bottom: 4px; color: var(--primary-text-color);">
          ${localize('editor.dropdown.available_options', lang, 'Available Options')}
          (${options.length}):
        </div>
        <div style="color: var(--secondary-text-color); line-height: 1.6;">
          ${options.map(
            (opt, idx) =>
              html`<div style="display: flex; align-items: center; gap: 6px;">
                <span style="color: var(--primary-color);">•</span>
                <span
                  style="${opt === currentState
                    ? 'font-weight: 600; color: var(--primary-color);'
                    : ''}"
                  >${opt}</span
                >
                ${opt === currentState
                  ? html`<span style="font-size: 10px; opacity: 0.7;">(current)</span>`
                  : ''}
              </div>`
          )}
        </div>
      </div>
    `;
  }

  // Label position support removed

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const dropdownModule = module as DropdownModule;
    const lang = hass?.locale?.language || 'en';

    // Initialize expanded state - all options start collapsed
    // Don't add any options to expandedOptions set, so they all start collapsed

    const updateDropdownOption = (optionId: string, updates: Partial<DropdownOption>) => {
      const updatedOptions = dropdownModule.options.map(option =>
        option.id === optionId ? { ...option, ...updates } : option
      );
      updateModule({ options: updatedOptions });
    };

    const updateCurrentSelection = (selection: string) => {
      console.log('Updating current selection to:', selection);
      updateModule({ current_selection: selection });
    };

    const moveOption = (fromIndex: number, toIndex: number) => {
      const newOptions = [...dropdownModule.options];
      const [movedOption] = newOptions.splice(fromIndex, 1);
      newOptions.splice(toIndex, 0, movedOption);
      updateModule({ options: newOptions });
    };

    const addDropdownOption = () => {
      const newOptionId = this.generateId('option');
      const newOption: DropdownOption = {
        id: newOptionId,
        label: `Option ${dropdownModule.options.length + 1}`,
        action: {
          action: 'more-info',
          entity: '',
        },
      };
      // Add to expanded options so new options start expanded
      this.expandedOptions.add(newOptionId);
      updateModule({ options: [...dropdownModule.options, newOption] });
    };

    const removeDropdownOption = (optionId: string) => {
      const updatedOptions = dropdownModule.options.filter(option => option.id !== optionId);
      updateModule({ options: updatedOptions });
    };

    const duplicateDropdownOption = (optionId: string) => {
      const optionToDuplicate = dropdownModule.options.find(option => option.id === optionId);
      if (optionToDuplicate) {
        const duplicatedOption: DropdownOption = {
          ...optionToDuplicate,
          id: this.generateId('option'),
          label: `${optionToDuplicate.label} (Copy)`,
        };
        const optionIndex = dropdownModule.options.findIndex(option => option.id === optionId);
        const updatedOptions = [
          ...dropdownModule.options.slice(0, optionIndex + 1),
          duplicatedOption,
          ...dropdownModule.options.slice(optionIndex + 1),
        ];
        updateModule({ options: updatedOptions });
      }
    };

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Source Configuration -->
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.dropdown.source.title', lang, 'Dropdown Source')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.dropdown.source.desc',
              lang,
              'Choose whether to manually define options or use a select/input_select entity.'
            )}
          </div>

          <!-- Source Mode Selection -->
          <div style="margin-bottom: 16px;">
            ${this.renderFieldSection(
              localize('editor.dropdown.source_mode.title', lang, 'Source Mode'),
              localize(
                'editor.dropdown.source_mode.desc',
                lang,
                'Manual: Define custom options with actions. Entity: Use options from a select or input_select entity.'
              ),
              hass,
              { source_mode: dropdownModule.source_mode || 'manual' },
              [
                this.selectField('source_mode', [
                  {
                    value: 'manual',
                    label: localize('editor.dropdown.source_mode.manual', lang, 'Manual Options'),
                  },
                  {
                    value: 'entity',
                    label: localize('editor.dropdown.source_mode.entity', lang, 'Entity Source'),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.source_mode;
                const prev = dropdownModule.source_mode || 'manual';
                if (next === prev) return;
                updateModule({ source_mode: next });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
          </div>

          <!-- Entity Picker (only shown when source_mode is 'entity') -->
          ${dropdownModule.source_mode === 'entity'
            ? html`
                <div style="margin-bottom: 16px;">
                  ${this.renderConditionalFieldsGroup(
                    localize(
                      'editor.dropdown.entity_source_config',
                      lang,
                      'Entity Source Configuration'
                    ),
                    html`
                      ${this.renderFieldSection(
                        localize('editor.dropdown.source_entity.title', lang, 'Source Entity'),
                        localize(
                          'editor.dropdown.source_entity.desc',
                          lang,
                          'Select or input_select entity to use as the source for dropdown options.'
                        ),
                        hass,
                        { source_entity: dropdownModule.source_entity || '' },
                        [
                          {
                            name: 'source_entity',
                            label: '',
                            selector: {
                              entity: {
                                domain: ['input_select', 'select'],
                              },
                            },
                          },
                        ],
                        (e: CustomEvent) => {
                          const next = e.detail.value.source_entity;
                          const prev = dropdownModule.source_entity || '';
                          if (next === prev) return;
                          updateModule({ source_entity: next });
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }
                      )}
                      ${dropdownModule.source_entity
                        ? html`
                            <div
                              style="margin-top: 12px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 4px; border-left: 3px solid var(--primary-color);"
                            >
                              <div
                                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px;"
                              >
                                ${localize(
                                  'editor.dropdown.entity_source_info',
                                  lang,
                                  'Options will be automatically populated from the entity. The dropdown will display the current state and update the entity when an option is selected.'
                                )}
                              </div>
                              ${this.renderEntitySourcePreview(dropdownModule, hass, lang)}
                            </div>
                          `
                        : ''}
                    `
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Basic Settings (only show for manual mode or when no entity is selected) -->
        ${dropdownModule.source_mode === 'manual'
          ? html`
              <div class="settings-section">
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${localize('editor.dropdown.basic.title', lang, 'Basic Settings')}
                </div>
                <div
                  style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.dropdown.basic.desc',
                    lang,
                    'Configure the dropdown appearance and behavior.'
                  )}
                </div>

                <!-- Keep Selection State -->
                <div
                  style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;"
                >
                  <div>
                    <div
                      style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                    >
                      ${localize(
                        'editor.dropdown.keep_selection_state.title',
                        lang,
                        'Keep Selection State'
                      )}
                    </div>
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
                    >
                      ${localize(
                        'editor.dropdown.keep_selection_state.desc',
                        lang,
                        'Remember and display the last selected option (recommended for scene selectors)'
                      )}
                    </div>
                  </div>
                  <ha-switch
                    .checked=${dropdownModule.track_state ?? true}
                    @change=${(e: Event) => {
                      const target = e.target as any;
                      updateModule({ track_state: target.checked });
                    }}
                  ></ha-switch>
                </div>

                <!-- Closed Dropdown Title Configuration -->
                <div style="margin-bottom: 16px;">
                  ${this.renderFieldSection(
                    localize('editor.dropdown.closed_title_mode.title', lang, 'Closed Dropdown Title'),
                    localize(
                      'editor.dropdown.closed_title_mode.desc',
                      lang,
                      'Choose what the dropdown displays when closed.'
                    ),
                    hass,
                    { closed_title_mode: dropdownModule.closed_title_mode || 'last_chosen' },
                    [
                      this.selectField('closed_title_mode', [
                        {
                          value: 'last_chosen',
                          label: localize('editor.dropdown.closed_title_mode.last_chosen', lang, 'Last Chosen'),
                        },
                        {
                          value: 'entity_state',
                          label: localize('editor.dropdown.closed_title_mode.entity_state', lang, 'Entity State'),
                        },
                        {
                          value: 'custom',
                          label: localize('editor.dropdown.closed_title_mode.custom', lang, 'Custom'),
                        },
                        {
                          value: 'first_option',
                          label: localize('editor.dropdown.closed_title_mode.first_option', lang, 'First Option'),
                        },
                      ]),
                    ],
                    (e: CustomEvent) => {
                      const next = e.detail.value.closed_title_mode;
                      const prev = dropdownModule.closed_title_mode || 'last_chosen';
                      if (next === prev) return;
                      updateModule({ closed_title_mode: next });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  )}
                </div>

                <!-- Conditional fields based on closed_title_mode -->
                ${dropdownModule.closed_title_mode === 'entity_state'
                  ? html`
                      <div style="margin-bottom: 16px;">
                        ${this.renderConditionalFieldsGroup(
                          localize(
                            'editor.dropdown.closed_title_entity_config',
                            lang,
                            'Entity State Configuration'
                          ),
                          html`
                            ${this.renderFieldSection(
                              localize('editor.dropdown.closed_title_entity.title', lang, 'Entity'),
                              localize(
                                'editor.dropdown.closed_title_entity.desc',
                                lang,
                                'Entity whose state will be displayed when dropdown is closed.'
                              ),
                              hass,
                              { closed_title_entity: dropdownModule.closed_title_entity || '' },
                              [this.entityField('closed_title_entity')],
                              (e: CustomEvent) => {
                                const next = e.detail.value.closed_title_entity;
                                const prev = dropdownModule.closed_title_entity || '';
                                if (next === prev) return;
                                updateModule({ closed_title_entity: next });
                                setTimeout(() => this.triggerPreviewUpdate(), 50);
                              }
                            )}
                          `
                        )}
                      </div>
                    `
                  : ''}
                ${dropdownModule.closed_title_mode === 'custom'
                  ? html`
                      <div style="margin-bottom: 16px;">
                        ${this.renderConditionalFieldsGroup(
                          localize(
                            'editor.dropdown.closed_title_custom_config',
                            lang,
                            'Custom Text Configuration'
                          ),
                          html`
                            <div class="field-group">
                              <div
                                class="field-title"
                                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                              >
                                ${localize('editor.dropdown.closed_title_custom.title', lang, 'Custom Text')}
                              </div>
                              <div
                                class="field-description"
                                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                              >
                                ${localize(
                                  'editor.dropdown.closed_title_custom.desc',
                                  lang,
                                  'Custom text to display when dropdown is closed.'
                                )}
                              </div>
                              <ha-textfield
                                .value=${dropdownModule.closed_title_custom || ''}
                                placeholder="Please select..."
                                @input=${(e: Event) => {
                                  const target = e.target as any;
                                  const input = target.shadowRoot?.querySelector('input') || target;
                                  const value = target.value;
                                  const cursorPosition = input.selectionStart;
                                  const cursorEnd = input.selectionEnd;

                                  updateModule({ closed_title_custom: value });

                                  requestAnimationFrame(() => {
                                    if (input && typeof cursorPosition === 'number') {
                                      target.value = value;
                                      input.value = value;
                                      input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                                    }
                                  });
                                  setTimeout(() => {
                                    if (input && typeof cursorPosition === 'number') {
                                      target.value = value;
                                      input.value = value;
                                      input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                                    }
                                  }, 0);
                                  setTimeout(() => {
                                    if (input && typeof cursorPosition === 'number') {
                                      target.value = value;
                                      input.value = value;
                                      input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                                    }
                                  }, 10);
                                }}
                                style="width: 100%; --mdc-theme-primary: var(--primary-color);"
                              ></ha-textfield>
                            </div>
                          `
                        )}
                      </div>
                    `
                  : ''}

                <!-- Placeholder (only show when track_state is disabled) -->
                ${!dropdownModule.track_state
                  ? html`
                      <div style="margin-bottom: 16px;">
                        <div
                          class="field-title"
                          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                        >
                          ${localize('editor.dropdown.placeholder.title', lang, 'Placeholder')}
                        </div>
                        <div
                          class="field-description"
                          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                        >
                          ${localize(
                            'editor.dropdown.placeholder.desc',
                            lang,
                            'Text shown when no option is selected.'
                          )}
                        </div>
                        <ha-textfield
                          .value=${dropdownModule.placeholder || ''}
                          placeholder="Select an option..."
                          @input=${(e: Event) => {
                            const target = e.target as any;
                            const input = target.shadowRoot?.querySelector('input') || target;
                            const value = target.value;
                            const cursorPosition = input.selectionStart;
                            const cursorEnd = input.selectionEnd;

                            updateModule({ placeholder: value });

                            requestAnimationFrame(() => {
                              if (input && typeof cursorPosition === 'number') {
                                target.value = value;
                                input.value = value;
                                input.setSelectionRange(
                                  cursorPosition,
                                  cursorEnd || cursorPosition
                                );
                              }
                            });
                            setTimeout(() => {
                              if (input && typeof cursorPosition === 'number') {
                                target.value = value;
                                input.value = value;
                                input.setSelectionRange(
                                  cursorPosition,
                                  cursorEnd || cursorPosition
                                );
                              }
                            }, 0);
                            setTimeout(() => {
                              if (input && typeof cursorPosition === 'number') {
                                target.value = value;
                                input.value = value;
                                input.setSelectionRange(
                                  cursorPosition,
                                  cursorEnd || cursorPosition
                                );
                              }
                            }, 10);
                          }}
                          style="width: 100%; --mdc-theme-primary: var(--primary-color);"
                        ></ha-textfield>
                      </div>
                    `
                  : ''}
              </div>

              <!-- Unified Template Section -->
              ${dropdownModule.source_mode === 'manual'
                ? html`
                    <div class="template-section" style="margin-bottom: 24px;">
                      <div class="template-header">
                        <div class="switch-container">
                          <label class="switch-label"
                            >${localize(
                              'editor.dropdown.unified_template_section.title',
                              lang,
                              'Template Mode'
                            )}</label
                          >
                          <label class="switch">
                            <input
                              type="checkbox"
                              .checked=${dropdownModule.unified_template_mode || false}
                              @change=${(e: Event) => {
                                const checked = (e.target as HTMLInputElement).checked;
                                updateModule({ unified_template_mode: checked });
                              }}
                            />
                            <span class="slider round"></span>
                          </label>
                        </div>
                        <div class="template-description">
                          ${localize(
                            'editor.dropdown.unified_template_section.desc',
                            lang,
                            'Use a single Jinja2 template to generate all dropdown options with icons, labels, and colors. Return a JSON array of option objects. When enabled, manual options are replaced by template-generated options.'
                          )}
                        </div>
                      </div>

                      ${dropdownModule.unified_template_mode
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
                                .value=${dropdownModule.unified_template || ''}
                                .placeholder=${'[\n  {"label": "Heating", "icon": "mdi:fire", "icon_color": "#FF5722"},\n  {"label": "Cooling", "icon": "mdi:snowflake", "icon_color": "#2196F3"},\n  {"label": "Auto", "icon": "mdi:autorenew", "icon_color": "#4CAF50"}\n]'}
                                .minHeight=${200}
                                .maxHeight=${500}
                                @value-changed=${(e: CustomEvent) => {
                                  updateModule({ unified_template: e.detail.value });
                                }}
                              ></ultra-template-editor>
                              <div class="template-help">
                                <p><strong>Template must return a JSON array of options:</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px; margin-top: 8px;"
                                >
                                  [<br />
                                  &nbsp;&nbsp;{"label": "Option 1", "icon": "mdi:home", "icon_color": "blue"},<br />
                                  &nbsp;&nbsp;{"label": "Option 2", "icon": "mdi:car", "icon_color": "red"},<br />
                                  &nbsp;&nbsp;{"label": "Option 3", "icon": "mdi:star"}<br />
                                  ]
                                </code>
                                <p style="margin-top: 12px;"><strong>Example - Ecobee Climate Modes (with actions):</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px; margin-top: 8px;"
                                >
                                  {% set modes = state_attr('climate.ecobee', 'hvac_modes') | default(['off', 'heat', 'cool', 'auto', 'heat_cool']) %}<br />
                                  [<br />
                                  {% for mode in modes %}<br />
                                  &nbsp;&nbsp;{<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"label": "{% if mode == 'heat' %}Heating{% elif mode == 'cool' %}Cooling{% elif mode == 'auto' %}Auto{% elif mode == 'heat_cool' %}Heat/Cool{% else %}Off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon": "{% if mode == 'heat' %}mdi:fire{% elif mode == 'cool' %}mdi:snowflake{% elif mode == 'auto' %}mdi:autorenew{% elif mode == 'heat_cool' %}mdi:thermostat{% else %}mdi:thermostat-off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon_color": "{% if mode == 'heat' %}#FF5722{% elif mode == 'cool' %}#2196F3{% elif mode == 'auto' %}#4CAF50{% elif mode == 'heat_cool' %}#FF9800{% else %}#9E9E9E{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"mode": "{{ mode }}"<br />
                                  &nbsp;&nbsp;}{% if not loop.last %},{% endif %}<br />
                                  {% endfor %}<br />
                                  ]
                                </code>
                                <p style="margin-top: 12px;">
                                  <strong>Important:</strong> To enable actions (clicking options to change HVAC mode), you must:
                                </p>
                                <ul style="margin-top: 8px; padding-left: 20px;">
                                  <li>Include a <code>"mode"</code> field in each option with the actual HVAC mode value (e.g., "heat", "cool", "auto")</li>
                                  <li>Set a <code>source_entity</code> in the Entity Source Configuration section (even if Source Mode is Manual)</li>
                                  <li>When an option is clicked, it will automatically call <code>climate.set_hvac_mode</code> service</li>
                                </ul>
                                <p style="margin-top: 12px;">
                                  <strong>Note:</strong> When Unified Template is enabled, manually configured options are ignored. The template dynamically generates all options with their icons, labels, and colors. The selected option's display automatically uses the properties from the template-generated options.
                                </p>
                                <p style="margin-top: 12px;">
                                  <strong>Optional Display Key:</strong> You can include a <code>"display"</code> key in your template result to customize what shows when the dropdown is closed. The template's <code>"display"</code> key takes priority over the "Closed Dropdown Title" configuration setting.
                                </p>
                                <p style="margin-top: 12px;"><strong>Example with display key:</strong></p>
                                <code
                                  style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px; margin-top: 8px;"
                                >
                                  {% set mode = states("climate.ecobee") %}<br />
                                  {% set modes = state_attr('climate.ecobee', 'hvac_modes') | default(['off', 'heat', 'cool', 'auto', 'heat_cool']) %}<br />
                                  {<br />
                                  &nbsp;&nbsp;"options": [<br />
                                  {% for m in modes %}<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;{"label": "{% if m == 'heat' %}Heating{% elif m == 'cool' %}Cooling{% elif m == 'auto' %}Auto{% else %}Off{% endif %}", "icon": "mdi:fire", "mode": "{{ m }}"}{% if not loop.last %},{% endif %}<br />
                                  {% endfor %}<br />
                                  &nbsp;&nbsp;],<br />
                                  &nbsp;&nbsp;"display": {<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"label": "{% if mode == 'heat' %}🔥 Heating{% elif mode == 'cool' %}❄️ Cooling{% elif mode == 'auto' %}🔄 Auto{% else %}Off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon": "{% if mode == 'heat' %}mdi:fire{% elif mode == 'cool' %}mdi:snowflake{% elif mode == 'auto' %}mdi:autorenew{% else %}mdi:thermostat-off{% endif %}",<br />
                                  &nbsp;&nbsp;&nbsp;&nbsp;"icon_color": "{% if mode == 'heat' %}#FF5722{% elif mode == 'cool' %}#2196F3{% elif mode == 'auto' %}#4CAF50{% else %}#9E9E9E{% endif %}"<br />
                                  &nbsp;&nbsp;}<br />
                                  }
                                </code>
                              </div>
                            </div>
                          `
                        : ''}
                    </div>
                  `
                : ''}

              <!-- Dropdown Options -->
              <div class="settings-section">
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${localize('editor.dropdown.options.title', lang, 'Dropdown Options')}
                </div>

                <div class="options-list">
                  ${dropdownModule.options.map(
                    (option, index) => html`
                      <div
                        class="option-item"
                        style="margin-bottom: 24px; background: var(--secondary-background-color); border-radius: 8px; border: 1px solid var(--divider-color); overflow: hidden;"
                        data-option-id="${option.id}"
                        data-option-index="${index}"
                        @dragover=${(e: DragEvent) => this.handleDragOver(e)}
                        @dragenter=${(e: DragEvent) => this.handleDragEnter(e)}
                        @dragleave=${(e: DragEvent) => this.handleDragLeave(e)}
                        @drop=${(e: DragEvent) => this.handleDrop(e, index, moveOption)}
                      >
                        <div
                          class="option-header"
                          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(var(--rgb-primary-color), 0.05); border-bottom: 1px solid var(--divider-color); cursor: pointer;"
                          @click=${(e: Event) => this.toggleHeader(e)}
                        >
                          <div style="display: flex; align-items: center; gap: 12px;">
                            <div
                              class="drag-handle"
                              style="padding: 8px; margin: -8px; cursor: grab; border-radius: 4px; transition: background-color 0.2s ease;"
                              draggable="true"
                              @dragstart=${(e: DragEvent) => this.handleDragStart(e, index)}
                              @dragend=${(e: DragEvent) => this.handleDragEnd(e)}
                              @click=${(e: Event) => e.stopPropagation()}
                              @mousedown=${(e: Event) => e.stopPropagation()}
                              .title=${localize(
                                'editor.dropdown.drag_option',
                                lang,
                                'Drag to reorder'
                              )}
                              @mouseenter=${(e: Event) => {
                                const target = e.target as HTMLElement;
                                target.style.backgroundColor =
                                  'rgba(var(--rgb-primary-color), 0.1)';
                              }}
                              @mouseleave=${(e: Event) => {
                                const target = e.target as HTMLElement;
                                target.style.backgroundColor = 'transparent';
                              }}
                            >
                              <ha-icon
                                icon="mdi:drag"
                                style="color: var(--secondary-text-color); pointer-events: none;"
                              ></ha-icon>
                            </div>
                            <div style="font-weight: 600; color: var(--primary-text-color);">
                              ${option.label ||
                              localize(
                                'editor.dropdown.option_number',
                                lang,
                                'Option {number}'
                              ).replace('{number}', (index + 1).toString())}
                            </div>
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <ha-icon-button
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                duplicateDropdownOption(option.id);
                              }}
                              .title=${localize(
                                'editor.dropdown.duplicate_option',
                                lang,
                                'Duplicate option'
                              )}
                            >
                              <ha-icon icon="mdi:content-duplicate"></ha-icon>
                            </ha-icon-button>
                            <ha-icon-button
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                removeDropdownOption(option.id);
                              }}
                              .title=${localize(
                                'editor.dropdown.remove_option',
                                lang,
                                'Remove option'
                              )}
                              .disabled=${dropdownModule.options.length <= 1}
                            >
                              <ha-icon icon="mdi:delete"></ha-icon>
                            </ha-icon-button>
                            <ha-icon
                              class="expand-caret"
                              icon="mdi:chevron-down"
                              style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.expandedOptions.has(
                                option.id
                              )
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)'}; cursor: pointer; padding: 8px; margin: -8px;"
                              @click=${(e: Event) => {
                                // Stop event propagation to prevent header click
                                e.stopPropagation();
                                e.preventDefault();
                                console.log('Direct caret clicked for option:', option.id);

                                // Find elements directly from the event
                                const caret = e.target as HTMLElement;
                                const card = caret.closest('.option-item') as HTMLElement;
                                const content = card?.querySelector(
                                  '.option-content'
                                ) as HTMLElement;

                                if (card && content && caret) {
                                  const id = card.getAttribute('data-option-id') || '';
                                  console.log('Direct caret - found ID:', id);

                                  // Toggle state
                                  if (this.expandedOptions.has(id)) {
                                    this.expandedOptions.delete(id);
                                    content.style.display = 'none';
                                    caret.style.transform = 'rotate(0deg)';
                                    console.log('Direct caret - collapsed');
                                  } else {
                                    this.expandedOptions.add(id);
                                    content.style.display = 'block';
                                    caret.style.transform = 'rotate(180deg)';
                                    console.log('Direct caret - expanded');
                                  }
                                }
                              }}
                            ></ha-icon>
                          </div>
                        </div>

                        <div
                          class="option-content"
                          style="padding: 16px; display: ${this.expandedOptions.has(option.id)
                            ? 'block'
                            : 'none'};"
                        >
                          ${this.renderOptionConfiguration(
                            option,
                            hass,
                            lang,
                            updateDropdownOption
                          )}
                        </div>
                      </div>
                    `
                  )}
                </div>

                <div style="margin-top: 16px; text-align: center;">
                  <ha-button @click=${addDropdownOption}>
                    <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
                    ${localize('editor.dropdown.add_option', lang, 'Add Option')}
                  </ha-button>
                </div>
              </div>
            `
          : html`
              <div class="settings-section">
                <div
                  class="section-title"
                  style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
                >
                  ${localize('editor.dropdown.basic.title', lang, 'Basic Settings')}
                </div>
                <div
                  style="text-align: center; padding: 32px; color: var(--secondary-text-color); background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px;"
                >
                  <ha-icon
                    icon="mdi:link-variant"
                    style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"
                  ></ha-icon>
                  <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                    ${localize(
                      'editor.dropdown.entity_mode_active',
                      lang,
                      'Entity Source Mode Active'
                    )}
                  </div>
                  <div style="font-size: 14px; line-height: 1.4;">
                    ${localize(
                      'editor.dropdown.entity_mode_desc',
                      lang,
                      'Options are automatically managed by the selected entity. The dropdown will display the current state and update the entity when an option is selected.'
                    )}
                  </div>
                </div>
              </div>
            `}
        <!-- Control Icon & Alignment -->
        <div class="settings-section">
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.dropdown.control_icon.section_title', lang, 'Dropdown Control Icon')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.dropdown.control_icon.section_desc',
              lang,
              'Customize the dropdown chevron icon and how it aligns with the selected value.'
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.dropdown.control_icon.label', lang, 'Control Icon'),
            localize(
              'editor.dropdown.control_icon.label_desc',
              lang,
              'Select the icon that indicates the dropdown toggle state.'
            ),
            hass,
            { control_icon: dropdownModule.control_icon || 'mdi:chevron-down' },
            [this.iconField('control_icon')],
            (e: CustomEvent) => {
              const next = e.detail.value.control_icon;
              const prev = dropdownModule.control_icon;
              if (next === prev) return;
              updateModule({ control_icon: next && next.trim() ? next : undefined });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <div style="margin-top: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.dropdown.control_alignment.mode', lang, 'Alignment Mode')}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[
                {
                  value: 'center',
                  icon: 'mdi:align-horizontal-center',
                  title: localize('editor.common.center', lang, 'Center'),
                },
                {
                  value: 'apart',
                  icon: 'mdi:arrow-left-right',
                  title: localize('editor.common.apart', lang, 'Apart'),
                },
              ].map(
                align => html`
                  <button
                    class="alignment-btn ${(dropdownModule.control_alignment || 'apart') === align.value
                      ? 'active'
                      : ''}"
                    @click=${() => {
                      if ((dropdownModule.control_alignment || 'apart') === align.value) {
                        return;
                      }
                      updateModule({ control_alignment: align.value as 'center' | 'apart' });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                    title="${align.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(dropdownModule.control_alignment || 'apart') === align.value
                      ? 'var(--primary-color)'
                      : 'var(--card-background-color)'}; color: ${(dropdownModule.control_alignment || 'apart') === align.value
                      ? 'white'
                      : 'var(--primary-text-color)'}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${align.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.dropdown.control_alignment.icon_side', lang, 'Icon Side')}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[
                {
                  value: 'left',
                  icon: 'mdi:arrow-left',
                  title: localize('editor.common.left', lang, 'Left'),
                },
                {
                  value: 'right',
                  icon: 'mdi:arrow-right',
                  title: localize('editor.common.right', lang, 'Right'),
                },
              ].map(
                side => html`
                  <button
                    class="alignment-btn ${(dropdownModule.control_icon_side || 'right') === side.value
                      ? 'active'
                      : ''}"
                    @click=${() => {
                      if ((dropdownModule.control_icon_side || 'right') === side.value) {
                        return;
                      }
                      updateModule({ control_icon_side: side.value as 'left' | 'right' });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                    title="${side.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(dropdownModule.control_icon_side || 'right') === side.value
                      ? 'var(--primary-color)'
                      : 'var(--card-background-color)'}; color: ${(dropdownModule.control_icon_side || 'right') === side.value
                      ? 'white'
                      : 'var(--primary-text-color)'}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${side.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Visible Items Configuration -->
          <div style="margin-top: 24px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${localize('editor.dropdown.visible_items.title', lang, 'Visible Items')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${localize(
                'editor.dropdown.visible_items.desc',
                lang,
                'Number of items visible in the dropdown before scrolling (1-20).'
              )}
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <ha-slider
                .min=${1}
                .max=${20}
                .step=${1}
                .value=${dropdownModule.visible_items ?? 5}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  const value = parseInt(target.value, 10);
                  if (!isNaN(value) && value >= 1 && value <= 20) {
                    updateModule({ visible_items: value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }
                }}
                style="flex: 1; --mdc-theme-primary: var(--primary-color);"
              ></ha-slider>
              <span style="min-width: 40px; text-align: center; font-weight: 600; color: var(--primary-color); font-size: 18px;">
                ${dropdownModule.visible_items ?? 5}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private draggedIndex: number | null = null;

  private handleDragStart(e: DragEvent, index: number): void {
    console.log('Drag start for index:', index);
    this.draggedIndex = index;

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());

      // Create a ghost image of the option header
      const dragHandle = e.target as HTMLElement;
      const optionItem = dragHandle.closest('.option-item') as HTMLElement;
      const optionHeader = optionItem?.querySelector('.option-header') as HTMLElement;

      if (optionHeader) {
        // Create a compact ghost image
        const ghostElement = document.createElement('div');
        const optionLabel =
          optionItem?.querySelector('.option-header div:nth-child(1) div:nth-child(2)')
            ?.textContent || `Option ${index + 1}`;

        ghostElement.innerHTML = `
          <div style="
            display: flex; 
            align-items: center; 
            gap: 8px; 
            padding: 8px 12px;
            background: var(--primary-color);
            color: white;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            white-space: nowrap;
            max-width: 200px;
            transform: rotate(2deg);
          ">
            <ha-icon icon="mdi:drag" style="color: white; font-size: 16px;"></ha-icon>
            <span>${optionLabel}</span>
          </div>
        `;

        ghostElement.style.position = 'absolute';
        ghostElement.style.top = '-1000px';
        ghostElement.style.left = '-1000px';
        ghostElement.style.zIndex = '10000';
        ghostElement.style.pointerEvents = 'none';

        // Add to document temporarily
        document.body.appendChild(ghostElement);

        // Set as drag image with smaller offset
        e.dataTransfer.setDragImage(ghostElement, 100, 20);

        // Remove after drag starts
        setTimeout(() => {
          if (document.body.contains(ghostElement)) {
            document.body.removeChild(ghostElement);
          }
        }, 0);
      }
    }

    // Add visual feedback to the entire option item
    const dragHandle = e.target as HTMLElement;
    const optionItem = dragHandle.closest('.option-item') as HTMLElement;
    if (optionItem) {
      optionItem.classList.add('dragging');
      console.log('Added dragging class to option item');
    }
  }

  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    const optionItem = e.currentTarget as HTMLElement;
    if (optionItem && !optionItem.classList.contains('dragging')) {
      optionItem.style.borderTop = '3px solid var(--primary-color)';
      optionItem.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
      console.log('Drag entered option item');
    }
  }

  private handleDragLeave(e: DragEvent): void {
    const optionItem = e.currentTarget as HTMLElement;
    if (optionItem) {
      optionItem.style.borderTop = '';
      optionItem.style.backgroundColor = '';
      console.log('Drag left option item');
    }
  }

  private handleDrop(
    e: DragEvent,
    dropIndex: number,
    moveOption: (from: number, to: number) => void
  ): void {
    e.preventDefault();
    console.log('Drop event - from:', this.draggedIndex, 'to:', dropIndex);

    // Clear visual feedback
    const optionItem = e.currentTarget as HTMLElement;
    optionItem.style.borderTop = '';
    optionItem.style.backgroundColor = '';

    if (this.draggedIndex !== null && this.draggedIndex !== dropIndex) {
      console.log('Executing moveOption from', this.draggedIndex, 'to', dropIndex);
      moveOption(this.draggedIndex, dropIndex);
    }

    // Clear all visual feedback
    document.querySelectorAll('.option-item').forEach(item => {
      (item as HTMLElement).style.borderTop = '';
      (item as HTMLElement).style.backgroundColor = '';
      (item as HTMLElement).classList.remove('dragging');
    });

    this.draggedIndex = null;
  }

  private handleDragEnd(e: DragEvent): void {
    console.log('Drag end');
    const target = (e.target as HTMLElement)?.closest('.option-item') as HTMLElement;
    if (target) {
      target.classList.remove('dragging');
      console.log('Removed dragging class');
    }

    // Clear any remaining visual feedback
    document.querySelectorAll('.option-item').forEach(item => {
      (item as HTMLElement).style.borderTop = '';
    });

    this.draggedIndex = null;
  }

  private toggleHeader(e: Event): void {
    console.log('Header clicked');
    const header = e.currentTarget as HTMLElement;
    const card = header.closest('.option-item') as HTMLElement;
    if (!card) {
      console.log('No card found');
      return;
    }
    const id = card.getAttribute('data-option-id') || '';
    if (!id) {
      console.log('No ID found');
      return;
    }
    console.log('Toggling option with ID:', id);

    // Find elements directly from the card we already have
    const content = card.querySelector('.option-content') as HTMLElement;
    const caret = card.querySelector('.expand-caret') as HTMLElement;

    console.log('Found content from card:', content);
    console.log('Found caret from card:', caret);

    // Toggle state
    if (this.expandedOptions.has(id)) {
      this.expandedOptions.delete(id);
    } else {
      this.expandedOptions.add(id);
    }

    // Update DOM directly
    if (content && caret) {
      const isExpanded = this.expandedOptions.has(id);
      console.log('Is expanded:', isExpanded);

      if (isExpanded) {
        content.style.display = 'block';
        caret.style.transform = 'rotate(180deg)';
        console.log('Showing content, rotating caret to 180deg');
      } else {
        content.style.display = 'none';
        caret.style.transform = 'rotate(0deg)';
        console.log('Hiding content, rotating caret to 0deg');
      }
    }
  }

  private toggleOptionExpanded(optionId: string): void {
    console.log('toggleOptionExpanded called for:', optionId);
    console.log('Current expanded options:', Array.from(this.expandedOptions));

    // Toggle the expanded state of the option
    if (this.expandedOptions.has(optionId)) {
      this.expandedOptions.delete(optionId);
      console.log('Removing from expanded options');
    } else {
      this.expandedOptions.add(optionId);
      console.log('Adding to expanded options');
    }

    // Find the option element and update it directly
    const optionElement = document.querySelector(`[data-option-id="${optionId}"]`);
    console.log('Found option element:', optionElement);

    if (optionElement) {
      const content = optionElement.querySelector('.option-content') as HTMLElement;
      const caret = optionElement.querySelector('.expand-caret') as HTMLElement;

      console.log('Found content:', content);
      console.log('Found caret:', caret);

      if (content && caret) {
        const isExpanded = this.expandedOptions.has(optionId);
        console.log('Is expanded:', isExpanded);

        if (isExpanded) {
          // Show content
          content.style.display = 'block';
          caret.style.transform = 'rotate(180deg)'; // Point up when expanded
          console.log('Showing content, rotating caret to 180deg');
        } else {
          // Hide content
          content.style.display = 'none';
          caret.style.transform = 'rotate(0deg)'; // Point down when collapsed
          console.log('Hiding content, rotating caret to 0deg');
        }
      }
    }
  }

  private renderOptionConfiguration(
    option: DropdownOption,
    hass: HomeAssistant,
    lang: string,
    updateOption: (optionId: string, updates: Partial<DropdownOption>) => void
  ): TemplateResult {
    return html`
      <!-- Basic Option Settings -->
      <div class="field-group" style="margin-bottom: 12px;">
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.dropdown.option.label', lang, 'Label')}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize('editor.dropdown.option.label_desc', lang, 'Display text for this option')}
        </div>
        <ha-textfield
          .value=${option.label || ''}
          placeholder="Enter option label"
          @input=${(e: Event) => {
            const target = e.target as any;
            const input = target.shadowRoot?.querySelector('input') || target;
            const value = target.value;
            const cursorPosition = input.selectionStart;
            const cursorEnd = input.selectionEnd;

            updateOption(option.id, { label: value });

            requestAnimationFrame(() => {
              if (input && typeof cursorPosition === 'number') {
                target.value = value;
                input.value = value;
                input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
              }
            });
            setTimeout(() => {
              if (input && typeof cursorPosition === 'number') {
                target.value = value;
                input.value = value;
                input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
              }
            }, 0);
            setTimeout(() => {
              if (input && typeof cursorPosition === 'number') {
                target.value = value;
                input.value = value;
                input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
              }
            }, 10);
          }}
          style="width: 100%; --mdc-theme-primary: var(--primary-color);"
        ></ha-textfield>
      </div>

      <div class="field-group" style="margin-bottom: 12px;">
        ${this.renderFieldSection(
          localize('editor.dropdown.option.icon', lang, 'Icon'),
          localize(
            'editor.dropdown.option.icon_desc',
            lang,
            'Optional icon for this option (e.g., mdi:lightbulb)'
          ),
          hass,
          { icon: option.icon || '' },
          [this.iconField('icon')],
          (e: CustomEvent) => updateOption(option.id, e.detail.value)
        )}
      </div>

      ${option.icon
        ? html`
            <div class="field-group" style="margin-bottom: 12px;">
              <div
                style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;"
              >
                <div>
                  <div
                    style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
                  >
                    ${localize('editor.dropdown.option.use_state_color', lang, 'Use State Color')}
                  </div>
                  <div
                    style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
                  >
                    ${localize(
                      'editor.dropdown.option.use_state_color_desc',
                      lang,
                      'Use the entity state color for the icon (overrides custom color)'
                    )}
                  </div>
                </div>
                <ha-switch
                  .checked=${option.use_state_color || false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateOption(option.id, { use_state_color: target.checked });
                  }}
                ></ha-switch>
              </div>

              ${!option.use_state_color
                ? html`
                    <div class="field-group">
                      <ultra-color-picker
                        .label=${localize('editor.dropdown.option.icon_color', lang, 'Icon Color')}
                        .value=${option.icon_color || 'var(--primary-color)'}
                        .defaultValue=${'var(--primary-color)'}
                        .hass=${hass}
                        @value-changed=${(e: CustomEvent) =>
                          updateOption(option.id, { icon_color: e.detail.value })}
                      ></ultra-color-picker>
                    </div>
                  `
                : html`
                    <div
                      style="text-align: center; padding: 16px; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 4px;"
                    >
                      ${localize(
                        'editor.dropdown.option.state_color_enabled',
                        lang,
                        'Icon will use entity state color automatically'
                      )}
                    </div>
                  `}
            </div>
          `
        : ''}

      <!-- Action Configuration -->
      <div class="field-group" style="margin-bottom: 12px;">
        <div
          style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--primary-text-color);"
        >
          ${localize('editor.dropdown.option.action', lang, 'Action')}
        </div>
        <div style="color: var(--secondary-text-color); font-size: 13px; margin-bottom: 12px;">
          ${localize(
            'editor.dropdown.option.action_desc',
            lang,
            'What happens when this option is selected'
          )}
        </div>
        ${this.renderUcForm(
          hass,
          { action_config: option.action },
          [
            {
              name: 'action_config',
              label: '',
              selector: {
                ui_action: {
                  actions: ['more-info', 'toggle', 'navigate', 'url', 'perform-action', 'assist'],
                },
              },
            },
          ],
          (e: CustomEvent) => {
            const newAction = e.detail.value?.action_config;
            if (!newAction) return;
            const prevStr = JSON.stringify(option.action || {});
            const nextStr = JSON.stringify(newAction || {});
            if (prevStr === nextStr) return;
            updateOption(option.id, { action: newAction });
            // Trigger re-render to update dropdown UI
            setTimeout(() => {
              this.triggerPreviewUpdate();
            }, 50);
          },
          false
        )}
      </div>

      ${option.action.action === 'more-info'
        ? html`
            <div class="field-group" style="margin-bottom: 12px;">
              ${this.renderConditionalFieldsGroup(
                localize(
                  'editor.dropdown.option.more_info_config',
                  lang,
                  'More Info Configuration'
                ),
                html`
                  <div class="field-group">
                    ${this.renderFieldSection(
                      localize('editor.dropdown.option.more_info_entity', lang, 'Entity'),
                      localize(
                        'editor.dropdown.option.more_info_entity_desc',
                        lang,
                        'Entity to show more information for'
                      ),
                      hass,
                      { entity: option.action.entity || '' },
                      [this.entityField('entity')],
                      (e: CustomEvent) => {
                        const next = e.detail.value.entity;
                        const prev = option.action.entity || '';
                        if (next === prev) return;
                        updateOption(option.id, {
                          action: { ...option.action, entity: e.detail.value.entity },
                        });
                      }
                    )}
                  </div>
                `
              )}
            </div>
          `
        : ''}
      ${option.action.action === 'toggle'
        ? html`
            <div class="field-group" style="margin-bottom: 12px;">
              ${this.renderConditionalFieldsGroup(
                localize('editor.dropdown.option.toggle_config', lang, 'Toggle Configuration'),
                html`
                  <div class="field-group">
                    ${this.renderFieldSection(
                      localize('editor.dropdown.option.toggle_entity', lang, 'Entity'),
                      localize(
                        'editor.dropdown.option.toggle_entity_desc',
                        lang,
                        'Entity to toggle on/off'
                      ),
                      hass,
                      { entity: option.action.entity || '' },
                      [this.entityField('entity')],
                      (e: CustomEvent) => {
                        const next = e.detail.value.entity;
                        const prev = option.action.entity || '';
                        if (next === prev) return;
                        updateOption(option.id, {
                          action: { ...option.action, entity: e.detail.value.entity },
                        });
                      }
                    )}
                  </div>
                `
              )}
            </div>
          `
        : ''}
    `;
  }

  // No Actions tab for dropdown module - actions are configured per option
  renderActionsTab(): TemplateResult {
    return html`
      <div style="text-align: center; padding: 40px; color: var(--secondary-text-color);">
        <ha-icon
          icon="mdi:information-outline"
          style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"
        ></ha-icon>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          Actions Configured Per Option
        </div>
        <div style="font-size: 14px; line-height: 1.4;">
          Actions for this dropdown are configured individually for each option in the General tab.
          Each dropdown option can have its own action (More Info, Toggle, Navigate, etc.).
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
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const dropdownModule = module as DropdownModule;

    // Store module context for event handling in portaled dropdowns
    this.moduleContexts.set(dropdownModule.id, { module: dropdownModule, hass, config });

    // Apply design properties with priority - global design properties are stored directly on the module
    const moduleWithDesign = dropdownModule as any;

    // Resolve styles - use design properties directly from module or defaults
    const textColor = moduleWithDesign.color || 'var(--primary-text-color)';
    const fontSize = moduleWithDesign.font_size || 14;
    const backgroundColor =
      moduleWithDesign.background_color || 'var(--secondary-background-color)';
    const borderColor = moduleWithDesign.border_color || 'var(--divider-color)';
    const borderRadius = moduleWithDesign.border_radius || 4;

    // Container styles for positioning and effects
    const containerStyles = {
      width: '100%',
      height: 'auto',
      // Only apply padding if explicitly set by user
      padding:
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${moduleWithDesign.padding_top || '0px'} ${moduleWithDesign.padding_right || '0px'} ${moduleWithDesign.padding_bottom || '0px'} ${moduleWithDesign.padding_left || '0px'}`
          : '0',
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${moduleWithDesign.margin_top || '8px'} ${moduleWithDesign.margin_right || '0'} ${moduleWithDesign.margin_bottom || '8px'} ${moduleWithDesign.margin_left || '0'}`
          : '8px 0',
      background: moduleWithDesign.background_color || 'transparent',
      'border-radius': moduleWithDesign.border_radius || '4px',
      border:
        moduleWithDesign.border_style && moduleWithDesign.border_style !== 'none'
          ? `${moduleWithDesign.border_width || '1px'} ${moduleWithDesign.border_style} ${moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      'box-shadow':
        moduleWithDesign.box_shadow_h ||
        moduleWithDesign.box_shadow_v ||
        moduleWithDesign.box_shadow_blur ||
        moduleWithDesign.box_shadow_spread
          ? `${moduleWithDesign.box_shadow_h || '0px'} ${moduleWithDesign.box_shadow_v || '0px'} ${moduleWithDesign.box_shadow_blur || '0px'} ${moduleWithDesign.box_shadow_spread || '0px'} ${moduleWithDesign.box_shadow_color || 'rgba(0,0,0,.2)'}`
          : 'none',
      'box-sizing': 'border-box',
    } as Record<string, string>;

    // Apply design properties to dropdown - read directly from module
    const dropdownWidth = moduleWithDesign.width || '100%';
    const dropdownHeight = moduleWithDesign.height || 'auto';
    const dropdownMaxWidth = moduleWithDesign.max_width || 'none';
    const dropdownMaxHeight = moduleWithDesign.max_height || 'none';
    const dropdownMinWidth = moduleWithDesign.min_width || 'auto';
    const dropdownMinHeight = moduleWithDesign.min_height || 'auto';
    const fontFamily = moduleWithDesign.font_family || 'inherit';
    const fontWeight = moduleWithDesign.font_weight || 'normal';
    const textAlign = moduleWithDesign.text_align || 'left';

    const controlIcon = dropdownModule.control_icon || 'mdi:chevron-down';
    const controlAlignment = dropdownModule.control_alignment || 'apart';
    const controlIconSide = dropdownModule.control_icon_side || 'right';
    const controlJustifyContent = controlAlignment === 'center' ? 'center' : 'space-between';
    const controlGap = controlAlignment === 'center' ? '12px' : '0';
    const selectionOrder = controlIconSide === 'left' ? 2 : 1;
    const chevronOrder = controlIconSide === 'left' ? 1 : 2;
    const selectionFlex = controlAlignment === 'apart' ? '1 1 auto' : '0 1 auto';
    const selectionWidth = controlAlignment === 'apart' ? '100%' : 'auto';
    const isIconLeftApart = controlAlignment === 'apart' && controlIconSide === 'left';
    const selectionJustify =
      controlAlignment === 'center' ? 'center' : isIconLeftApart ? 'flex-end' : 'flex-start';
    const selectionTextAlign =
      controlAlignment === 'center' ? 'center' : isIconLeftApart ? 'right' : 'left';

    // Calculate dropdown options max-height based on visible_items (each item ~44px: 12px padding top + bottom + ~20px content)
    const visibleItems = dropdownModule.visible_items ?? 5;
    const itemHeight = 44; // Approximate height per option item in pixels
    const optionsMaxHeight = visibleItems * itemHeight;

    const dropdownStyles = `
      width: ${this.addPixelUnit(dropdownWidth)};
      max-width: ${this.addPixelUnit(dropdownMaxWidth)};
      min-width: ${this.addPixelUnit(dropdownMinWidth)};
      height: ${this.addPixelUnit(dropdownHeight)};
      max-height: ${this.addPixelUnit(dropdownMaxHeight)};
      min-height: ${this.addPixelUnit(dropdownMinHeight)};
      font-size: ${this.addPixelUnit(fontSize.toString())};
      font-family: ${fontFamily};
      font-weight: ${fontWeight};
      text-align: ${textAlign};
      color: ${textColor};
      background: ${backgroundColor};
      border: 1px solid ${borderColor};
      border-radius: ${this.addPixelUnit(borderRadius.toString())};
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: ${controlJustifyContent};
      gap: ${controlGap};
      cursor: pointer;
      transition: all 0.2s ease;
      box-sizing: border-box;
    `;

    // GRACEFUL RENDERING: Check for incomplete configuration
    const isEntityMode = dropdownModule.source_mode === 'entity';

    if (
      isEntityMode &&
      (!dropdownModule.source_entity || dropdownModule.source_entity.trim() === '')
    ) {
      return this.renderGradientErrorState(
        'Configure Source Entity',
        'Select a source entity in the General tab',
        'mdi:format-list-bulleted'
      );
    }

    if (!isEntityMode && (!dropdownModule.options || dropdownModule.options.length === 0)) {
      // Check if unified template is enabled
      if (!dropdownModule.unified_template_mode || !dropdownModule.unified_template) {
        return this.renderGradientErrorState(
          'Add Options',
          'Configure dropdown options in the General tab or enable Unified Template',
          'mdi:format-list-bulleted'
        );
      }
    }

    // Determine if we're in entity source mode
    const isEntityModeValid =
      dropdownModule.source_mode === 'entity' && dropdownModule.source_entity;

    // Check if unified template is enabled
    const isUnifiedTemplateMode = dropdownModule.unified_template_mode && dropdownModule.unified_template;

    // Get options based on mode
    let availableOptions: Array<{
      label: string;
      icon?: string;
      icon_color?: string;
      use_state_color?: boolean;
      mode?: string; // Store mode/value for action mapping
      value?: string; // Preserve raw entity option for syncing across modules
    }> = [];
    let currentSelectedLabel: string | undefined;
    let entityModeDisplay: { label?: string; icon?: string; icon_color?: string } | null = null;
    
    // Display properties from unified template (if display key is present)
    let displayIcon: string | undefined = undefined;
    let displayLabel: string | undefined = undefined;
    let displayIconColor: string | undefined = undefined;

    if (isEntityModeValid) {
      // Entity source mode: get options from entity
      const entityOptions = this.getOptionsFromEntity(dropdownModule, hass);
      const entityState = this.getCurrentStateFromEntity(dropdownModule, hass);
      const entityStateObj = hass.states[dropdownModule.source_entity!];

      availableOptions = entityOptions.map(opt => ({
        label: this.formatOptionLabel(opt, entityStateObj, hass), // Use formatted friendly name for display
        value: opt, // Keep original value for service calls
        // Apply customization if it exists (using original value as key)
        icon: dropdownModule.entity_option_customization?.[opt]?.icon,
        icon_color: dropdownModule.entity_option_customization?.[opt]?.icon_color,
        use_state_color: dropdownModule.entity_option_customization?.[opt]?.use_state_color,
      }));

      // In entity mode, always show current state (no placeholder mode)
      // Format the state for display
      const formattedEntityState = this.formatOptionLabel(entityState, entityStateObj, hass);
      currentSelectedLabel = formattedEntityState;

      // Cache info for header rendering so duplicated dropdowns stay in sync
      if (entityState !== undefined && entityStateObj) {
        const matchedOption = availableOptions.find(opt => opt.value === entityState);
        const resolvedIcon = matchedOption?.icon;
        const resolvedIconColor = matchedOption
          ? this.getOptionIconColor(matchedOption, hass, dropdownModule)
          : undefined;

        entityModeDisplay = {
          label: formattedEntityState || entityState,
          icon: resolvedIcon,
          icon_color: resolvedIconColor,
        };
      }
    } else if (isUnifiedTemplateMode) {
      // Unified template mode: get options and display properties from template
      if (!this._templateService && hass) {
        this._templateService = new TemplateService(hass);
      }

      const templateHash = this._hashString(dropdownModule.unified_template!);
      const templateKey = `unified_dropdown_${dropdownModule.id}_${templateHash}`;

      if (!hass.__uvc_template_strings) {
        hass.__uvc_template_strings = {};
      }

      if (
        this._templateService &&
        !this._templateService.hasTemplateSubscription(templateKey)
      ) {
        // Subscribe to template for updates
        this._templateService.subscribeToTemplate(
          dropdownModule.unified_template!,
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
          undefined, // No context variables
          config // Pass config for card-specific variable resolution
        );
        
        // Try initial evaluation via API for immediate result
        if (hass.callApi) {
          hass.callApi<string>('POST', 'template', {
            template: dropdownModule.unified_template!,
          }).then((result) => {
            if (!hass.__uvc_template_strings) {
              hass.__uvc_template_strings = {};
            }
            hass.__uvc_template_strings[templateKey] = result;
            // Trigger update
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
            }
          }).catch((error) => {
            console.error('Error evaluating template initially:', error);
          });
        }
      }

      const unifiedTemplateResult = hass?.__uvc_template_strings?.[templateKey];
      if (unifiedTemplateResult) {
        try {
          const resultStr = String(unifiedTemplateResult).trim();
          let parsedData: any = null;

          // Try to parse as JSON
          if (resultStr.startsWith('{') && resultStr.endsWith('}')) {
            // Object format: { "options": [...], "display": {...} }
            parsedData = JSON.parse(resultStr);
          } else if (resultStr.startsWith('[') && resultStr.endsWith(']')) {
            // Array format: just options array
            parsedData = { options: JSON.parse(resultStr) };
          } else {
            // Simple string array (comma/newline separated)
            const simpleOptions = resultStr.split(/[,\n]/).map(s => s.trim()).filter(s => s);
            parsedData = { options: simpleOptions.map(label => ({ label })) };
          }

          if (parsedData && parsedData.options && Array.isArray(parsedData.options)) {
            availableOptions = parsedData.options.map((opt: any, index: number) => ({
              label: String(opt.label || opt.name || `Option ${index + 1}`),
              icon: opt.icon ? String(opt.icon) : undefined,
              icon_color: opt.icon_color ? String(opt.icon_color) : undefined,
              use_state_color: opt.use_state_color || false,
              // Store original mode/value for action mapping
              mode: opt.mode || opt.value || opt.label,
            }));
          }
          
          // Extract display properties if display key exists (moved to after parsing)
          if (parsedData && parsedData.display) {
            displayLabel = parsedData.display.label || parsedData.display.name || '';
            displayIcon = parsedData.display.icon;
            displayIconColor = parsedData.display.icon_color;
          }
        } catch (error) {
          console.error('Error parsing unified template:', error);
          console.error('Template result:', unifiedTemplateResult);
          // Fallback to manual options
          availableOptions = dropdownModule.options?.map(opt => ({
            label: opt.label,
            icon: opt.icon,
            icon_color: opt.icon_color,
            use_state_color: opt.use_state_color,
          })) || [];
        }
      } else {
        // Template not evaluated yet - try to evaluate synchronously as fallback
        // This handles the case where template hasn't been subscribed yet
        console.log('Template not evaluated yet, using manual options as fallback');
        availableOptions = dropdownModule.options?.map(opt => ({
          label: opt.label,
          icon: opt.icon,
          icon_color: opt.icon_color,
          use_state_color: opt.use_state_color,
        })) || [];
      }

      // Handle selection based on tracking mode
      if (dropdownModule.track_state) {
        const moduleId = dropdownModule.id;
        const storedSelection =
          this.currentSelection.get(moduleId) || dropdownModule.current_selection;
        currentSelectedLabel = storedSelection;
      }
    } else {
      // Manual mode: use configured options
      availableOptions = dropdownModule.options.map(opt => ({
        label: opt.label,
        icon: opt.icon,
        icon_color: opt.icon_color,
        use_state_color: opt.use_state_color,
      }));

      // Handle selection based on tracking mode
      if (dropdownModule.track_state) {
        const moduleId = dropdownModule.id;
        const storedSelection =
          this.currentSelection.get(moduleId) || dropdownModule.current_selection;
        currentSelectedLabel = storedSelection;
      }
    }

    // Find current selected option or default to first
    let currentSelectedOption = availableOptions.find(opt => opt.label === currentSelectedLabel);
    if (
      !currentSelectedOption &&
      availableOptions.length > 0 &&
      (isEntityModeValid || dropdownModule.track_state)
    ) {
      currentSelectedOption = availableOptions[0];
      if (!isEntityModeValid) {
        // Store the first option as current selection for manual mode
        const moduleId = dropdownModule.id;
        this.currentSelection.set(moduleId, currentSelectedOption.label);
      }
    }

    const showPlaceholder = !isEntityModeValid && !dropdownModule.track_state;
    const placeholderText = dropdownModule.placeholder || 'Choose an option...';
    const shouldPrioritizeEntityDisplay =
      isEntityModeValid &&
      (!dropdownModule.closed_title_mode ||
        dropdownModule.closed_title_mode === 'last_chosen' ||
        dropdownModule.closed_title_mode === 'entity_state');

    // Get hover effect configuration from module design
    const hoverEffect = (dropdownModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Determine closed dropdown title based on closed_title_mode
    // Priority: Template display key > closed_title_mode settings
    let closedTitleLabel: string | undefined = undefined;
    let closedTitleIcon: string | undefined = undefined;
    let closedTitleIconColor: string | undefined = undefined;

    // Only evaluate closed_title_mode if template display is not present
    if (displayLabel === undefined || displayLabel === '') {
      const titleMode = dropdownModule.closed_title_mode || 'last_chosen';
      
      switch (titleMode) {
        case 'last_chosen':
          // Try localStorage first, then in-memory, then config, then first option
          const storedSelection = this.getStoredSelection(dropdownModule.id);
          const memorySelection = this.currentSelection.get(dropdownModule.id);
          const configSelection = dropdownModule.current_selection;
          
          // Load from localStorage if available and not already in memory
          if (storedSelection && !memorySelection) {
            this.currentSelection.set(dropdownModule.id, storedSelection);
          }
          
          const lastChosenLabel = storedSelection || memorySelection || configSelection;
          
          if (lastChosenLabel) {
            // Try to find by label first (for formatted labels), then by value
            let lastChosenOption = availableOptions.find(opt => opt.label === lastChosenLabel);
            if (!lastChosenOption && isEntityModeValid) {
              // If not found by label, try finding by original value (for entity mode)
              lastChosenOption = availableOptions.find(opt => (opt as any).value === lastChosenLabel);
            }
            if (lastChosenOption) {
              closedTitleLabel = lastChosenOption.label;
              closedTitleIcon = lastChosenOption.icon;
              closedTitleIconColor = lastChosenOption.icon_color;
            }
          }
          
          // Fallback to first option if nothing found
          if (!closedTitleLabel && availableOptions.length > 0) {
            closedTitleLabel = availableOptions[0].label;
            closedTitleIcon = availableOptions[0].icon;
            closedTitleIconColor = availableOptions[0].icon_color;
          }
          break;

        case 'entity_state':
          if (dropdownModule.closed_title_entity && hass) {
            const entityState = hass.states[dropdownModule.closed_title_entity];
            if (entityState) {
              // Use friendly name if available, otherwise formatted state
              const friendlyName = entityState.attributes?.friendly_name;
              const state = entityState.state;
              
              // Format state nicely (capitalize, replace underscores)
              const formattedState = state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              closedTitleLabel = friendlyName ? `${friendlyName}: ${formattedState}` : formattedState;
            } else {
              closedTitleLabel = 'Entity not found';
            }
          } else {
            closedTitleLabel = 'No entity selected';
          }
          break;

        case 'custom':
          closedTitleLabel = dropdownModule.closed_title_custom || 'Please select...';
          break;

        case 'first_option':
          if (availableOptions.length > 0) {
            closedTitleLabel = availableOptions[0].label;
            closedTitleIcon = availableOptions[0].icon;
            closedTitleIconColor = availableOptions[0].icon_color;
          } else {
            closedTitleLabel = 'No options';
          }
          break;
      }
    }

    return html`
      <div
        class="dropdown-module-container ${hoverEffectClass}"
        data-module-id="${dropdownModule.id}"
        data-preview-context="${previewContext || 'dashboard'}"
        style=${this.styleObjectToCss(containerStyles)}
      >
        <div
          class="dropdown-module-preview"
          style="display: flex; flex-direction: column; align-items: flex-start; position: relative; z-index: 1;"
        >
          <div style="position: relative; width: 100%; z-index: 1;">
            <div class="custom-dropdown" style="position: relative;">
              <div
                class="dropdown-selected"
                style="${dropdownStyles}"
                @click=${(e: Event) => {
                  // Don't toggle if clicking on the chevron container (it has its own handler)
                  const target = e.target as HTMLElement;
                  const composedPath = e.composedPath();
                  const isChevronClick = composedPath.some(
                    (el: any) => el?.classList?.contains?.('dropdown-chevron-container') || el?.classList?.contains?.('dropdown-chevron')
                  ) || target.classList.contains('dropdown-chevron-container') || target.closest('.dropdown-chevron-container');
                  
                  if (isChevronClick) {
                    return;
                  }
                  
                  const moduleId = dropdownModule.id;
                  
                  // Get current state and calculate new state
                  const currentState = this.dropdownOpenStates.get(moduleId) || false;
                  const newState = !currentState;
                  
                  // Update chevron rotation INSTANTLY
                  const selectedElement = e.currentTarget as HTMLElement;
                  const chevron = selectedElement.querySelector('.dropdown-chevron') as HTMLElement;
                  if (chevron) {
                    // Update immediately with no transition delay
                    chevron.style.transition = 'none';
                    chevron.style.transform = newState ? 'rotate(180deg)' : 'rotate(0deg)';
                    // Re-enable transition after the instant update
                    requestAnimationFrame(() => {
                      chevron.style.transition = 'transform 0.2s ease';
                    });
                  }
                  
                  console.log('Dropdown clicked');
                  this.toggleDropdown(e, moduleId, previewContext);
                }}
              >
                <div
                  class="dropdown-selection"
                  style="display: flex; align-items: center; gap: 8px; order: ${selectionOrder}; flex: ${selectionFlex}; min-width: 0; width: ${selectionWidth}; justify-content: ${selectionJustify}; text-align: ${selectionTextAlign};"
                >
                  ${(() => {
                    // Priority 1: Template display key (highest priority)
                    if (displayLabel !== undefined && displayLabel !== '') {
                      const iconToUse = displayIcon;
                      const labelToUse = displayLabel;
                      const iconColorToUse = displayIconColor || 'var(--primary-color)';
                      return html`
                        ${iconToUse
                          ? html`<ha-icon
                              icon="${iconToUse}"
                              style="color: ${iconColorToUse};"
                            ></ha-icon>`
                          : ''}
                        <span>${labelToUse}</span>
                      `;
                    }
                    
                    // Priority 2: Entity source dropdowns show current entity state so duplicates stay in sync
                    if (shouldPrioritizeEntityDisplay && entityModeDisplay?.label) {
                      return html`
                        ${entityModeDisplay.icon
                          ? html`<ha-icon
                              icon="${entityModeDisplay.icon}"
                              style="color: ${entityModeDisplay.icon_color || 'var(--primary-color)'};"
                            ></ha-icon>`
                          : ''}
                        <span>${entityModeDisplay.label}</span>
                      `;
                    }

                    // Priority 3: closed_title_mode settings
                    if (closedTitleLabel !== undefined) {
                      const iconToUse = closedTitleIcon;
                      const labelToUse = closedTitleLabel;
                      const iconColorToUse = closedTitleIconColor || 'var(--primary-color)';
                      return html`
                        ${iconToUse
                          ? html`<ha-icon
                              icon="${iconToUse}"
                              style="color: ${iconColorToUse};"
                            ></ha-icon>`
                          : ''}
                        <span>${labelToUse}</span>
                      `;
                    }
                    
                    // Priority 4: Placeholder (when track_state is disabled)
                    if (showPlaceholder) {
                      return html`<span style="color: var(--secondary-text-color);"
                          >${placeholderText}</span
                        >`;
                    }
                    
                    // Fallback: Show first option or "No options"
                    if (availableOptions.length > 0) {
                      const fallbackOption = availableOptions[0];
                      return html`
                        ${fallbackOption.icon
                          ? html`<ha-icon
                              icon="${fallbackOption.icon}"
                              style="color: ${this.getOptionIconColor(fallbackOption, hass, dropdownModule)};"
                            ></ha-icon>`
                          : ''}
                        <span>${fallbackOption.label}</span>
                      `;
                    }
                    
                    return html`<span style="color: var(--secondary-text-color);">No options</span>`;
                  })()}
                </div>
                <div
                  class="dropdown-chevron-container"
                  style="display: flex; align-items: center; cursor: pointer; padding: 4px; margin: -4px; order: ${chevronOrder}; flex-shrink: 0;"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    
                    const moduleId = dropdownModule.id;
                    
                    // Prevent double-handling
                    if (this.chevronClickHandling.has(moduleId)) {
                      console.log('Chevron click already being handled for', moduleId);
                      return;
                    }
                    
                    this.chevronClickHandling.add(moduleId);
                    
                    // Get current state and calculate new state
                    const currentState = this.dropdownOpenStates.get(moduleId) || false;
                    const newState = !currentState;
                    
                    // Update chevron rotation INSTANTLY using direct DOM access from event
                    const chevronContainer = e.currentTarget as HTMLElement;
                    const chevron = chevronContainer.querySelector('.dropdown-chevron') as HTMLElement;
                    if (chevron) {
                      // Update immediately with no transition delay
                      chevron.style.transition = 'none';
                      chevron.style.transform = newState ? 'rotate(180deg)' : 'rotate(0deg)';
                      // Re-enable transition after the instant update
                      requestAnimationFrame(() => {
                        chevron.style.transition = 'transform 0.2s ease';
                      });
                    }
                    
                    // Now toggle the dropdown
                    // Get previewContext from the module container if available
                    const currentTarget = e.currentTarget as HTMLElement;
                    const moduleContainer = currentTarget.closest('.dropdown-module-container') as HTMLElement;
                    const previewCtx = moduleContainer?.dataset?.previewContext as 'live' | 'ha-preview' | 'dashboard' | undefined;
                    this.toggleDropdown(e, moduleId, previewCtx || previewContext);
                    
                    // Clear the flag after a short delay
                    setTimeout(() => {
                      this.chevronClickHandling.delete(moduleId);
                    }, 100);
                  }}
                >
                  <ha-icon
                    class="dropdown-chevron"
                    icon="${controlIcon}"
                    style="color: var(--secondary-text-color); transition: transform 0.2s ease; transform: ${this.dropdownOpenStates.get(dropdownModule.id) ? 'rotate(180deg)' : 'rotate(0deg)'}; pointer-events: none;"
                  ></ha-icon>
                </div>
              </div>

              <div
                class="dropdown-options"
                style="position: ${previewContext === 'live' || previewContext === 'ha-preview' ? 'fixed' : 'fixed'} !important; top: auto; left: auto; right: auto; background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: ${previewContext === 'live' || previewContext === 'ha-preview' ? '999999' : '10001'} !important; display: none; pointer-events: none; visibility: hidden; max-height: ${optionsMaxHeight}px; overflow-y: auto; overflow-x: hidden; color: ${textColor}; font-size: ${this.addPixelUnit(
                  fontSize.toString()
                )}; font-family: ${fontFamily}; font-weight: ${fontWeight};"
                @scroll=${(e: Event) => {
                  // Prevent scroll events from bubbling and closing dropdown
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
                @wheel=${(e: Event) => {
                  // Prevent wheel events from bubbling
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
                @touchmove=${(e: Event) => {
                  // Prevent touch scroll events from bubbling
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
              >
                ${showPlaceholder
                  ? html`
                      <div
                        class="dropdown-option"
                        style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color); color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit;"
                        @click=${(e: Event) => {
                          this.selectOption('', dropdownModule);
                          this.closeDropdown(e, dropdownModule.id);
                        }}
                      >
                        <span
                          style="color: var(--secondary-text-color); font-size: inherit; font-family: inherit; font-weight: inherit;"
                          >${placeholderText}</span
                        >
                      </div>
                    `
                  : ''}
                ${availableOptions.map(
                  option => html`
                    <div
                      class="dropdown-option"
                      style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color); display: flex; align-items: center; gap: 8px; transition: background-color 0.2s ease; color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit;"
                      @click=${(e: Event) => {
                        // Update selection and execute action
                        if (isEntityMode) {
                          // Entity mode: call service to update entity
                          // Use original value if available, otherwise use label
                          const optionValue = (option as any).value || option.label;
                          this.updateEntitySelection(dropdownModule, optionValue, hass);
                          // Also persist for last_chosen mode if enabled (use formatted label for display)
                          this.selectOption(option.label, dropdownModule);
                        } else {
                          // Manual mode: track state and execute action
                          if (dropdownModule.track_state) {
                            const moduleId = dropdownModule.id;
                            this.currentSelection.set(moduleId, option.label);
                            // Persist to localStorage
                            this.selectOption(option.label, dropdownModule);

                            // Update the displayed selection immediately
                            const clickedElement = e.target as HTMLElement;
                            const previewContainer = clickedElement.closest(
                              '.dropdown-module-container'
                            );
                            if (previewContainer) {
                              // Update the displayed selection text
                              const selectedSpan = previewContainer.querySelector(
                                '.dropdown-selected span:last-child'
                              );
                              if (selectedSpan) {
                                selectedSpan.textContent = option.label;
                              }

                              // Update the icon if the option has one
                              const selectedIconContainer = previewContainer.querySelector(
                                '.dropdown-selected > div'
                              );
                              if (selectedIconContainer) {
                                const existingIcon = selectedIconContainer.querySelector('ha-icon');
                                if (option.icon) {
                                  if (existingIcon) {
                                    // Update existing icon
                                    existingIcon.setAttribute('icon', option.icon);
                                    (existingIcon as HTMLElement).style.color =
                                      this.getOptionIconColor(option, hass, dropdownModule);
                                  } else {
                                    // Add new icon
                                    const iconElement = document.createElement('ha-icon');
                                    iconElement.setAttribute('icon', option.icon);
                                    iconElement.style.color = this.getOptionIconColor(
                                      option,
                                      hass,
                                      dropdownModule
                                    );
                                    iconElement.style.marginRight = '8px';
                                    selectedIconContainer.insertBefore(
                                      iconElement,
                                      selectedIconContainer.firstChild
                                    );
                                  }
                                } else if (existingIcon) {
                                  // Remove icon if option doesn't have one
                                  existingIcon.remove();
                                }
                              }
                            }
                          }

                          // Execute the option's action
                          const manualOption = dropdownModule.options.find(
                            o => o.label === option.label
                          );
                          if (manualOption) {
                            this.selectOption(option.label, dropdownModule);
                            this.executeOptionAction(
                              manualOption,
                              hass,
                              (e.currentTarget as HTMLElement) || undefined,
                              config,
                              dropdownModule
                            );
                          } else if (isUnifiedTemplateMode && option.mode) {
                            // Template-generated option - try to execute climate service call if source_entity is set
                            // This allows template options to work with climate entities
                            const sourceEntity = dropdownModule.source_entity;
                            if (sourceEntity && sourceEntity.startsWith('climate.')) {
                              this.selectOption(option.label, dropdownModule);
                              hass.callService('climate', 'set_hvac_mode', {
                                entity_id: sourceEntity,
                                hvac_mode: option.mode,
                              }).catch((error) => {
                                console.error('Failed to set HVAC mode:', error);
                              });
                            } else {
                              // No action configured for template option
                              this.selectOption(option.label, dropdownModule);
                            }
                          } else {
                            // No action found, just track selection
                            this.selectOption(option.label, dropdownModule);
                          }
                        }

                        this.closeDropdown(e, dropdownModule.id);
                      }}
                      @mouseenter=${(e: Event) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
                      }}
                      @mouseleave=${(e: Event) => {
                        const target = e.target as HTMLElement;
                        target.style.backgroundColor = 'transparent';
                      }}
                    >
                      ${option.icon
                        ? html`<ha-icon
                            icon="${option.icon}"
                            style="color: ${this.getOptionIconColor(option, hass, dropdownModule)};"
                          ></ha-icon>`
                        : ''}
                      <span>${option.label}</span>
                    </div>
                  `
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper to get icon color for options (handles both manual and entity mode)
  private getOptionIconColor(
    option: { label: string; icon?: string; icon_color?: string; use_state_color?: boolean },
    hass: HomeAssistant,
    module: DropdownModule
  ): string {
    // If use state color is enabled and we have a source entity, get the state color
    if (option.use_state_color && module.source_entity && hass) {
      const entityState = hass.states[module.source_entity];
      if (entityState) {
        // Try to get color from entity attributes
        const entityColor = (entityState.attributes as any)?.rgb_color;
        if (entityColor && Array.isArray(entityColor) && entityColor.length === 3) {
          return `rgb(${entityColor[0]}, ${entityColor[1]}, ${entityColor[2]})`;
        }

        // Fallback to state-based colors for common entity types
        const domain = module.source_entity.split('.')[0];
        const state = entityState.state;

        switch (domain) {
          case 'light':
            return state === 'on' ? '#FFA500' : '#666666'; // Orange when on, gray when off
          case 'switch':
            return state === 'on' ? '#4CAF50' : '#666666'; // Green when on, gray when off
          case 'binary_sensor':
            return state === 'on' ? '#F44336' : '#4CAF50'; // Red when on, green when off
          case 'sensor':
            return '#2196F3'; // Blue for sensors
          default:
            return state === 'on' || state === 'open' || state === 'active'
              ? 'var(--primary-color)'
              : '#666666';
        }
      }
    }

    // Use custom color or default
    return option.icon_color || 'var(--primary-color)';
  }

  // Update entity selection via service call
  private async updateEntitySelection(
    module: DropdownModule,
    selectedValue: string,
    hass: HomeAssistant
  ): Promise<void> {
    if (!module.source_entity || !hass) return;

    const domain = module.source_entity.split('.')[0];
    const service =
      domain === 'input_select' ? 'input_select.select_option' : 'select.select_option';

    try {
      await hass.callService(domain, 'select_option', {
        entity_id: module.source_entity,
        option: selectedValue,
      });
    } catch (error) {
      console.error('Failed to update entity selection:', error);
    }
  }

  private getIconColor(option: DropdownOption, hass: HomeAssistant): string {
    // If use state color is enabled and we have an entity, get the state color
    if (option.use_state_color && option.action.entity && hass) {
      const entityState = hass.states[option.action.entity];
      if (entityState) {
        // Try to get color from entity attributes
        const entityColor = (entityState.attributes as any)?.rgb_color;
        if (entityColor && Array.isArray(entityColor) && entityColor.length === 3) {
          return `rgb(${entityColor[0]}, ${entityColor[1]}, ${entityColor[2]})`;
        }

        // Fallback to state-based colors for common entity types
        const domain = option.action.entity.split('.')[0];
        const state = entityState.state;

        switch (domain) {
          case 'light':
            return state === 'on' ? '#FFA500' : '#666666'; // Orange when on, gray when off
          case 'switch':
            return state === 'on' ? '#4CAF50' : '#666666'; // Green when on, gray when off
          case 'binary_sensor':
            return state === 'on' ? '#F44336' : '#4CAF50'; // Red when on, green when off
          case 'sensor':
            return '#2196F3'; // Blue for sensors
          default:
            return state === 'on' || state === 'open' || state === 'active'
              ? 'var(--primary-color)'
              : '#666666';
        }
      }
    }

    // Use custom color or default
    return option.icon_color || 'var(--primary-color)';
  }

  private toggleDropdown(event?: Event, moduleId?: string, previewContext?: 'live' | 'ha-preview' | 'dashboard'): void {
    // Find the dropdown options and selected element relative to the clicked element
    let dropdownElement: HTMLElement | null = null;
    let selectedElement: HTMLElement | null = null;
    let instanceId = moduleId || 'default';

    // Check if we're in preview context - if so, use simpler positioning without portaling
    const isPreviewContext = previewContext === 'live' || previewContext === 'ha-preview';

    if (event) {
      const target = event.target as HTMLElement;

      // The target might be the selected element itself or a child
      selectedElement = target.classList.contains('dropdown-selected')
        ? target
        : (target.closest('.dropdown-selected') as HTMLElement);

      const container = target.closest('.custom-dropdown');

      // Try to get module ID from the container's data attribute
      const moduleContainer = target.closest('.dropdown-module-container') as HTMLElement;
      if (moduleContainer?.dataset?.moduleId) {
        instanceId = moduleContainer.dataset.moduleId;
      }

      dropdownElement = container?.querySelector('.dropdown-options') as HTMLElement;
    } else {
      dropdownElement = document.querySelector('.dropdown-options') as HTMLElement;
      selectedElement = document.querySelector('.dropdown-selected') as HTMLElement;
    }

    // Toggle state for this specific instance
    const currentState = this.dropdownOpenStates.get(instanceId) || false;
    const newState = !currentState;
    
    if (newState) {
      // Close all other open dropdowns before opening this one
      // This ensures only one dropdown is open at a time
      this.dropdownOpenStates.forEach((isOpen, otherInstanceId) => {
        if (isOpen && otherInstanceId !== instanceId) {
          this.closeDropdown(undefined, otherInstanceId);
        }
      });
    }
    
    this.dropdownOpenStates.set(instanceId, newState);

    if (dropdownElement) {
      if (newState) {
        // Get position of the selected element
        if (selectedElement) {
          // In preview contexts, use fixed positioning to escape container stacking context
          if (isPreviewContext) {
            const rect = selectedElement.getBoundingClientRect();
            dropdownElement.style.display = 'block';
            dropdownElement.style.pointerEvents = 'auto';
            dropdownElement.style.visibility = 'visible';
            dropdownElement.style.position = 'fixed'; // Use fixed to escape container boundaries
            dropdownElement.style.top = `${rect.bottom}px`;
            dropdownElement.style.left = `${rect.left}px`;
            dropdownElement.style.width = `${rect.width}px`;
            dropdownElement.style.right = 'auto';
            dropdownElement.style.zIndex = '999999'; // Extremely high z-index to appear above live preview container
            
            // Ensure click-outside closes dropdown in preview contexts too
            this.setupClickOutsideHandler(dropdownElement, selectedElement, instanceId);
            
            // Set up scroll handlers for preview contexts too (to close on scroll)
            this.setupScrollAndResizeHandlers(instanceId);
          } else {
            // Dashboard context - use portaled dropdown with scroll handlers
            const rect = selectedElement.getBoundingClientRect();

            // Create or reuse portaled dropdown
            let portaledDropdown = this.portaledDropdowns.get(instanceId);

            if (!portaledDropdown) {
              // Clone the dropdown element for portaling
              portaledDropdown = dropdownElement.cloneNode(true) as HTMLElement;
              portaledDropdown.id = `portaled-dropdown-${instanceId}`;
              portaledDropdown.dataset.instanceId = instanceId;
              document.body.appendChild(portaledDropdown);
              this.portaledDropdowns.set(instanceId, portaledDropdown);
            } else {
              // Update the cloned dropdown's content from the original
              portaledDropdown.innerHTML = dropdownElement.innerHTML;
            }

            // Re-attach event handlers to the cloned dropdown's options
            this.attachPortaledDropdownHandlers(portaledDropdown, instanceId);

            // Smart positioning - drop up if not enough space below
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            // Get module context for visible_items setting
            const moduleContext = this.moduleContexts.get(instanceId);
            const moduleVisibleItems = (moduleContext?.module as DropdownModule)?.visible_items ?? 5;
            const portaledDropdownMaxHeight = moduleVisibleItems * 44; // Match calculated max-height
            
            // Calculate if we should drop up or down
            const shouldDropUp = spaceBelow < portaledDropdownMaxHeight && spaceAbove > spaceBelow;
            
            // Position portaled dropdown using fixed positioning
            portaledDropdown.style.position = 'fixed';
            portaledDropdown.style.left = `${rect.left}px`;
            portaledDropdown.style.width = `${rect.width}px`;
            portaledDropdown.style.right = 'auto';
            
            if (shouldDropUp) {
              // Drop up - position above the trigger
              portaledDropdown.style.bottom = `${viewportHeight - rect.top}px`;
              portaledDropdown.style.top = 'auto';
            } else {
              // Drop down - position below the trigger (default)
              portaledDropdown.style.top = `${rect.bottom}px`;
              portaledDropdown.style.bottom = 'auto';
            }
            
            portaledDropdown.style.display = 'block';
            portaledDropdown.style.pointerEvents = 'auto';
            portaledDropdown.style.visibility = 'visible';
            portaledDropdown.style.zIndex = '10001';
            portaledDropdown.style.maxHeight = `${portaledDropdownMaxHeight}px`;
            
            // Ensure scrollbar is interactive
            portaledDropdown.style.overflowY = 'auto';
            portaledDropdown.style.overflowX = 'hidden';

            // Hide the original dropdown
            dropdownElement.style.display = 'none';
            dropdownElement.style.pointerEvents = 'none';
            dropdownElement.style.visibility = 'hidden';

            // Store trigger element for position updates
            this.portaledDropdownTriggers.set(instanceId, selectedElement);

            // Set up click-outside handler
            this.setupClickOutsideHandler(portaledDropdown, selectedElement, instanceId);

            // Set up scroll and resize handlers to update position
            this.setupScrollAndResizeHandlers(instanceId);
          }
        } else {
          // Fallback if selectedElement not found
          dropdownElement.style.display = 'block';
          dropdownElement.style.pointerEvents = 'auto';
          dropdownElement.style.visibility = 'visible';
        }
      } else {
        // Close dropdown
        if (isPreviewContext) {
          // In preview context, just hide the dropdown element
          dropdownElement.style.display = 'none';
          dropdownElement.style.pointerEvents = 'none';
          dropdownElement.style.visibility = 'hidden';
        } else {
          // In dashboard context, hide portaled dropdown and clean up handlers
          const portaledDropdown = this.portaledDropdowns.get(instanceId);
          if (portaledDropdown) {
            portaledDropdown.style.display = 'none';
            portaledDropdown.style.pointerEvents = 'none';
            portaledDropdown.style.visibility = 'hidden';
          }
          dropdownElement.style.display = 'none';
          dropdownElement.style.pointerEvents = 'none';
          dropdownElement.style.visibility = 'hidden';
          this.removeClickOutsideHandler();
          this.removeScrollAndResizeHandlers(instanceId);
        }
      }
    }
  }

  private closeDropdown(event?: Event, moduleId?: string): void {
    let instanceId = moduleId || 'default';
    let moduleContainer: HTMLElement | null = null;

    if (event) {
      const target = event.target as HTMLElement;

      // Try to get module ID from the container's data attribute
      moduleContainer = target.closest('.dropdown-module-container') as HTMLElement;
      if (moduleContainer?.dataset?.moduleId) {
        instanceId = moduleContainer.dataset.moduleId;
      }
    }

    // Update state for this specific instance
    this.dropdownOpenStates.set(instanceId, false);

    // Update chevron rotation instantly, passing the specific container if available
    this.updateChevronRotationInstant(instanceId, false, moduleContainer || undefined);

    // Hide the portaled dropdown (for dashboard contexts)
    const portaledDropdown = this.portaledDropdowns.get(instanceId);
    if (portaledDropdown) {
      portaledDropdown.style.display = 'none';
      portaledDropdown.style.pointerEvents = 'none';
      portaledDropdown.style.visibility = 'hidden';
    }

    // Also hide regular dropdown element (for preview contexts)
    const regularDropdown = document.querySelector(
      `.dropdown-module-container[data-module-id="${instanceId}"] .dropdown-options`
    ) as HTMLElement;
    if (regularDropdown && regularDropdown.style.display !== 'none') {
      regularDropdown.style.display = 'none';
      regularDropdown.style.pointerEvents = 'none';
      regularDropdown.style.visibility = 'hidden';
    }

    // Clean up trigger reference
    this.portaledDropdownTriggers.delete(instanceId);

    this.removeClickOutsideHandler();
    this.removeScrollAndResizeHandlers(instanceId);
  }

  private setupClickOutsideHandler(
    portaledDropdown: HTMLElement,
    selectedElement: HTMLElement,
    moduleId: string
  ): void {
    // Remove any existing handler first
    this.removeClickOutsideHandler();

    this.clickOutsideHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      const composedPath = e.composedPath();

      // Don't close if clicking inside portaled dropdown, on the selected element, or on the chevron container
      const isChevronClick = composedPath.some(
        (el: any) => el?.classList?.contains?.('dropdown-chevron-container') || el?.classList?.contains?.('dropdown-chevron')
      ) || target.classList.contains('dropdown-chevron-container') || target.closest('.dropdown-chevron-container');

      // Don't close if clicking inside dropdown (including scrollbar area)
      const isInsideDropdown = portaledDropdown.contains(target) || 
                               target === portaledDropdown ||
                               composedPath.some((el: any) => el === portaledDropdown || (el.nodeType === Node.ELEMENT_NODE && portaledDropdown.contains(el)));

      if (
        isInsideDropdown ||
        selectedElement.contains(target) ||
        target === selectedElement ||
        isChevronClick
      ) {
        return;
      }

      // Close the dropdown
      this.dropdownOpenStates.set(moduleId, false);
      
      // Update chevron rotation instantly, using the selectedElement's container to target the specific dropdown
      const moduleContainer = selectedElement.closest('.dropdown-module-container') as HTMLElement;
      this.updateChevronRotationInstant(moduleId, false, moduleContainer || undefined);
      
      portaledDropdown.style.display = 'none';
      portaledDropdown.style.pointerEvents = 'none';
      portaledDropdown.style.visibility = 'hidden';
      this.removeClickOutsideHandler();
      this.removeScrollAndResizeHandlers(moduleId);
    };

    // Add listener with a slight delay to avoid immediate triggering
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler!, true);
    }, 10);
  }

  private removeClickOutsideHandler(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler, true);
      this.clickOutsideHandler = null;
    }
  }

  private setupScrollAndResizeHandlers(instanceId: string): void {
    // Mark this instance as having active scroll handlers
    this.activeScrollHandlers.add(instanceId);

    // Create scroll handler if it doesn't exist (shared across all instances)
    if (!this.scrollHandler) {
      this.scrollHandler = (e: Event) => {
        // Close all open dropdowns when page/container scrolls
        // Check both portaled dropdowns and all open dropdown states
        const allOpenDropdowns = Array.from(this.dropdownOpenStates.entries())
          .filter(([_, isOpen]) => isOpen)
          .map(([id]) => id);
        
        allOpenDropdowns.forEach(id => {
          const portaledDropdown = this.portaledDropdowns.get(id);
          
          // Check if scroll event originated from within this dropdown
          // For window scroll events, the target is usually document or window
          // For element scroll events, check the target
          const target = e.target;
          const isWindowScroll = target === document || target === window || !target || 
                                 (target as any) === document.documentElement || 
                                 (target as any) === document.body;
          
          // If it's a window scroll, close the dropdown (page is scrolling)
          if (isWindowScroll) {
            // Close the dropdown when page scrolls
            this.closeDropdown(undefined, id);
            return;
          }
          
          // If it's an element scroll, check if it's inside the dropdown
          if (target instanceof HTMLElement) {
            const composedPath = e.composedPath();
            
            // Check both portaled dropdown and regular dropdown element
            const dropdownElement = portaledDropdown || 
              document.querySelector(`.dropdown-module-container[data-module-id="${id}"] .dropdown-options`) as HTMLElement;
            
            const isScrollingInsideDropdown = dropdownElement && composedPath.some((el: any) => {
              return el === dropdownElement || 
                     (el.nodeType === Node.ELEMENT_NODE && dropdownElement.contains(el));
            });
            
            // Don't close if scrolling inside this dropdown itself
            if (isScrollingInsideDropdown) {
              return;
            }
            
            // Close the dropdown when parent container scrolls
            this.closeDropdown(undefined, id);
          }
        });
      };

      // Add window-level listeners (only once)
      window.addEventListener('scroll', this.scrollHandler, { passive: true, capture: true });
      document.addEventListener('scroll', this.scrollHandler, { passive: true, capture: true });
      
      // Add touchmove listener for immediate mobile swipe detection
      // This ensures the dropdown closes instantly when user swipes on mobile
      document.addEventListener('touchmove', this.scrollHandler, { passive: true, capture: true });
    }

    // Create resize handler if it doesn't exist (shared across all instances)
    if (!this.resizeHandler) {
      this.resizeHandler = () => {
        // Update position for all open dropdowns
        this.activeScrollHandlers.forEach(id => {
          this.updatePortaledDropdownPosition(id);
        });
      };

      window.addEventListener('resize', this.resizeHandler, { passive: true });
    }
    
    // Also listen to scroll on parent containers for this specific instance
    const trigger = this.portaledDropdownTriggers.get(instanceId);
    const parentElements: HTMLElement[] = [];
    if (trigger && this.scrollHandler) {
      let parent: HTMLElement | null = trigger.parentElement;
      let depth = 0;
      while (parent && depth < 5) {
        const parentScrollHandler = (e: Event) => {
          const composedPath = e.composedPath();
          const portaledDropdown = this.portaledDropdowns.get(instanceId);
          
          if (!portaledDropdown) return;
          
          // Check if scroll event originated from within the dropdown
          const isScrollingInsideDropdown = composedPath.some((el: any) => {
            return el === portaledDropdown || 
                   (el.nodeType === Node.ELEMENT_NODE && portaledDropdown.contains(el));
          });
          
          // Don't close if scrolling inside the dropdown itself
          if (isScrollingInsideDropdown) {
            return;
          }

          // Close the dropdown when parent container scrolls
          this.closeDropdown(undefined, instanceId);
        };
        
        parent.addEventListener('scroll', parentScrollHandler, { passive: true, capture: true });
        parentElements.push(parent);
        parent = parent.parentElement;
        depth++;
      }
    }
    // Store parent elements for cleanup
    this.scrollListenerParents.set(instanceId, parentElements);
  }

  private removeScrollAndResizeHandlers(instanceId?: string): void {
    if (instanceId) {
      // Remove handlers for specific instance
      this.activeScrollHandlers.delete(instanceId);
      
      // Remove parent scroll listeners for this instance
      const parents = this.scrollListenerParents.get(instanceId);
      if (parents) {
        parents.forEach(parent => {
          // We need to remove the specific handler, but we created inline handlers
          // So we'll need to track them differently or just remove all scroll listeners
          // For now, we'll leave parent listeners - they'll be cleaned up when element is removed
        });
        this.scrollListenerParents.delete(instanceId);
      }
      
      // Only remove window-level handlers if no dropdowns are open
      if (this.activeScrollHandlers.size === 0) {
        if (this.scrollHandler) {
          window.removeEventListener('scroll', this.scrollHandler, { capture: true } as any);
          document.removeEventListener('scroll', this.scrollHandler, { capture: true } as any);
          document.removeEventListener('touchmove', this.scrollHandler, { capture: true } as any);
          this.scrollHandler = null;
        }
        if (this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler);
          this.resizeHandler = null;
        }
      }
    } else {
      // Remove all handlers (cleanup)
      this.activeScrollHandlers.clear();
      
      // Remove from stored parent elements
      this.scrollListenerParents.forEach((parents, id) => {
        parents.forEach(parent => {
          // Parent listeners will be cleaned up when elements are removed
        });
      });
      this.scrollListenerParents.clear();
      
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler, { capture: true } as any);
        document.removeEventListener('scroll', this.scrollHandler, { capture: true } as any);
        document.removeEventListener('touchmove', this.scrollHandler, { capture: true } as any);
        this.scrollHandler = null;
      }
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }
    }
  }

  private updatePortaledDropdownPosition(instanceId: string): void {
    const portaledDropdown = this.portaledDropdowns.get(instanceId);
    const trigger = this.portaledDropdownTriggers.get(instanceId);
    
    if (!portaledDropdown || !trigger) return;

    // Check if dropdown is actually open
    if (portaledDropdown.style.display !== 'block') return;

    try {
      const rect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      // Get module context for visible_items setting
      const moduleContext = this.moduleContexts.get(instanceId);
      const moduleVisibleItems = (moduleContext?.module as DropdownModule)?.visible_items ?? 5;
      const positionDropdownMaxHeight = moduleVisibleItems * 44;

      const shouldDropUp = spaceBelow < positionDropdownMaxHeight && spaceAbove > spaceBelow;

      // Update position
      portaledDropdown.style.left = `${rect.left}px`;
      portaledDropdown.style.width = `${rect.width}px`;
      portaledDropdown.style.right = 'auto';

      if (shouldDropUp) {
        portaledDropdown.style.bottom = `${viewportHeight - rect.top}px`;
        portaledDropdown.style.top = 'auto';
      } else {
        portaledDropdown.style.top = `${rect.bottom}px`;
        portaledDropdown.style.bottom = 'auto';
      }
    } catch (error) {
      console.error('Error updating dropdown position:', error);
    }
  }

  private updateChevronRotation(moduleId: string, isOpen: boolean, specificElement?: HTMLElement): void {
    // If a specific element is provided, update only that chevron (prevents updating duplicates)
    if (specificElement) {
      const chevron = specificElement.querySelector('.dropdown-chevron') as HTMLElement;
      if (chevron) {
        chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        return;
      }
    }
    
    // Fallback: Find the chevron icon for this module instance
    const moduleContainer = document.querySelector(
      `.dropdown-module-container[data-module-id="${moduleId}"]`
    ) as HTMLElement;
    
    if (moduleContainer) {
      const chevron = moduleContainer.querySelector('.dropdown-chevron') as HTMLElement;
      if (chevron) {
        chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }
  }

  private updateChevronRotationInstant(moduleId: string, isOpen: boolean, specificElement?: HTMLElement): void {
    // If a specific element is provided, update only that chevron (prevents updating duplicates)
    if (specificElement) {
      const chevron = specificElement.querySelector('.dropdown-chevron') as HTMLElement;
      if (chevron) {
        chevron.style.transition = 'none';
        chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        requestAnimationFrame(() => {
          chevron.style.transition = 'transform 0.2s ease';
        });
        return;
      }
    }
    
    // Fallback: Find the chevron icon for this module instance
    const moduleContainer = document.querySelector(
      `.dropdown-module-container[data-module-id="${moduleId}"]`
    ) as HTMLElement;
    
    if (moduleContainer) {
      const chevron = moduleContainer.querySelector('.dropdown-chevron') as HTMLElement;
      if (chevron) {
        chevron.style.transition = 'none';
        chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        requestAnimationFrame(() => {
          chevron.style.transition = 'transform 0.2s ease';
        });
      }
    }
  }

  private attachPortaledDropdownHandlers(portaledDropdown: HTMLElement, instanceId: string): void {
    const context = this.moduleContexts.get(instanceId);
    if (!context) {
      console.error('No module context found for', instanceId);
      return;
    }

    const { module: dropdownModule, hass, config } = context;
    const isEntityMode = dropdownModule.source_mode === 'entity' && dropdownModule.source_entity;
    const isUnifiedTemplateMode = dropdownModule.unified_template_mode && dropdownModule.unified_template;

    // Prevent scroll events from bubbling and closing dropdown
    // Also prevent them from triggering position updates
    // BUT allow the scrollbar to be draggable
    const scrollStopHandler = (e: Event) => {
      // Only stop propagation for wheel/touch events, not for scrollbar dragging
      const target = e.target as HTMLElement;
      if (target === portaledDropdown || portaledDropdown.contains(target)) {
        // This is scrolling inside the dropdown - prevent it from updating position
        e.stopPropagation();
      }
    };
    
    // Only prevent wheel/touch events, allow native scrollbar dragging
    portaledDropdown.addEventListener('wheel', (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, { passive: true, capture: true });
    
    portaledDropdown.addEventListener('touchmove', (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, { passive: true, capture: true });
    
    // For scroll events, just mark that we're scrolling inside
    portaledDropdown.addEventListener('scroll', scrollStopHandler, { passive: true });

    // Get all option elements in the portaled dropdown
    const optionElements = portaledDropdown.querySelectorAll('.dropdown-option');

    if (isEntityMode) {
      // Entity mode: get options from entity
      const entityOptions = this.getOptionsFromEntity(dropdownModule, hass);

      optionElements.forEach((optionEl, index) => {
        // Remove old listeners by cloning and replacing
        const newOptionEl = optionEl.cloneNode(true) as HTMLElement;
        optionEl.replaceWith(newOptionEl);

        newOptionEl.addEventListener('click', e => {
          e.stopPropagation();
          const optionValue = entityOptions[index];
          if (optionValue) {
            console.log('Entity option clicked:', optionValue);
            // Format the label for display/storage
            const entityStateObj = hass.states[dropdownModule.source_entity];
            const formattedLabel = this.formatOptionLabel(optionValue, entityStateObj, hass);
            this.updateEntitySelection(dropdownModule, optionValue, hass);
            // Persist formatted label for last_chosen mode (for display)
            this.selectOption(formattedLabel, dropdownModule);
            this.closeDropdown(undefined, instanceId);
          }
        });

        // Hover effects
        newOptionEl.addEventListener('mouseenter', () => {
          newOptionEl.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
        });
        newOptionEl.addEventListener('mouseleave', () => {
          newOptionEl.style.backgroundColor = 'transparent';
        });
      });
    } else if (isUnifiedTemplateMode) {
      // Unified template mode: get options from template
      const templateHash = this._hashString(dropdownModule.unified_template!);
      const templateKey = `unified_dropdown_${dropdownModule.id}_${templateHash}`;
      const unifiedTemplateResult = hass?.__uvc_template_strings?.[templateKey];
      
      let templateOptions: Array<{ label: string; mode?: string }> = [];
      if (unifiedTemplateResult) {
        try {
          const resultStr = String(unifiedTemplateResult).trim();
          let parsedData: any = null;
          
          if (resultStr.startsWith('{') && resultStr.endsWith('}')) {
            parsedData = JSON.parse(resultStr);
          } else if (resultStr.startsWith('[') && resultStr.endsWith(']')) {
            parsedData = { options: JSON.parse(resultStr) };
          }
          
          if (parsedData && parsedData.options && Array.isArray(parsedData.options)) {
            templateOptions = parsedData.options.map((opt: any) => ({
              label: String(opt.label || opt.name || 'Option'),
              mode: opt.mode || opt.value,
            }));
          }
        } catch (error) {
          console.error('Error parsing template in portaled handler:', error);
        }
      }

      optionElements.forEach((optionEl, index) => {
        const newOptionEl = optionEl.cloneNode(true) as HTMLElement;
        optionEl.replaceWith(newOptionEl);
        
        const templateOption = templateOptions[index];
        
        newOptionEl.addEventListener('click', e => {
          e.stopPropagation();
          if (templateOption) {
            console.log('Template option clicked:', templateOption.label);
            
            // Track state if enabled
            if (dropdownModule.track_state) {
              this.currentSelection.set(instanceId, templateOption.label);
            }
            
            // Always call selectOption to handle localStorage persistence
            this.selectOption(templateOption.label, dropdownModule);
            
            // Execute action if mode is set and source_entity is a climate entity
            const sourceEntity = dropdownModule.source_entity;
            if (templateOption.mode && sourceEntity && sourceEntity.startsWith('climate.')) {
              hass.callService('climate', 'set_hvac_mode', {
                entity_id: sourceEntity,
                hvac_mode: templateOption.mode,
              }).then(() => {
                console.log(`Set ${sourceEntity} to ${templateOption.mode}`);
              }).catch((error) => {
                console.error('Failed to set HVAC mode:', error);
              });
            }
            
            this.closeDropdown(undefined, instanceId);
          }
        });

        // Hover effects
        newOptionEl.addEventListener('mouseenter', () => {
          newOptionEl.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
        });
        newOptionEl.addEventListener('mouseleave', () => {
          newOptionEl.style.backgroundColor = 'transparent';
        });
      });
    } else {
      // Manual mode: use configured options
      const options = dropdownModule.options;

      optionElements.forEach((optionEl, index) => {
        // Skip placeholder option (it's at index 0 if track_state is false)
        const optionIndex = !dropdownModule.track_state ? index - 1 : index;

        if (optionIndex < 0) {
          // This is the placeholder
          const newOptionEl = optionEl.cloneNode(true) as HTMLElement;
          optionEl.replaceWith(newOptionEl);

          newOptionEl.addEventListener('click', e => {
            e.stopPropagation();
            console.log('Placeholder clicked');
            this.selectOption('', dropdownModule);
            this.closeDropdown(undefined, instanceId);
          });
          return;
        }

        const option = options[optionIndex];
        if (!option) return;

        // Remove old listeners by cloning and replacing
        const newOptionEl = optionEl.cloneNode(true) as HTMLElement;
        optionEl.replaceWith(newOptionEl);

        newOptionEl.addEventListener('click', e => {
          e.stopPropagation();

          // Track state if enabled
          if (dropdownModule.track_state) {
            this.currentSelection.set(instanceId, option.label);
          }

          // Always call selectOption to handle localStorage persistence
          this.selectOption(option.label, dropdownModule);
          this.executeOptionAction(option, hass, newOptionEl, config, dropdownModule);
          this.closeDropdown(undefined, instanceId);
        });

        // Hover effects
        newOptionEl.addEventListener('mouseenter', () => {
          newOptionEl.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
        });
        newOptionEl.addEventListener('mouseleave', () => {
          newOptionEl.style.backgroundColor = 'transparent';
        });
      });
    }
  }

  // localStorage helper methods for selection persistence
  private getStoredSelection(moduleId: string): string | null {
    try {
      return localStorage.getItem(`ultra_card_dropdown_selection_${moduleId}`);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private setStoredSelection(moduleId: string, value: string): void {
    try {
      localStorage.setItem(`ultra_card_dropdown_selection_${moduleId}`, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  private selectOption(value: string, module: DropdownModule): void {
    // Update the current selection if state tracking is enabled
    if (module.track_state && value) {
      // This would typically update the module configuration
      // For now, we'll just track it locally for the preview
      console.log('Selected option:', value);

      // In a real implementation, this would update the module config:
      // updateModule({ current_selection: value });
    }
    
    // Entity-driven dropdowns should always mirror the underlying entity state,
    // so skip local persistence to keep duplicated modules in sync.
    if (module.source_mode === 'entity') {
      return;
    }

    // Persist to localStorage if closed_title_mode is last_chosen
    if (module.closed_title_mode === 'last_chosen' || !module.closed_title_mode) {
      this.setStoredSelection(module.id, value);
    }
  }

  private executeOptionAction(
    option: DropdownOption,
    hass: HomeAssistant,
    element?: HTMLElement,
    config?: UltraCardConfig,
    dropdownModule?: DropdownModule
  ): void {
    console.log('Executing action:', option.action);

    // Trigger haptic feedback if enabled (default: true)
    const hapticEnabled = config?.haptic_feedback !== false;
    if (hapticEnabled) {
      import('custom-card-helpers').then(({ forwardHaptic }) => {
        forwardHaptic('selection'); // Use selection haptic for dropdown selections
      });
    }

    // Prefer central handler to keep behavior consistent with the rest of the card
    if (option.action.action === 'more-info' && option.action.entity) {
      // Dispatch within the component tree so HA overlays catch the event
      console.log('Triggering more-info for entity:', option.action.entity);
      const event = new CustomEvent('hass-more-info', {
        detail: { entityId: option.action.entity },
        bubbles: true,
        composed: true,
      });
      // Dispatch via nearest element when available; fall back to document/window
      if (element) {
        element.dispatchEvent(event);
      } else {
        document.dispatchEvent(event);
        window.dispatchEvent(event as any);
      }
      return;
    }

    // Extract entity from the option's action configuration to ensure each dropdown uses its own entity
    // Check multiple possible locations where entity_id might be stored
    const actionEntity = option.action.entity || 
                        option.action.service_data?.entity_id || 
                        option.action.data?.entity_id ||
                        (Array.isArray(option.action.target?.entity_id) 
                          ? option.action.target.entity_id[0] 
                          : option.action.target?.entity_id) ||
                        undefined;

    // Create a clean action object to avoid any shared state issues
    const cleanAction = {
      ...option.action,
      entity: actionEntity || option.action.entity,
    };

    // Pass the action entity as moduleEntity to ensure correct resolution for default actions
    UltraLinkComponent.handleAction(
      cleanAction as any, 
      hass, 
      element || document.body, 
      config, 
      actionEntity, // Pass the entity from the option's action as moduleEntity
      dropdownModule
    );
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;
    if (value === 'auto' || value === 'none' || value === 'inherit') return value;
    if (/^\d+$/.test(value)) return `${value}px`;
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }
    return value;
  }

  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  // Simple string hash function for template cache keys
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
    const dropdownModule = module as DropdownModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow incomplete configuration - UI will show placeholders
    // Check source mode
    const isEntityMode = dropdownModule.source_mode === 'entity';

    if (isEntityMode) {
      // Entity mode validation - allow empty, UI will handle
      // Only validate action requirements if source entity is configured
      if (dropdownModule.source_entity && dropdownModule.source_entity.trim() !== '') {
        // Could add specific entity format validation here if needed
      }
    } else {
      // Manual mode validation - only validate options that have content
      if (dropdownModule.options && dropdownModule.options.length > 0) {
        dropdownModule.options.forEach((option, index) => {
          // Only validate options that have been started
          const hasContent = (option.label && option.label.trim() !== '') || option.action;

          if (hasContent && option.action) {
            // Validate action-specific requirements (only truly critical errors)
            switch (option.action.action) {
              case 'more-info':
              case 'toggle':
                if (!option.action.entity) {
                  errors.push(
                    `Option ${index + 1}: Entity is required for ${option.action.action} action`
                  );
                }
                break;
              case 'navigate':
                if (!option.action.navigation_path) {
                  errors.push(
                    `Option ${index + 1}: Navigation path is required for navigate action`
                  );
                }
                break;
              case 'url':
                if (!option.action.url_path) {
                  errors.push(`Option ${index + 1}: URL is required for url action`);
                }
                break;
              case 'perform-action':
                if (!option.action.perform_action && !option.action.service) {
                  errors.push(`Option ${index + 1}: Service is required for perform-action`);
                }
                break;
            }
          }
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .dropdown-module-container {
        width: 100%;
        box-sizing: border-box;
        position: relative;
        pointer-events: none;
        isolation: isolate;
        overflow: visible !important;
      }

      .dropdown-module-preview {
        width: 100%;
        position: relative;
        overflow: visible !important;
        pointer-events: none;
      }

      /* label styles removed */

      /* Fix dropdown width in preview */
      .dropdown-module-container select,
      .dropdown-module-container ha-select {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        pointer-events: auto !important;
      }

      /* Custom dropdown styling - allow Global Design tab to override */
      .custom-dropdown {
        position: relative;
        width: inherit;
        height: inherit;
        overflow: visible !important;
        pointer-events: none;
        z-index: 1;
      }

      /* Ensure preview containers allow overflow for dropdowns */
      .dropdown-module-container[data-preview-context="live"],
      .dropdown-module-container[data-preview-context="ha-preview"] {
        overflow: visible !important;
      }

      .dropdown-module-container[data-preview-context="live"] .dropdown-module-preview,
      .dropdown-module-container[data-preview-context="ha-preview"] .dropdown-module-preview {
        overflow: visible !important;
      }

      .dropdown-selected {
        cursor: pointer;
        user-select: none;
        pointer-events: auto;
        /* Allow all design properties to be inherited */
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        background: inherit;
        border: inherit;
        border-radius: inherit;
        text-align: inherit;
        width: inherit;
        height: inherit;
        max-width: inherit;
        max-height: inherit;
        min-width: inherit;
        min-height: inherit;
      }

      .dropdown-selected:hover {
        background: rgba(var(--rgb-primary-color), 0.05) !important;
      }

      .dropdown-selected * {
        pointer-events: none;
      }

      .dropdown-chevron-container {
        cursor: pointer;
        pointer-events: auto;
        flex-shrink: 0;
        user-select: none;
      }

      .dropdown-chevron-container * {
        pointer-events: none;
      }

      .dropdown-chevron {
        pointer-events: none;
        flex-shrink: 0;
      }

      .dropdown-options {
        position: fixed !important;
        z-index: 10001 !important;
        background: var(--card-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        border-radius: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        pointer-events: none !important;
        visibility: hidden !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: var(--divider-color) var(--secondary-background-color);
      }

      /* Preview contexts - use fixed positioning with higher z-index */
      /* Need to be above popup content (1001) and popup tabs (2000) */
      .dropdown-module-container[data-preview-context="live"] .dropdown-options,
      .dropdown-module-container[data-preview-context="ha-preview"] .dropdown-options {
        position: fixed !important;
        z-index: 999999 !important; /* Extremely high to appear above all popup content */
      }

      .dropdown-options[style*="display: block"] {
        pointer-events: auto !important;
        visibility: visible !important;
      }

      /* Ensure scrollbar is visible and functional */
      .dropdown-options::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      .dropdown-options::-webkit-scrollbar-track {
        background: var(--secondary-background-color);
        border-radius: 4px;
      }

      .dropdown-options::-webkit-scrollbar-thumb {
        background: var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        -webkit-user-select: none;
        user-select: none;
      }

      .dropdown-options::-webkit-scrollbar-thumb:hover {
        background: var(--primary-color);
      }

      .dropdown-options::-webkit-scrollbar-thumb:active {
        background: var(--primary-color);
        opacity: 0.8;
      }

      /* Ensure scrollbar is clickable and draggable */
      .dropdown-options[style*="display: block"]::-webkit-scrollbar-thumb {
        pointer-events: auto !important;
      }

      .dropdown-option {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        text-align: inherit;
      }

      .dropdown-option:hover {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      .dropdown-option:last-child {
        border-bottom: none !important;
      }

      /* Enable pointer events only on interactive elements */
      .dropdown-module-container .dropdown-selected,
      .dropdown-module-container .dropdown-chevron-container,
      .dropdown-module-container .dropdown-option {
        pointer-events: auto;
      }


      /* Remove the ::before pseudo-element that was blocking clicks */
      /* This was extending beyond the container and intercepting pointer events */

      /* Let HA handle dropdown positioning naturally */

      /* Style dropdown items with icons */
      .dropdown-module-container mwc-list-item ha-icon {
        margin-right: 8px !important;
        color: var(--primary-color) !important;
      }

      .dropdown-module-container mwc-list-item span {
        display: flex !important;
        align-items: center !important;
      }

      .options-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .option-item {
        transition: all 0.2s ease;
        position: relative;
        cursor: default;
      }

      .option-item:hover {
        background: rgba(var(--rgb-primary-color), 0.05);
      }

      .option-item[draggable="true"] {
        cursor: grab;
      }

      .option-item:active {
        cursor: grabbing;
      }

      .option-item.dragging {
        opacity: 0.7;
        transform: rotate(2deg) scale(0.95);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        z-index: 100;
        position: relative;
      }

      .drag-handle {
        transition: all 0.2s ease;
      }

      .drag-handle:strong {
        background: rgba(var(--rgb-primary-color), 0.15) !important;
        transform: scale(1.1);
      }

      .drag-handle:active {
        cursor: grabbing !important;
        transform: scale(0.95);
      }

      .option-header {
        user-select: none;
        transition: background-color 0.2s ease;
      }

      .option-header:hover {
        background: rgba(var(--rgb-primary-color), 0.1) !important;
      }

      .option-header ha-icon[icon="mdi:drag"] {
        transition: color 0.2s ease;
      }

      .option-header:hover ha-icon[icon="mdi:drag"] {
        color: var(--primary-color) !important;
      }

      .expand-caret {
        transition: transform 0.2s ease !important;
      }

      .option-content {
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .option-content.collapsed {
        display: none !important;
      }

      /* Simplified form styling - let HA handle dropdowns */
      .option-item ha-form,
      .field-group ha-form {
        position: relative;
      }

      /* Conditional fields grouping */
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

      /* Settings section styling */
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 32px;
        position: relative;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        color: var(--primary-color) !important;
        margin-bottom: 16px !important;
        padding-bottom: 0 !important;
        border-bottom: none !important;
        letter-spacing: 0.5px !important;
      }

      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: var(--primary-text-color) !important;
        margin-bottom: 4px !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .field-group {
        margin-bottom: 16px;
        position: relative;
      }
    `;
  }
}
