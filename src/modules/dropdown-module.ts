import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DropdownModule, DropdownOption, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import '../components/ultra-color-picker';

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
  private dropdownOpen: boolean = false;
  private currentSelection: Map<string, string> = new Map(); // moduleId -> selectedOption

  createDefault(id?: string, hass?: HomeAssistant): DropdownModule {
    return {
      id: id || this.generateId('dropdown'),
      type: 'dropdown',
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
      current_selection: 'Turn On Lights', // Default to first option
      track_state: true, // Enable state tracking by default
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
        <!-- Basic Settings -->
        ${this.renderSettingsSection(
          localize('editor.dropdown.basic.title', lang, 'Basic Settings'),
          localize(
            'editor.dropdown.basic.desc',
            lang,
            'Configure the dropdown appearance and behavior.'
          ),
          [
            ...(dropdownModule.track_state
              ? []
              : [
                  {
                    title: localize('editor.dropdown.placeholder.title', lang, 'Placeholder'),
                    description: localize(
                      'editor.dropdown.placeholder.desc',
                      lang,
                      'Text shown when no option is selected.'
                    ),
                    hass,
                    data: { placeholder: dropdownModule.placeholder ?? 'Choose an option...' },
                    schema: [this.textField('placeholder')],
                    onChange: (e: CustomEvent) => {
                      updateModule(e.detail.value);
                    },
                  },
                ]),
          ]
        )}

        <!-- Keep Selection State -->
        <div class="settings-section">
          <div style="display: flex; align-items: center; justify-content: space-between;">
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
        </div>

        <!-- Label Settings removed intentionally -->

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
                        .title=${localize('editor.dropdown.drag_option', lang, 'Drag to reorder')}
                        @mouseenter=${(e: Event) => {
                          const target = e.target as HTMLElement;
                          target.style.backgroundColor = 'rgba(var(--rgb-primary-color), 0.1)';
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
                        localize('editor.dropdown.option_number', lang, 'Option {number}').replace(
                          '{number}',
                          (index + 1).toString()
                        )}
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
                        .title=${localize('editor.dropdown.remove_option', lang, 'Remove option')}
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
                          e.stopPropagation();
                          console.log('Direct caret clicked for option:', option.id);

                          // Find elements directly from the event
                          const caret = e.target as HTMLElement;
                          const card = caret.closest('.option-item') as HTMLElement;
                          const content = card?.querySelector('.option-content') as HTMLElement;

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
                    ${this.renderOptionConfiguration(option, hass, lang, updateDropdownOption)}
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
        ${this.renderFieldSection(
          localize('editor.dropdown.option.label', lang, 'Label'),
          localize('editor.dropdown.option.label_desc', lang, 'Display text for this option'),
          hass,
          { label: option.label },
          [this.textField('label')],
          (e: CustomEvent) => updateOption(option.id, e.detail.value)
        )}
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
        <ha-form
          .hass=${hass}
          .data=${{ action_config: option.action }}
          .schema=${[
            {
              name: 'action_config',
              label: '',
              selector: {
                ui_action: {
                  actions: ['more-info', 'toggle', 'navigate', 'url', 'perform-action', 'assist'],
                },
              },
            },
          ]}
          .computeLabel=${(schema: any) => schema.label || ''}
          .computeDescription=${(schema: any) => schema.description || ''}
          @value-changed=${(e: CustomEvent) => {
            const newAction = e.detail.value?.action_config;
            if (newAction) {
              updateOption(option.id, { action: newAction });
            }
          }}
        ></ha-form>
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
                      (e: CustomEvent) =>
                        updateOption(option.id, {
                          action: { ...option.action, entity: e.detail.value.entity },
                        })
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
                      (e: CustomEvent) =>
                        updateOption(option.id, {
                          action: { ...option.action, entity: e.detail.value.entity },
                        })
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

  renderPreview(module: CardModule, hass: HomeAssistant): TemplateResult {
    const dropdownModule = module as DropdownModule;

    // Apply design properties with priority - global design properties are stored directly on the module
    const moduleWithDesign = dropdownModule as any;

    console.log('Raw module with design:', moduleWithDesign);
    console.log('Full module object keys:', Object.keys(dropdownModule));
    console.log('Design properties found on module:', {
      width: moduleWithDesign.width,
      height: moduleWithDesign.height,
      color: moduleWithDesign.color,
      font_size: moduleWithDesign.font_size,
      font_family: moduleWithDesign.font_family,
      background_color: moduleWithDesign.background_color,
      border_color: moduleWithDesign.border_color,
      border_radius: moduleWithDesign.border_radius,
    });

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

    console.log('Design properties applied:', {
      width: dropdownWidth,
      height: dropdownHeight,
      fontSize: fontSize,
      textColor: textColor,
      backgroundColor: backgroundColor,
      fontFamily: fontFamily,
      fontWeight: fontWeight,
      textAlign: textAlign,
    });

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
      cursor: pointer;
      transition: all 0.2s ease;
      box-sizing: border-box;
    `;

    const labelStyles = ``;

    // Handle dropdown selection
    const handleDropdownChange = (e: Event) => {
      e.stopPropagation(); // Prevent event from bubbling up to close the popup
      e.stopImmediatePropagation();
      const target = e.target as HTMLSelectElement;
      const selectedValue = target.value;

      if (!selectedValue) {
        return;
      }

      // Find option by label since we removed the value field
      const selectedOption = dropdownModule.options.find(option => option.label === selectedValue);
      if (selectedOption) {
        this.executeOptionAction(selectedOption, hass);
      }
    };

    // Determine current selection based on tracking mode
    let currentSelectedOption: DropdownOption | undefined;
    let showPlaceholder = false;

    if (dropdownModule.track_state) {
      // State tracking mode: show current selection or first option
      const moduleId = dropdownModule.id;
      const storedSelection =
        this.currentSelection.get(moduleId) || dropdownModule.current_selection;

      if (storedSelection) {
        currentSelectedOption = dropdownModule.options.find(
          option => option.label === storedSelection
        );
      }
      // If no current selection or option not found, default to first option
      if (!currentSelectedOption && dropdownModule.options.length > 0) {
        currentSelectedOption = dropdownModule.options[0];
        // Store the first option as current selection
        this.currentSelection.set(moduleId, currentSelectedOption.label);
      }
      showPlaceholder = false; // Never show placeholder in state tracking mode
    } else {
      // Traditional mode: show placeholder if no selection
      showPlaceholder = true;
    }

    const placeholderText = dropdownModule.placeholder || 'Choose an option...';
    const dropdownValue = currentSelectedOption ? currentSelectedOption.label : '';

    console.log('Selection logic:', {
      track_state: dropdownModule.track_state,
      current_selection: dropdownModule.current_selection,
      currentSelectedOption: currentSelectedOption?.label,
      showPlaceholder: showPlaceholder,
    });

    // Handle dropdown interactions - prevent closing popup
    const handleDropdownInteraction = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Prevent all dropdown interactions from closing the popup
    const preventClose = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // More comprehensive event prevention for the entire dropdown container
    const preventAllEvents = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Prevent container clicks from closing popup but allow dropdown functionality
    const preventContainerClose = (e: Event) => {
      // Only prevent propagation, don't prevent default to allow dropdown to work
      e.stopPropagation();
    };

    // Get hover effect configuration from module design
    const hoverEffect = (dropdownModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Add comprehensive event capturing for the entire container
    const captureAllEvents = (e: Event) => {
      // Stop all event propagation to prevent popup from closing
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Only prevent default for non-essential events
      if (e.type !== 'change' && e.type !== 'input' && e.type !== 'select') {
        e.preventDefault();
      }
    };
    return html`
      <div
        class="dropdown-module-container ${hoverEffectClass}"
        style=${this.styleObjectToCss(containerStyles)}
      >
        <div
          class="dropdown-module-preview"
          style="display: flex; flex-direction: column; align-items: flex-start;"
        >
          ${''}

          <div style="position: relative; width: 100%;">
            <div class="custom-dropdown" style="position: relative;">
              <div
                class="dropdown-selected"
                style="${dropdownStyles} display: flex; align-items: center; justify-content: space-between;"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  console.log('Dropdown clicked');
                  this.toggleDropdown(e);
                }}
              >
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${currentSelectedOption
                    ? html`
                        ${currentSelectedOption.icon
                          ? html`<ha-icon
                              icon="${currentSelectedOption.icon}"
                              style="color: ${this.getIconColor(currentSelectedOption, hass)};"
                            ></ha-icon>`
                          : ''}
                        <span>${currentSelectedOption.label}</span>
                      `
                    : html`<span style="color: var(--secondary-text-color);"
                        >${placeholderText}</span
                      >`}
                </div>
                <ha-icon
                  icon="mdi:chevron-down"
                  style="color: var(--secondary-text-color);"
                ></ha-icon>
              </div>

              <div
                class="dropdown-options"
                style="position: absolute; top: 100%; left: 0; right: 0; background: var(--card-background-color); border: 1px solid var(--divider-color); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999; display: none; max-height: 200px; overflow-y: auto; color: ${textColor}; font-size: ${this.addPixelUnit(
                  fontSize.toString()
                )}; font-family: ${fontFamily}; font-weight: ${fontWeight};"
              >
                ${showPlaceholder
                  ? html`
                      <div
                        class="dropdown-option"
                        style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color); color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit;"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          console.log('Placeholder option clicked');
                          this.selectOption('', dropdownModule);
                          this.closeDropdown(e);
                        }}
                      >
                        <span
                          style="color: var(--secondary-text-color); font-size: inherit; font-family: inherit; font-weight: inherit;"
                          >${placeholderText}</span
                        >
                      </div>
                    `
                  : ''}
                ${dropdownModule.options.map(
                  option => html`
                    <div
                      class="dropdown-option"
                      style="padding: 12px; cursor: pointer; border-bottom: 1px solid var(--divider-color); display: flex; align-items: center; gap: 8px; transition: background-color 0.2s ease; color: inherit; font-size: inherit; font-family: inherit; font-weight: inherit;"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        console.log('Option clicked:', option.label);

                        // Update current selection if state tracking is enabled
                        if (dropdownModule.track_state) {
                          const moduleId = dropdownModule.id;
                          this.currentSelection.set(moduleId, option.label);
                          console.log(
                            'Updated selection for module',
                            moduleId,
                            'to:',
                            option.label
                          );

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
                              console.log('Updated display to show:', option.label);
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
                                  (existingIcon as HTMLElement).style.color = this.getIconColor(
                                    option,
                                    hass
                                  );
                                } else {
                                  // Add new icon
                                  const iconElement = document.createElement('ha-icon');
                                  iconElement.setAttribute('icon', option.icon);
                                  iconElement.style.color = this.getIconColor(option, hass);
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

                        this.selectOption(option.label, dropdownModule);
                        this.executeOptionAction(
                          option,
                          hass,
                          (e.currentTarget as HTMLElement) || undefined
                        );
                        this.closeDropdown(e);
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
                            style="color: ${this.getIconColor(option, hass)};"
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

  private toggleDropdown(event?: Event): void {
    this.dropdownOpen = !this.dropdownOpen;

    // Find the dropdown options relative to the clicked element
    let dropdownElement: HTMLElement | null = null;
    if (event) {
      const target = event.target as HTMLElement;
      const container = target.closest('.custom-dropdown');
      dropdownElement = container?.querySelector('.dropdown-options') as HTMLElement;
    } else {
      dropdownElement = document.querySelector('.dropdown-options') as HTMLElement;
    }

    if (dropdownElement) {
      dropdownElement.style.display = this.dropdownOpen ? 'block' : 'none';
      console.log('Dropdown toggled:', this.dropdownOpen ? 'open' : 'closed');
    }
  }

  private closeDropdown(event?: Event): void {
    this.dropdownOpen = false;

    // Find the dropdown options relative to the event if provided
    let dropdownElement: HTMLElement | null = null;
    if (event) {
      const target = event.target as HTMLElement;
      const container = target.closest('.custom-dropdown');
      dropdownElement = container?.querySelector('.dropdown-options') as HTMLElement;
    } else {
      dropdownElement = document.querySelector('.dropdown-options') as HTMLElement;
    }

    if (dropdownElement) {
      dropdownElement.style.display = 'none';
      console.log('Dropdown closed');
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
  }

  private executeOptionAction(
    option: DropdownOption,
    hass: HomeAssistant,
    element?: HTMLElement
  ): void {
    console.log('Executing action:', option.action);

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

    UltraLinkComponent.handleAction(option.action as any, hass, element || document.body);
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

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const dropdownModule = module as DropdownModule;
    const errors = [...baseValidation.errors];

    // Validate options array
    if (!dropdownModule.options || dropdownModule.options.length === 0) {
      errors.push('At least one dropdown option is required');
    } else {
      dropdownModule.options.forEach((option, index) => {
        if (!option.label || option.label.trim() === '') {
          errors.push(`Option ${index + 1}: Label is required`);
        }

        // Validate action configuration
        if (!option.action || !option.action.action) {
          errors.push(`Option ${index + 1}: Action is required`);
        } else {
          // Validate action-specific requirements
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
                errors.push(`Option ${index + 1}: Navigation path is required for navigate action`);
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

    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .dropdown-module-container {
        width: 100%;
        box-sizing: border-box;
        position: relative;
        pointer-events: auto;
        isolation: isolate;
      }

      .dropdown-module-preview {
        width: 100%;
        position: relative;
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
      }

      .dropdown-selected {
        cursor: pointer;
        user-select: none;
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

      .dropdown-options {
        position: absolute !important;
        z-index: 999 !important;
        background: var(--card-background-color) !important;
        border: 1px solid var(--divider-color) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        border-radius: inherit;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
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

      /* Prevent event bubbling from dropdown container */
      .dropdown-module-container * {
        pointer-events: auto;
      }

      /* Capture all events within dropdown container */
      .dropdown-module-container {
        position: relative;
        z-index: 1000;
      }

      .dropdown-module-container::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        pointer-events: auto;
        z-index: -1;
      }

      /* Ensure dropdown menu appears above other content */
      .dropdown-module-container ha-select,
      .dropdown-module-container mwc-menu,
      .dropdown-module-container .mdc-menu-surface {
        z-index: 10001 !important;
      }

      /* Fix dropdown positioning */
      .dropdown-module-container .mdc-select__menu {
        z-index: 10001 !important;
        position: fixed !important;
      }

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
        z-index: 1000;
        position: relative;
      }

      .drag-handle {
        transition: all 0.2s ease;
      }

      .drag-handle:hover {
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

      /* Fix z-index for action dropdowns in option configuration */
      .option-item ha-form {
        position: relative;
        z-index: 1000;
      }

      .option-item ha-form ha-select,
      .option-item ha-form mwc-menu,
      .option-item ha-form .mdc-menu-surface,
      .option-item ha-form .mdc-select__menu {
        z-index: 10002 !important;
        position: fixed !important;
      }

      /* Ensure action selector dropdowns appear above other content */
      .field-group ha-form {
        position: relative;
        z-index: 1000;
      }

      .field-group ha-form ha-select,
      .field-group ha-form mwc-menu,
      .field-group ha-form .mdc-menu-surface,
      .field-group ha-form .mdc-select__menu {
        z-index: 10002 !important;
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
