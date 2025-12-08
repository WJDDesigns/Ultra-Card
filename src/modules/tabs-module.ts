import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, TabsModule, TabSection } from '../types';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';

export class UltraTabsModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'tabs',
    title: 'Tabs',
    description: 'Tabbed container for organizing modules into switchable sections',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:tab',
    category: 'layout',
    tags: ['layout', 'tabs', 'organization', 'container', 'sections'],
  };

  // Track the active tab for each tabs module instance
  private activeTabStates = new Map<string, string>();
  
  // Track dragged section for reordering
  private _draggedSection: TabSection | null = null;

  createDefault(id?: string, hass?: HomeAssistant): TabsModule {
    const moduleId = id || this.generateId('tabs');
    const section1Id = this.generateId('section');
    const section2Id = this.generateId('section');
    
    return {
      id: moduleId,
      type: 'tabs',
      sections: [
        { id: section1Id, title: 'Section 1', modules: [] },
        { id: section2Id, title: 'Section 2', modules: [] },
      ],
      orientation: 'horizontal',
      style: 'switch_1',
      alignment: 'left',
      switch_on_hover: false,
      default_tab: section1Id,
      // Typography
      font_size: '14px',
      font_weight: '500',
      text_transform: 'none',
      // Tab design
      tab_gap: 4,
      tab_padding: '10px 16px',
      active_tab_color: 'var(--primary-text-color)',
      active_tab_background: 'var(--primary-color)',
      inactive_tab_color: 'var(--secondary-text-color)',
      inactive_tab_background: 'var(--secondary-background-color)',
      hover_tab_color: 'var(--primary-text-color)',
      hover_tab_background: 'rgba(var(--rgb-primary-color), 0.1)',
      tab_border_radius: '8px',
      tab_border_width: 0,
      // Content area
      content_background: 'transparent',
      content_padding: '16px',
      content_border_radius: '0',
      // Animation
      transition_duration: '0.2s',
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const tabsModule = module as TabsModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .section-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: var(--card-background-color);
          margin-bottom: 8px;
          transition: all 0.2s ease;
          overflow: visible;
          position: relative;
        }
        .section-item:hover {
          border-color: var(--primary-color);
        }
        .section-item.dragging {
          opacity: 0.5;
          border-style: dashed;
        }
        .section-item.drop-target {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .drag-handle {
          cursor: grab;
          color: var(--secondary-text-color);
          padding: 4px;
        }
        .drag-handle:active {
          cursor: grabbing;
        }
        .section-title-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--primary-text-color);
          padding: 4px 8px;
        }
        .section-title-input:focus {
          outline: none;
          background: var(--secondary-background-color);
          border-radius: 4px;
        }
        .section-actions {
          display: flex;
          gap: 4px;
        }
        .section-action-btn {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: var(--secondary-text-color);
          border-radius: 4px;
          transition: all 0.2s;
        }
        .section-action-btn:hover {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
        }
        .section-action-btn.delete:hover {
          color: var(--error-color);
        }
        /* Fix icon picker dropdown visibility and width */
        .section-icon-picker {
          flex-shrink: 0;
        }
        .section-icon-picker ha-icon-picker {
          --mdc-icon-size: 20px;
          --text-field-padding: 0 8px;
          width: 56px;
        }
        /* Target the vaadin combo box overlay for wider dropdown */
        .section-icon-picker vaadin-combo-box-overlay {
          width: 320px !important;
          min-width: 320px !important;
        }
        .sections-list {
          overflow: visible;
        }
        .section-item {
          overflow: visible !important;
        }
        /* Ensure parent containers don't clip the dropdown */
        .sections-manager-container {
          overflow: visible !important;
        }
        .module-general-settings {
          overflow: visible !important;
        }
        .add-section-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border: 1px dashed var(--primary-color);
          border-radius: 8px;
          background: none;
          color: var(--primary-color);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .add-section-btn:hover {
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .orientation-btn, .style-btn {
          flex: 1;
          padding: 12px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .orientation-btn.active, .style-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      </style>

      <div class="module-general-settings" style="overflow: visible;">
        <!-- Inject global style for icon picker dropdown width -->
        ${this._injectIconPickerStyles()}
        
        <!-- Orientation Section -->
        ${this.renderSettingsSection(
          localize('editor.tabs_module.orientation.title', lang, 'Tab Orientation'),
          localize('editor.tabs_module.orientation.desc', lang, 'Choose how the tabs are arranged.'),
          []
        )}
        <div style="display: flex; gap: 8px; margin-bottom: 32px;">
          ${[
            { value: 'horizontal', icon: 'mdi:view-column', label: localize('editor.tabs_module.orientation.horizontal', lang, 'Horizontal') },
            { value: 'vertical', icon: 'mdi:view-sequential', label: localize('editor.tabs_module.orientation.vertical', lang, 'Vertical') },
          ].map(
            opt => html`
              <button
                class="orientation-btn ${(tabsModule.orientation || 'horizontal') === opt.value ? 'active' : ''}"
                @click=${() => {
                  updateModule({ orientation: opt.value as 'horizontal' | 'vertical' });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              >
                <ha-icon icon="${opt.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                <span style="font-size: 12px;">${opt.label}</span>
              </button>
            `
          )}
        </div>

        <!-- Style Section -->
        ${this.renderSettingsSection(
          localize('editor.tabs_module.style.title', lang, 'Tab Style'),
          localize('editor.tabs_module.style.desc', lang, 'Choose the visual style for the tabs.'),
          [
            {
              title: localize('editor.tabs_module.style.type', lang, 'Style'),
              description: '',
              hass,
              data: { style: tabsModule.style || 'switch_1' },
              schema: [
                this.selectField('style', [
                  { value: 'default', label: 'Default' },
                  { value: 'simple', label: 'Simple' },
                  { value: 'simple_2', label: 'Simple 2' },
                  { value: 'simple_3', label: 'Simple 3' },
                  { value: 'switch_1', label: 'Switch 1' },
                  { value: 'switch_2', label: 'Switch 2' },
                  { value: 'switch_3', label: 'Switch 3' },
                  { value: 'modern', label: 'Modern' },
                  { value: 'trendy', label: 'Trendy' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.style;
                if (next === tabsModule.style) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Alignment Section -->
        ${this.renderSettingsSection(
          localize('editor.tabs_module.alignment.title', lang, 'Tab Alignment'),
          localize('editor.tabs_module.alignment.desc', lang, 'Choose how tabs are aligned within their container.'),
          [
            {
              title: localize('editor.tabs_module.alignment.alignment', lang, 'Alignment'),
              description: '',
              hass,
              data: { alignment: tabsModule.alignment || 'left' },
              schema: [
                this.selectField('alignment', [
                  { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                  { value: 'center', label: localize('editor.common.center', lang, 'Center') },
                  { value: 'right', label: localize('editor.common.right', lang, 'Right') },
                  { value: 'stretch', label: localize('editor.common.stretch', lang, 'Stretch') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.alignment;
                if (next === tabsModule.alignment) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Position Section -->
        ${this.renderSettingsSection(
          localize('editor.tabs_module.position.title', lang, 'Tab Position'),
          localize('editor.tabs_module.position.desc', lang, 'Choose where the tabs appear relative to the content.'),
          [
            {
              title: localize('editor.tabs_module.position.position', lang, 'Position'),
              description: '',
              hass,
              data: { tab_position: tabsModule.tab_position || (tabsModule.orientation === 'vertical' ? 'left' : 'top') },
              schema: [
                this.selectField('tab_position', 
                  tabsModule.orientation === 'vertical' 
                    ? [
                        { value: 'left', label: localize('editor.common.left', lang, 'Left') },
                        { value: 'right', label: localize('editor.common.right', lang, 'Right') },
                      ]
                    : [
                        { value: 'top', label: localize('editor.common.top', lang, 'Top') },
                        { value: 'bottom', label: localize('editor.common.bottom', lang, 'Bottom') },
                      ]
                ),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.tab_position;
                if (next === tabsModule.tab_position) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- Colors Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${localize('editor.tabs_module.colors.title', lang, 'Colors')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize('editor.tabs_module.colors.desc', lang, 'Customize the colors for your tabs.')}
          </div>

          <style>
            .color-section-title {
              font-size: 15px;
              font-weight: 700;
              color: var(--primary-text-color);
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .color-grid {
              display: flex;
              gap: 16px;
            }
            .color-picker-wrapper {
              flex: 1;
              min-width: 0;
              overflow: hidden;
            }
            .color-picker-wrapper ultra-color-picker {
              --ha-select-min-width: 100%;
              width: 100%;
              display: block;
            }
            .color-picker-wrapper ultra-color-picker ha-select {
              width: 100% !important;
              max-width: 100% !important;
            }
            .color-picker-wrapper .mdc-select__selected-text {
              max-width: calc(100% - 40px) !important;
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              white-space: nowrap !important;
            }
            .color-picker-wrapper .mdc-text-field--with-leading-icon {
              padding-inline-start: var(--text-field-suffix-padding-left, 0px);
              padding-inline-end: var(--text-field-suffix-padding-right, 0px);
            }
          </style>

          <!-- Active Tab Colors -->
          <div style="margin-bottom: 20px;">
            <div class="color-section-title">
              ${localize('editor.tabs_module.colors.active', lang, 'Active Tab')}
            </div>
            <div class="color-grid">
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${localize('editor.tabs_module.colors.text', lang, 'Text')}
                  .value=${tabsModule.active_tab_color || ''}
                  .defaultValue=${'var(--primary-text-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ active_tab_color: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${localize('editor.tabs_module.colors.background', lang, 'Background')}
                  .value=${tabsModule.active_tab_background || ''}
                  .defaultValue=${'var(--primary-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ active_tab_background: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          </div>

          <!-- Inactive Tab Colors -->
          <div style="margin-bottom: 20px;">
            <div class="color-section-title">
              ${localize('editor.tabs_module.colors.inactive', lang, 'Inactive Tab')}
            </div>
            <div class="color-grid">
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${localize('editor.tabs_module.colors.text', lang, 'Text')}
                  .value=${tabsModule.inactive_tab_color || ''}
                  .defaultValue=${'var(--secondary-text-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ inactive_tab_color: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${localize('editor.tabs_module.colors.background', lang, 'Background')}
                  .value=${tabsModule.inactive_tab_background || ''}
                  .defaultValue=${'transparent'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ inactive_tab_background: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          </div>

          <!-- Track & Icon Colors -->
          <div>
            <div class="color-section-title">
              ${localize('editor.tabs_module.colors.other', lang, 'Track & Icons')}
            </div>
            <div class="color-grid">
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${localize('editor.tabs_module.colors.track', lang, 'Track')}
                  .value=${tabsModule.track_background || ''}
                  .defaultValue=${'var(--secondary-background-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ track_background: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
              <div class="color-picker-wrapper">
                <ultra-color-picker
                  .label=${localize('editor.tabs_module.colors.icon', lang, 'Icon')}
                  .value=${tabsModule.icon_color || ''}
                  .defaultValue=${'inherit'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ icon_color: e.detail.value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          </div>
        </div>

        <!-- Switch Behavior Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="flex: 1;">
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
              >
                ${localize('editor.tabs_module.behavior.switch_on_hover', lang, 'Switch on Hover')}
              </div>
              <div
                class="field-description"
                style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
              >
                ${localize(
                  'editor.tabs.behavior.switch_on_hover_desc',
                  lang,
                  'Switch tabs when hovering over them instead of clicking.'
                )}
              </div>
            </div>
            <div style="margin-left: 16px;">
              <ha-switch
                .checked=${tabsModule.switch_on_hover || false}
                @change=${(e: Event) => {
                  const target = e.target as any;
                  updateModule({ switch_on_hover: target.checked });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              ></ha-switch>
            </div>
          </div>
        </div>

        <!-- Sections Manager -->
        <div
          class="settings-section sections-manager-container"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px; overflow: visible;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${localize('editor.tabs_module.sections.title', lang, 'Sections')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.tabs.sections.desc',
              lang,
              'Manage your tab sections. Drag to reorder, click to edit titles.'
            )}
          </div>

          <!-- Section List -->
          <div class="sections-list">
            ${(tabsModule.sections || []).map((section, index) => this._renderSectionItem(section, index, tabsModule, hass, updateModule))}
          </div>

          <!-- Add Section Button -->
          <button
            class="add-section-btn"
            @click=${() => {
              const newSection: TabSection = {
                id: this.generateId('section'),
                title: `Section ${(tabsModule.sections?.length || 0) + 1}`,
                modules: [],
              };
              const sections = [...(tabsModule.sections || []), newSection];
              updateModule({ sections });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          >
            <ha-icon icon="mdi:plus" style="--mdc-icon-size: 20px;"></ha-icon>
            ${localize('editor.tabs_module.sections.add', lang, 'Add Section')}
          </button>
        </div>

        <!-- Typography Section -->
        ${this.renderSettingsSection(
          localize('editor.tabs_module.typography.title', lang, 'Typography'),
          localize('editor.tabs_module.typography.desc', lang, 'Configure the font settings for tab labels.'),
          [
            {
              title: localize('editor.tabs_module.typography.font_size', lang, 'Font Size'),
              description: '',
              hass,
              data: { font_size: tabsModule.font_size || '14px' },
              schema: [this.textField('font_size')],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.tabs_module.typography.font_weight', lang, 'Font Weight'),
              description: '',
              hass,
              data: { font_weight: tabsModule.font_weight || '500' },
              schema: [
                this.selectField('font_weight', [
                  { value: '300', label: 'Light' },
                  { value: '400', label: 'Normal' },
                  { value: '500', label: 'Medium' },
                  { value: '600', label: 'Semi-Bold' },
                  { value: '700', label: 'Bold' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.font_weight;
                if (next === tabsModule.font_weight) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.tabs_module.typography.text_transform', lang, 'Text Transform'),
              description: '',
              hass,
              data: { text_transform: tabsModule.text_transform || 'none' },
              schema: [
                this.selectField('text_transform', [
                  { value: 'none', label: 'None' },
                  { value: 'uppercase', label: 'Uppercase' },
                  { value: 'lowercase', label: 'Lowercase' },
                  { value: 'capitalize', label: 'Capitalize' },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.text_transform;
                if (next === tabsModule.text_transform) return;
                updateModule(e.detail.value);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}
      </div>
    `;
  }

  /**
   * Injects global styles for the icon picker dropdown width
   */
  private _injectIconPickerStyles(): TemplateResult {
    // Only inject once
    if (!document.getElementById('ultra-icon-picker-styles')) {
      const style = document.createElement('style');
      style.id = 'ultra-icon-picker-styles';
      style.textContent = `
        vaadin-combo-box-overlay {
          --vaadin-combo-box-overlay-width: 320px !important;
          min-width: 320px !important;
        }
        vaadin-combo-box-overlay [part="content"] {
          width: 320px !important;
        }
        vaadin-combo-box-overlay vaadin-combo-box-item {
          padding: 8px !important;
        }
      `;
      document.head.appendChild(style);
    }
    return html``;
  }

  private _renderSectionItem(
    section: TabSection,
    index: number,
    tabsModule: TabsModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';
    const sections = tabsModule.sections || [];
    const canDelete = sections.length > 1;
    const isDefault = tabsModule.default_tab === section.id;

    return html`
      <div
        class="section-item ${this._draggedSection?.id === section.id ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this._handleDragStart(e, section)}
        @dragover=${(e: DragEvent) => this._handleDragOver(e, section)}
        @dragend=${() => this._handleDragEnd()}
        @drop=${(e: DragEvent) => this._handleDrop(e, section, tabsModule, updateModule)}
      >
        <!-- Drag Handle -->
        <div class="drag-handle">
          <ha-icon icon="mdi:drag" style="--mdc-icon-size: 20px;"></ha-icon>
        </div>

        <!-- Title Input -->
        <input
          type="text"
          class="section-title-input"
          .value=${section.title}
          placeholder=${localize('editor.tabs_module.sections.title_placeholder', lang, 'Section Title')}
          @input=${(e: Event) => {
            const target = e.target as HTMLInputElement;
            const updatedSections = [...sections];
            updatedSections[index] = { ...section, title: target.value };
            updateModule({ sections: updatedSections });
          }}
          @blur=${() => this.triggerPreviewUpdate()}
        />

        <!-- Icon Picker (optional) -->
        <div class="section-icon-picker">
          <ha-icon-picker
            .hass=${hass}
            .value=${section.icon || ''}
            .label=${''}
            @opened-changed=${(e: CustomEvent) => {
              // Inject style to widen the dropdown when it opens
              if (e.detail.value) {
                requestAnimationFrame(() => {
                  const overlay = document.querySelector('vaadin-combo-box-overlay');
                  if (overlay) {
                    (overlay as HTMLElement).style.setProperty('--vaadin-combo-box-overlay-width', '320px');
                    (overlay as HTMLElement).style.width = '320px';
                    (overlay as HTMLElement).style.minWidth = '320px';
                  }
                });
              }
            }}
            @value-changed=${(e: CustomEvent) => {
              const updatedSections = [...sections];
              updatedSections[index] = { ...section, icon: e.detail.value };
              updateModule({ sections: updatedSections });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          ></ha-icon-picker>
        </div>

        <!-- Default Tab Indicator -->
        <button
          class="section-action-btn"
          title=${isDefault
            ? localize('editor.tabs_module.sections.is_default', lang, 'Default Tab')
            : localize('editor.tabs_module.sections.set_default', lang, 'Set as Default')}
          @click=${() => {
            updateModule({ default_tab: section.id });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }}
          style="color: ${isDefault ? 'var(--primary-color)' : 'var(--secondary-text-color)'}"
        >
          <ha-icon icon=${isDefault ? 'mdi:star' : 'mdi:star-outline'} style="--mdc-icon-size: 18px;"></ha-icon>
        </button>

        <!-- Section Actions -->
        <div class="section-actions">
          <!-- Duplicate -->
          <button
            class="section-action-btn"
            title=${localize('editor.tabs_module.sections.duplicate', lang, 'Duplicate')}
            @click=${() => {
              const duplicatedSection: TabSection = {
                ...section,
                id: this.generateId('section'),
                title: `${section.title} (Copy)`,
                modules: JSON.parse(JSON.stringify(section.modules)),
              };
              const updatedSections = [...sections];
              updatedSections.splice(index + 1, 0, duplicatedSection);
              updateModule({ sections: updatedSections });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          >
            <ha-icon icon="mdi:content-copy" style="--mdc-icon-size: 18px;"></ha-icon>
          </button>

          <!-- Delete -->
          <button
            class="section-action-btn delete"
            title=${localize('editor.tabs_module.sections.delete', lang, 'Delete')}
            ?disabled=${!canDelete}
            @click=${() => {
              if (!canDelete) return;
              const updatedSections = sections.filter((_, i) => i !== index);
              const updates: Partial<TabsModule> = { sections: updatedSections };
              // If we're deleting the default tab, set the first section as default
              if (tabsModule.default_tab === section.id && updatedSections.length > 0) {
                updates.default_tab = updatedSections[0].id;
              }
              updateModule(updates);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
            style="opacity: ${canDelete ? 1 : 0.3}; cursor: ${canDelete ? 'pointer' : 'not-allowed'};"
          >
            <ha-icon icon="mdi:trash-can-outline" style="--mdc-icon-size: 18px;"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  // Drag and drop handlers
  private _handleDragStart(e: DragEvent, section: TabSection): void {
    this._draggedSection = section;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', section.id);
    }
    const target = e.target as HTMLElement;
    setTimeout(() => target.classList.add('dragging'), 0);
  }

  private _handleDragOver(e: DragEvent, section: TabSection): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    const target = e.currentTarget as HTMLElement;
    if (this._draggedSection && this._draggedSection.id !== section.id) {
      target.classList.add('drop-target');
    }
  }

  private _handleDragEnd(): void {
    this._draggedSection = null;
    document.querySelectorAll('.section-item').forEach(el => {
      el.classList.remove('dragging', 'drop-target');
    });
  }

  private _handleDrop(
    e: DragEvent,
    targetSection: TabSection,
    tabsModule: TabsModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    e.preventDefault();
    if (!this._draggedSection || this._draggedSection.id === targetSection.id) return;

    const sections = [...(tabsModule.sections || [])];
    const dragIndex = sections.findIndex(s => s.id === this._draggedSection!.id);
    const dropIndex = sections.findIndex(s => s.id === targetSection.id);

    if (dragIndex === -1 || dropIndex === -1) return;

    // Remove from old position and insert at new position
    const [removed] = sections.splice(dragIndex, 1);
    sections.splice(dropIndex, 0, removed);

    updateModule({ sections });
    this._handleDragEnd();
    setTimeout(() => this.triggerPreviewUpdate(), 50);
  }

  renderDesignTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const tabsModule = module as TabsModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        .design-subsection {
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          padding: 16px;
          margin-bottom: 24px;
          border-radius: 0 8px 8px 0;
        }
        .subsection-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>

      <div class="module-design-settings">
        <!-- Active Tab Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.tabs_module.design.active_title', lang, 'Active Tab Design')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.tabs.design.active_desc',
              lang,
              'Customize the appearance of the currently selected tab.'
            )}
          </div>

          <!-- Active Tab Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.active_text_color', lang, 'Text Color')}
              .value=${tabsModule.active_tab_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ active_tab_color: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Active Tab Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.active_bg_color', lang, 'Background Color')}
              .value=${tabsModule.active_tab_background || ''}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ active_tab_background: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Active Tab Border Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.active_border_color', lang, 'Border Color')}
              .value=${tabsModule.active_tab_border_color || ''}
              .defaultValue=${'transparent'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ active_tab_border_color: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Inactive Tab Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.tabs_module.design.inactive_title', lang, 'Inactive Tab Design')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.tabs.design.inactive_desc',
              lang,
              'Customize the appearance of tabs that are not selected.'
            )}
          </div>

          <!-- Inactive Tab Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.inactive_text_color', lang, 'Text Color')}
              .value=${tabsModule.inactive_tab_color || ''}
              .defaultValue=${'var(--secondary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ inactive_tab_color: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Inactive Tab Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.inactive_bg_color', lang, 'Background Color')}
              .value=${tabsModule.inactive_tab_background || ''}
              .defaultValue=${'var(--secondary-background-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ inactive_tab_background: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Inactive Tab Border Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.inactive_border_color', lang, 'Border Color')}
              .value=${tabsModule.inactive_tab_border_color || ''}
              .defaultValue=${'transparent'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ inactive_tab_border_color: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Hover State Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.tabs_module.design.hover_title', lang, 'Hover State')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.tabs.design.hover_desc',
              lang,
              'Customize the appearance when hovering over inactive tabs.'
            )}
          </div>

          <!-- Hover Tab Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.hover_text_color', lang, 'Text Color')}
              .value=${tabsModule.hover_tab_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ hover_tab_color: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Hover Tab Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.hover_bg_color', lang, 'Background Color')}
              .value=${tabsModule.hover_tab_background || ''}
              .defaultValue=${'rgba(var(--rgb-primary-color), 0.1)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ hover_tab_background: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Tab Styling -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.tabs_module.design.tab_styling_title', lang, 'Tab Styling')}
          </div>

          <!-- Tab Gap -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.tab_gap', lang, 'Gap Between Tabs'),
            localize('editor.tabs_module.design.tab_gap_desc', lang, 'Space between individual tabs (in pixels).'),
            hass,
            { tab_gap: tabsModule.tab_gap ?? 4 },
            [this.numberField('tab_gap', 0, 32, 1)],
            (e: CustomEvent) => {
              updateModule({ tab_gap: e.detail.value.tab_gap });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <!-- Tab Padding -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.tab_padding', lang, 'Tab Padding'),
            localize('editor.tabs_module.design.tab_padding_desc', lang, 'Padding inside each tab (CSS value, e.g. "10px 16px").'),
            hass,
            { tab_padding: tabsModule.tab_padding || '10px 16px' },
            [this.textField('tab_padding')],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <!-- Tab Border Radius -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.tab_border_radius', lang, 'Tab Border Radius'),
            localize('editor.tabs_module.design.tab_border_radius_desc', lang, 'Border radius for tabs (CSS value, e.g. "8px" or "50%").'),
            hass,
            { tab_border_radius: tabsModule.tab_border_radius || '8px' },
            [this.textField('tab_border_radius')],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <!-- Tab Border Width -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.tab_border_width', lang, 'Tab Border Width'),
            localize('editor.tabs_module.design.tab_border_width_desc', lang, 'Border width for tabs (in pixels).'),
            hass,
            { tab_border_width: tabsModule.tab_border_width ?? 0 },
            [this.numberField('tab_border_width', 0, 10, 1)],
            (e: CustomEvent) => {
              updateModule({ tab_border_width: e.detail.value.tab_border_width });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Content Area Design -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.tabs_module.design.content_title', lang, 'Content Area Design')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.tabs.design.content_desc',
              lang,
              'Customize the appearance of the content area below/beside the tabs.'
            )}
          </div>

          <!-- Content Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.content_bg_color', lang, 'Background Color')}
              .value=${tabsModule.content_background || ''}
              .defaultValue=${'transparent'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ content_background: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Content Padding -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.content_padding', lang, 'Content Padding'),
            localize('editor.tabs_module.design.content_padding_desc', lang, 'Padding around the content area (CSS value).'),
            hass,
            { content_padding: tabsModule.content_padding || '16px' },
            [this.textField('content_padding')],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <!-- Content Border Radius -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.content_border_radius', lang, 'Content Border Radius'),
            localize('editor.tabs_module.design.content_border_radius_desc', lang, 'Border radius for content area (CSS value).'),
            hass,
            { content_border_radius: tabsModule.content_border_radius || '0' },
            [this.textField('content_border_radius')],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <!-- Content Border Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.tabs_module.design.content_border_color', lang, 'Border Color')}
              .value=${tabsModule.content_border_color || ''}
              .defaultValue=${'transparent'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ content_border_color: e.detail.value });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Content Border Width -->
          ${this.renderFieldSection(
            localize('editor.tabs_module.design.content_border_width', lang, 'Content Border Width'),
            localize('editor.tabs_module.design.content_border_width_desc', lang, 'Border width for content area (in pixels).'),
            hass,
            { content_border_width: tabsModule.content_border_width ?? 0 },
            [this.numberField('content_border_width', 0, 10, 1)],
            (e: CustomEvent) => {
              updateModule({ content_border_width: e.detail.value.content_border_width });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Animation -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.tabs_module.design.animation_title', lang, 'Animation')}
          </div>

          ${this.renderFieldSection(
            localize('editor.tabs_module.design.transition_duration', lang, 'Transition Duration'),
            localize('editor.tabs_module.design.transition_duration_desc', lang, 'How long tab transitions take (CSS value, e.g. "0.2s").'),
            hass,
            { transition_duration: tabsModule.transition_duration || '0.2s' },
            [this.textField('transition_duration')],
            (e: CustomEvent) => {
              updateModule(e.detail.value);
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Standard Design Tab Content (from GlobalDesignTab) -->
        <div style="margin-top: 24px;">
          <div
            style="font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;"
          >
            ${localize('editor.tabs_module.design.general_title', lang, 'General Container Design')}
          </div>
          ${super.renderDesignTab(module, hass, config, updateModule)}
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
    const tabsModule = module as TabsModule;
    const lang = hass?.locale?.language || 'en';
    const sections = tabsModule.sections || [];

    if (sections.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.tabs_module.preview.no_sections', lang, 'No Sections'),
        localize('editor.tabs_module.preview.no_sections_desc', lang, 'Add sections in the General tab to get started.')
      );
    }

    // Get or initialize active tab
    let activeTabId = this.activeTabStates.get(tabsModule.id);
    if (!activeTabId || !sections.find(s => s.id === activeTabId)) {
      activeTabId = tabsModule.default_tab || sections[0]?.id;
      if (activeTabId) {
        this.activeTabStates.set(tabsModule.id, activeTabId);
      }
    }

    const activeSection = sections.find(s => s.id === activeTabId) || sections[0];
    const orientation = tabsModule.orientation || 'horizontal';
    const style = tabsModule.style || 'switch';
    const alignment = tabsModule.alignment || 'left';

    // Build styles
    const containerStyles = this._buildContainerStyles(tabsModule);
    const tabsContainerStyles = this._buildTabsContainerStyles(tabsModule, orientation, alignment);
    const contentStyles = this._buildContentStyles(tabsModule);

    const position = tabsModule.tab_position || (orientation === 'vertical' ? 'left' : 'top');
    let flexDirection = 'column';
    if (orientation === 'horizontal') {
      flexDirection = position === 'bottom' ? 'column-reverse' : 'column';
    } else {
      flexDirection = position === 'right' ? 'row-reverse' : 'row';
    }

    return html`
      <style>
        .ultra-tabs-container {
          display: flex;
          flex-direction: ${flexDirection};
        }
        .ultra-tabs-header {
          display: flex;
          flex-direction: ${orientation === 'horizontal' ? 'row' : 'column'};
          flex-wrap: nowrap;
          overflow: hidden;
          /* Hide scrollbar by default */
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ultra-tabs-header::-webkit-scrollbar {
          display: none;
        }
        .ultra-tab-btn {
          border: none;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all ${tabsModule.transition_duration || '0.2s'} ease;
          flex-shrink: 0;
        }
        .ultra-tab-btn.icon-only {
          width: fit-content;
          min-width: unset;
          aspect-ratio: 1;
        }
        .ultra-tab-btn:hover:not(.active) {
          color: ${tabsModule.hover_tab_color || 'var(--primary-text-color)'};
          background: ${tabsModule.hover_tab_background || 'rgba(var(--rgb-primary-color), 0.1)'};
        }
      </style>

      <div class="ultra-tabs-container" style="${containerStyles}">
        <!-- Tabs Header -->
        <div class="ultra-tabs-header" style="${tabsContainerStyles}">
          ${sections.map(section => this._renderTabButton(section, activeTabId!, tabsModule, hass))}
        </div>

        <!-- Tab Content -->
        <div class="ultra-tabs-content" style="${contentStyles}">
          ${activeSection ? this._renderSectionContent(activeSection, hass, config, previewContext, lang) : ''}
        </div>
      </div>
    `;
  }

  private _renderTabButton(
    section: TabSection,
    activeTabId: string,
    tabsModule: TabsModule,
    hass: HomeAssistant
  ): TemplateResult {
    const isActive = section.id === activeTabId;
    const style = tabsModule.style || 'switch';
    const hasIcon = !!section.icon;
    const hasTitle = !!section.title?.trim();
    const isIconOnly = hasIcon && !hasTitle;
    
    const buttonStyles = this._buildTabButtonStyles(tabsModule, isActive, style, isIconOnly);
    
    const handleClick = (e: Event) => {
      e.stopPropagation();
      this.activeTabStates.set(tabsModule.id, section.id);
      this.triggerPreviewUpdate(true);
    };

    const handleHover = tabsModule.switch_on_hover ? handleClick : undefined;

    // Get icon color - use custom color if set, otherwise inherit from text color
    const iconColor = tabsModule.icon_color || 'inherit';
    const iconStyle = `--mdc-icon-size: 18px; ${iconColor !== 'inherit' ? `color: ${iconColor};` : ''}`;

    return html`
      <button
        class="ultra-tab-btn ${isActive ? 'active' : ''} ${isIconOnly ? 'icon-only' : ''}"
        style="${buttonStyles}"
        @click=${handleClick}
        @mouseenter=${handleHover}
      >
        ${hasIcon ? html`<ha-icon icon="${section.icon}" style="${iconStyle}"></ha-icon>` : ''}
        ${hasTitle ? html`<span>${section.title}</span>` : ''}
      </button>
    `;
  }

  private _renderSectionContent(
    section: TabSection,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard',
    lang: string = 'en'
  ): TemplateResult {
    const hasModules = section.modules && section.modules.length > 0;
    const registry = getModuleRegistry();

    if (!hasModules) {
      return html`
        <div
          style="padding: 24px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
        >
          ${localize(
            'editor.tabs.preview.no_modules',
            lang,
            'No modules added. Add modules to this section in the Layout tab.'
          )}
        </div>
      `;
    }

    return html`
      ${section.modules.map(childModule => {
        const childModuleHandler = registry.getModule(childModule.type);
        if (!childModuleHandler) {
          return html`<div>Unknown module type: ${childModule.type}</div>`;
        }

        // Check visibility
        logicService.setHass(hass);
        const isVisible = logicService.evaluateModuleVisibility(childModule);
        if (!isVisible) return '';

        // Check Pro access for child modules
        const isProModule =
          childModuleHandler.metadata?.tags?.includes('pro') ||
          childModuleHandler.metadata?.tags?.includes('premium') ||
          false;

        let hasProAccess = false;
        const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
        if (
          integrationUser?.subscription?.tier === 'pro' &&
          integrationUser?.subscription?.status === 'active'
        ) {
          hasProAccess = true;
        }

        if (isProModule && !hasProAccess) {
          return html`
            <div
              style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-warning-color), 0.1); border: 1px dashed var(--warning-color); border-radius: 8px; margin: 8px 0;"
            >
              🔒 ${childModuleHandler.metadata.title} - Pro Feature
            </div>
          `;
        }

        return html`
          <div class="tab-child-module" style="margin-bottom: 8px;">
            ${childModuleHandler.renderPreview(childModule, hass, config, previewContext)}
          </div>
        `;
      })}
    `;
  }

  // Style building helpers
  private _buildContainerStyles(tabsModule: TabsModule): string {
    const orientation = tabsModule.orientation || 'horizontal';
    const position = tabsModule.tab_position || (orientation === 'vertical' ? 'left' : 'top');
    
    let flexDirection = 'column'; // default for horizontal top
    if (orientation === 'horizontal') {
      flexDirection = position === 'bottom' ? 'column-reverse' : 'column';
    } else {
      flexDirection = position === 'right' ? 'row-reverse' : 'row';
    }
    
    return `
      display: flex;
      flex-direction: ${flexDirection};
      width: 100%;
    `;
  }

  private _buildTabsContainerStyles(tabsModule: TabsModule, orientation: string, alignment: string): string {
    const gap = tabsModule.tab_gap ?? 4;
    const style = tabsModule.style || 'switch_1';
    
    let justifyContent = 'flex-start';
    if (alignment === 'center') justifyContent = 'center';
    else if (alignment === 'right') justifyContent = 'flex-end';
    // For stretch, we don't use justify-content, we use flex: 1 on children

    // Style-specific container backgrounds
    // Use track_background if set, otherwise use style-specific defaults
    const trackBg = tabsModule.track_background || '';
    let containerBg = trackBg || 'var(--secondary-background-color)';
    let containerPadding = '4px';
    let containerRadius = tabsModule.tab_border_radius || '8px';
    
    if (style === 'default' || style === 'simple' || style === 'simple_2' || style === 'simple_3') {
      containerBg = trackBg || 'transparent';
      containerPadding = '0';
      containerRadius = '0';
    } else if (style === 'switch_2') {
      // Pill style - match the container radius to the button radius
      containerRadius = '50px';
    } else if (style === 'switch_3') {
      containerBg = trackBg || 'rgba(0, 0, 0, 0.1)';
    } else if (style === 'modern') {
      containerBg = trackBg || 'transparent';
      containerPadding = '0';
    } else if (style === 'trendy') {
      containerBg = trackBg || 'transparent';
      containerPadding = '0';
    }

    // Check if all sections are icon-only (have icon but no title)
    const sections = tabsModule.sections || [];
    const allIconOnly = sections.length > 0 && sections.every(s => !!s.icon && !s.title?.trim());
    
    // For vertical orientation, use smaller width if all tabs are icon-only
    let verticalWidthStyle = '';
    if (orientation === 'vertical') {
      if (allIconOnly) {
        verticalWidthStyle = 'width: fit-content;';
      } else {
        verticalWidthStyle = 'min-width: 120px; max-width: 200px;';
      }
    }

    return `
      display: flex;
      flex-direction: ${orientation === 'horizontal' ? 'row' : 'column'};
      gap: ${gap}px;
      ${orientation === 'horizontal' && alignment !== 'stretch' ? `justify-content: ${justifyContent};` : ''}
      ${verticalWidthStyle}
      padding: ${containerPadding};
      background: ${containerBg};
      border-radius: ${containerRadius};
      ${style === 'simple' || style === 'default' ? 'border-bottom: 1px solid var(--divider-color);' : ''}
      ${style === 'simple_2' ? 'border-top: 1px solid var(--divider-color); border-bottom: 1px solid var(--divider-color);' : ''}
    `;
  }

  private _buildContentStyles(tabsModule: TabsModule): string {
    const padding = tabsModule.content_padding || '16px';
    const background = tabsModule.content_background || 'transparent';
    const borderRadius = tabsModule.content_border_radius || '0';
    const borderColor = tabsModule.content_border_color || 'transparent';
    const borderWidth = tabsModule.content_border_width ?? 0;

    return `
      flex: 1;
      padding: ${padding};
      background: ${background};
      border-radius: ${borderRadius};
      ${borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : ''}
    `;
  }

  private _buildTabButtonStyles(tabsModule: TabsModule, isActive: boolean, style: string, isIconOnly: boolean = false): string {
    // For icon-only tabs, use square padding; otherwise use configured padding
    const padding = isIconOnly ? '10px' : (tabsModule.tab_padding || '10px 16px');
    const fontSize = tabsModule.font_size || '14px';
    const fontWeight = tabsModule.font_weight || '500';
    const textTransform = tabsModule.text_transform || 'none';
    const borderRadius = tabsModule.tab_border_radius || '8px';
    const borderWidth = tabsModule.tab_border_width ?? 0;
    const transition = tabsModule.transition_duration || '0.2s';
    const alignment = tabsModule.alignment || 'left';

    const activeColor = tabsModule.active_tab_color || 'var(--primary-text-color)';
    const activeBg = tabsModule.active_tab_background || 'var(--primary-color)';
    const activeBorder = tabsModule.active_tab_border_color || 'transparent';
    const inactiveColor = tabsModule.inactive_tab_color || 'var(--secondary-text-color)';
    const inactiveBg = tabsModule.inactive_tab_background || 'var(--secondary-background-color)';
    const inactiveBorder = tabsModule.inactive_tab_border_color || 'transparent';

    // Base styles
    let bgColor = isActive ? activeBg : inactiveBg;
    let textColor = isActive ? activeColor : inactiveColor;
    let border = borderWidth > 0 ? `${borderWidth}px solid ${isActive ? activeBorder : inactiveBorder}` : 'none';
    let radius = borderRadius;
    let extraStyles = '';

    // Apply style-specific modifications
    switch (style) {
      case 'default':
        // Minimal underline style
        bgColor = 'transparent';
        textColor = isActive ? activeBg : inactiveColor;
        border = 'none';
        radius = '0';
        extraStyles = isActive 
          ? `border-bottom: 2px solid ${activeBg}; margin-bottom: -1px;`
          : 'border-bottom: 2px solid transparent;';
        break;

      case 'simple':
        // Clean underline
        bgColor = 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
        border = 'none';
        radius = '0';
        extraStyles = isActive
          ? `border-bottom: 2px solid ${activeBg}; margin-bottom: -1px; font-weight: 600;`
          : 'border-bottom: 2px solid transparent;';
        break;

      case 'simple_2':
        // Top and bottom border style
        bgColor = isActive ? 'rgba(var(--rgb-primary-color), 0.1)' : 'transparent';
        textColor = isActive ? activeBg : inactiveColor;
        border = 'none';
        radius = '0';
        extraStyles = isActive
          ? `border-top: 2px solid ${activeBg}; border-bottom: 2px solid ${activeBg};`
          : 'border-top: 2px solid transparent; border-bottom: 2px solid transparent;';
        break;

      case 'simple_3':
        // Full border box
        bgColor = isActive ? 'var(--card-background-color)' : 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
        radius = '4px';
        extraStyles = isActive
          ? `border: 1px solid var(--divider-color); border-bottom-color: var(--card-background-color); margin-bottom: -1px; position: relative; z-index: 1;`
          : 'border: 1px solid transparent;';
        break;

      case 'switch_1':
        // Solid background switch (default)
        bgColor = isActive ? activeBg : 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
        break;

      case 'switch_2':
        // Rounded pill switch
        radius = '50px';
        bgColor = isActive ? activeBg : 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
        break;

      case 'switch_3':
        // Dark background container switch
        bgColor = isActive ? activeBg : 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
        break;

      case 'modern':
        // Clean modern style with subtle indicator
        bgColor = 'transparent';
        textColor = isActive ? activeBg : inactiveColor;
        radius = '0';
        extraStyles = isActive
          ? `position: relative; &::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 3px; background: ${activeBg}; border-radius: 3px; }`
          : '';
        // Fallback for modern without pseudo-elements
        if (isActive) {
          extraStyles = `border-bottom: 3px solid ${activeBg}; padding-bottom: 7px;`;
        }
        break;

      case 'trendy':
        // Stylized with gradient-like accent
        bgColor = isActive ? `linear-gradient(135deg, ${activeBg}, color-mix(in srgb, ${activeBg} 70%, white))` : 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
        radius = '8px';
        extraStyles = isActive ? 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);' : '';
        break;

      default:
        // Fallback to switch_1 style
        bgColor = isActive ? activeBg : 'transparent';
        textColor = isActive ? activeColor : inactiveColor;
    }

    // Handle stretch alignment
    const flexStyle = alignment === 'stretch' ? 'flex: 1; justify-content: center;' : '';

    return `
      padding: ${padding};
      font-size: ${fontSize};
      font-weight: ${fontWeight};
      text-transform: ${textTransform};
      color: ${textColor};
      background: ${bgColor};
      border-radius: ${radius};
      border: ${border};
      transition: all ${transition} ease;
      ${extraStyles}
      ${flexStyle}
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const tabsModule = module as TabsModule;
    const errors = [...baseValidation.errors];

    // Validate sections array exists and has at least one section
    if (!tabsModule.sections || tabsModule.sections.length === 0) {
      errors.push('At least one section is required');
    }

    // Validate each section has an id and either a title or icon
    if (tabsModule.sections) {
      tabsModule.sections.forEach((section, index) => {
        if (!section.id) {
          errors.push(`Section ${index + 1} is missing an ID`);
        }
        // Section must have either a title or an icon (or both)
        const hasTitle = !!section.title?.trim();
        const hasIcon = !!section.icon;
        if (!hasTitle && !hasIcon) {
          errors.push(`Section ${index + 1} needs a title or an icon`);
        }
      });
    }

    // Validate default_tab references a valid section
    if (tabsModule.default_tab && tabsModule.sections) {
      const defaultTabExists = tabsModule.sections.some(s => s.id === tabsModule.default_tab);
      if (!defaultTabExists) {
        errors.push('Default tab references a non-existent section');
      }
    }

    // Prevent tabs-in-tabs nesting
    if (tabsModule.sections) {
      for (const section of tabsModule.sections) {
        if (section.modules) {
          for (const childModule of section.modules) {
            if (childModule.type === 'tabs') {
              errors.push('Tabs modules cannot be nested inside other tabs');
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

