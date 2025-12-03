import { TemplateResult, html, css } from 'lit';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, StatusSummaryModule, StatusSummaryEntity, UltraCardConfig } from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { TemplateService } from '../services/template-service';
import { localize } from '../localize/localize';
import '../components/ultra-color-picker';

export class UltraStatusSummaryModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'status_summary',
    title: 'Status Summary',
    description: 'Display entity activity with timestamps and customizable color coding',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:format-list-bulleted-square',
    category: 'data',
    tags: ['status', 'activity', 'monitor', 'summary', 'entities', 'tracking'],
  };

  private _templateService?: TemplateService;
  private _expandedEntities: Set<string> = new Set();
  private _draggedItem: StatusSummaryEntity | null = null;
  private _hass?: HomeAssistant;

  createDefault(id?: string, hass?: HomeAssistant): StatusSummaryModule {
    // Create a default entity for demonstration
    const defaultEntity: StatusSummaryEntity = {
      id: this.generateId('status_entity'),
      entity: '',
      color_mode: 'state',
      state_colors: {
        on: 'yellow',
        off: 'gray',
      },
    };

    return {
      id: id || this.generateId('status_summary'),
      type: 'status_summary',

      // Entity Management
      entities: [defaultEntity],

      // Auto-filtering
      enable_auto_filter: false,
      include_filters: [],
      exclude_filters: [],

      // Time Filtering
      max_time_since_change: undefined,

      // Display Options
      title: 'Status Summary',
      show_title: true,
      show_last_change_header: true,
      show_time_header: false,
      sort_by: 'last_change',
      sort_direction: 'desc',
      max_items_to_show: 50,

      // Global display settings
      global_show_icon: true,
      global_show_state: false,

      // Layout
      row_height: 40,
      row_gap: 4,
      max_entity_name_length: 30,
      show_separator_lines: true,

      // Global color mode
      global_color_mode: 'none',
      global_state_colors: {},
      global_time_colors: [],
      global_custom_color_template: '',

      // Default colors
      default_text_color: 'var(--primary-text-color)',
      default_icon_color: 'var(--primary-color)',
      header_text_color: 'var(--primary-text-color)',
      header_background_color: 'var(--secondary-background-color)',

      // Template support
      template_mode: false,
      template: '',
      unified_template_mode: false,
      unified_template: '',

      // Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Logic
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const summaryModule = module as StatusSummaryModule;
    const errors = [...baseValidation.errors];

    // If auto-filter is enabled, we don't require manual entities
    // Auto-filtered entities will be synced automatically
    if (!summaryModule.enable_auto_filter) {
      // Check that at least one entity is configured when auto-filter is off
      if (!summaryModule.entities || summaryModule.entities.length === 0) {
        errors.push('At least one entity must be configured, or auto-filter must be enabled');
      }

      // Validate each manual entity
      if (summaryModule.entities) {
        summaryModule.entities.forEach((entity, index) => {
          if (!entity.entity || entity.entity.trim() === '') {
            errors.push(`Entity ${index + 1} must have an entity ID configured`);
          }
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as StatusSummaryModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as StatusSummaryModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const summaryModule = module as StatusSummaryModule;
    const lang = hass?.locale?.language || 'en';
    this._hass = hass; // Store hass for use in private methods

    // Migrate entities to use global settings (remove hardcoded show_icon/show_state if they match global defaults)
    this.migrateEntitiesToGlobalSettings(summaryModule, updateModule);

    // Sync auto-filtered entities when auto-filter is enabled
    if (summaryModule.enable_auto_filter && hass) {
      this.syncAutoFilteredEntities(summaryModule, hass, updateModule);
    }

    return html`
      ${this.injectUcFormStyles()}
      <style>
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
          padding-bottom: 8px;
          border-bottom: 2px solid var(--primary-color);
          letter-spacing: 0.5px;
        }

        .entity-rows-container {
          margin-top: 16px;
        }

        .entity-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: move;
          border: 1px solid var(--divider-color);
          transition: all 0.2s ease;
        }

        .entity-row:hover {
          background: var(--primary-color);
          opacity: 0.9;
        }

        .entity-row.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .entity-row.drag-over {
          border-top: 3px solid var(--primary-color);
        }

        .entity-row.auto-generated {
          border-left: 3px solid var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.05);
        }

        .lock-icon {
          flex-shrink: 0;
        }

        .drag-handle {
          cursor: grab;
          color: var(--secondary-text-color);
          flex-shrink: 0;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .entity-info {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entity-info.no-entity {
          color: var(--secondary-text-color);
          font-style: italic;
        }

        .expand-icon {
          cursor: pointer;
          color: var(--primary-color);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .expand-icon.expanded {
          transform: rotate(180deg);
        }

        .delete-icon {
          cursor: pointer;
          color: var(--error-color);
          flex-shrink: 0;
        }

        .delete-icon:hover {
          opacity: 0.7;
        }

        .entity-settings {
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          border-radius: 0 8px 8px 0;
          margin-bottom: 8px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .add-entity-btn {
          width: 100%;
          padding: 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .add-entity-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .state-color-editor {
          margin-top: 12px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 4px;
        }

        .state-color-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 16px;
        }

        .state-color-input {
          flex: 0 0 150px;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }

        .time-threshold-editor {
          margin-top: 12px;
        }

        .time-threshold-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-radius: 16px;
          font-size: 13px;
          margin: 4px;
          transition: all 0.2s ease;
          position: relative;
        }

        .filter-chip.exclude-chip {
          background: var(--error-color);
        }

        .filter-chip:hover {
          opacity: 0.9;
          padding-right: 32px;
        }

        .chip-remove-icon {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.2s ease;
        }

        .filter-chip:hover .chip-remove-icon {
          opacity: 1;
        }

        .domain-input-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
      </style>

      <div class="module-settings">
        <!-- Title & Display Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.title_display', lang, 'TITLE & DISPLAY')}
          </div>

          ${UcFormUtils.renderFieldSection(
            localize('editor.status_summary.title', lang, 'Title'),
            localize(
              'editor.status_summary.title_desc',
              lang,
              'Title to display at the top of the summary.'
            ),
            hass,
            { title: summaryModule.title || 'Status Summary' },
            [UcFormUtils.text('title')],
            (e: CustomEvent) => updateModule({ title: e.detail.value.title })
          )}
          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.status_summary.show_title', lang, 'Show Title'),
              description: localize(
                'editor.status_summary.show_title_desc',
                lang,
                'Display the title at the top of the summary.'
              ),
              hass,
              data: { show_title: summaryModule.show_title },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => updateModule({ show_title: e.detail.value.show_title }),
            },
            {
              title: localize(
                'editor.status_summary.show_last_change_header',
                lang,
                'Show Last Change Header'
              ),
              description: localize(
                'editor.status_summary.show_last_change_header_desc',
                lang,
                'Display "Last Change" column header.'
              ),
              hass,
              data: { show_last_change_header: summaryModule.show_last_change_header },
              schema: [this.booleanField('show_last_change_header')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_last_change_header: e.detail.value.show_last_change_header }),
            },
            {
              title: localize('editor.status_summary.show_time_header', lang, 'Show Time Header'),
              description: localize(
                'editor.status_summary.show_time_header_desc',
                lang,
                'Display "Time" column header.'
              ),
              hass,
              data: { show_time_header: summaryModule.show_time_header },
              schema: [this.booleanField('show_time_header')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_time_header: e.detail.value.show_time_header }),
            },
          ])}
          ${this.renderFieldSection(
            localize('editor.status_summary.sort_by', lang, 'Sort By'),
            localize('editor.status_summary.sort_by_desc', lang, 'How to sort the entity list.'),
            hass,
            { sort_by: summaryModule.sort_by || 'last_change' },
            [
              this.selectField('sort_by', [
                { value: 'name', label: 'Name' },
                { value: 'last_change', label: 'Last Change' },
                { value: 'custom', label: 'Custom Order' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ sort_by: e.detail.value.sort_by })
          )}
          ${this.renderFieldSection(
            localize('editor.status_summary.sort_direction', lang, 'Sort Direction'),
            localize('editor.status_summary.sort_direction_desc', lang, 'Sort order direction.'),
            hass,
            { sort_direction: summaryModule.sort_direction || 'asc' },
            [
              this.selectField('sort_direction', [
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' },
              ]),
            ],
            (e: CustomEvent) => updateModule({ sort_direction: e.detail.value.sort_direction })
          )}
          ${UcFormUtils.renderFieldSection(
            localize('editor.status_summary.max_items_to_show', lang, 'Max Items to Show'),
            localize(
              'editor.status_summary.max_items_to_show_desc',
              lang,
              'Maximum number of entities to display. Set to 0 for unlimited.'
            ),
            hass,
            { max_items_to_show: summaryModule.max_items_to_show || 50 },
            [UcFormUtils.number('max_items_to_show', 0, 1000, 1)],
            (e: CustomEvent) => {
              const value = e.detail.value.max_items_to_show;
              updateModule({ max_items_to_show: value === 0 ? undefined : value });
            }
          )}
        </div>

        <!-- Global Display Settings Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize(
              'editor.status_summary.global_display_settings',
              lang,
              'GLOBAL DISPLAY SETTINGS'
            )}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${localize(
              'editor.status_summary.global_display_settings_desc',
              lang,
              'Set default display options for all entities. Individual entity settings will override these.'
            )}
          </div>

          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.status_summary.global_show_icon', lang, 'Show Icons'),
              description: localize(
                'editor.status_summary.global_show_icon_desc',
                lang,
                'Display entity icons by default for all entities.'
              ),
              hass,
              data: { global_show_icon: summaryModule.global_show_icon },
              schema: [this.booleanField('global_show_icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ global_show_icon: e.detail.value.global_show_icon }),
            },
            {
              title: localize('editor.status_summary.global_show_state', lang, 'Show States'),
              description: localize(
                'editor.status_summary.global_show_state_desc',
                lang,
                'Display entity states (e.g., "on", "off") by default for all entities.'
              ),
              hass,
              data: { global_show_state: summaryModule.global_show_state },
              schema: [this.booleanField('global_show_state')],
              onChange: (e: CustomEvent) =>
                updateModule({ global_show_state: e.detail.value.global_show_state }),
            },
          ])}
        </div>

        <!-- Entity Management Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.entity_management', lang, 'ENTITY MANAGEMENT')}
          </div>

          <div class="entity-rows-container">
            ${summaryModule.entities.map((entity, index) =>
              this.renderEntityRow(entity, index, summaryModule, hass, updateModule)
            )}
          </div>

          <button
            class="add-entity-btn"
            @click=${() => this.addEntity(summaryModule, updateModule)}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            ${localize('editor.status_summary.add_entity', lang, 'Add Entity')}
          </button>
        </div>

        <!-- Auto Filter Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.auto_filter', lang, 'AUTO FILTER')}
          </div>

          ${this.renderSettingsSection('', '', [
            {
              title: localize(
                'editor.status_summary.enable_auto_filter',
                lang,
                'Enable Auto Filter'
              ),
              description: localize(
                'editor.status_summary.enable_auto_filter_desc',
                lang,
                'Automatically include entities based on domain and device class filters.'
              ),
              hass,
              data: { enable_auto_filter: summaryModule.enable_auto_filter },
              schema: [this.booleanField('enable_auto_filter')],
              onChange: (e: CustomEvent) =>
                updateModule({ enable_auto_filter: e.detail.value.enable_auto_filter }),
            },
          ])}
          ${summaryModule.enable_auto_filter
            ? html`
                <div style="margin-top: 16px;">
                  <!-- Include Filters -->
                  <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    ${localize('editor.status_summary.include_filters', lang, 'Include Filters')}
                  </div>
                  <div
                    style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
                  >
                    ${localize(
                      'editor.status_summary.include_filters_desc',
                      lang,
                      'Add domains or partial names to include. Examples: "binary_sensor", "light", "garage", "kitchen"'
                    )}
                  </div>
                  <div
                    style="font-size: 11px; color: var(--secondary-text-color); margin-bottom: 8px; font-style: italic;"
                  >
                    Common domains: binary_sensor, light, switch, sensor, climate, cover, fan, lock,
                    media_player
                  </div>

                  <!-- Include filter tags -->
                  <div style="margin-bottom: 8px; min-height: 32px;">
                    ${(summaryModule.include_filters || []).map(
                      filter => html`
                        <span class="filter-chip">
                          ${filter}
                          <ha-icon
                            icon="mdi:close"
                            class="chip-remove-icon"
                            @click=${(e: Event) =>
                              this.removeFilter('include', filter, summaryModule, updateModule, e)}
                          ></ha-icon>
                        </span>
                      `
                    )}
                  </div>

                  <div class="domain-input-row">
                    <input
                      type="text"
                      class="state-color-input"
                      placeholder="e.g., binary_sensor, garage, kitchen"
                      @keydown=${(e: KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          this.addFilter('include', summaryModule, updateModule, e);
                        }
                      }}
                    />
                    <button
                      class="add-entity-btn"
                      style="width: auto; padding: 8px 16px;"
                      @click=${(e: Event) =>
                        this.addFilter('include', summaryModule, updateModule, e)}
                    >
                      <ha-icon icon="mdi:plus"></ha-icon>
                    </button>
                  </div>

                  <!-- Exclude Filters -->
                  <div style="margin-top: 24px;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                      ${localize('editor.status_summary.exclude_filters', lang, 'Exclude Filters')}
                    </div>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.status_summary.exclude_filters_desc',
                        lang,
                        'Add domains or partial names to exclude. Examples: "battery", "update", "unavailable"'
                      )}
                    </div>

                    <!-- Exclude filter tags -->
                    <div style="margin-bottom: 8px; min-height: 32px;">
                      ${(summaryModule.exclude_filters || []).map(
                        filter => html`
                          <span class="filter-chip exclude-chip">
                            ${filter}
                            <ha-icon
                              icon="mdi:close"
                              class="chip-remove-icon"
                              @click=${(e: Event) =>
                                this.removeFilter(
                                  'exclude',
                                  filter,
                                  summaryModule,
                                  updateModule,
                                  e
                                )}
                            ></ha-icon>
                          </span>
                        `
                      )}
                    </div>

                    <div class="domain-input-row">
                      <input
                        type="text"
                        class="state-color-input"
                        placeholder="e.g., battery, update, unavailable"
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            this.addFilter('exclude', summaryModule, updateModule, e);
                          }
                        }}
                      />
                      <button
                        class="add-entity-btn"
                        style="width: auto; padding: 8px 16px;"
                        @click=${(e: Event) =>
                          this.addFilter('exclude', summaryModule, updateModule, e)}
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                      </button>
                    </div>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Global Color Mode Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.global_color_mode', lang, 'GLOBAL COLOR MODE')}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${localize(
              'editor.status_summary.global_color_mode_desc',
              lang,
              'Set a default color mode for all entities. Individual entity color modes will override this setting.'
            )}
          </div>

          ${this.renderFieldSection(
            localize('editor.status_summary.global_color_mode_select', lang, 'Global Color Mode'),
            localize(
              'editor.status_summary.global_color_mode_select_desc',
              lang,
              'How to determine colors for entities by default.'
            ),
            hass,
            { global_color_mode: summaryModule.global_color_mode || 'none' },
            [
              this.selectField('global_color_mode', [
                { value: 'none', label: 'None (Use Default Colors)' },
                { value: 'state', label: 'State-based' },
                { value: 'time', label: 'Time-based' },
                { value: 'custom', label: 'Custom Template' },
              ]),
            ],
            (e: CustomEvent) =>
              updateModule({ global_color_mode: e.detail.value.global_color_mode })
          )}
          ${summaryModule.global_color_mode === 'state'
            ? this.renderGlobalStateColorEditor(summaryModule, updateModule, lang)
            : ''}
          ${summaryModule.global_color_mode === 'time'
            ? this.renderGlobalTimeColorEditor(summaryModule, updateModule, lang)
            : ''}
          ${summaryModule.global_color_mode === 'custom'
            ? html`
                ${UcFormUtils.renderFieldSection(
                  localize(
                    'editor.status_summary.global_custom_color_template',
                    lang,
                    'Global Custom Color Template'
                  ),
                  localize(
                    'editor.status_summary.global_custom_color_template_desc',
                    lang,
                    'Template that returns a color value for all entities.'
                  ),
                  hass,
                  {
                    global_custom_color_template: summaryModule.global_custom_color_template || '',
                  },
                  [UcFormUtils.text('global_custom_color_template', true)],
                  (e: CustomEvent) =>
                    updateModule({
                      global_custom_color_template: e.detail.value.global_custom_color_template,
                    })
                )}
              `
            : ''}
        </div>

        <!-- Time Filtering Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.time_filtering', lang, 'TIME FILTERING')}
          </div>

          ${UcFormUtils.renderFieldSection(
            localize(
              'editor.status_summary.max_time_since_change',
              lang,
              'Max Time Since Change (minutes)'
            ),
            localize(
              'editor.status_summary.max_time_since_change_desc',
              lang,
              "Hide entities that haven't changed in this many minutes. Leave empty for no limit."
            ),
            hass,
            { max_time_since_change: summaryModule.max_time_since_change || '' },
            [UcFormUtils.number('max_time_since_change', 0, 10080, 1)],
            (e: CustomEvent) => {
              const value = e.detail.value.max_time_since_change;
              updateModule({ max_time_since_change: value === '' ? undefined : value });
            }
          )}
        </div>

        <!-- Layout Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.layout', lang, 'LAYOUT')}
          </div>

          ${UcFormUtils.renderFieldSection(
            localize('editor.status_summary.row_height', lang, 'Row Height (px)'),
            localize(
              'editor.status_summary.row_height_desc',
              lang,
              'Height of each entity row in pixels.'
            ),
            hass,
            { row_height: summaryModule.row_height || 40 },
            [UcFormUtils.number('row_height', 20, 100, 1)],
            (e: CustomEvent) => updateModule({ row_height: e.detail.value.row_height })
          )}
          ${UcFormUtils.renderFieldSection(
            localize('editor.status_summary.row_gap', lang, 'Row Gap (px)'),
            localize(
              'editor.status_summary.row_gap_desc',
              lang,
              'Gap between entity rows in pixels.'
            ),
            hass,
            { row_gap: summaryModule.row_gap || 4 },
            [UcFormUtils.number('row_gap', 0, 20, 1)],
            (e: CustomEvent) => updateModule({ row_gap: e.detail.value.row_gap })
          )}
          ${UcFormUtils.renderFieldSection(
            localize(
              'editor.status_summary.max_entity_name_length',
              lang,
              'Max Entity Name Length'
            ),
            localize(
              'editor.status_summary.max_entity_name_length_desc',
              lang,
              'Maximum number of characters to display for entity names before truncating.'
            ),
            hass,
            { max_entity_name_length: summaryModule.max_entity_name_length || 30 },
            [UcFormUtils.number('max_entity_name_length', 10, 100, 1)],
            (e: CustomEvent) =>
              updateModule({ max_entity_name_length: e.detail.value.max_entity_name_length })
          )}
          ${this.renderSettingsSection('', '', [
            {
              title: localize(
                'editor.status_summary.show_separator_lines',
                lang,
                'Show Separator Lines'
              ),
              description: localize(
                'editor.status_summary.show_separator_lines_desc',
                lang,
                'Display lines between entity rows.'
              ),
              hass,
              data: { show_separator_lines: summaryModule.show_separator_lines },
              schema: [this.booleanField('show_separator_lines')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_separator_lines: e.detail.value.show_separator_lines }),
            },
          ])}
        </div>

        <!-- Default Colors Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.status_summary.default_colors', lang, 'DEFAULT COLORS')}
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize(
                'editor.status_summary.default_text_color',
                lang,
                'Default Text Color'
              )}
              .value=${summaryModule.default_text_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ default_text_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize(
                'editor.status_summary.default_icon_color',
                lang,
                'Default Icon Color'
              )}
              .value=${summaryModule.default_icon_color || ''}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ default_icon_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize(
                'editor.status_summary.header_text_color',
                lang,
                'Header Text Color'
              )}
              .value=${summaryModule.header_text_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ header_text_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>

          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize(
                'editor.status_summary.header_background_color',
                lang,
                'Header Background Color'
              )}
              .value=${summaryModule.header_background_color || ''}
              .defaultValue=${'var(--secondary-background-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                updateModule({ header_background_color: e.detail.value });
              }}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  private renderEntityRow(
    entity: StatusSummaryEntity,
    index: number,
    module: StatusSummaryModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): TemplateResult {
    const isExpanded = this._expandedEntities.has(entity.id);
    const lang = hass?.locale?.language || 'en';
    const isAutoGenerated = entity.is_auto_generated || false;

    return html`
      <div
        class="entity-row ${this._draggedItem?.id === entity.id ? 'dragging' : ''} ${isAutoGenerated
          ? 'auto-generated'
          : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this.handleDragStart(e, entity)}
        @dragend=${() => this.handleDragEnd()}
        @dragover=${(e: DragEvent) => this.handleDragOver(e)}
        @drop=${(e: DragEvent) => this.handleDrop(e, index, module, updateModule)}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <div class="entity-info ${!entity.entity ? 'no-entity' : ''}">
          ${isAutoGenerated
            ? html`<ha-icon
                icon="mdi:auto-fix"
                style="margin-right: 4px; color: var(--primary-color);"
              ></ha-icon>`
            : ''}
          ${entity.entity || 'No entity selected'}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${isExpanded ? 'expanded' : ''}"
          @click=${() => this.toggleExpand(entity.id)}
        ></ha-icon>
        ${!isAutoGenerated
          ? html`
              <ha-icon
                icon="mdi:delete"
                class="delete-icon"
                @click=${() => this.deleteEntity(index, module, updateModule)}
              ></ha-icon>
            `
          : html`
              <ha-icon
                icon="mdi:lock"
                class="lock-icon"
                style="color: var(--secondary-text-color); cursor: help;"
                title="Auto-generated from filters. Adjust filters to remove."
              ></ha-icon>
            `}
      </div>

      ${isExpanded
        ? html`
            <div class="entity-settings">
              ${isAutoGenerated
                ? html`
                    <div
                      style="background: rgba(var(--rgb-primary-color), 0.1); padding: 12px; border-radius: 4px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
                    >
                      <ha-icon
                        icon="mdi:information"
                        style="color: var(--primary-color);"
                      ></ha-icon>
                      <div style="font-size: 13px; color: var(--primary-text-color);">
                        This entity was auto-generated from your filters. You can customize its
                        appearance, but it will be removed if it no longer matches your filters.
                      </div>
                    </div>
                  `
                : ''}
              ${!isAutoGenerated
                ? html`
                    ${UcFormUtils.renderFieldSection(
                      localize('editor.status_summary.entity', lang, 'Entity'),
                      localize(
                        'editor.status_summary.entity_desc',
                        lang,
                        'Entity to monitor for status.'
                      ),
                      hass,
                      { entity: entity.entity || '' },
                      [UcFormUtils.entity('entity')],
                      (e: CustomEvent) =>
                        this.updateEntity(
                          index,
                          { entity: e.detail.value.entity },
                          module,
                          updateModule
                        )
                    )}
                  `
                : html`
                    <div style="margin-bottom: 16px;">
                      <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
                        Entity
                      </div>
                      <div
                        style="font-size: 13px; color: var(--secondary-text-color); padding: 8px; background: var(--secondary-background-color); border-radius: 4px;"
                      >
                        ${entity.entity}
                      </div>
                    </div>
                  `}
              ${UcFormUtils.renderFieldSection(
                localize('editor.status_summary.label', lang, 'Label Override'),
                localize(
                  'editor.status_summary.label_desc',
                  lang,
                  'Custom label to display instead of entity name.'
                ),
                hass,
                { label: entity.label || '' },
                [UcFormUtils.text('label')],
                (e: CustomEvent) =>
                  this.updateEntity(index, { label: e.detail.value.label }, module, updateModule)
              )}
              ${UcFormUtils.renderFieldSection(
                localize('editor.status_summary.icon', lang, 'Icon Override'),
                localize(
                  'editor.status_summary.icon_desc',
                  lang,
                  'Custom icon to display instead of entity icon.'
                ),
                hass,
                { icon: entity.icon || '' },
                [UcFormUtils.icon('icon')],
                (e: CustomEvent) =>
                  this.updateEntity(index, { icon: e.detail.value.icon }, module, updateModule)
              )}
              ${this.renderSettingsSection('', '', [
                {
                  title: localize('editor.status_summary.show_icon', lang, 'Show Icon'),
                  description: localize(
                    'editor.status_summary.show_icon_desc',
                    lang,
                    'Display entity icon. Leave unset to use global setting.'
                  ),
                  hass,
                  data: {
                    show_icon:
                      entity.show_icon !== undefined ? entity.show_icon : module.global_show_icon,
                  },
                  schema: [this.booleanField('show_icon')],
                  onChange: (e: CustomEvent) =>
                    this.updateEntity(
                      index,
                      { show_icon: e.detail.value.show_icon },
                      module,
                      updateModule
                    ),
                },
                {
                  title: localize('editor.status_summary.show_state', lang, 'Show State'),
                  description: localize(
                    'editor.status_summary.show_state_desc',
                    lang,
                    'Display entity state. Leave unset to use global setting.'
                  ),
                  hass,
                  data: {
                    show_state:
                      entity.show_state !== undefined
                        ? entity.show_state
                        : module.global_show_state,
                  },
                  schema: [this.booleanField('show_state')],
                  onChange: (e: CustomEvent) =>
                    this.updateEntity(
                      index,
                      { show_state: e.detail.value.show_state },
                      module,
                      updateModule
                    ),
                },
              ])}
              ${this.renderFieldSection(
                localize('editor.status_summary.color_mode', lang, 'Color Mode'),
                localize(
                  'editor.status_summary.color_mode_desc',
                  lang,
                  'How to determine the color for this entity.'
                ),
                hass,
                { color_mode: entity.color_mode || 'none' },
                [
                  this.selectField('color_mode', [
                    { value: 'none', label: 'None (Use Default)' },
                    { value: 'state', label: 'State-based' },
                    { value: 'time', label: 'Time-based' },
                    { value: 'custom', label: 'Custom Template' },
                  ]),
                ],
                (e: CustomEvent) =>
                  this.updateEntity(
                    index,
                    { color_mode: e.detail.value.color_mode },
                    module,
                    updateModule
                  )
              )}
              ${entity.color_mode === 'state'
                ? this.renderStateColorEditor(entity, index, module, updateModule, lang)
                : ''}
              ${entity.color_mode === 'time'
                ? this.renderTimeColorEditor(entity, index, module, updateModule, lang)
                : ''}
              ${entity.color_mode === 'custom'
                ? html`
                    ${UcFormUtils.renderFieldSection(
                      localize(
                        'editor.status_summary.custom_color_template',
                        lang,
                        'Custom Color Template'
                      ),
                      localize(
                        'editor.status_summary.custom_color_template_desc',
                        lang,
                        'Template that returns a color value.'
                      ),
                      hass,
                      { custom_color_template: entity.custom_color_template || '' },
                      [UcFormUtils.text('custom_color_template', true)],
                      (e: CustomEvent) =>
                        this.updateEntity(
                          index,
                          { custom_color_template: e.detail.value.custom_color_template },
                          module,
                          updateModule
                        )
                    )}
                  `
                : ''}
            </div>
          `
        : ''}
    `;
  }

  // Global color mode editors
  private renderGlobalStateColorEditor(
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void,
    lang: string
  ): TemplateResult {
    const stateColors = module.global_state_colors || {};
    const hass = this._hass;

    return html`
      <div class="state-color-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.status_summary.global_state_colors', lang, 'Global State Colors')}
        </div>
        ${Object.entries(stateColors).map(
          ([state, color]) => html`
            <div class="state-color-row">
              <input
                type="text"
                class="state-color-input"
                placeholder="State (e.g., on, off)"
                .value=${state}
                @input=${(e: Event) =>
                  this.updateGlobalStateColor(
                    state,
                    (e.target as HTMLInputElement).value,
                    color,
                    module,
                    updateModule
                  )}
              />
              <ultra-color-picker
                .label=${''}
                .value=${color}
                .defaultValue=${'gray'}
                .hass=${hass}
                style="flex: 1;"
                @value-changed=${(e: CustomEvent) => {
                  this.updateGlobalStateColor(state, state, e.detail.value, module, updateModule);
                }}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${() => this.removeGlobalStateColor(state, module, updateModule)}
              ></ha-icon>
            </div>
          `
        )}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${() => this.addGlobalStateColor(module, updateModule)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.status_summary.add_state_color', lang, 'Add State Color')}
        </button>
      </div>
    `;
  }

  private renderGlobalTimeColorEditor(
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void,
    lang: string
  ): TemplateResult {
    const timeColors = module.global_time_colors || [];
    const hass = this._hass;

    return html`
      <div class="time-threshold-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize(
            'editor.status_summary.global_time_thresholds',
            lang,
            'Global Time Thresholds'
          )}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Threshold is the maximum minutes since last change. If the entity changed within this
          time, apply the color.
        </div>
        ${timeColors.map(
          (threshold, thresholdIndex) => html`
            <div class="time-threshold-row">
              <input
                type="number"
                class="state-color-input"
                placeholder="Minutes"
                style="flex: 0 0 120px;"
                .value=${threshold.threshold.toString()}
                @input=${(e: Event) =>
                  this.updateGlobalTimeThreshold(
                    thresholdIndex,
                    parseInt((e.target as HTMLInputElement).value) || 0,
                    threshold.color,
                    module,
                    updateModule
                  )}
              />
              <ultra-color-picker
                .label=${''}
                .value=${threshold.color}
                .defaultValue=${'gray'}
                .hass=${hass}
                style="flex: 1;"
                @value-changed=${(e: CustomEvent) => {
                  this.updateGlobalTimeThreshold(
                    thresholdIndex,
                    threshold.threshold,
                    e.detail.value,
                    module,
                    updateModule
                  );
                }}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${() => this.removeGlobalTimeThreshold(thresholdIndex, module, updateModule)}
              ></ha-icon>
            </div>
          `
        )}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${() => this.addGlobalTimeThreshold(module, updateModule)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.status_summary.add_time_threshold', lang, 'Add Time Threshold')}
        </button>
      </div>
    `;
  }

  private renderStateColorEditor(
    entity: StatusSummaryEntity,
    index: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void,
    lang: string
  ): TemplateResult {
    const stateColors = entity.state_colors || {};
    const hass = (this as any)._hass; // Get hass from component context

    return html`
      <div class="state-color-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.status_summary.state_colors', lang, 'State Colors')}
        </div>
        ${Object.entries(stateColors).map(
          ([state, color]) => html`
            <div class="state-color-row">
              <input
                type="text"
                class="state-color-input"
                placeholder="State (e.g., on, off)"
                .value=${state}
                @input=${(e: Event) =>
                  this.updateStateColor(
                    index,
                    state,
                    (e.target as HTMLInputElement).value,
                    color,
                    module,
                    updateModule
                  )}
              />
              <ultra-color-picker
                .label=${''}
                .value=${color}
                .defaultValue=${'gray'}
                .hass=${hass}
                style="flex: 1;"
                @value-changed=${(e: CustomEvent) => {
                  this.updateStateColor(index, state, state, e.detail.value, module, updateModule);
                }}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${() => this.removeStateColor(index, state, module, updateModule)}
              ></ha-icon>
            </div>
          `
        )}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${() => this.addStateColor(index, module, updateModule)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.status_summary.add_state_color', lang, 'Add State Color')}
        </button>
      </div>
    `;
  }

  private renderTimeColorEditor(
    entity: StatusSummaryEntity,
    index: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void,
    lang: string
  ): TemplateResult {
    const timeColors = entity.time_colors || [];
    const hass = (this as any)._hass; // Get hass from component context

    return html`
      <div class="time-threshold-editor">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.status_summary.time_thresholds', lang, 'Time Thresholds')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          Threshold is the maximum minutes since last change. If the entity changed within this
          time, apply the color.
        </div>
        ${timeColors.map(
          (threshold, thresholdIndex) => html`
            <div class="time-threshold-row">
              <input
                type="number"
                class="state-color-input"
                placeholder="Minutes"
                style="flex: 0 0 120px;"
                .value=${threshold.threshold.toString()}
                @input=${(e: Event) =>
                  this.updateTimeThreshold(
                    index,
                    thresholdIndex,
                    parseInt((e.target as HTMLInputElement).value) || 0,
                    threshold.color,
                    module,
                    updateModule
                  )}
              />
              <ultra-color-picker
                .label=${''}
                .value=${threshold.color}
                .defaultValue=${'gray'}
                .hass=${hass}
                style="flex: 1;"
                @value-changed=${(e: CustomEvent) => {
                  this.updateTimeThreshold(
                    index,
                    thresholdIndex,
                    threshold.threshold,
                    e.detail.value,
                    module,
                    updateModule
                  );
                }}
              ></ultra-color-picker>
              <ha-icon
                icon="mdi:delete"
                style="cursor: pointer; color: var(--error-color); margin-left: 8px; flex-shrink: 0;"
                @click=${() =>
                  this.removeTimeThreshold(index, thresholdIndex, module, updateModule)}
              ></ha-icon>
            </div>
          `
        )}
        <button
          class="add-entity-btn"
          style="margin-top: 8px;"
          @click=${() => this.addTimeThreshold(index, module, updateModule)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.status_summary.add_time_threshold', lang, 'Add Time Threshold')}
        </button>
      </div>
    `;
  }

  // Entity management methods
  private addEntity(
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const newEntity: StatusSummaryEntity = {
      id: this.generateId('status_entity'),
      entity: '',
      show_icon: true,
      show_state: true,
      color_mode: 'none',
    };

    const entities = [...module.entities, newEntity];
    updateModule({ entities });
    this._expandedEntities.add(newEntity.id);
  }

  private deleteEntity(
    index: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const removed = entities.splice(index, 1);
    if (removed[0]) {
      this._expandedEntities.delete(removed[0].id);
    }
    updateModule({ entities });
  }

  private updateEntity(
    index: number,
    updates: Partial<StatusSummaryEntity>,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    entities[index] = { ...entities[index], ...updates };
    updateModule({ entities });
  }

  private toggleExpand(entityId: string): void {
    if (this._expandedEntities.has(entityId)) {
      this._expandedEntities.delete(entityId);
    } else {
      this._expandedEntities.add(entityId);
    }
    // Trigger a re-render by dispatching a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
    }
  }

  // Drag and drop methods
  private handleDragStart(e: DragEvent, entity: StatusSummaryEntity): void {
    this._draggedItem = entity;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  private handleDragEnd(): void {
    this._draggedItem = null;
    // Trigger a re-render by dispatching a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
    }
  }

  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  private handleDrop(
    e: DragEvent,
    dropIndex: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    e.preventDefault();
    if (!this._draggedItem) return;

    const entities = [...module.entities];
    const dragIndex = entities.findIndex(e => e.id === this._draggedItem!.id);

    if (dragIndex === -1 || dragIndex === dropIndex) return;

    // Remove from old position
    const [removed] = entities.splice(dragIndex, 1);
    // Insert at new position
    entities.splice(dropIndex, 0, removed);

    updateModule({ entities });
    this._draggedItem = null;
  }

  // Global state color methods
  private addGlobalStateColor(
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const stateColors = { ...(module.global_state_colors || {}), new_state: 'gray' };
    updateModule({ global_state_colors: stateColors });
  }

  private removeGlobalStateColor(
    state: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const stateColors = { ...(module.global_state_colors || {}) };
    delete stateColors[state];
    updateModule({ global_state_colors: stateColors });
  }

  private updateGlobalStateColor(
    oldState: string,
    newState: string,
    color: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const stateColors = { ...(module.global_state_colors || {}) };

    if (oldState !== newState) {
      delete stateColors[oldState];
    }
    stateColors[newState] = color;

    updateModule({ global_state_colors: stateColors });
  }

  // Global time threshold methods
  private addGlobalTimeThreshold(
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const timeColors = [...(module.global_time_colors || []), { threshold: 60, color: 'gray' }];
    updateModule({ global_time_colors: timeColors });
  }

  private removeGlobalTimeThreshold(
    thresholdIndex: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const timeColors = [...(module.global_time_colors || [])];
    timeColors.splice(thresholdIndex, 1);
    updateModule({ global_time_colors: timeColors });
  }

  private updateGlobalTimeThreshold(
    thresholdIndex: number,
    threshold: number,
    color: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const timeColors = [...(module.global_time_colors || [])];
    timeColors[thresholdIndex] = { threshold, color };
    updateModule({ global_time_colors: timeColors });
  }

  // State color methods
  private addStateColor(
    index: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const entity = entities[index];
    const stateColors = { ...(entity.state_colors || {}), new_state: 'gray' };
    entities[index] = { ...entity, state_colors: stateColors };
    updateModule({ entities });
  }

  private removeStateColor(
    index: number,
    state: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const entity = entities[index];
    const stateColors = { ...(entity.state_colors || {}) };
    delete stateColors[state];
    entities[index] = { ...entity, state_colors: stateColors };
    updateModule({ entities });
  }

  private updateStateColor(
    index: number,
    oldState: string,
    newState: string,
    color: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const entity = entities[index];
    const stateColors = { ...(entity.state_colors || {}) };

    if (oldState !== newState) {
      delete stateColors[oldState];
    }
    stateColors[newState] = color;

    entities[index] = { ...entity, state_colors: stateColors };
    updateModule({ entities });
  }

  // Time threshold methods
  private addTimeThreshold(
    index: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const entity = entities[index];
    const timeColors = [...(entity.time_colors || []), { threshold: 60, color: 'gray' }];
    entities[index] = { ...entity, time_colors: timeColors };
    updateModule({ entities });
  }

  private removeTimeThreshold(
    index: number,
    thresholdIndex: number,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const entity = entities[index];
    const timeColors = [...(entity.time_colors || [])];
    timeColors.splice(thresholdIndex, 1);
    entities[index] = { ...entity, time_colors: timeColors };
    updateModule({ entities });
  }

  private updateTimeThreshold(
    index: number,
    thresholdIndex: number,
    threshold: number,
    color: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    const entities = [...module.entities];
    const entity = entities[index];
    const timeColors = [...(entity.time_colors || [])];
    timeColors[thresholdIndex] = { threshold, color };
    entities[index] = { ...entity, time_colors: timeColors };
    updateModule({ entities });
  }

  // Migrate entities to use global settings instead of hardcoded values
  private migrateEntitiesToGlobalSettings(
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    let needsUpdate = false;
    const migratedEntities = module.entities.map(entity => {
      const migratedEntity = { ...entity };

      // If show_icon is explicitly true and matches global default, remove it to use global
      if (migratedEntity.show_icon === true && module.global_show_icon === true) {
        delete migratedEntity.show_icon;
        needsUpdate = true;
      }

      // If show_icon is explicitly false and doesn't match global, keep it (user override)
      // If show_icon is undefined, keep it undefined (uses global)

      // If show_state is explicitly true and matches global default, remove it to use global
      if (migratedEntity.show_state === true && module.global_show_state === true) {
        delete migratedEntity.show_state;
        needsUpdate = true;
      }

      // If show_state is explicitly false and matches global default, remove it to use global
      if (migratedEntity.show_state === false && module.global_show_state === false) {
        delete migratedEntity.show_state;
        needsUpdate = true;
      }

      return migratedEntity;
    });

    if (needsUpdate) {
      updateModule({ entities: migratedEntities });
    }
  }

  // Sync auto-filtered entities with the entity management list
  private syncAutoFilteredEntities(
    module: StatusSummaryModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<StatusSummaryModule>) => void
  ): void {
    // Get the list of entity IDs that match the current filters
    const autoFilteredEntityIds = this.getAutoFilteredEntities(module, hass);

    // Get current entities
    const currentEntities = module.entities || [];

    // Separate manual entities from auto-generated ones
    const manualEntities = currentEntities.filter(e => !e.is_auto_generated);
    const existingAutoEntities = currentEntities.filter(e => e.is_auto_generated);

    // Build a map of existing auto entities by entity ID for quick lookup
    const existingAutoMap = new Map<string, StatusSummaryEntity>();
    existingAutoEntities.forEach(e => {
      if (e.entity) {
        existingAutoMap.set(e.entity, e);
      }
    });

    // Create/update auto-generated entities
    const updatedAutoEntities: StatusSummaryEntity[] = [];
    autoFilteredEntityIds.forEach(entityId => {
      // Check if we already have this entity
      const existing = existingAutoMap.get(entityId);

      if (existing) {
        // Keep the existing entity (preserves user customizations)
        updatedAutoEntities.push(existing);
      } else {
        // Create a new auto-generated entity
        // Don't set show_icon and show_state so they default to global settings
        const newEntity: StatusSummaryEntity = {
          id: this.generateId('status_entity'),
          entity: entityId,
          color_mode: 'none',
          is_auto_generated: true,
        };
        updatedAutoEntities.push(newEntity);
      }
    });

    // Combine manual entities with updated auto entities
    const allEntities = [...manualEntities, ...updatedAutoEntities];

    // Only update if the entities list has changed
    if (JSON.stringify(currentEntities) !== JSON.stringify(allEntities)) {
      updateModule({ entities: allEntities });
    }
  }

  // Filter methods (include/exclude)
  private addFilter(
    type: 'include' | 'exclude',
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void,
    event: Event
  ): void {
    event.preventDefault();
    event.stopPropagation();

    // Get the input element from the same parent container as the button
    const button = event.target as HTMLElement;
    const container = button.closest('.domain-input-row');
    const input = container?.querySelector('input') as HTMLInputElement;

    if (!input || !input.value.trim()) return;

    const filter = input.value.trim().toLowerCase();
    const filterKey = type === 'include' ? 'include_filters' : 'exclude_filters';
    const filters = [...(module[filterKey] || [])];

    if (!filters.includes(filter)) {
      filters.push(filter);
      updateModule({ [filterKey]: filters } as any);
      input.value = '';

      // Trigger a small delay to ensure the UI updates
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
        }
      }, 50);
    }
  }

  private removeFilter(
    type: 'include' | 'exclude',
    filter: string,
    module: StatusSummaryModule,
    updateModule: (updates: Partial<StatusSummaryModule>) => void,
    event: Event
  ): void {
    event.preventDefault();
    event.stopPropagation();

    const filterKey = type === 'include' ? 'include_filters' : 'exclude_filters';
    const filters = (module[filterKey] || []).filter(f => f !== filter);
    updateModule({ [filterKey]: filters } as any);

    // Trigger a small delay to ensure the UI updates
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
      }
    }, 50);
  }

  // Preview rendering
  renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult {
    const summaryModule = module as StatusSummaryModule;

    // Get all entities to display
    const entitiesToDisplay = this.getEntitiesToDisplay(summaryModule, hass);

    // Sort entities
    const sortedEntities = this.sortEntities(entitiesToDisplay, summaryModule, hass);

    // Apply max items limit
    const maxItems = summaryModule.max_items_to_show || 0;
    const displayedEntities = maxItems > 0 ? sortedEntities.slice(0, maxItems) : sortedEntities;
    const hiddenCount = sortedEntities.length - displayedEntities.length;

    return html`
      <style>
        .status-summary-container {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }

        .summary-title {
          font-size: 18px;
          font-weight: 700;
          color: ${summaryModule.header_text_color || 'var(--primary-text-color)'};
          margin-bottom: 12px;
          text-align: center;
        }

        .summary-table {
          width: 100%;
          display: grid;
          grid-template-columns: ${this.getGridColumns(summaryModule)};
          gap: ${summaryModule.row_gap || 4}px;
        }

        .summary-header {
          display: contents;
        }

        .header-cell {
          font-size: 14px;
          font-weight: 600;
          color: ${summaryModule.header_text_color || 'var(--primary-text-color)'};
          background: ${summaryModule.header_background_color ||
        'var(--secondary-background-color)'};
          padding: 8px;
          text-align: left;
        }

        .header-cell:last-child {
          text-align: right;
        }

        .summary-row {
          display: contents;
        }

        .row-cell {
          height: ${summaryModule.row_height || 40}px;
          display: flex;
          align-items: center;
          padding: 0 8px;
          font-size: 14px;
          ${summaryModule.show_separator_lines
          ? 'border-bottom: 1px solid var(--divider-color);'
          : ''}
        }

        .entity-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .entity-cell:hover {
          background-color: rgba(var(--rgb-primary-color), 0.1);
        }

        .entity-icon {
          flex-shrink: 0;
        }

        .entity-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .entity-state {
          font-size: 12px;
          opacity: 0.7;
          margin-left: 4px;
        }

        .last-change-cell {
          text-align: center;
          color: var(--secondary-text-color);
        }

        .time-cell {
          text-align: right;
          color: var(--secondary-text-color);
        }

        @media (max-width: 600px) {
          .summary-table {
            grid-template-columns: 1fr;
          }

          .header-cell:nth-child(2),
          .header-cell:nth-child(3),
          .last-change-cell,
          .time-cell {
            display: none;
          }

          .row-cell {
            border-bottom: 1px solid var(--divider-color);
            padding: 12px 8px;
          }
        }
      </style>

      <div class="status-summary-container">
        ${summaryModule.show_title
          ? html`<div class="summary-title">${summaryModule.title || 'Status Summary'}</div>`
          : ''}

        <div class="summary-table">
          ${summaryModule.show_last_change_header || summaryModule.show_time_header
            ? html`
                <div class="summary-header">
                  <div class="header-cell">Entity</div>
                  ${summaryModule.show_last_change_header
                    ? html`<div class="header-cell">Last Change</div>`
                    : ''}
                  ${summaryModule.show_time_header ? html`<div class="header-cell">Time</div>` : ''}
                </div>
              `
            : ''}
          ${displayedEntities.map(item => {
            const stateObj = hass.states[item.entity.entity];
            if (!stateObj) return '';

            const color = this.getEntityColor(item.entity, stateObj, summaryModule);
            const iconName =
              item.entity.icon ||
              stateObj.attributes.icon ||
              this.getDefaultIcon(stateObj.entity_id);
            let displayName =
              item.entity.label || stateObj.attributes.friendly_name || stateObj.entity_id;

            // Determine if icon should be shown (per-entity setting overrides global)
            const showIcon =
              item.entity.show_icon !== undefined
                ? item.entity.show_icon
                : summaryModule.global_show_icon;

            // Determine if state should be shown (per-entity setting overrides global)
            const showState =
              item.entity.show_state !== undefined
                ? item.entity.show_state
                : summaryModule.global_show_state;

            // Truncate name if it exceeds max length
            const maxLength = summaryModule.max_entity_name_length || 30;
            if (displayName.length > maxLength) {
              displayName = displayName.substring(0, maxLength) + '...';
            }

            return html`
              <div class="summary-row">
                <div
                  class="row-cell entity-cell"
                  style="color: ${color};"
                  @click=${(e: Event) => this.handleEntityClick(e, item.entity.entity)}
                >
                  ${showIcon
                    ? html`<ha-icon
                        class="entity-icon"
                        icon="${iconName}"
                        style="color: ${color};"
                      ></ha-icon>`
                    : ''}
                  <span class="entity-name">${displayName}</span>
                  ${showState ? html`<span class="entity-state">(${stateObj.state})</span>` : ''}
                </div>
                ${summaryModule.show_last_change_header
                  ? html`<div class="row-cell last-change-cell">${item.lastChangeFormatted}</div>`
                  : ''}
                ${summaryModule.show_time_header
                  ? html`<div class="row-cell time-cell">${item.timeFormatted}</div>`
                  : ''}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private getEntitiesToDisplay(
    module: StatusSummaryModule,
    hass: HomeAssistant
  ): { entity: StatusSummaryEntity; lastChange: Date }[] {
    const result: { entity: StatusSummaryEntity; lastChange: Date }[] = [];

    // Use all entities from the entities array (which now includes synced auto-filtered entities)
    module.entities.forEach(entity => {
      if (entity.entity && hass.states[entity.entity]) {
        const stateObj = hass.states[entity.entity];
        const lastChange = new Date(stateObj.last_changed);

        // Apply time filter
        if (module.max_time_since_change) {
          const minutesSinceChange = (Date.now() - lastChange.getTime()) / 60000;
          if (minutesSinceChange > module.max_time_since_change) {
            return;
          }
        }

        result.push({ entity, lastChange });
      }
    });

    return result;
  }

  private getAutoFilteredEntities(module: StatusSummaryModule, hass: HomeAssistant): string[] {
    if (!hass || !hass.states) return [];

    // If no include filters specified, return empty array (user must explicitly add filters)
    if (!module.include_filters || module.include_filters.length === 0) {
      return [];
    }

    return Object.keys(hass.states).filter(entityId => {
      const domain = entityId.split('.')[0];
      const stateObj = hass.states[entityId];
      const friendlyName = (stateObj.attributes.friendly_name || '').toLowerCase();
      const entityIdLower = entityId.toLowerCase();

      // Check include filters - must match at least one filter
      const matchesInclude = module.include_filters!.some(filter => {
        const filterLower = filter.toLowerCase();
        // Match if filter matches domain, or is in entity_id, or is in friendly name
        return (
          domain === filterLower ||
          entityIdLower.includes(filterLower) ||
          friendlyName.includes(filterLower)
        );
      });

      if (!matchesInclude) {
        return false;
      }

      // Check exclude filters - must not match any exclude filter
      if (module.exclude_filters && module.exclude_filters.length > 0) {
        const matchesExclude = module.exclude_filters.some(filter => {
          const filterLower = filter.toLowerCase();
          // Match if filter matches domain, or is in entity_id, or is in friendly name
          return (
            domain === filterLower ||
            entityIdLower.includes(filterLower) ||
            friendlyName.includes(filterLower)
          );
        });

        if (matchesExclude) {
          return false;
        }
      }

      return true;
    });
  }

  private sortEntities(
    entities: { entity: StatusSummaryEntity; lastChange: Date }[],
    module: StatusSummaryModule,
    hass: HomeAssistant
  ): {
    entity: StatusSummaryEntity;
    lastChange: Date;
    lastChangeFormatted: string;
    timeFormatted: string;
  }[] {
    const enriched = entities.map(item => ({
      ...item,
      lastChangeFormatted: this.formatTimeSince(item.lastChange),
      timeFormatted: this.formatTime(item.lastChange),
    }));

    if (module.sort_by === 'custom') {
      return enriched; // Keep original order
    }

    enriched.sort((a, b) => {
      let comparison = 0;

      if (module.sort_by === 'name') {
        const aName = this.getEntityName(a.entity, hass);
        const bName = this.getEntityName(b.entity, hass);
        comparison = aName.localeCompare(bName);
      } else if (module.sort_by === 'last_change') {
        comparison = b.lastChange.getTime() - a.lastChange.getTime();
      }

      return module.sort_direction === 'desc' ? -comparison : comparison;
    });

    return enriched;
  }

  private getEntityName(entity: StatusSummaryEntity, hass: HomeAssistant): string {
    if (entity.label) return entity.label;
    const stateObj = hass.states[entity.entity];
    return stateObj?.attributes.friendly_name || entity.entity;
  }

  private getEntityColor(
    entity: StatusSummaryEntity,
    stateObj: any,
    module: StatusSummaryModule
  ): string {
    // Priority: per-entity color mode > global color mode > default

    // Check per-entity color mode first (if not 'none')
    if (entity.color_mode !== 'none') {
      if (entity.color_mode === 'custom' && entity.custom_color_template) {
        // TODO: Evaluate template (requires template service integration)
        // For now, fall through to global
      } else if (entity.color_mode === 'state' && entity.state_colors) {
        const stateColor = entity.state_colors[stateObj.state];
        if (stateColor) return stateColor;
      } else if (entity.color_mode === 'time' && entity.time_colors) {
        const minutesSinceChange = (Date.now() - new Date(stateObj.last_changed).getTime()) / 60000;
        // Sort thresholds ascending and find first match
        const sorted = [...entity.time_colors].sort((a, b) => a.threshold - b.threshold);
        const match = sorted.find(rule => minutesSinceChange <= rule.threshold);
        if (match) return match.color;
      }
    }

    // Fall back to global color mode
    if (module.global_color_mode !== 'none') {
      if (module.global_color_mode === 'custom' && module.global_custom_color_template) {
        // TODO: Evaluate template (requires template service integration)
        // For now, fall through to default
      } else if (module.global_color_mode === 'state' && module.global_state_colors) {
        const stateColor = module.global_state_colors[stateObj.state];
        if (stateColor) return stateColor;
      } else if (module.global_color_mode === 'time' && module.global_time_colors) {
        const minutesSinceChange = (Date.now() - new Date(stateObj.last_changed).getTime()) / 60000;
        // Sort thresholds ascending and find first match
        const sorted = [...module.global_time_colors].sort((a, b) => a.threshold - b.threshold);
        const match = sorted.find(rule => minutesSinceChange <= rule.threshold);
        if (match) return match.color;
      }
    }

    // Fall back to default color
    return module.default_text_color || 'var(--primary-text-color)';
  }

  private formatTimeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} m` : `${hours} h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  private getDefaultIcon(entityId: string): string {
    const domain = entityId.split('.')[0];
    const iconMap: Record<string, string> = {
      binary_sensor: 'mdi:radiobox-marked',
      light: 'mdi:lightbulb',
      switch: 'mdi:light-switch',
      sensor: 'mdi:eye',
      climate: 'mdi:thermostat',
      cover: 'mdi:window-shutter',
      fan: 'mdi:fan',
      lock: 'mdi:lock',
      media_player: 'mdi:cast',
      person: 'mdi:account',
      device_tracker: 'mdi:account-arrow-right',
    };
    return iconMap[domain] || 'mdi:help-circle';
  }

  private getGridColumns(module: StatusSummaryModule): string {
    // Build grid columns based on which headers are shown
    const columns: string[] = ['1fr']; // Entity column always shown

    if (module.show_last_change_header) {
      columns.push('auto');
    }

    if (module.show_time_header) {
      columns.push('auto');
    }

    return columns.join(' ');
  }

  // Handle entity click to open more-info dialog
  private handleEntityClick(event: Event, entityId: string): void {
    event.stopPropagation();

    // Use the fireEvent helper from custom-card-helpers
    fireEvent(event.target as HTMLElement, 'hass-more-info', {
      entityId,
    });
  }
}
