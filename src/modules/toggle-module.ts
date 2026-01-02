import { TemplateResult, html, css } from 'lit';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, ToggleModule, TogglePoint, UltraCardConfig } from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { localize } from '../localize/localize';
import { TemplateService } from '../services/template-service';
import '../components/ultra-color-picker';

export class UltraToggleModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'toggle',
    title: 'Toggle',
    description: 'Interactive toggles and multi-state switchers with custom actions',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:toggle-switch',
    category: 'interactive',
    tags: ['toggle', 'switch', 'button', 'state', 'control', 'interactive'],
  };

  private _expandedTogglePoints: Set<string> = new Set();
  private _draggedItem: TogglePoint | null = null;
  private _hass?: HomeAssistant;
  private _activeTogglePointId?: string;
  private _actionFormChangeGuard: boolean = false;
  private _templateService: TemplateService | null = null;
  private _templateMatchCache: Map<string, boolean> = new Map();

  createDefault(id?: string, hass?: HomeAssistant): ToggleModule {
    // Create two default toggle points
    const togglePoint1: TogglePoint = {
      id: this.generateId('toggle_point'),
      label: 'Off',
      icon: 'mdi:power-off',
      tap_action: { action: 'nothing' },
      background_color: 'var(--secondary-background-color)',
      text_color: 'var(--primary-text-color)',
      active_background_color: 'var(--error-color)',
      active_text_color: 'white',
    };

    const togglePoint2: TogglePoint = {
      id: this.generateId('toggle_point'),
      label: 'On',
      icon: 'mdi:power-on',
      tap_action: { action: 'nothing' },
      background_color: 'var(--secondary-background-color)',
      text_color: 'var(--primary-text-color)',
      active_background_color: 'var(--primary-color)',
      active_text_color: 'white',
    };

    return {
      id: id || this.generateId('toggle'),
      type: 'toggle',
      toggle_points: [togglePoint1, togglePoint2],
      visual_style: 'segmented',
      title: 'Toggle',
      show_title: false,
      orientation: 'horizontal',
      alignment: 'center',
      size: 'normal',
      spacing: 8,
      show_icons: true,
      icon_size: '24px',
      icon_position: 'left',
      default_background_color: 'var(--secondary-background-color)',
      default_text_color: 'var(--primary-text-color)',
      default_active_background_color: 'var(--primary-color)',
      default_active_text_color: 'white',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const toggleModule = module as ToggleModule;
    const errors = [...baseValidation.errors];

    // Must have at least 2 toggle points
    if (!toggleModule.toggle_points || toggleModule.toggle_points.length < 2) {
      errors.push('Toggle module must have at least 2 toggle points');
    }

    // iOS toggle style requires exactly 2 points
    if (toggleModule.visual_style === 'ios_toggle' && toggleModule.toggle_points.length !== 2) {
      errors.push('iOS toggle style requires exactly 2 toggle points');
    }

    // Check that each toggle point has a label
    if (toggleModule.toggle_points) {
      toggleModule.toggle_points.forEach((point, index) => {
        if (!point.label || point.label.trim() === '') {
          errors.push(`Toggle point ${index + 1} must have a label`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as ToggleModule, hass, updates => updateModule(updates));
  }

  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as ToggleModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const toggleModule = module as ToggleModule;
    const lang = hass?.locale?.language || 'en';
    this._hass = hass;

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

        .toggle-point-rows-container {
          margin-top: 16px;
        }

        .toggle-point-row {
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

        .toggle-point-row:hover {
          background: var(--primary-color);
          opacity: 0.9;
        }

        .toggle-point-row.dragging {
          opacity: 0.5;
          transform: scale(0.95);
        }

        .toggle-point-row.drag-over {
          border-top: 3px solid var(--primary-color);
        }

        .drag-handle {
          cursor: grab;
          color: var(--secondary-text-color);
          flex-shrink: 0;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .toggle-point-info {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .toggle-point-info.no-label {
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

        .toggle-point-settings {
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          border-radius: 0 8px 8px 0;
          margin-bottom: 8px;
          animation: slideDown 0.3s ease;
          overflow: visible;
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

        .add-toggle-point-btn {
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

        .add-toggle-point-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .color-controls {
          display: grid;
          gap: 16px;
        }

        /* Ensure ha-form dropdowns render properly */
        ha-form {
          display: block;
        }

        ha-select {
          position: relative;
          overflow: visible;
          z-index: 9999;
        }

        ha-select mwc-menu {
          position: fixed !important;
          z-index: 10001 !important;
        }
      </style>

      <div class="module-settings">
        <!-- Display Settings Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.toggle.display_settings', lang, 'DISPLAY SETTINGS')}
          </div>

          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.toggle.title', lang, 'Title'),
              description: localize('editor.toggle.title_desc', lang, 'Title to display above the toggle'),
              hass,
              data: { title: toggleModule.title || 'Toggle' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => updateModule({ title: e.detail.value.title }),
            },
            {
              title: localize('editor.toggle.show_title', lang, 'Show Title'),
              description: localize('editor.toggle.show_title_desc', lang, 'Display the title above the toggle'),
              hass,
              data: { show_title: toggleModule.show_title },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => updateModule({ show_title: e.detail.value.show_title }),
            },
          ])}

          ${this.renderFieldSection(
            localize('editor.toggle.visual_style', lang, 'Visual Style'),
            localize('editor.toggle.visual_style_desc', lang, 'How the toggle should be displayed'),
            hass,
            { visual_style: toggleModule.visual_style || 'segmented' },
            [
              this.selectField('visual_style', [
                { value: 'ios_toggle', label: 'Basic Toggle (2 states only)' },
                { value: 'segmented', label: 'Segmented Control' },
                { value: 'button_group', label: 'Button Group' },
                { value: 'slider_track', label: 'Slider Track' },
                { value: 'timeline', label: 'Timeline' },
                { value: 'minimal', label: 'Minimal' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.visual_style;
              const prev = toggleModule.visual_style || 'segmented';
              if (next === prev) return;
              updateModule({ visual_style: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.toggle.orientation', lang, 'Orientation'),
            localize('editor.toggle.orientation_desc', lang, 'Layout direction of toggle points'),
            hass,
            { orientation: toggleModule.orientation || 'horizontal' },
            [
              this.selectField('orientation', [
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Vertical' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.orientation;
              const prev = toggleModule.orientation || 'horizontal';
              if (next === prev) return;
              updateModule({ orientation: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.toggle.alignment', lang, 'Alignment'),
            localize('editor.toggle.alignment_desc', lang, 'How the toggle is aligned within its container'),
            hass,
            { alignment: toggleModule.alignment || 'center' },
            [
              this.selectField('alignment', [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
                { value: 'justify', label: 'Justify (Full Width)' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.alignment;
              const prev = toggleModule.alignment || 'center';
              if (next === prev) return;
              updateModule({ alignment: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            localize('editor.toggle.size', lang, 'Size'),
            localize('editor.toggle.size_desc', lang, 'Size of the toggle control'),
            hass,
            { size: toggleModule.size || 'normal' },
            [
              this.selectField('size', [
                { value: 'compact', label: 'Compact' },
                { value: 'normal', label: 'Normal' },
                { value: 'large', label: 'Large' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.size;
              const prev = toggleModule.size || 'normal';
              if (next === prev) return;
              updateModule({ size: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <div class="field-container" style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${localize('editor.toggle.spacing', lang, 'Spacing')}
            </div>
            <div class="field-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
              ${localize('editor.toggle.spacing_desc', lang, 'Gap between toggle points in pixels')}
            </div>
            <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
              <input
                type="range"
                class="gap-slider"
                min="0"
                max="100"
                step="1"
                .value="${String(toggleModule.spacing || 8)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = Number(target.value);
                  updateModule({ spacing: value });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
              />
              <input
                type="number"
                class="gap-input"
                .value="${String(toggleModule.spacing || 8)}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = Number(target.value);
                  if (!isNaN(value)) {
                    updateModule({ spacing: value });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => {
                  updateModule({ spacing: 8 });
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }}
                title="Reset to default (8)"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Entity Tracking Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.toggle.entity_tracking', lang, 'ENTITY TRACKING')}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${localize(
              'editor.toggle.entity_tracking_desc',
              lang,
              'Optional: Track an entity state to auto-select matching toggle points'
            )}
          </div>

          ${UcFormUtils.renderFieldSection(
            localize('editor.toggle.tracking_entity', lang, 'Tracking Entity'),
            localize(
              'editor.toggle.tracking_entity_desc',
              lang,
              'When set, the toggle will automatically select the point that matches the entity state'
            ),
            hass,
            { tracking_entity: toggleModule.tracking_entity || '' },
            [UcFormUtils.entity('tracking_entity')],
            (e: CustomEvent) => updateModule({ tracking_entity: e.detail.value.tracking_entity })
          )}
        </div>

        <!-- Icon Settings Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.toggle.icon_settings', lang, 'ICON SETTINGS')}
          </div>

          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.toggle.show_icons', lang, 'Show Icons'),
              description: localize('editor.toggle.show_icons_desc', lang, 'Display icons on toggle points'),
              hass,
              data: { show_icons: toggleModule.show_icons },
              schema: [this.booleanField('show_icons')],
              onChange: (e: CustomEvent) => updateModule({ show_icons: e.detail.value.show_icons }),
            },
          ])}

          ${toggleModule.show_icons
            ? html`
                ${UcFormUtils.renderFieldSection(
                  localize('editor.toggle.icon_size', lang, 'Icon Size'),
                  localize('editor.toggle.icon_size_desc', lang, 'Size of icons in pixels'),
                  hass,
                  { icon_size: toggleModule.icon_size || '24px' },
                  [UcFormUtils.text('icon_size')],
                  (e: CustomEvent) => updateModule({ icon_size: e.detail.value.icon_size })
                )}
                ${this.renderFieldSection(
                  localize('editor.toggle.icon_position', lang, 'Icon Position'),
                  localize('editor.toggle.icon_position_desc', lang, 'Position of icons relative to labels'),
                  hass,
                  { icon_position: toggleModule.icon_position || 'left' },
                  [
                    this.selectField('icon_position', [
                      { value: 'above', label: 'Above' },
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                      { value: 'below', label: 'Below' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const next = e.detail.value.icon_position;
                    const prev = toggleModule.icon_position || 'left';
                    if (next === prev) return;
                    updateModule({ icon_position: next });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }
                )}
              `
            : ''}
        </div>

        <!-- Default Colors Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.toggle.default_colors', lang, 'DEFAULT COLORS')}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;">
            ${localize(
              'editor.toggle.default_colors_desc',
              lang,
              'Default colors for toggle points (can be overridden per point)'
            )}
          </div>

          <div class="color-controls">
            <ultra-color-picker
              .label=${localize('editor.toggle.default_background_color', lang, 'Background Color')}
              .value=${toggleModule.default_background_color || 'var(--secondary-background-color)'}
              .defaultValue=${'var(--secondary-background-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ default_background_color: e.detail.value })}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${localize('editor.toggle.default_text_color', lang, 'Text Color')}
              .value=${toggleModule.default_text_color || 'var(--primary-text-color)'}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => updateModule({ default_text_color: e.detail.value })}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${localize(
                'editor.toggle.default_active_background_color',
                lang,
                'Active Background Color'
              )}
              .value=${toggleModule.default_active_background_color || 'var(--primary-color)'}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ default_active_background_color: e.detail.value })}
            ></ultra-color-picker>

            <ultra-color-picker
              .label=${localize('editor.toggle.default_active_text_color', lang, 'Active Text Color')}
              .value=${toggleModule.default_active_text_color || 'white'}
              .defaultValue=${'white'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ default_active_text_color: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Toggle Points Management Section -->
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.toggle.toggle_points', lang, 'TOGGLE POINTS')}
          </div>

          <div class="toggle-point-rows-container">
            ${toggleModule.toggle_points.map((point, index) =>
              this.renderTogglePointRow(point, index, toggleModule, hass, updateModule)
            )}
          </div>

          <button
            class="add-toggle-point-btn"
            @click=${() => this.addTogglePoint(toggleModule, updateModule)}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            ${localize('editor.toggle.add_toggle_point', lang, 'Add Toggle Point')}
          </button>
        </div>
      </div>
    `;
  }

  private renderTogglePointRow(
    point: TogglePoint,
    index: number,
    module: ToggleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<ToggleModule>) => void
  ): TemplateResult {
    const isExpanded = this._expandedTogglePoints.has(point.id);
    const lang = hass?.locale?.language || 'en';

    return html`
      <div
        class="toggle-point-row ${this._draggedItem?.id === point.id ? 'dragging' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this.handleDragStart(e, point)}
        @dragend=${() => this.handleDragEnd()}
        @dragover=${(e: DragEvent) => this.handleDragOver(e)}
        @drop=${(e: DragEvent) => this.handleDrop(e, index, module, updateModule)}
      >
        <ha-icon icon="mdi:drag" class="drag-handle"></ha-icon>
        <div class="toggle-point-info ${!point.label ? 'no-label' : ''}">
          ${point.label || 'No label set'}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${isExpanded ? 'expanded' : ''}"
          @click=${() => this.toggleExpand(point.id)}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${() => this.deleteTogglePoint(index, module, updateModule)}
        ></ha-icon>
      </div>

      ${isExpanded
        ? html`
            <div class="toggle-point-settings">
              ${this.renderTogglePointConfig(point, index, module, hass, updateModule)}
            </div>
          `
        : ''}
    `;
  }

  private renderTogglePointConfig(
    point: TogglePoint,
    index: number,
    module: ToggleModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<ToggleModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';

    return html`
      ${UcFormUtils.renderFieldSection(
        localize('editor.toggle.point_label', lang, 'Label'),
        localize('editor.toggle.point_label_desc', lang, 'Display text for this toggle point'),
        hass,
        { label: point.label || '' },
        [UcFormUtils.text('label')],
        (e: CustomEvent) => this.updateTogglePoint(index, { label: e.detail.value.label }, module, updateModule)
      )}

      ${UcFormUtils.renderFieldSection(
        localize('editor.toggle.point_icon', lang, 'Icon'),
        localize('editor.toggle.point_icon_desc', lang, 'Icon to display for this toggle point'),
        hass,
        { icon: point.icon || '' },
        [UcFormUtils.icon('icon')],
        (e: CustomEvent) => this.updateTogglePoint(index, { icon: e.detail.value.icon }, module, updateModule)
      )}

      <div style="margin-top: 16px; margin-bottom: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.toggle.point_auto_select', lang, 'Auto-Select Conditions')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${localize(
            'editor.toggle.point_auto_select_desc',
            lang,
            'Automatically select this toggle point based on entity state or template conditions'
          )}
        </div>

        <!-- Match Mode Selector -->
        ${this.renderFieldSection(
          localize('editor.toggle.point_match_mode', lang, 'Match Mode'),
          localize(
            'editor.toggle.point_match_mode_desc',
            lang,
            'Choose how to determine when this toggle point should be active'
          ),
          hass,
          { match_mode: point.match_template_mode ? 'template' : 'entity' },
          [
            this.selectField('match_mode', [
              { value: 'entity', label: localize('editor.toggle.match_mode_entity', lang, 'Entity State') },
              { value: 'template', label: localize('editor.toggle.match_mode_template', lang, 'Template (Advanced)') },
            ]),
          ],
          (e: CustomEvent) => {
            const mode = e.detail.value.match_mode;
            const isCurrentlyTemplate = point.match_template_mode || false;
            if ((mode === 'template') === isCurrentlyTemplate) return;
            
            // Update the point based on selected mode
            if (mode === 'entity') {
              this.updateTogglePoint(
                index,
                { match_template_mode: false, match_template: '' },
                module,
                updateModule
              );
            } else if (mode === 'template') {
              this.updateTogglePoint(
                index,
                { match_template_mode: true, match_entity: '', match_state: '' },
                module,
                updateModule
              );
            }
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${point.match_template_mode
          ? html`
              <!-- Template Mode UI -->
              <div style="border-left: 3px solid var(--primary-color); padding-left: 12px; margin-top: 12px;">
                ${UcFormUtils.renderFieldSection(
                  localize('editor.toggle.point_match_template', lang, 'Match Template'),
                  localize(
                    'editor.toggle.point_match_template_desc',
                    lang,
                    'Jinja2 template that evaluates to true when this point should be active'
                  ),
                  hass,
                  { match_template: point.match_template || '' },
                  [UcFormUtils.text('match_template', true)],
                  (e: CustomEvent) =>
                    this.updateTogglePoint(
                      index,
                      { match_template: e.detail.value.match_template },
                      module,
                      updateModule
                    )
                )}
                <div
                  style="font-size: 11px; color: var(--secondary-text-color); margin-top: 8px; padding: 8px; background: var(--card-background-color); border-radius: 4px;"
                >
                  <strong>${localize('editor.toggle.template_examples', lang, 'Examples')}:</strong
                  ><br />
                  • ${localize('editor.toggle.template_example_range', lang, 'Range')}:
                  <code style="font-size: 10px;"
                    >{{ state_attr('cover.garage', 'current_position') | int >= 15 and
                    state_attr('cover.garage', 'current_position') | int &lt;= 25 }}</code
                  ><br />
                  • ${localize('editor.toggle.template_example_brightness', lang, 'Brightness')}:
                  <code style="font-size: 10px;"
                    >{{ state_attr('light.living_room', 'brightness') | int > 200 }}</code
                  ><br />
                  • ${localize('editor.toggle.template_example_multi', lang, 'Multiple conditions')}:
                  <code style="font-size: 10px;"
                    >{{ states('climate.hvac') == 'heat' and state_attr('climate.hvac',
                    'temperature') > 20 }}</code
                  >
                </div>
              </div>
            `
          : html`
              <!-- Entity State Mode UI -->
              <div style="border-left: 3px solid var(--primary-color); padding-left: 12px; margin-top: 12px;">
                ${UcFormUtils.renderFieldSection(
                  localize('editor.toggle.point_match_entity', lang, 'Match Entity'),
                  localize('editor.toggle.point_match_entity_desc', lang, 'Entity to match'),
                  hass,
                  { match_entity: point.match_entity || '' },
                  [UcFormUtils.entity('match_entity')],
                  (e: CustomEvent) =>
                    this.updateTogglePoint(
                      index,
                      { match_entity: e.detail.value.match_entity },
                      module,
                      updateModule
                    )
                )}

                ${UcFormUtils.renderFieldSection(
                  localize('editor.toggle.point_match_state', lang, 'Match State'),
                  localize(
                    'editor.toggle.point_match_state_desc',
                    lang,
                    'State value to match (e.g., "on", "off", "heat")'
                  ),
                  hass,
                  { match_state: typeof point.match_state === 'string' ? point.match_state : '' },
                  [UcFormUtils.text('match_state')],
                  (e: CustomEvent) =>
                    this.updateTogglePoint(
                      index,
                      { match_state: e.detail.value.match_state },
                      module,
                      updateModule
                    )
                )}
              </div>
            `
        }
      </div>

      <div style="margin-top: 16px; margin-bottom: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.toggle.point_colors', lang, 'Colors')}
        </div>

        <div class="color-controls">
          <ultra-color-picker
            .label=${localize('editor.toggle.point_background_color', lang, 'Background Color')}
            .value=${point.background_color || module.default_background_color || ''}
            .defaultValue=${module.default_background_color || 'var(--secondary-background-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              this.updateTogglePoint(index, { background_color: e.detail.value }, module, updateModule)}
          ></ultra-color-picker>

          <ultra-color-picker
            .label=${localize('editor.toggle.point_text_color', lang, 'Text Color')}
            .value=${point.text_color || module.default_text_color || ''}
            .defaultValue=${module.default_text_color || 'var(--primary-text-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              this.updateTogglePoint(index, { text_color: e.detail.value }, module, updateModule)}
          ></ultra-color-picker>

          <ultra-color-picker
            .label=${localize('editor.toggle.point_active_background_color', lang, 'Active Background Color')}
            .value=${point.active_background_color || module.default_active_background_color || ''}
            .defaultValue=${module.default_active_background_color || 'var(--primary-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              this.updateTogglePoint(index, { active_background_color: e.detail.value }, module, updateModule)}
          ></ultra-color-picker>

          <ultra-color-picker
            .label=${localize('editor.toggle.point_active_text_color', lang, 'Active Text Color')}
            .value=${point.active_text_color || module.default_active_text_color || ''}
            .defaultValue=${module.default_active_text_color || 'white'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              this.updateTogglePoint(index, { active_text_color: e.detail.value }, module, updateModule)}
          ></ultra-color-picker>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.toggle.point_action', lang, 'Action')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${localize(
            'editor.toggle.point_action_desc',
            lang,
            'Configure what happens when this toggle point is activated'
          )}
        </div>

        <div style="position: relative; overflow: visible; z-index: 9999;">
          <ha-form
            .hass=${hass}
            .data=${{ tap_action: point.tap_action || { action: 'nothing' } }}
            .schema=${[
              {
                name: 'tap_action',
                selector: { ui_action: {} },
              },
            ]}
            .computeLabel=${(schema: any) =>
              hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`)}
            @value-changed=${(e: CustomEvent) => {
              // Prevent re-entrancy
              if (this._actionFormChangeGuard) {
                return;
              }

              e.stopPropagation();
              e.stopImmediatePropagation();

              const newAction = e.detail.value.tap_action;
              
              // Check if the action actually changed
              const currentAction = point.tap_action;
              if (JSON.stringify(currentAction) === JSON.stringify(newAction)) {
                return;
              }

              // Set guard and update
              this._actionFormChangeGuard = true;
              this.updateTogglePoint(index, { tap_action: newAction }, module, updateModule);
              
              // Clear guard and trigger preview update
              setTimeout(() => {
                this._actionFormChangeGuard = false;
                this.triggerPreviewUpdate();
              }, 50);
            }}
          ></ha-form>
        </div>
      </div>
    `;
  }

  // Toggle point management methods
  private addTogglePoint(
    module: ToggleModule,
    updateModule: (updates: Partial<ToggleModule>) => void
  ): void {
    const newPoint: TogglePoint = {
      id: this.generateId('toggle_point'),
      label: `Point ${module.toggle_points.length + 1}`,
      icon: '',
      tap_action: { action: 'nothing' },
      background_color: module.default_background_color,
      text_color: module.default_text_color,
      active_background_color: module.default_active_background_color,
      active_text_color: module.default_active_text_color,
    };

    const toggle_points = [...module.toggle_points, newPoint];
    updateModule({ toggle_points });
    this._expandedTogglePoints.add(newPoint.id);
  }

  private deleteTogglePoint(
    index: number,
    module: ToggleModule,
    updateModule: (updates: Partial<ToggleModule>) => void
  ): void {
    const toggle_points = [...module.toggle_points];
    const removed = toggle_points.splice(index, 1);
    if (removed[0]) {
      this._expandedTogglePoints.delete(removed[0].id);
    }
    updateModule({ toggle_points });
  }

  private updateTogglePoint(
    index: number,
    updates: Partial<TogglePoint>,
    module: ToggleModule,
    updateModule: (updates: Partial<ToggleModule>) => void
  ): void {
    const toggle_points = [...module.toggle_points];
    toggle_points[index] = { ...toggle_points[index], ...updates };
    updateModule({ toggle_points });
  }

  private toggleExpand(pointId: string): void {
    if (this._expandedTogglePoints.has(pointId)) {
      this._expandedTogglePoints.delete(pointId);
    } else {
      this._expandedTogglePoints.add(pointId);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ultra-card-module-update'));
    }
  }


  // Drag and drop methods
  private handleDragStart(e: DragEvent, point: TogglePoint): void {
    this._draggedItem = point;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  private handleDragEnd(): void {
    this._draggedItem = null;
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
    module: ToggleModule,
    updateModule: (updates: Partial<ToggleModule>) => void
  ): void {
    e.preventDefault();
    if (!this._draggedItem) return;

    const toggle_points = [...module.toggle_points];
    const dragIndex = toggle_points.findIndex(p => p.id === this._draggedItem!.id);

    if (dragIndex === -1 || dragIndex === dropIndex) return;

    // Remove from old position
    const [removed] = toggle_points.splice(dragIndex, 1);
    // Insert at new position
    toggle_points.splice(dropIndex, 0, removed);

    updateModule({ toggle_points });
    this._draggedItem = null;
  }

  renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult {
    const toggleModule = module as ToggleModule;
    this._hass = hass;

    // Initialize template service if needed
    if (!this._templateService && hass) {
      this._templateService = new TemplateService(hass);
    }

    // Subscribe to any template-based toggle points
    this._subscribeToToggleTemplates(toggleModule, hass);

    // Determine active toggle point
    // Priority: Always check entity state first, then fall back to clicked state
    let activePointId: string | undefined;
    
    // Check if any entity tracking is configured (including template mode)
    const hasEntityTracking = toggleModule.tracking_entity || 
      toggleModule.toggle_points.some(p => 
        (p.match_entity && p.match_state) || 
        (p.match_template_mode && p.match_template)
      );
    
    if (hasEntityTracking) {
      // When entity tracking is configured, always determine from entity state
      // This ensures the toggle reacts to external state changes
      activePointId = this.determineActiveTogglePoint(toggleModule, hass);
      // Update the cached value so it stays in sync
      this._activeTogglePointId = activePointId;
    } else if (this._activeTogglePointId) {
      // No entity tracking - use the last clicked toggle point
      activePointId = this._activeTogglePointId;
    } else {
      // No entity tracking and nothing clicked - default to first point
      activePointId = toggleModule.toggle_points[0]?.id;
      this._activeTogglePointId = activePointId;
    }

    // Render based on visual style
    switch (toggleModule.visual_style) {
      case 'ios_toggle':
        return this.renderIOSToggle(toggleModule, hass, activePointId);
      case 'segmented':
        return this.renderSegmented(toggleModule, hass, activePointId);
      case 'button_group':
        return this.renderButtonGroup(toggleModule, hass, activePointId);
      case 'slider_track':
        return this.renderSliderTrack(toggleModule, hass, activePointId);
      case 'timeline':
        return this.renderTimeline(toggleModule, hass, activePointId);
      case 'minimal':
        return this.renderMinimal(toggleModule, hass, activePointId);
      default:
        return this.renderSegmented(toggleModule, hass, activePointId);
    }
  }

  /**
   * Subscribe to templates for toggle points that use template-based matching
   */
  private _subscribeToToggleTemplates(module: ToggleModule, hass: HomeAssistant): void {
    if (!this._templateService || !hass) return;

    // Ensure template string cache exists
    if (!hass.__uvc_template_strings) {
      hass.__uvc_template_strings = {};
    }

    for (const point of module.toggle_points) {
      if (point.match_template_mode && point.match_template) {
        const templateHash = this._hashString(point.match_template);
        const templateKey = `toggle_match_${module.id}_${point.id}_${templateHash}`;

        if (!this._templateService.hasTemplateSubscription(templateKey)) {
          this._templateService.subscribeToTemplate(
            point.match_template,
            templateKey,
            () => {
              // When template result changes, trigger a preview update
              if (typeof window !== 'undefined') {
                if (!window._ultraCardUpdateTimer) {
                  window._ultraCardUpdateTimer = setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                    window._ultraCardUpdateTimer = null;
                  }, 50);
                }
              }
            }
          );
        }
      }
    }
  }

  /**
   * Simple string hash for template caching
   */
  private _hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private determineActiveTogglePoint(module: ToggleModule, hass: HomeAssistant): string | undefined {
    // PRIORITY 1: Check template-based matching first
    // Templates allow for more complex conditions (ranges, attributes, etc.)
    for (const point of module.toggle_points) {
      if (point.match_template_mode && point.match_template) {
        const templateHash = this._hashString(point.match_template);
        const templateKey = `toggle_match_${module.id}_${point.id}_${templateHash}`;
        
        // Check the rendered template result
        const renderedResult = hass.__uvc_template_strings?.[templateKey];
        if (renderedResult !== undefined) {
          const isMatch = this._parseTemplateResultAsBoolean(renderedResult);
          if (isMatch) {
            return point.id;
          }
        }
      }
    }

    // PRIORITY 2: If tracking entity is set, check for simple matching toggle points
    if (module.tracking_entity && hass.states[module.tracking_entity]) {
      const entityState = hass.states[module.tracking_entity].state;

      // Find first toggle point that matches the entity state
      const matchingPoint = module.toggle_points.find(point => {
        // Skip template-mode points (already checked above)
        if (point.match_template_mode) return false;
        
        if (point.match_entity === module.tracking_entity) {
          if (Array.isArray(point.match_state)) {
            return point.match_state.includes(entityState);
          } else if (point.match_state) {
            return point.match_state === entityState;
          }
        }
        return false;
      });

      if (matchingPoint) {
        return matchingPoint.id;
      }
    }

    // PRIORITY 3: Check each toggle point's individual match_entity (simple mode)
    for (const point of module.toggle_points) {
      // Skip template-mode points (already checked above)
      if (point.match_template_mode) continue;
      
      if (point.match_entity && hass.states[point.match_entity]) {
        const entityState = hass.states[point.match_entity].state;
        if (Array.isArray(point.match_state)) {
          if (point.match_state.includes(entityState)) {
            return point.id;
          }
        } else if (point.match_state) {
          if (point.match_state === entityState) {
            return point.id;
          }
        }
      }
    }

    // Default to first toggle point if no match
    return module.toggle_points[0]?.id;
  }

  /**
   * Parse template result as boolean for match evaluation
   */
  private _parseTemplateResultAsBoolean(result: any): boolean {
    if (result === undefined || result === null) {
      return false;
    }

    // Direct boolean
    if (typeof result === 'boolean') {
      return result;
    }

    // Number values
    if (typeof result === 'number') {
      return result !== 0;
    }

    // String values (case-insensitive)
    if (typeof result === 'string') {
      const lowerResult = result.toLowerCase().trim();
      return (
        lowerResult === 'true' ||
        lowerResult === 'on' ||
        lowerResult === 'yes' ||
        lowerResult === '1'
      );
    }

    return false;
  }

  private handleTogglePointClick(
    point: TogglePoint,
    module: ToggleModule,
    hass: HomeAssistant,
    event: Event
  ): void {
    event.stopPropagation();

    // Update active toggle point
    this._activeTogglePointId = point.id;

    // Force immediate re-render to show the active state
    this.triggerPreviewUpdate(true);

    // Execute tap action using the base module action handler
    if (point.tap_action && point.tap_action.action !== 'nothing') {
      // Determine the entity to use for the action
      // Priority: 1. Action's own entity, 2. Toggle point's match_entity, 3. Module's tracking_entity
      const actionEntity = point.tap_action.entity || point.match_entity || module.tracking_entity;
      
      // Build the action config with entity injected if needed
      const actionConfig = actionEntity && !point.tap_action.entity
        ? { ...point.tap_action, entity: actionEntity }
        : point.tap_action;
      
      this.handleModuleAction(actionConfig, hass, event.target as HTMLElement, undefined, actionEntity, module);
    }
  }

  private renderIOSToggle(
    module: ToggleModule,
    hass: HomeAssistant,
    activePointId?: string
  ): TemplateResult {
    // Basic toggle only supports 2 states
    if (module.toggle_points.length !== 2) {
      return html`
        <div style="padding: 16px; color: var(--error-color); text-align: center;">
          Basic toggle requires exactly 2 toggle points
        </div>
      `;
    }

    const point1 = module.toggle_points[0];
    const point2 = module.toggle_points[1];
    const isPoint1Active = activePointId === point1.id;
    const isVertical = module.orientation === 'vertical';

    const sizeMap = {
      compact: { width: '44px', height: '24px', thumbSize: '18px' },
      normal: { width: '52px', height: '28px', thumbSize: '22px' },
      large: { width: '64px', height: '34px', thumbSize: '28px' },
    };
    const size = sizeMap[module.size || 'normal'];

    // Swap width/height for vertical orientation
    const trackWidth = isVertical ? size.height : size.width;
    const trackHeight = isVertical ? size.width : size.height;

    return html`
      <style>
        .ios-toggle-container {
          display: flex;
          flex-direction: column;
          align-items: ${module.alignment === 'left'
            ? 'flex-start'
            : module.alignment === 'right'
              ? 'flex-end'
              : 'center'};
          padding: 8px;
          gap: 8px;
        }

        .ios-toggle-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .ios-toggle-track {
          position: relative;
          width: ${trackWidth};
          height: ${trackHeight};
          border-radius: ${isVertical ? trackWidth : trackHeight};
          cursor: pointer;
          transition: background-color 0.3s ease;
          background-color: ${isPoint1Active
            ? point1.active_background_color || module.default_active_background_color
            : point2.active_background_color || module.default_active_background_color};
        }

        .ios-toggle-thumb {
          position: absolute;
          ${isVertical
            ? `
            left: 50%;
            transform: translateX(-50%) ${isPoint1Active ? 'translateY(3px)' : `translateY(calc(${trackHeight} - ${size.thumbSize} - 3px))`};
          `
            : `
            top: 50%;
            transform: translateY(-50%) ${isPoint1Active ? 'translateX(3px)' : `translateX(calc(${trackWidth} - ${size.thumbSize} - 3px))`};
          `}
          width: ${size.thumbSize};
          height: ${size.thumbSize};
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }
      </style>

      <div class="ios-toggle-container">
        ${module.show_title && module.title
          ? html`<div class="ios-toggle-title">${module.title}</div>`
          : ''}
        <div
          class="ios-toggle-track"
          @click=${(e: Event) =>
            this.handleTogglePointClick(isPoint1Active ? point2 : point1, module, hass, e)}
        >
          <div class="ios-toggle-thumb"></div>
        </div>
      </div>
    `;
  }

  private renderSegmented(
    module: ToggleModule,
    hass: HomeAssistant,
    activePointId?: string
  ): TemplateResult {
    const isHorizontal = module.orientation === 'horizontal';
    const sizeMap = {
      compact: { padding: '6px 12px', fontSize: '12px', iconSize: '16px' },
      normal: { padding: '8px 16px', fontSize: '14px', iconSize: '20px' },
      large: { padding: '12px 24px', fontSize: '16px', iconSize: '24px' },
    };
    const size = sizeMap[module.size || 'normal'];

    return html`
      <style>
        .segmented-container {
          display: flex;
          flex-direction: column;
          align-items: ${module.alignment === 'left'
            ? 'flex-start'
            : module.alignment === 'right'
              ? 'flex-end'
              : 'center'};
          padding: 8px;
          gap: ${module.spacing || 8}px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .segmented-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .segmented-control {
          display: flex;
          flex-direction: ${isHorizontal ? 'row' : 'column'};
          background: var(--card-background-color);
          border-radius: 8px;
          padding: 4px;
          gap: ${module.spacing || 0}px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .segmented-button {
          flex: ${module.alignment === 'justify' ? '1' : '0 0 auto'};
          padding: ${size.padding};
          font-size: ${size.fontSize};
          border: none;
          background: transparent;
          color: var(--primary-text-color);
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-direction: ${module.icon_position === 'above'
            ? 'column'
            : module.icon_position === 'below'
              ? 'column-reverse'
              : module.icon_position === 'right'
                ? 'row-reverse'
                : 'row'};
        }

        .segmented-button.active {
          background: var(--primary-color);
          color: white;
          transform: scale(1.02);
        }

        .segmented-button ha-icon {
          --mdc-icon-size: ${size.iconSize};
        }
      </style>

      <div class="segmented-container">
        ${module.show_title && module.title
          ? html`<div class="segmented-title">${module.title}</div>`
          : ''}
        <div class="segmented-control">
          ${module.toggle_points.map(
            point => html`
              <button
                class="segmented-button ${activePointId === point.id ? 'active' : ''}"
                style="
                  background-color: ${activePointId === point.id
                    ? point.active_background_color ||
                      module.default_active_background_color ||
                      'var(--primary-color)'
                    : point.background_color || module.default_background_color || 'transparent'};
                  color: ${activePointId === point.id
                    ? point.active_text_color || module.default_active_text_color || 'white'
                    : point.text_color || module.default_text_color || 'var(--primary-text-color)'};
                "
                @click=${(e: Event) => this.handleTogglePointClick(point, module, hass, e)}
              >
                ${module.show_icons && point.icon ? html`<ha-icon icon="${point.icon}"></ha-icon>` : ''}
                <span>${point.label}</span>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderButtonGroup(
    module: ToggleModule,
    hass: HomeAssistant,
    activePointId?: string
  ): TemplateResult {
    const isHorizontal = module.orientation === 'horizontal';
    const sizeMap = {
      compact: { padding: '6px 12px', fontSize: '12px', iconSize: '16px' },
      normal: { padding: '10px 20px', fontSize: '14px', iconSize: '20px' },
      large: { padding: '14px 28px', fontSize: '16px', iconSize: '24px' },
    };
    const size = sizeMap[module.size || 'normal'];

    return html`
      <style>
        .button-group-container {
          display: flex;
          flex-direction: column;
          align-items: ${module.alignment === 'left'
            ? 'flex-start'
            : module.alignment === 'right'
              ? 'flex-end'
              : 'center'};
          padding: 8px;
          gap: ${module.spacing || 8}px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .button-group-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .button-group {
          display: flex;
          flex-direction: ${isHorizontal ? 'row' : 'column'};
          gap: ${module.spacing || 8}px;
          flex-wrap: wrap;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .group-button {
          flex: ${module.alignment === 'justify' ? '1' : '0 0 auto'};
          padding: ${size.padding};
          font-size: ${size.fontSize};
          border: 2px solid var(--divider-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-direction: ${module.icon_position === 'above'
            ? 'column'
            : module.icon_position === 'below'
              ? 'column-reverse'
              : module.icon_position === 'right'
                ? 'row-reverse'
                : 'row'};
        }

        .group-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .group-button.active {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 1px var(--primary-color);
        }

        .group-button ha-icon {
          --mdc-icon-size: ${size.iconSize};
        }
      </style>

      <div class="button-group-container">
        ${module.show_title && module.title
          ? html`<div class="button-group-title">${module.title}</div>`
          : ''}
        <div class="button-group">
          ${module.toggle_points.map(
            point => html`
              <button
                class="group-button ${activePointId === point.id ? 'active' : ''}"
                style="
                  background-color: ${activePointId === point.id
                    ? point.active_background_color ||
                      module.default_active_background_color ||
                      'var(--primary-color)'
                    : point.background_color || module.default_background_color || 'var(--secondary-background-color)'};
                  color: ${activePointId === point.id
                    ? point.active_text_color || module.default_active_text_color || 'white'
                    : point.text_color || module.default_text_color || 'var(--primary-text-color)'};
                  border-color: ${activePointId === point.id ? 'var(--primary-color)' : 'var(--divider-color)'};
                "
                @click=${(e: Event) => this.handleTogglePointClick(point, module, hass, e)}
              >
                ${module.show_icons && point.icon ? html`<ha-icon icon="${point.icon}"></ha-icon>` : ''}
                <span>${point.label}</span>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderSliderTrack(
    module: ToggleModule,
    hass: HomeAssistant,
    activePointId?: string
  ): TemplateResult {
    const activeIndex = module.toggle_points.findIndex(p => p.id === activePointId);
    const progressPercent = module.toggle_points.length > 1
      ? (activeIndex / (module.toggle_points.length - 1)) * 100
      : 0;
    const isVertical = module.orientation === 'vertical';
    
    // Calculate dynamic track size based on number of points and spacing
    const baseMarkerSize = 40; // Base size per marker
    const spacing = module.spacing || 0;
    const numPoints = module.toggle_points.length;
    const dynamicSize = module.alignment === 'justify' 
      ? '100%' 
      : `${baseMarkerSize * numPoints + spacing * (numPoints + 1)}px`;

    return html`
      <style>
        .slider-track-container {
          display: flex;
          flex-direction: column;
          align-items: ${module.alignment === 'left'
            ? 'flex-start'
            : module.alignment === 'right'
              ? 'flex-end'
              : 'center'};
          padding: 8px;
          gap: 12px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .slider-track-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .slider-track-wrapper {
          position: relative;
          ${isVertical
            ? `
            width: 40px;
            height: ${dynamicSize};
          `
            : `
            width: ${dynamicSize};
            height: 40px;
          `}
          background: var(--secondary-background-color);
          border-radius: 20px;
          overflow: hidden;
        }

        .slider-track-progress {
          position: absolute;
          background: var(--primary-color);
          transition: ${isVertical ? 'height' : 'width'} 0.3s ease;
          border-radius: 20px;
          ${isVertical
            ? `
            top: 0;
            left: 0;
            width: 100%;
            height: ${progressPercent}%;
          `
            : `
            top: 0;
            left: 0;
            height: 100%;
            width: ${progressPercent}%;
          `}
        }

        .slider-track-markers {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: ${isVertical ? 'column' : 'row'};
          align-items: center;
          justify-content: space-evenly;
          padding: 0;
        }

        .slider-marker {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1;
          transition: transform 0.2s ease;
        }

        .slider-marker:hover {
          transform: scale(1.1);
        }

        .slider-marker.active {
          transform: scale(1.2);
        }

        .slider-marker span {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-text-color);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
      </style>

      <div class="slider-track-container">
        ${module.show_title && module.title
          ? html`<div class="slider-track-title">${module.title}</div>`
          : ''}
        <div class="slider-track-wrapper">
          <div class="slider-track-progress"></div>
          <div class="slider-track-markers">
            ${module.toggle_points.map(
              point => html`
                <div
                  class="slider-marker ${activePointId === point.id ? 'active' : ''}"
                  @click=${(e: Event) => this.handleTogglePointClick(point, module, hass, e)}
                >
                  ${module.show_icons && point.icon
                    ? html`<ha-icon icon="${point.icon}"></ha-icon>`
                    : html`<span>${point.label}</span>`}
                </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }

  private renderTimeline(
    module: ToggleModule,
    hass: HomeAssistant,
    activePointId?: string
  ): TemplateResult {
    const isVertical = module.orientation === 'vertical';
    const activeIndex = module.toggle_points.findIndex(p => p.id === activePointId);
    const sizeMap = {
      compact: { dotSize: '12px', lineThickness: '2px', fontSize: '11px', iconSize: '14px' },
      normal: { dotSize: '16px', lineThickness: '3px', fontSize: '13px', iconSize: '18px' },
      large: { dotSize: '20px', lineThickness: '4px', fontSize: '15px', iconSize: '22px' },
    };
    const size = sizeMap[module.size || 'normal'];

    return html`
      <style>
        .timeline-container {
          display: flex;
          flex-direction: column;
          align-items: ${module.alignment === 'left'
            ? 'flex-start'
            : module.alignment === 'right'
              ? 'flex-end'
              : 'center'};
          padding: 8px;
          gap: 12px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .timeline-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .timeline-track {
          display: flex;
          flex-direction: ${isVertical ? 'column' : 'row'};
          align-items: ${isVertical ? 'flex-start' : 'flex-start'};
          position: relative;
          gap: ${module.spacing || 8}px;
        }

        .timeline-line {
          position: absolute;
          background: var(--divider-color);
          z-index: 0;
          ${isVertical
            ? `
            left: 16%;
            top: calc(${size.dotSize} / 2);
            bottom: calc(${size.dotSize} / 2);
            width: ${size.lineThickness};
          `
            : `
            top: calc(17px / 2 - 3px / 2);
            left: calc(${size.dotSize} / 2);
            right: calc(${size.dotSize} / 2);
            height: ${size.lineThickness};
          `}
        }

        .timeline-point {
          position: relative;
          display: flex;
          flex-direction: ${isVertical ? 'row' : 'column'};
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          cursor: pointer;
          z-index: 1;
          transition: all 0.3s ease;
        }

        .timeline-dot {
          width: ${size.dotSize};
          height: ${size.dotSize};
          border-radius: 50%;
          border: ${size.lineThickness} solid var(--primary-color);
          background: var(--card-background-color);
          transition: all 0.3s ease;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
          box-sizing: border-box;
        }

        .timeline-point.active .timeline-dot {
          background: var(--primary-color);
          transform: scale(1.3);
          box-shadow: 0 0 12px rgba(var(--rgb-primary-color), 0.6);
        }

        .timeline-point:hover .timeline-dot {
          transform: scale(1.15);
        }

        .timeline-label {
          font-size: ${size.fontSize};
          font-weight: 500;
          color: var(--secondary-text-color);
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .timeline-point.active .timeline-label {
          color: var(--primary-color);
          font-weight: 600;
        }

        .timeline-point ha-icon {
          --mdc-icon-size: ${size.iconSize};
          color: var(--secondary-text-color);
          transition: color 0.3s ease;
        }

        .timeline-point.active ha-icon {
          color: var(--primary-color);
        }
      </style>

      <div class="timeline-container">
        ${module.show_title && module.title
          ? html`<div class="timeline-title">${module.title}</div>`
          : ''}
        <div class="timeline-track">
          <div class="timeline-line"></div>
          ${module.toggle_points.map(
            point => html`
              <div
                class="timeline-point ${activePointId === point.id ? 'active' : ''}"
                @click=${(e: Event) => this.handleTogglePointClick(point, module, hass, e)}
              >
                <div class="timeline-dot"></div>
                ${module.show_icons && point.icon
                  ? html`<ha-icon icon="${point.icon}"></ha-icon>`
                  : html`<span class="timeline-label">${point.label}</span>`}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderMinimal(
    module: ToggleModule,
    hass: HomeAssistant,
    activePointId?: string
  ): TemplateResult {
    const isHorizontal = module.orientation === 'horizontal';
    const sizeMap = {
      compact: { padding: '4px 8px', fontSize: '12px', iconSize: '16px' },
      normal: { padding: '6px 12px', fontSize: '14px', iconSize: '20px' },
      large: { padding: '8px 16px', fontSize: '16px', iconSize: '24px' },
    };
    const size = sizeMap[module.size || 'normal'];

    return html`
      <style>
        .minimal-container {
          display: flex;
          flex-direction: column;
          align-items: ${module.alignment === 'left'
            ? 'flex-start'
            : module.alignment === 'right'
              ? 'flex-end'
              : 'center'};
          padding: 8px;
          gap: ${module.spacing || 8}px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .minimal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .minimal-options {
          display: flex;
          flex-direction: ${isHorizontal ? 'row' : 'column'};
          gap: ${module.spacing || 8}px;
          width: ${module.alignment === 'justify' ? '100%' : 'auto'};
        }

        .minimal-option {
          flex: ${module.alignment === 'justify' ? '1' : '0 0 auto'};
          padding: ${size.padding};
          font-size: ${size.fontSize};
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0.6;
          flex-direction: ${module.icon_position === 'above'
            ? 'column'
            : module.icon_position === 'below'
              ? 'column-reverse'
              : module.icon_position === 'right'
                ? 'row-reverse'
                : 'row'};
        }

        .minimal-option:hover {
          opacity: 0.8;
        }

        .minimal-option.active {
          opacity: 1;
          font-weight: 600;
        }

        .minimal-option ha-icon {
          --mdc-icon-size: ${size.iconSize};
        }
      </style>

      <div class="minimal-container">
        ${module.show_title && module.title ? html`<div class="minimal-title">${module.title}</div>` : ''}
        <div class="minimal-options">
          ${module.toggle_points.map(
            point => html`
              <button
                class="minimal-option ${activePointId === point.id ? 'active' : ''}"
                style="
                  color: ${activePointId === point.id
                    ? point.active_text_color || module.default_active_text_color || 'var(--primary-color)'
                    : point.text_color || module.default_text_color || 'var(--primary-text-color)'};
                "
                @click=${(e: Event) => this.handleTogglePointClick(point, module, hass, e)}
              >
                ${module.show_icons && point.icon ? html`<ha-icon icon="${point.icon}"></ha-icon>` : ''}
                <span>${point.label}</span>
              </button>
            `
          )}
        </div>
      </div>
    `;
  }
}

