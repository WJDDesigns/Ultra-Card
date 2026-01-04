import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, InfoModule, InfoEntityConfig, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { formatEntityState } from '../utils/number-format';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { EntityIconService } from '../services/entity-icon-service';
import { TemplateService } from '../services/template-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { localize } from '../localize/localize';
import { computeBackgroundStyles } from '../utils/uc-color-utils';
import { getPopupForModule } from '../services/popup-trigger-registry';
import '../components/ultra-color-picker';
import '../components/ultra-template-editor';
import { buildEntityContext } from '../utils/template-context';
import { parseUnifiedTemplate, hasTemplateError, getTemplateError } from '../utils/template-parser';
import {
  detectLegacyTemplates,
  migrateToUnified,
  shouldShowMigrationPrompt,
} from '../utils/template-migration';
import { preprocessTemplateVariables } from '../utils/uc-template-processor';

export class UltraInfoModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'info',
    title: 'Info Items',
    description: 'Show entity information values',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:information',
    category: 'data',
    tags: ['info', 'entity', 'data', 'sensors'],
  };

  private _templateService?: TemplateService;
  private _templateInputDebounce: any = null;

  createDefault(id?: string, hass?: HomeAssistant): InfoModule {
    return {
      id: id || this.generateId('info'),
      type: 'info',
      info_entities: [
        {
          id: this.generateId('entity'),
          entity: 'weather.forecast_home',
          name: 'Temperature',
          icon: 'mdi:thermometer',
          show_icon: true,
          show_name: true,
          show_state: true,
          show_units: true,
          text_size: 14,
          name_size: 12,
          icon_size: 26,
          text_bold: false,
          text_italic: false,
          text_uppercase: false,
          text_strikethrough: false,
          name_bold: false,
          name_italic: false,
          name_uppercase: false,
          name_strikethrough: false,
          icon_color: 'var(--primary-color)',
          name_color: 'var(--secondary-text-color)',
          text_color: 'var(--primary-text-color)',
          state_color: 'var(--primary-text-color)',
          click_action: 'more-info',
          navigation_path: '',
          url: '',
          service: '',
          service_data: {},
          template_mode: false,
          template: '',
          dynamic_icon_template_mode: false,
          dynamic_icon_template: '',
          dynamic_color_template_mode: false,
          dynamic_color_template: '',
          // Unified template system
          unified_template_mode: false,
          unified_template: '',
          ignore_entity_state_config: false,
          // Icon positioning and alignment
          icon_position: 'left',
          icon_alignment: 'center',
          name_alignment: 'start',
          state_alignment: 'start',
          overall_alignment: 'center',
          icon_gap: 8,
          // Name/Value layout direction (works with any icon position)
          name_value_layout: 'vertical',
          name_value_gap: 2,
          // Content distribution control
          content_distribution: 'normal',
        },
      ],
      // alignment: undefined, // No default alignment to allow Global Design tab control
      // vertical_alignment: undefined, // No default alignment to allow Global Design tab control
      columns: 1,
      gap: 12,
      allow_wrap: true, // Allow grid items to wrap to new rows
      // Global action configuration - smart default based on entity type
      tap_action: undefined,
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
    const infoModule = module as InfoModule;
    const lang = hass?.locale?.language || 'en';
    const defaultEntity = this.createDefault().info_entities[0];

    // Ensure the module has at least one entity with proper defaults
    if (!infoModule.info_entities || infoModule.info_entities.length === 0) {
      infoModule.info_entities = [{ ...defaultEntity }];
      // Update the module immediately to ensure persistence
      updateModule({ info_entities: infoModule.info_entities });
    }

    let entity = infoModule.info_entities[0]
      ? { ...defaultEntity, ...infoModule.info_entities[0] }
      : defaultEntity;

    // Ensure all required properties have default values - update the entity variable
    entity = {
      ...entity,
      icon_position: entity.icon_position || 'left',
      overall_alignment: entity.overall_alignment || 'center',
      icon_alignment: entity.icon_alignment || 'center',
      name_alignment: entity.name_alignment || 'start',
      state_alignment: entity.state_alignment || 'start',
      name_value_layout: entity.name_value_layout || 'vertical',
      name_value_gap: entity.name_value_gap !== undefined ? entity.name_value_gap : 2,
      content_distribution: entity.content_distribution || 'normal',
    };

    return html`
      ${this.injectUcFormStyles()}
      <style>
        /* Layout & Positioning button active styles */
        .control-btn.active {
          border: none !important;
          background: var(--primary-color) !important;
          color: white !important;
          border-radius: 2px !important;
        }
      </style>
      <div class="module-general-settings">
        <!-- Entity Configuration -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.entity_section.title', lang, 'ENTITY CONFIGURATION')}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ entity: entity.entity || '' }}
              .schema=${[
                {
                  name: 'entity',
                  label: localize('editor.info.entity', lang, 'Entity'),
                  description: localize(
                    'editor.info.entity_desc',
                    lang,
                    'Select the entity to display'
                  ),
                  selector: { entity: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) => {
                const next = e.detail.value.entity;
                const prev = infoModule.info_entities?.[0]?.entity || '';
                if (next === prev) return;
                this._handleEntityChange(infoModule, 0, next, hass, updateModule);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ha-form>
          </div>
        </div>

        <!-- Icon Settings -->
        <div
          class="settings-section icon-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.icon_section.title', lang, 'Icon Settings')}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ show_icon: entity.show_icon !== false }}
              .schema=${[
                {
                  name: 'show_icon',
                  label: localize('editor.info.show_icon', lang, 'Show Icon'),
                  description: localize(
                    'editor.info.show_icon_desc',
                    lang,
                    'Display an icon next to the entity value'
                  ),
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) => {
                this._updateEntity(
                  infoModule,
                  0,
                  { show_icon: e.detail.value.show_icon },
                  updateModule
                );
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ha-form>
          </div>

          ${entity.show_icon !== false
            ? html`
                <div style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${hass}
                    .data=${{ icon: entity.icon || '' }}
                    .schema=${[
                      {
                        name: 'icon',
                        label: localize('editor.info.icon', lang, 'Icon'),
                        description: localize(
                          'editor.info.icon_desc',
                          lang,
                          'Choose an icon to display'
                        ),
                        selector: { icon: {} },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) => {
                      const next = e.detail.value.icon;
                      const prev = infoModule.info_entities?.[0]?.icon || '';
                      if (next === prev) return;
                      this._updateEntity(infoModule, 0, { icon: next }, updateModule);
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ha-form>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${localize('editor.info.icon_color', lang, 'Icon Color')}
                  </div>
                  <ultra-color-picker
                    .value=${entity.icon_color || ''}
                    .defaultValue=${'var(--primary-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { icon_color: e.detail.value },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ultra-color-picker>
                </div>
              `
            : ''}
        </div>

        <!-- Name Settings -->
        <div
          class="settings-section name-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.name_section.title', lang, 'Name Settings')}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ show_name: entity.show_name !== false }}
              .schema=${[
                {
                  name: 'show_name',
                  label: localize('editor.info.show_name', lang, 'Show Name'),
                  description: localize(
                    'editor.info.show_name_desc',
                    lang,
                    'Display the entity name above the value'
                  ),
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) => {
                this._updateEntity(
                  infoModule,
                  0,
                  { show_name: e.detail.value.show_name },
                  updateModule
                );
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ha-form>
          </div>

          ${entity.show_name !== false
            ? html`
                <div style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${hass}
                    .data=${{ name: infoModule.info_entities[0]?.name ?? '' }}
                    .schema=${[
                      {
                        name: 'name',
                        label: localize('editor.info.custom_name', lang, 'Custom Name'),
                        description: localize(
                          'editor.info.custom_name_desc',
                          lang,
                          'Override the entity name with a custom name'
                        ),
                        selector: { text: {} },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { name: e.detail.value.name },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ha-form>
                </div>

                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${localize('editor.info.name_color', lang, 'Name Color')}
                  </div>
                  <ultra-color-picker
                    .value=${entity.name_color || ''}
                    .defaultValue=${'var(--secondary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { name_color: e.detail.value },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ultra-color-picker>
                </div>
              `
            : ''}
        </div>

        <!-- State Settings -->
        <div
          class="settings-section state-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.state_section.title', lang, 'State Settings')}
          </div>

          <div style="margin-bottom: 16px;">
            <ha-form
              .hass=${hass}
              .data=${{ show_state: entity.show_state !== false }}
              .schema=${[
                {
                  name: 'show_state',
                  label: localize('editor.info.show_state', lang, 'Show State'),
                  description: localize(
                    'editor.info.show_state_desc',
                    lang,
                    'Display the entity state/value'
                  ),
                  selector: { boolean: {} },
                },
              ]}
              .computeLabel=${(schema: any) => schema.label || schema.name}
              .computeDescription=${(schema: any) => schema.description || ''}
              @value-changed=${(e: CustomEvent) => {
                this._updateEntity(
                  infoModule,
                  0,
                  { show_state: e.detail.value.show_state },
                  updateModule
                );
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ha-form>
          </div>

          ${entity.show_state !== false
            ? html`
                <div style="margin-bottom: 16px;">
                  <ha-form
                    .hass=${hass}
                    .data=${{ show_units: entity.show_units !== false }}
                    .schema=${[
                      {
                        name: 'show_units',
                        label: localize('editor.info.show_units', lang, 'Show Units'),
                        description: localize(
                          'editor.info.show_units_desc',
                          lang,
                          'Display the unit of measurement (if available)'
                        ),
                        selector: { boolean: {} },
                      },
                    ]}
                    .computeLabel=${(schema: any) => schema.label || schema.name}
                    .computeDescription=${(schema: any) => schema.description || ''}
                    @value-changed=${(e: CustomEvent) => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { show_units: e.detail.value.show_units },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ha-form>
                </div>
              `
            : ''}
          ${entity.show_state !== false
            ? html`
                <div style="margin-bottom: 16px;">
                  <div
                    class="field-title"
                    style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
                  >
                    ${localize('editor.info.state_color', lang, 'State Color')}
                  </div>
                  <ultra-color-picker
                    .value=${entity.state_color || ''}
                    .defaultValue=${'var(--primary-text-color)'}
                    .hass=${hass}
                    @value-changed=${(e: CustomEvent) => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { state_color: e.detail.value },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                  ></ultra-color-picker>
                </div>
              `
            : ''}
        </div>

        <!-- Name & Value Layout Section (always shown) -->
        <div
          class="settings-section name-value-layout-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.name_value_layout.title', lang, 'Name & Value Layout')}
          </div>

          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${localize(
                'editor.info.name_value_layout.orientation',
                lang,
                'Layout Direction'
              )}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${entity.show_icon === false
                ? localize(
                    'editor.info.name_value_layout.orientation_desc',
                    lang,
                    'Choose how to display the name and value'
                  )
                : (entity.icon_position === 'left' || entity.icon_position === 'right')
                  ? localize(
                      'editor.info.name_value_layout.orientation_desc_with_icon',
                      lang,
                      'Choose how to arrange the name and value beside the icon'
                    )
                  : localize(
                      'editor.info.name_value_layout.orientation_desc_vertical_icon',
                      lang,
                      'Arrange name and value (horizontal places them on one line)'
                    )}
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; width: 100%;"
            >
              ${[
                { value: 'vertical', icon: 'mdi:arrow-up-down', label: 'Vertical' },
                { value: 'horizontal', icon: 'mdi:arrow-left-right', label: 'Horizontal' },
              ].map(
                layout => html`
                  <button
                    type="button"
                    class="control-btn ${(entity.name_value_layout || 'vertical') ===
                    layout.value
                      ? 'active'
                      : ''}"
                    @click=${() => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { name_value_layout: layout.value as any },
                        updateModule
                      );
                      // Delay long enough for debounced config to propagate (200ms > 100ms debounce)
                      setTimeout(() => this.triggerPreviewUpdate(), 200);
                    }}
                    title="${layout.label}"
                    style="padding: 12px 8px; gap: 8px;"
                  >
                    <ha-icon icon="${layout.icon}"></ha-icon>
                    <span style="font-size: 12px;">${layout.label}</span>
                  </button>
                `
              )}
            </div>
          </div>

          <div class="field-container" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 8px;"
            >
              ${localize('editor.info.name_value_gap', lang, 'Name & Value Gap')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${localize(
                'editor.info.name_value_gap_desc',
                lang,
                'Space between the name and value in pixels'
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
                max="32"
                step="1"
                .value="${entity.name_value_gap !== undefined ? entity.name_value_gap : 2}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = Number(target.value);
                  this._updateEntity(infoModule, 0, { name_value_gap: value }, updateModule);
                  setTimeout(() => this.triggerPreviewUpdate(), 200);
                }}
              />
              <input
                type="number"
                class="gap-input"
                min="0"
                max="32"
                step="1"
                .value="${entity.name_value_gap !== undefined ? entity.name_value_gap : 2}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = Number(target.value);
                  if (!isNaN(value)) {
                    this._updateEntity(
                      infoModule,
                      0,
                      { name_value_gap: value },
                      updateModule
                    );
                    setTimeout(() => this.triggerPreviewUpdate(), 200);
                  }
                }}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    const currentValue = Number(target.value) || 2;
                    const increment = e.key === 'ArrowUp' ? 1 : -1;
                    const newValue = Math.max(0, Math.min(32, currentValue + increment));
                    this._updateEntity(
                      infoModule,
                      0,
                      { name_value_gap: newValue },
                      updateModule
                    );
                    setTimeout(() => this.triggerPreviewUpdate(), 200);
                  }
                }}
              />
              <button
                class="reset-btn"
                @click=${() => {
                  this._updateEntity(infoModule, 0, { name_value_gap: 2 }, updateModule);
                  setTimeout(() => this.triggerPreviewUpdate(), 200);
                }}
                title="${localize(
                  'editor.fields.reset_default_value',
                  lang,
                  'Reset to default ({value})'
                ).replace('{value}', '2')}"
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Migration Banner (if legacy templates detected) -->
        ${shouldShowMigrationPrompt(entity)
          ? html`
              <div
                class="migration-banner"
                style="
                  background: linear-gradient(135deg, rgba(var(--rgb-primary-color), 0.1), rgba(var(--rgb-primary-color), 0.05));
                  border: 2px solid var(--primary-color);
                  border-radius: 12px;
                  padding: 20px;
                  margin-bottom: 24px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                "
              >
                <div style="display: flex; align-items: start; gap: 16px;">
                  <ha-icon
                    icon="mdi:lightbulb-on-outline"
                    style="color: var(--primary-color); font-size: 32px; flex-shrink: 0;"
                  ></ha-icon>
                  <div style="flex: 1;">
                    <div
                      style="font-size: 18px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.info.migration_title',
                        lang,
                        'Template Migration Available'
                      )}
                    </div>
                    <div
                      style="font-size: 14px; color: var(--primary-text-color); margin-bottom: 12px; line-height: 1.5;"
                    >
                      ${localize(
                        'editor.info.migration_desc',
                        lang,
                        `Combine your templates into one unified template for easier editing.`
                      )}
                    </div>
                    <button
                      style="
                        background: var(--primary-color);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                      "
                      @click=${() => {
                        const migration = migrateToUnified(entity);
                        this._updateEntity(
                          infoModule,
                          0,
                          {
                            unified_template_mode: migration.unified_template_mode,
                            unified_template: migration.unified_template,
                            ignore_entity_state_config: migration.ignore_entity_state_config,
                            template_mode: false,
                            dynamic_icon_template_mode: false,
                            dynamic_color_template_mode: false,
                          },
                          updateModule
                        );
                      }}
                    >
                      ${localize('editor.info.migrate_button', lang, 'Migrate to Unified Template')}
                    </button>
                  </div>
                </div>
              </div>
            `
          : ''}

        <!-- Unified Template Section (New Preferred Method) -->
        <div class="template-section" style="margin-bottom: 24px;">
          <div class="template-header">
            <div class="switch-container">
              <label class="switch-label"
                >${localize(
                  'editor.info.unified_template_section.title',
                  lang,
                  'Template Mode'
                )}</label
              >
              <label class="switch">
                <input
                  type="checkbox"
                  .checked=${entity.unified_template_mode || false}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    this._updateEntity(
                      infoModule,
                      0,
                      { unified_template_mode: checked },
                      updateModule
                    );
                  }}
                />
                <span class="slider round"></span>
              </label>
            </div>
            <div class="template-description">
              ${localize(
                'editor.info.unified_template_section.desc',
                lang,
                'Use Jinja2 templates to control icon and color dynamically. Uses entity context variables for seamless entity remapping.'
              )}
            </div>
          </div>

          ${entity.unified_template_mode
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
                    .value=${entity.unified_template || ''}
                    .placeholder=${'{\n  "icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{% endif %}",\n  "icon_color": "{% if state|int > 25 %}red{% else %}blue{% endif %}"\n}'}
                    .minHeight=${200}
                    .maxHeight=${500}
                    @value-changed=${(e: CustomEvent) => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { unified_template: e.detail.value },
                        updateModule
                      );
                    }}
                  ></ultra-template-editor>
                  <div class="template-help">
                    <p><strong>Entity context variables available:</strong></p>
                    <ul>
                      <li>
                        <code>entity</code>, <code>state</code>, <code>name</code>,
                        <code>attributes</code>, <code>unit</code>, <code>domain</code>
                      </li>
                    </ul>
                    <p><strong>Return JSON for multiple properties:</strong></p>
                    <code
                      style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                    >
                      {<br />
                      &nbsp;&nbsp;"icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{%
                      endif %}",<br />
                      &nbsp;&nbsp;"icon_color": "red"<br />
                      }
                    </code>
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Legacy Templates Section (Deprecated) -->
        <details
          style="margin-bottom: 24px;"
          ${entity.template_mode ||
          entity.dynamic_icon_template_mode ||
          entity.dynamic_color_template_mode
            ? 'open'
            : ''}
        >
          <summary
            style="
            padding: 12px 16px;
            background: var(--secondary-background-color);
            border: 1px solid var(--divider-color);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            color: var(--secondary-text-color);
          "
          >
            ${localize('editor.info.legacy_templates', lang, 'Legacy Templates (Deprecated)')}
            ${entity.template_mode ||
            entity.dynamic_icon_template_mode ||
            entity.dynamic_color_template_mode
              ? html`<span
                  style="background: var(--warning-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;"
                  >IN USE</span
                >`
              : ''}
          </summary>
          <div style="padding: 16px;">
            <!-- Advanced Template Mode Section -->
            <div class="template-section" style="margin-bottom: 24px;">
              <div class="template-header">
                <div class="switch-container">
                  <label class="switch-label"
                    >${localize(
                      'editor.info.advanced_template_section.title',
                      lang,
                      'Advanced Template Mode'
                    )}</label
                  >
                  <label class="switch">
                    <input
                      type="checkbox"
                      .checked=${entity.template_mode || false}
                      @change=${(e: Event) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        this._updateEntity(infoModule, 0, { template_mode: checked }, updateModule);
                      }}
                    />
                    <span class="slider round"></span>
                  </label>
                </div>
                <div class="template-description">
                  ${localize(
                    'editor.info.advanced_template_section.desc',
                    lang,
                    'Use Jinja2 templates for advanced value control. Templates can control visibility (true/false to show/hide) and customize display text. Return custom text for display, return actual entity state for fallback.'
                  )}
                </div>
              </div>

              ${entity.template_mode
                ? html`
                    <div 
                      class="template-content"
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @click=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.stopPropagation()}
                    >
                      <ultra-template-editor
                        .hass=${hass}
                        .value=${entity.template || ''}
                        .placeholder=${"{% if states('binary_sensor.example') == 'on' %}Active{% else %}Inactive{% endif %}"}
                        .minHeight=${150}
                        .maxHeight=${400}
                        @value-changed=${(e: CustomEvent) => {
                          this._updateEntity(
                            infoModule,
                            0,
                            { template: e.detail.value },
                            updateModule
                          );
                          this._handleTemplateChange(e.detail.value, infoModule, 0, hass);
                        }}
                      ></ultra-template-editor>
                      <div class="template-help">
                        <p><strong>For visibility control, return a boolean:</strong></p>
                        <ul>
                          <li>
                            <code>true</code>, <code>on</code>, <code>yes</code>, <code>1</code> →
                            Show value (Active State)
                          </li>
                          <li>
                            <code>false</code>, <code>off</code>, <code>no</code>, <code>0</code> →
                            Hide value (Inactive State)
                          </li>
                        </ul>
                        <p><strong>For custom display text, return a string:</strong></p>
                        <ul>
                          <li>
                            <code
                              >{% if states('weather.forecast_home') == 'cloudy' %}About to Rain{%
                              else %}{{ states('weather.forecast_home') }}{% endif %}</code
                            >
                            → When cloudy: shows "About to Rain" (Active), when not cloudy: shows
                            actual state (Inactive)
                          </li>
                          <li>
                            <code>{{ states('sensor.temperature') | round(1) }}°F</code> → Shows
                            formatted temperature and Active State is current
                          </li>
                        </ul>
                        <p>
                          <strong>Note:</strong> Use the same entity name throughout your template
                          to avoid "unknown" states
                        </p>
                      </div>
                    </div>
                  `
                : ''}
            </div>

            <!-- Dynamic Icon Template Section -->
            <div class="template-section" style="margin-bottom: 24px;">
              <div class="template-header">
                <div class="switch-container">
                  <label class="switch-label"
                    >${localize(
                      'editor.info.dynamic_icon_template_section.title',
                      lang,
                      'Dynamic Icon Template'
                    )}</label
                  >
                  <label class="switch">
                    <input
                      type="checkbox"
                      .checked=${entity.dynamic_icon_template_mode || false}
                      @change=${(e: Event) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        this._updateEntity(
                          infoModule,
                          0,
                          { dynamic_icon_template_mode: checked },
                          updateModule
                        );
                      }}
                    />
                    <span class="slider round"></span>
                  </label>
                </div>
                <div class="template-description">
                  ${localize(
                    'editor.info.dynamic_icon_template_section.desc',
                    lang,
                    'Use Jinja2 templates to dynamically change the icon based on conditions. Return a valid icon name (e.g., mdi:weather-sunny, mdi:home, mdi:lightbulb) or empty for default icon.'
                  )}
                </div>
              </div>

              ${entity.dynamic_icon_template_mode
                ? html`
                    <div 
                      class="template-content"
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @click=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.stopPropagation()}
                    >
                      <ultra-template-editor
                        .hass=${hass}
                        .value=${entity.dynamic_icon_template || ''}
                        .placeholder=${"{% if states('binary_sensor.example') == 'on' %}mdi:lightbulb-on{% else %}mdi:lightbulb-off{% endif %}"}
                        .minHeight=${100}
                        .maxHeight=${300}
                        @value-changed=${(e: CustomEvent) => {
                          this._updateEntity(
                            infoModule,
                            0,
                            { dynamic_icon_template: e.detail.value },
                            updateModule
                          );
                        }}
                      ></ultra-template-editor>
                      <div class="template-help">
                        <p><strong>Return an icon name:</strong></p>
                        <ul>
                          <li><code>mdi:weather-sunny</code> → Weather icon</li>
                          <li><code>mdi:home</code> → Home icon</li>
                          <li><code>mdi:lightbulb</code> → Light icon</li>
                          <li>
                            <code>{{ states.light.living_room.attributes.icon }}</code>
                            → Use entity's current icon
                          </li>
                        </ul>
                        <p>
                          <strong>Example:</strong>
                          <code
                            >{% if states('sensor.temperature') | int > 25 %}mdi:thermometer{% else
                            %}mdi:snowflake{% endif %}</code
                          >
                        </p>
                      </div>
                    </div>
                  `
                : ''}
            </div>

            <!-- Dynamic Icon Color Template Section -->
            <div class="template-section" style="margin-bottom: 24px;">
              <div class="template-header">
                <div class="switch-container">
                  <label class="switch-label"
                    >${localize(
                      'editor.info.dynamic_color_template_section.title',
                      lang,
                      'Dynamic Icon Color Template'
                    )}</label
                  >
                  <label class="switch">
                    <input
                      type="checkbox"
                      .checked=${entity.dynamic_color_template_mode || false}
                      @change=${(e: Event) => {
                        const checked = (e.target as HTMLInputElement).checked;
                        this._updateEntity(
                          infoModule,
                          0,
                          { dynamic_color_template_mode: checked },
                          updateModule
                        );
                      }}
                    />
                    <span class="slider round"></span>
                  </label>
                </div>
                <div class="template-description">
                  ${localize(
                    'editor.info.dynamic_color_template_section.desc',
                    lang,
                    'Use Jinja2 templates to dynamically change icon color based on conditions. Return a valid CSS color value (e.g., #FF0000, rgb(255,0,0), red) or empty for default color.'
                  )}
                </div>
              </div>

              ${entity.dynamic_color_template_mode
                ? html`
                    <div 
                      class="template-content"
                      @mousedown=${(e: Event) => e.stopPropagation()}
                      @click=${(e: Event) => e.stopPropagation()}
                      @dragstart=${(e: Event) => e.stopPropagation()}
                    >
                      <ultra-template-editor
                        .hass=${hass}
                        .value=${entity.dynamic_color_template || ''}
                        .placeholder=${"{% if states('binary_sensor.example') == 'on' %}#FF0000{% else %}#00FF00{% endif %}"}
                        .minHeight=${100}
                        .maxHeight=${300}
                        @value-changed=${(e: CustomEvent) => {
                          this._updateEntity(
                            infoModule,
                            0,
                            { dynamic_color_template: e.detail.value },
                            updateModule
                          );
                        }}
                      ></ultra-template-editor>
                      <div class="template-help">
                        <p><strong>Return a CSS color value:</strong></p>
                        <ul>
                          <li><code>#FF0000</code> → Red color in hex</li>
                          <li><code>rgb(255, 0, 0)</code> → Red color in RGB</li>
                          <li><code>red</code> → Red color by name</li>
                          <li>
                            <code
                              >{{ states.light.living_room.attributes.rgb_color | join(',') |
                              format('rgb(%s)') }}</code
                            >
                            → Use entity RGB color
                          </li>
                        </ul>
                        <p>
                          <strong>Example:</strong>
                          <code
                            >{% if states('sensor.temperature') | int > 25 %}#FF4444{% else
                            %}#4444FF{% endif %}</code
                          >
                        </p>
                      </div>
                    </div>
                  `
                : ''}
            </div>
          </div>
        </details>

        <!-- Size Settings -->
        <div
          class="settings-section size-settings"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.size_section.title', lang, 'Size Settings')}
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${entity.show_icon !== false
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.info.icon_size', lang, 'Icon Size')}
                    </div>
                    <div class="field-description">
                      ${localize('editor.info.icon_size_desc', lang, 'Size of the icon in pixels')}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="12"
                        max="48"
                        step="1"
                        .value="${Number(entity.icon_size) || 26}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = Number(target.value);
                          this._updateEntity(infoModule, 0, { icon_size: value }, updateModule);
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="12"
                        max="48"
                        step="1"
                        .value="${Number(entity.icon_size) || 26}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = Number(target.value);
                          if (!isNaN(value)) {
                            this._updateEntity(infoModule, 0, { icon_size: value }, updateModule);
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = Number(target.value) || 26;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(12, Math.min(48, currentValue + increment));
                            this._updateEntity(
                              infoModule,
                              0,
                              { icon_size: newValue },
                              updateModule
                            );
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }
                        }}
                      />
                      <button
                        class="reset-btn"
                        @click=${() => {
                          this._updateEntity(infoModule, 0, { icon_size: 26 }, updateModule);
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '26')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `
              : ''}
            ${entity.show_name !== false
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.info.name_size', lang, 'Name Size')}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.info.name_size_desc',
                        lang,
                        'Size of the entity name text in pixels'
                      )}
                    </div>
                    <div
                      class="gap-control-container"
                      style="display: flex; align-items: center; gap: 12px;"
                    >
                      <input
                        type="range"
                        class="gap-slider"
                        min="8"
                        max="32"
                        step="1"
                        .value="${entity.name_size || 12}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = Number(target.value);
                          this._updateEntity(infoModule, 0, { name_size: value }, updateModule);
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="8"
                        max="32"
                        step="1"
                        .value="${entity.name_size || 12}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = Number(target.value);
                          if (!isNaN(value)) {
                            this._updateEntity(infoModule, 0, { name_size: value }, updateModule);
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = Number(target.value) || 12;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(8, Math.min(32, currentValue + increment));
                            this._updateEntity(
                              infoModule,
                              0,
                              { name_size: newValue },
                              updateModule
                            );
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }
                        }}
                      />
                      <button
                        class="reset-btn"
                        @click=${() => {
                          this._updateEntity(infoModule, 0, { name_size: 12 }, updateModule);
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }}
                        title="${localize(
                          'editor.fields.reset_default_value',
                          lang,
                          'Reset to default ({value})'
                        ).replace('{value}', '12')}"
                      >
                        <ha-icon icon="mdi:refresh"></ha-icon>
                      </button>
                    </div>
                  </div>
                `
              : ''}

            <div class="field-container" style="margin-bottom: 24px;">
              <div class="field-title">
                ${localize('editor.info.value_size', lang, 'Value Size')}
              </div>
              <div class="field-description">
                ${localize(
                  'editor.info.value_size_desc',
                  lang,
                  'Size of the entity value text in pixels'
                )}
              </div>
              <div
                class="gap-control-container"
                style="display: flex; align-items: center; gap: 12px;"
              >
                <input
                  type="range"
                  class="gap-slider"
                  min="8"
                  max="32"
                  step="1"
                  .value="${entity.text_size || 14}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = Number(target.value);
                    this._updateEntity(infoModule, 0, { text_size: value }, updateModule);
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                />
                <input
                  type="number"
                  class="gap-input"
                  min="8"
                  max="32"
                  step="1"
                  .value="${entity.text_size || 14}"
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const value = Number(target.value);
                    if (!isNaN(value)) {
                      this._updateEntity(infoModule, 0, { text_size: value }, updateModule);
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  }}
                  @keydown=${(e: KeyboardEvent) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      const currentValue = Number(target.value) || 14;
                      const increment = e.key === 'ArrowUp' ? 1 : -1;
                      const newValue = Math.max(8, Math.min(32, currentValue + increment));
                      this._updateEntity(infoModule, 0, { text_size: newValue }, updateModule);
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  }}
                />
                <button
                  class="reset-btn"
                  @click=${() => {
                    this._updateEntity(infoModule, 0, { text_size: 14 }, updateModule);
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
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

            ${entity.show_icon !== false
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    <div class="field-title">
                      ${localize('editor.info.icon_gap', lang, 'Icon Gap')}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.info.icon_gap_desc',
                        lang,
                        'Space between the icon and content in pixels'
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
                        max="32"
                        step="1"
                        .value="${entity.icon_gap || 8}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = Number(target.value);
                          this._updateEntity(infoModule, 0, { icon_gap: value }, updateModule);
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }}
                      />
                      <input
                        type="number"
                        class="gap-input"
                        min="0"
                        max="32"
                        step="1"
                        .value="${entity.icon_gap || 8}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          const value = Number(target.value);
                          if (!isNaN(value)) {
                            this._updateEntity(infoModule, 0, { icon_gap: value }, updateModule);
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }
                        }}
                        @keydown=${(e: KeyboardEvent) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const target = e.target as HTMLInputElement;
                            const currentValue = Number(target.value) || 8;
                            const increment = e.key === 'ArrowUp' ? 1 : -1;
                            const newValue = Math.max(0, Math.min(32, currentValue + increment));
                            this._updateEntity(infoModule, 0, { icon_gap: newValue }, updateModule);
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }
                        }}
                      />
                      <button
                        class="reset-btn"
                        @click=${() => {
                          this._updateEntity(infoModule, 0, { icon_gap: 8 }, updateModule);
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }}
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
              : ''}
          </div>
        </div>

        <!-- Layout & Positioning Section -->
        <div
          class="settings-section layout-positioning-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 24px;"
        >
          <div
            class="section-title"
            style="font-size: 18px !important; font-weight: 700 !important; text-transform: uppercase !important; color: var(--primary-color); margin-bottom: 16px; border-bottom: 2px solid var(--primary-color); padding-bottom: 8px;"
          >
            ${localize('editor.info.layout_section.title', lang, 'Layout & Positioning')}
          </div>

          <!-- Allow Wrap Toggle -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="flex: 1;">
                <div
                  class="field-title"
                  style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
                >
                  ${localize('editor.info.allow_wrap', lang, 'Allow Wrapping')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px !important; font-weight: 400 !important; color: var(--secondary-text-color); opacity: 0.8; line-height: 1.4;"
                >
                  ${localize(
                    'editor.info.allow_wrap_desc',
                    lang,
                    'Allow grid items to wrap to new rows when they exceed the container width'
                  )}
                </div>
              </div>
              <div style="margin-left: 16px;">
                <ha-switch
                  .checked=${infoModule.allow_wrap !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ allow_wrap: target.checked });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }}
                ></ha-switch>
              </div>
            </div>
          </div>

          <!-- Icon Position -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${localize('editor.info.icon_position', lang, 'Icon Position')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${localize(
                'editor.info.icon_position_desc',
                lang,
                'Position the icon relative to the content (left, top, right, or bottom)'
              )}
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;"
            >
              ${[
                { value: 'left', icon: 'mdi:arrow-left' },
                { value: 'top', icon: 'mdi:arrow-up' },
                { value: 'right', icon: 'mdi:arrow-right' },
                { value: 'bottom', icon: 'mdi:arrow-down' },
              ].map(
                position => html`
                  <button
                    type="button"
                    class="control-btn ${(entity.icon_position || 'left') === position.value
                      ? 'active'
                      : ''}"
                    @click=${() => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { icon_position: position.value as any },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                    title="${position.value.charAt(0).toUpperCase() + position.value.slice(1)}"
                  >
                    <ha-icon icon="${position.icon}"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Content Distribution -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${localize('editor.info.content_distribution', lang, 'Content Distribution')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${localize(
                'editor.info.content_distribution_desc',
                lang,
                'Control how icon and content are distributed along the main axis'
              )}
            </div>
            <div
              class="control-button-group"
              style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 100%;"
            >
              ${[
                { value: 'normal', icon: 'mdi:format-align-left', label: 'Normal' },
                { value: 'space-between', icon: 'mdi:arrow-left-right', label: 'Space Between' },
                { value: 'space-around', icon: 'mdi:arrow-expand-horizontal', label: 'Space Around' },
                { value: 'space-evenly', icon: 'mdi:arrow-expand-all', label: 'Space Evenly' },
              ].map(
                distribution => html`
                  <button
                    type="button"
                    class="control-btn ${(entity.content_distribution || 'normal') ===
                    distribution.value
                      ? 'active'
                      : ''}"
                    @click=${() => {
                      this._updateEntity(
                        infoModule,
                        0,
                        { content_distribution: distribution.value as any },
                        updateModule
                      );
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }}
                    title="${distribution.label}"
                  >
                    <ha-icon icon="${distribution.icon}"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Overall Alignment and Name Alignment Side by Side -->
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; margin-bottom: 24px;"
          >
            <!-- Overall Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${localize('editor.info.overall_alignment', lang, 'Overall Alignment')}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${localize(
                  'editor.info.overall_alignment_desc',
                  lang,
                  'Align the entire info item within its container'
                )}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[
                  { value: 'left', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'right', icon: 'mdi:format-align-right' },
                ].map(
                  alignment => html`
                    <button
                      type="button"
                      class="control-btn ${(entity.overall_alignment || 'center') ===
                      alignment.value
                        ? 'active'
                        : ''}"
                      @click=${() => {
                        this._updateEntity(
                          infoModule,
                          0,
                          { overall_alignment: alignment.value as any },
                          updateModule
                        );
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                      title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                    >
                      <ha-icon icon="${alignment.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>

            <!-- Name Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${localize('editor.info.name_alignment', lang, 'Name Alignment')}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${localize(
                  'editor.info.name_alignment_desc',
                  lang,
                  'Align the name text within its container'
                )}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[
                  { value: 'start', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'end', icon: 'mdi:format-align-right' },
                ].map(
                  alignment => html`
                    <button
                      type="button"
                      class="control-btn ${(entity.name_alignment || 'start') === alignment.value
                        ? 'active'
                        : ''}"
                      @click=${() => {
                        this._updateEntity(
                          infoModule,
                          0,
                          { name_alignment: alignment.value as any },
                          updateModule
                        );
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                      title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                    >
                      <ha-icon icon="${alignment.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>
          </div>

          <!-- Icon Alignment and State Alignment Side by Side -->
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px;"
          >
            <!-- Icon Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${localize('editor.info.icon_alignment', lang, 'Icon Alignment')}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${localize(
                  'editor.info.icon_alignment_desc',
                  lang,
                  'Align the icon along the cross axis'
                )}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[
                  { value: 'start', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'end', icon: 'mdi:format-align-right' },
                ].map(
                  alignment => html`
                    <button
                      type="button"
                      class="control-btn ${(entity.icon_alignment || 'center') === alignment.value
                        ? 'active'
                        : ''}"
                      @click=${() => {
                        this._updateEntity(
                          infoModule,
                          0,
                          { icon_alignment: alignment.value as any },
                          updateModule
                        );
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                      title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                    >
                      <ha-icon icon="${alignment.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>

            <!-- State Alignment -->
            <div class="field-group">
              <div
                class="field-title"
                style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
              >
                ${localize('editor.info.state_alignment', lang, 'State Alignment')}
              </div>
              <div
                class="field-description"
                style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
              >
                ${localize(
                  'editor.info.state_alignment_desc',
                  lang,
                  'Align the state/value text within its container'
                )}
              </div>
              <div
                class="control-button-group"
                style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"
              >
                ${[
                  { value: 'start', icon: 'mdi:format-align-left' },
                  { value: 'center', icon: 'mdi:format-align-center' },
                  { value: 'end', icon: 'mdi:format-align-right' },
                ].map(
                  alignment => html`
                    <button
                      type="button"
                      class="control-btn ${(entity.state_alignment || 'start') === alignment.value
                        ? 'active'
                        : ''}"
                      @click=${() => {
                        this._updateEntity(
                          infoModule,
                          0,
                          { state_alignment: alignment.value as any },
                          updateModule
                        );
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                      title="${alignment.value.charAt(0).toUpperCase() + alignment.value.slice(1)}"
                    >
                      <ha-icon icon="${alignment.icon}"></ha-icon>
                    </button>
                  `
                )}
              </div>
            </div>
          </div>
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
    return GlobalActionsTab.render(module as any, hass, updates => updateModule(updates));
  }

  // Explicit Logic tab renderer (some editors call this directly)
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as any, hass, updates => updateModule(updates));
  }

  private renderSingleActionConfig(
    label: string,
    description: string,
    action: any,
    hass: HomeAssistant,
    updateAction: (action: any) => void
  ): TemplateResult {
    const schema = [
      {
        name: 'action_config',
        label: '',
        selector: {
          ui_action: {
            actions: [
              'default',
              'more-info',
              'toggle',
              'navigate',
              'url',
              'perform-action',
              'assist',
            ],
          },
        },
      },
    ];

    const data = {
      action_config: action?.action === 'nothing' ? { ...action, action: 'default' } : action,
    };

    return html`
      <div style="margin-bottom: 16px;">
        <ha-form
          .hass=${hass}
          .data=${data}
          .schema=${schema}
          .computeLabel=${(schema: any) => schema.label || ''}
          @value-changed=${(e: CustomEvent) => {
            const newAction = e.detail.value?.action_config;
            if (newAction) {
              updateAction(newAction);
            }
          }}
        ></ha-form>
      </div>
    `;
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
    const infoModule = module as InfoModule;

    // Apply design properties with priority - design properties override module properties
    const moduleWithDesign = infoModule as any;
    const designFromDesignObject = (infoModule as any).design || {};

    // Create merged design properties object that prioritizes top-level properties (where Global Design saves)
    // over design object properties, and includes all properties needed by the container styles
    const designProperties = {
      // Text properties - prioritize top-level (where Global Design saves them)
      color: (infoModule as any).color || designFromDesignObject.color,
      font_size: (infoModule as any).font_size || designFromDesignObject.font_size,
      font_weight: (infoModule as any).font_weight || designFromDesignObject.font_weight,
      font_style: (infoModule as any).font_style || designFromDesignObject.font_style,
      text_transform: (infoModule as any).text_transform || designFromDesignObject.text_transform,
      font_family: (infoModule as any).font_family || designFromDesignObject.font_family,
      line_height: (infoModule as any).line_height || designFromDesignObject.line_height,
      letter_spacing: (infoModule as any).letter_spacing || designFromDesignObject.letter_spacing,
      text_align: (infoModule as any).text_align || designFromDesignObject.text_align,
      white_space: (infoModule as any).white_space || designFromDesignObject.white_space,
      text_shadow_h: (infoModule as any).text_shadow_h || designFromDesignObject.text_shadow_h,
      text_shadow_v: (infoModule as any).text_shadow_v || designFromDesignObject.text_shadow_v,
      text_shadow_blur:
        (infoModule as any).text_shadow_blur || designFromDesignObject.text_shadow_blur,
      text_shadow_color:
        (infoModule as any).text_shadow_color || designFromDesignObject.text_shadow_color,
      // Container properties - also check both locations
      background_color:
        (infoModule as any).background_color || designFromDesignObject.background_color,
      background_image:
        (infoModule as any).background_image || designFromDesignObject.background_image,
      background_size:
        (infoModule as any).background_size || designFromDesignObject.background_size,
      background_position:
        (infoModule as any).background_position || designFromDesignObject.background_position,
      background_repeat:
        (infoModule as any).background_repeat || designFromDesignObject.background_repeat,
      border_style: (infoModule as any).border_style || designFromDesignObject.border_style,
      border_width: (infoModule as any).border_width || designFromDesignObject.border_width,
      border_color: (infoModule as any).border_color || designFromDesignObject.border_color,
      border_radius: (infoModule as any).border_radius || designFromDesignObject.border_radius,
      position: (infoModule as any).position || designFromDesignObject.position,
      top: (infoModule as any).top || designFromDesignObject.top,
      bottom: (infoModule as any).bottom || designFromDesignObject.bottom,
      left: (infoModule as any).left || designFromDesignObject.left,
      right: (infoModule as any).right || designFromDesignObject.right,
      z_index: (infoModule as any).z_index || designFromDesignObject.z_index,
      width: (infoModule as any).width || designFromDesignObject.width,
      height: (infoModule as any).height || designFromDesignObject.height,
      max_width: (infoModule as any).max_width || designFromDesignObject.max_width,
      max_height: (infoModule as any).max_height || designFromDesignObject.max_height,
      min_width: (infoModule as any).min_width || designFromDesignObject.min_width,
      min_height: (infoModule as any).min_height || designFromDesignObject.min_height,
      overflow: (infoModule as any).overflow || designFromDesignObject.overflow,
      clip_path: (infoModule as any).clip_path || designFromDesignObject.clip_path,
      backdrop_filter:
        (infoModule as any).backdrop_filter || designFromDesignObject.backdrop_filter,
      box_shadow_h: (infoModule as any).box_shadow_h || designFromDesignObject.box_shadow_h,
      box_shadow_v: (infoModule as any).box_shadow_v || designFromDesignObject.box_shadow_v,
      box_shadow_blur:
        (infoModule as any).box_shadow_blur || designFromDesignObject.box_shadow_blur,
      box_shadow_spread:
        (infoModule as any).box_shadow_spread || designFromDesignObject.box_shadow_spread,
      box_shadow_color:
        (infoModule as any).box_shadow_color || designFromDesignObject.box_shadow_color,
      // Spacing properties
      padding_top: (infoModule as any).padding_top || designFromDesignObject.padding_top,
      padding_bottom: (infoModule as any).padding_bottom || designFromDesignObject.padding_bottom,
      padding_left: (infoModule as any).padding_left || designFromDesignObject.padding_left,
      padding_right: (infoModule as any).padding_right || designFromDesignObject.padding_right,
      margin_top: (infoModule as any).margin_top || designFromDesignObject.margin_top,
      margin_bottom: (infoModule as any).margin_bottom || designFromDesignObject.margin_bottom,
      margin_left: (infoModule as any).margin_left || designFromDesignObject.margin_left,
      margin_right: (infoModule as any).margin_right || designFromDesignObject.margin_right,
    };

    // Helper function to safely add px units to font size
    const getFontSizeWithUnits = (designSize?: number | string, fallbackSize?: number | string) => {
      if (designSize !== undefined && designSize !== null && designSize !== '') {
        // If it's already a string with units, return as-is
        if (typeof designSize === 'string' && /[a-zA-Z%]/.test(designSize)) {
          return designSize;
        }
        // Otherwise add px
        return `${designSize}px`;
      }
      if (fallbackSize !== undefined && fallbackSize !== null) {
        return typeof fallbackSize === 'string' && /[a-zA-Z%]/.test(fallbackSize)
          ? fallbackSize
          : `${fallbackSize}px`;
      }
      return 'inherit';
    };

    // Helper function for icon size - only use design font_size if it's a number (no units)
    const getIconSizeWithUnits = (designSize?: number | string, fallbackSize?: number | string) => {
      // Only use design size for icons if it's a number (26) not a string with units (26px)
      if (
        designSize !== undefined &&
        designSize !== null &&
        designSize !== '' &&
        typeof designSize === 'number'
      ) {
        return `${designSize}px`;
      }
      if (fallbackSize !== undefined && fallbackSize !== null) {
        return typeof fallbackSize === 'string' && fallbackSize.includes('px')
          ? fallbackSize
          : `${fallbackSize}px`;
      }
      return 'clamp(18px, 4vw, 26px)';
    };

    // Get name text alignment
    const getNameAlignment = (entity: any) => {
      if (designProperties.text_align && designProperties.text_align !== 'inherit') {
        return designProperties.text_align;
      }
      const nameAlignment: string | undefined = entity.name_alignment;
      if (nameAlignment === 'start') return 'left';
      if (nameAlignment === 'end') return 'right';
      if (nameAlignment === 'center') return 'center';
      return 'left';
    };

    // Get state text alignment
    const getStateAlignment = (entity: any) => {
      if (designProperties.text_align && designProperties.text_align !== 'inherit') {
        return designProperties.text_align;
      }
      const stateAlignment: string | undefined = entity.state_alignment;
      if (stateAlignment === 'start') return 'left';
      if (stateAlignment === 'end') return 'right';
      if (stateAlignment === 'center') return 'center';
      return 'left';
    };

    // Compute flex alignment used for the content container cross-axis alignment
    const getFlexAlignment = (entity: any) => {
      if (designProperties.text_align && designProperties.text_align !== 'inherit') {
        return designProperties.text_align === 'left'
          ? 'flex-start'
          : designProperties.text_align === 'right'
            ? 'flex-end'
            : 'center';
      }
      // Use name_alignment as the primary alignment for the container
      const nameAlignment: string | undefined = entity.name_alignment;
      if (nameAlignment === 'start') return 'flex-start';
      if (nameAlignment === 'end') return 'flex-end';
      if (nameAlignment === 'center') return 'center';
      return 'flex-start';
    };

    // Container styles for design system with proper priority: design properties override module properties
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
          : '16px',
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
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${designProperties.border_width || moduleWithDesign.border_width || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'relative',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      width: designProperties.width || moduleWithDesign.width || 'auto',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || 'none',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'none',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || 'auto',
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'visible',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || 'none',
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || 'none',
      boxShadow:
        (designProperties.box_shadow_h || moduleWithDesign.box_shadow_h) &&
        (designProperties.box_shadow_v || moduleWithDesign.box_shadow_v)
          ? `${designProperties.box_shadow_h || moduleWithDesign.box_shadow_h || '0'} ${designProperties.box_shadow_v || moduleWithDesign.box_shadow_v || '0'} ${designProperties.box_shadow_blur || moduleWithDesign.box_shadow_blur || '0'} ${designProperties.box_shadow_spread || moduleWithDesign.box_shadow_spread || '0'} ${designProperties.box_shadow_color || moduleWithDesign.box_shadow_color || 'rgba(0,0,0,0.1)'}`
          : 'none',
      boxSizing: 'border-box',
    };

    // GRACEFUL RENDERING: Check for incomplete configuration
    const validEntities = (infoModule.info_entities || []).filter(
      e => e.entity && e.entity.trim() !== ''
    );
    const incompleteEntities = (infoModule.info_entities || []).filter(
      e => !e.entity || e.entity.trim() === ''
    );

    // Check if any entity has a template-based container background color (needs to be parsed from template strings)
    let templateContainerBg = '';
    for (const entity of validEntities) {
      // Check if entity has unified template mode enabled
      if (entity.unified_template_mode && entity.unified_template) {
        // Initialize template service if needed
        if (!this._templateService && hass) {
          this._templateService = new TemplateService(hass);
        }

        const templateHash = this._hashString(entity.unified_template);
        const templateKey = `unified_info_${entity.entity}_${validEntities.indexOf(entity)}_${templateHash}`;

        // Check if we already have the rendered template result
        const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
        if (unifiedResult && String(unifiedResult).trim() !== '') {
          const parsed = parseUnifiedTemplate(unifiedResult);
          if (!hasTemplateError(parsed) && parsed.container_background_color) {
            templateContainerBg = parsed.container_background_color;
            break; // Use first entity's template background
          }
        }
      }
    }

    // Compute background styles with template background taking priority over design background
    const { styles: containerBackgroundStyles } = computeBackgroundStyles({
      color: templateContainerBg || designProperties.background_color || moduleWithDesign.background_color,
      fallback: moduleWithDesign.background_color || 'transparent',
      image: this.getBackgroundImageCSS({ ...moduleWithDesign, ...designProperties }, hass),
      imageSize: designProperties.background_size || moduleWithDesign.background_size || 'cover',
      imagePosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      imageRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
    });
    Object.assign(containerStyles, containerBackgroundStyles);

    // If no entities configured at all, show gradient error state
    if (!infoModule.info_entities || infoModule.info_entities.length === 0) {
      return this.renderGradientErrorState(
        'Configure Entities',
        'Add info entities in the General tab',
        'mdi:information-outline'
      );
    }

    // If ALL entities are incomplete, show gradient error state
    if (validEntities.length === 0 && incompleteEntities.length > 0) {
      const entityList = incompleteEntities.map((e, i) => `Entity ${i + 1}`).join(', ');
      return this.renderGradientErrorState(
        'Entities Need Configuration',
        entityList,
        'mdi:information-outline'
      );
    }

    // Get the first entity with proper defaults for consistent grid alignment
    const firstEntity =
      infoModule.info_entities && infoModule.info_entities.length > 0
        ? { ...this.createDefault().info_entities[0], ...infoModule.info_entities[0] }
        : this.createDefault().info_entities[0];
    const gridAlignment = firstEntity.overall_alignment || 'center';

    // Show warning banner if some entities are incomplete
    const warningBanner =
      incompleteEntities.length > 0
        ? this.renderGradientWarningBanner(
            `${incompleteEntities.length > 1 ? 'entities' : 'entity'} need configuration`,
            incompleteEntities.length
          )
        : '';

    return html`
      ${warningBanner}
      <div
        class="info-module-container"
        style="${this.styleObjectToCss(containerStyles)}; align-self: ${gridAlignment === 'left'
          ? 'flex-start'
          : gridAlignment === 'right'
            ? 'flex-end'
            : 'center'};"
      >
        <div class="info-module-preview">
          <div
            class="info-entities"
            style="
            display: grid;
            grid-template-columns: repeat(${infoModule.columns || 1}, 1fr);
            grid-auto-flow: ${infoModule.allow_wrap === false ? 'column' : 'row'};
            gap: ${infoModule.gap || 12}px;
            justify-content: ${gridAlignment === 'left'
              ? 'start'
              : gridAlignment === 'right'
                ? 'end'
                : 'center'};
            justify-items: ${gridAlignment === 'left'
              ? 'start'
              : gridAlignment === 'right'
                ? 'end'
                : 'center'};
          "
          >
            ${validEntities.slice(0, 3).map((originalEntity, index) => {
              // Ensure entity has default values merged for consistent rendering
              const defaultEntity = this.createDefault().info_entities[0];
              let entity = { ...defaultEntity, ...originalEntity };
              entity = {
                ...entity,
                icon_position: entity.icon_position || 'left',
                overall_alignment: entity.overall_alignment || 'center',
                icon_alignment: entity.icon_alignment || 'center',
                name_alignment: entity.name_alignment || 'start',
                state_alignment: entity.state_alignment || 'start',
                name_value_layout: entity.name_value_layout || 'vertical',
                name_value_gap: entity.name_value_gap !== undefined ? entity.name_value_gap : 2,
                content_distribution: entity.content_distribution || 'normal',
              };

              const entityState = hass?.states[entity.entity];

              // Process template if template_mode is enabled
              let displayValue: string;
              if (entity.template_mode && entity.template) {
                // Initialize template service
                if (!this._templateService && hass) {
                  this._templateService = new TemplateService(hass);
                }

                // Ensure template string cache exists on hass
                if (hass) {
                  if (!hass.__uvc_template_strings) {
                    hass.__uvc_template_strings = {};
                  }
                  const templateHash = this._hashString(entity.template);
                  // Use only template hash and index for key to prevent subscription leaks when module ID changes
                  // Module ID can change during editor updates, but template content + index is stable
                  const templateKey = `info_entity_${index}_${templateHash}`;

                  // Subscribe if needed
                  if (
                    this._templateService &&
                    !this._templateService.hasTemplateSubscription(templateKey)
                  ) {
                    this._templateService.subscribeToTemplate(entity.template, templateKey, () => {
                      if (typeof window !== 'undefined') {
                        // Use global debounced update
                        if (!window._ultraCardUpdateTimer) {
                          window._ultraCardUpdateTimer = setTimeout(() => {
                            // Use global debounced update
                            if (!window._ultraCardUpdateTimer) {
                              window._ultraCardUpdateTimer = setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
                                window._ultraCardUpdateTimer = null;
                              }, 50);
                            }
                            window._ultraCardUpdateTimer = null;
                          }, 50);
                        }
                      }
                    });
                  }

                  // Use latest rendered string if available
                  const rendered = hass.__uvc_template_strings?.[templateKey];
                  if (rendered !== undefined && String(rendered).trim() !== '') {
                    displayValue = String(rendered);
                  } else {
                    // Show template error message instead of entity state
                    displayValue = 'Template Error: Invalid or incomplete template';
                  }
                }
              } else {
                // Non-template path: use precision-aware formatter
                if (entityState) {
                  displayValue = formatEntityState(hass, entity.entity, {
                    includeUnit: entity.show_units !== false,
                  });
                } else {
                  displayValue = 'N/A';
                }
              }

              const hasCustomName =
                originalEntity.name !== undefined &&
                originalEntity.name !== null &&
                String(originalEntity.name).trim() !== '';
              // Use 'let' so we can override with template values after template processing
              let displayName =
                hasCustomName
                  ? String(originalEntity.name)
                  : entityState?.attributes?.friendly_name || entity.entity;
              // Get base icon and color
              let displayIcon = entity.icon || entityState?.attributes?.icon || 'mdi:help-circle';
              let displayIconColor =
                designProperties.color || entity.icon_color || 'var(--primary-color)';

              // PRIORITY 1: Unified template (if enabled)
              if (entity.unified_template_mode && entity.unified_template) {
                if (!this._templateService && hass) {
                  this._templateService = new TemplateService(hass);
                }

                const templateHash = this._hashString(entity.unified_template);
                const templateKey = `unified_info_${entity.entity}_${index}_${templateHash}`;

                if (!hass.__uvc_template_strings) {
                  hass.__uvc_template_strings = {};
                }

                if (
                  this._templateService &&
                  !this._templateService.hasTemplateSubscription(templateKey)
                ) {
                  const context = buildEntityContext(entity.entity, hass, {
                    name: entity.name,
                    icon: entity.icon,
                  });
                  this._templateService.subscribeToTemplate(
                    entity.unified_template,
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

                const unifiedResult = hass?.__uvc_template_strings?.[templateKey];
                if (unifiedResult && String(unifiedResult).trim() !== '') {
                  const parsed = parseUnifiedTemplate(unifiedResult);
                  if (!hasTemplateError(parsed)) {
                    if (parsed.icon) displayIcon = parsed.icon;
                    if (parsed.icon_color) displayIconColor = parsed.icon_color;
                    // Store template properties for later use
                    if (parsed.name) {
                      (entity as any)._template_name = parsed.name;
                    }
                    if (parsed.state_text !== undefined) {
                      (entity as any)._template_state_text = parsed.state_text;
                    }
                    if (parsed.name_color) {
                      (entity as any)._template_name_color = parsed.name_color;
                    }
                    if (parsed.state_color) {
                      (entity as any)._template_state_color = parsed.state_color;
                    }
                    if (parsed.container_background_color) {
                      (entity as any)._template_container_background_color =
                        parsed.container_background_color;
                    }
                  }
                }
              }
              // PRIORITY 2: Apply dynamic icon template if enabled (legacy)
              else if (entity.dynamic_icon_template_mode && entity.dynamic_icon_template) {
                // Initialize template service if needed
                if (!this._templateService && hass) {
                  this._templateService = new TemplateService(hass);
                }
                const templateHash = this._hashString(entity.dynamic_icon_template);
                const templateKey = `dynamic_icon_info_${entity.entity}_${index}_${templateHash}`;

                if (!hass.__uvc_template_strings) {
                  hass.__uvc_template_strings = {};
                }

                if (
                  this._templateService &&
                  !this._templateService.hasTemplateSubscription(templateKey)
                ) {
                  this._templateService.subscribeToTemplate(
                    entity.dynamic_icon_template,
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
                    }
                  );
                }

                const iconTemplateResult = hass?.__uvc_template_strings?.[templateKey];
                if (iconTemplateResult && String(iconTemplateResult).trim() !== '') {
                  displayIcon = String(iconTemplateResult);
                }
              }

              // Override displayName and displayValue with template values AFTER template processing
              if ((entity as any)._template_name !== undefined) {
                displayName = (entity as any)._template_name;
              }
              if ((entity as any)._template_state_text !== undefined) {
                displayValue = (entity as any)._template_state_text;
              }

              const iconPosition = entity.icon_position || 'left';
              const iconAlignment = entity.icon_alignment || 'center';
              const nameAlignment = entity.name_alignment || 'start';
              const stateAlignment = entity.state_alignment || 'start';
              const overallAlignment = entity.overall_alignment || 'center';
              const iconGap = entity.icon_gap || 8;
              const contentDistribution = entity.content_distribution || 'normal';

              // Calculate justify-content based on content_distribution and overall_alignment
              const getJustifyContent = () => {
                if (contentDistribution !== 'normal') {
                  return contentDistribution;
                }
                // Fall back to overall_alignment logic
                if (overallAlignment === 'left') return 'flex-start';
                if (overallAlignment === 'right') return 'flex-end';
                return 'center';
              };
              const justifyContent = getJustifyContent();
              
              // When using distribution modes, disable gap to let the distribution handle spacing
              const effectiveGap = contentDistribution !== 'normal' ? 0 : iconGap;

              const iconElement =
                entity.show_icon !== false
                  ? this._shouldUseEntityPicture(entityState)
                    ? html`
                        <img
                          src="${this._getEntityPicture(entityState, hass)}"
                          class="entity-icon entity-picture"
                          style="
                            width: ${getIconSizeWithUnits(
                            designProperties.font_size,
                            entity.icon_size || 26
                          )};
                            height: ${getIconSizeWithUnits(
                            designProperties.font_size,
                            entity.icon_size || 26
                          )};
                            border-radius: 50%;
                            object-fit: cover;
                          "
                          alt="Entity picture"
                        />
                      `
                    : html`
                        <ha-icon
                          icon="${displayIcon}"
                          class="entity-icon"
                          style="color: ${(() => {
                            // Use color from unified/dynamic templates or default
                            let finalColor = displayIconColor;

                            // PRIORITY 3: Apply dynamic color template if enabled (legacy, only if not using unified)
                            if (
                              entity.dynamic_color_template_mode &&
                              entity.dynamic_color_template
                            ) {
                              // Initialize template service if needed
                              if (!this._templateService && hass) {
                                this._templateService = new TemplateService(hass);
                              }
                              const templateHash = this._hashString(entity.dynamic_color_template);
                              const templateKey = `dynamic_color_info_${entity.entity}_${index}_${templateHash}`;

                              if (!hass.__uvc_template_strings) {
                                hass.__uvc_template_strings = {};
                              }

                              if (
                                this._templateService &&
                                !this._templateService.hasTemplateSubscription(templateKey)
                              ) {
                                this._templateService.subscribeToTemplate(
                                  entity.dynamic_color_template,
                                  templateKey,
                                  () => {
                                    if (typeof window !== 'undefined') {
                                      if (!window._ultraCardUpdateTimer) {
                                        window._ultraCardUpdateTimer = setTimeout(() => {
                                          window.dispatchEvent(
                                            new CustomEvent('ultra-card-template-update')
                                          );
                                          window._ultraCardUpdateTimer = null;
                                        }, 50);
                                      }
                                    }
                                  }
                                );
                              }

                              const colorTemplateResult =
                                hass?.__uvc_template_strings?.[templateKey];
                              if (
                                colorTemplateResult &&
                                String(colorTemplateResult).trim() !== ''
                              ) {
                                finalColor = String(colorTemplateResult);
                              }
                            }

                            return finalColor;
                          })()}; --mdc-icon-size: ${getIconSizeWithUnits(
                            designProperties.font_size,
                            entity.icon_size || 26
                          )};"
                        ></ha-icon>
                      `
                  : '';

              // Helper function to compose text shadow CSS
              const getTextShadow = () => {
                const h = designProperties.text_shadow_h || moduleWithDesign.text_shadow_h;
                const v = designProperties.text_shadow_v || moduleWithDesign.text_shadow_v;
                const blur = designProperties.text_shadow_blur || moduleWithDesign.text_shadow_blur;
                const color =
                  designProperties.text_shadow_color || moduleWithDesign.text_shadow_color;
                if (h || v || blur || color) {
                  return `${h || '0px'} ${v || '0px'} ${blur || '0px'} ${color || 'rgba(0,0,0,0.2)'}`;
                }
                return 'none';
              };

              // Determine layout direction for name/value
              // Always respect user's choice - works best with left/right icon positions
              // or when icon is disabled, but also available for top/bottom layouts
              const nameValueLayout = entity.name_value_layout || 'vertical';
              const nameValueGap = entity.name_value_gap !== undefined ? entity.name_value_gap : 2;
              
              // Check if we're using horizontal layout with distribution
              const isHorizontalWithDistribution = nameValueLayout === 'horizontal' && contentDistribution !== 'normal';
              const hasIcon = entity.show_icon !== false && (iconPosition === 'left' || iconPosition === 'right');
              
              // Create name element template
              const nameElement = entity.show_name !== false
                ? html`
                    <div
                      class="entity-name"
                      style="
                        color: ${(entity as any)._template_name_color ||
                          designProperties.color ||
                          entity.name_color ||
                          'var(--secondary-text-color)'};
                        font-size: ${getFontSizeWithUnits(
                          designProperties.font_size,
                          entity.name_size || 12
                        )};
                        font-weight: ${designProperties.font_weight ||
                          (entity.name_bold ? 'bold' : 'normal')};
                        font-style: ${designProperties.font_style ||
                          (entity.name_italic ? 'italic' : 'normal')};
                        text-transform: ${designProperties.text_transform ||
                          (entity.name_uppercase ? 'uppercase' : 'none')};
                        text-decoration: ${entity.name_strikethrough ? 'line-through' : 'none'};
                        font-family: ${designProperties.font_family || 'inherit'};
                        line-height: ${designProperties.line_height || 'inherit'};
                        letter-spacing: ${designProperties.letter_spacing || 'inherit'};
                        text-align: ${getNameAlignment(entity)};
                        text-shadow: ${getTextShadow()};
                        white-space: ${designProperties.white_space || 'normal'};
                        flex-shrink: 0;
                      "
                    >
                      ${displayName}
                    </div>
                  `
                : '';
              
              // Create value element template
              const valueElement = entity.show_state !== false
                ? html`
                    <div
                      class="entity-value"
                      style="
                        color: ${(entity as any)._template_state_color ||
                          designProperties.color ||
                          entity.state_color ||
                          entity.text_color ||
                          'var(--primary-text-color)'};
                        font-size: ${getFontSizeWithUnits(
                          designProperties.font_size,
                          entity.text_size || 14
                        )};
                        font-weight: ${designProperties.font_weight ||
                          (entity.text_bold ? 'bold' : 'normal')};
                        font-style: ${designProperties.font_style ||
                          (entity.text_italic ? 'italic' : 'normal')};
                        text-transform: ${designProperties.text_transform ||
                          (entity.text_uppercase ? 'uppercase' : 'none')};
                        text-decoration: ${entity.text_strikethrough ? 'line-through' : 'none'};
                        font-family: ${designProperties.font_family || 'inherit'};
                        line-height: ${designProperties.line_height || 'inherit'};
                        letter-spacing: ${designProperties.letter_spacing || 'inherit'};
                        text-align: ${getStateAlignment(entity)};
                        text-shadow: ${getTextShadow()};
                        white-space: ${designProperties.white_space || 'normal'};
                        flex-shrink: 0;
                      "
                    >
                      ${displayValue}
                    </div>
                  `
                : '';

              // Standard content element (used when NOT horizontal+distribution with icon)
              const contentElement = html`
                <div
                  class="entity-content"
                  data-layout="${nameValueLayout}"
                  data-gap="${nameValueGap}"
                  data-entity-gap="${entity.name_value_gap}"
                  data-show-icon="${entity.show_icon}"
                  style="
                    display: flex;
                    align-items: ${nameValueLayout === 'horizontal' ? 'center' : getFlexAlignment(entity)};
                    flex-direction: ${nameValueLayout === 'horizontal' ? 'row' : 'column'};
                    gap: ${isHorizontalWithDistribution && !hasIcon ? 0 : nameValueGap}px;
                    justify-content: ${isHorizontalWithDistribution && !hasIcon ? contentDistribution : 'flex-start'};
                    flex: ${isHorizontalWithDistribution && !hasIcon ? '1' : (contentDistribution !== 'normal' ? '0 0 auto' : '1')};
                    width: ${isHorizontalWithDistribution && !hasIcon ? '100%' : 'auto'};
                  "
                >
                  ${nameElement}
                  ${valueElement}
                </div>
              `;
              
              // When using horizontal layout with distribution AND icon is shown,
              // we need to group icon+name together, with value separate
              // Structure: [icon + name wrapper] <--distribution--> [value]
              const iconNameGroupElement = isHorizontalWithDistribution && hasIcon
                ? html`
                    <div
                      class="icon-name-group"
                      style="
                        display: flex;
                        align-items: center;
                        gap: ${iconGap}px;
                        flex-shrink: 0;
                      "
                    >
                      ${iconPosition === 'left' ? html`${iconElement}${nameElement}` : html`${nameElement}${iconElement}`}
                    </div>
                  `
                : null;

              // Get hover effect configuration from module design
              const hoverEffect = (infoModule as any).design?.hover_effect;
              const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

              // Determine content based on layout mode
              // When horizontal+distribution+icon: [icon+name] <-> [value]
              // Otherwise: [icon] [name+value content]
              const renderInnerContent = () => {
                if (iconNameGroupElement) {
                  // Horizontal + distribution + icon: group icon+name, then value
                  return html`${iconNameGroupElement}${valueElement}`;
                }
                // Standard layout
                if (iconPosition === 'left' || iconPosition === 'top') {
                  return html`${iconElement}${contentElement}`;
                }
                return html`${contentElement}${iconElement}`;
              };

              // Wrap in clickable element if actions are configured OR if this module is a popup trigger
              const isPopupTrigger = Boolean(infoModule?.id && getPopupForModule(infoModule.id));
              const element = ((m: any) =>
                isPopupTrigger ||
                (m?.tap_action && m.tap_action.action !== 'nothing') ||
                (m?.hold_action && m.hold_action.action !== 'nothing') ||
                (m?.double_tap_action && m.double_tap_action.action !== 'nothing'))(infoModule)
                ? html`<div
                    class="info-entity-clickable position-${iconPosition} ${hoverEffectClass}"
                    style="
                    display: flex;
                    width: 100%;
                    flex-direction: ${iconPosition === 'top' || iconPosition === 'bottom'
                      ? 'column'
                      : 'row'};
                    align-items: ${iconAlignment === 'start'
                      ? 'flex-start'
                      : iconAlignment === 'end'
                        ? 'flex-end'
                        : 'center'};
                    justify-content: ${justifyContent};
                    gap: ${iconNameGroupElement ? 0 : effectiveGap}px;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                  "
                    @click=${(e: Event) => this.handleClick(e, infoModule, hass, config)}
                    @dblclick=${(e: Event) => this.handleDoubleClick(e, infoModule, hass, config)}
                    @mousedown=${(e: Event) => this.handleMouseDown(e, infoModule, hass, config)}
                    @mouseup=${(e: Event) => this.handleMouseUp(e, infoModule, hass)}
                    @mouseleave=${(e: Event) => this.handleMouseLeave(e, infoModule, hass)}
                    @touchstart=${(e: Event) => this.handleTouchStart(e, infoModule, hass, config)}
                    @touchend=${(e: Event) => this.handleTouchEnd(e, infoModule, hass, config)}
                  >
                    ${renderInnerContent()}
                  </div>`
                : html`<div
                    class="info-entity-item position-${iconPosition} ${hoverEffectClass}"
                    style="
                    display: flex;
                    width: 100%;
                    flex-direction: ${iconPosition === 'top' || iconPosition === 'bottom'
                      ? 'column'
                      : 'row'};
                    align-items: ${iconAlignment === 'start'
                      ? 'flex-start'
                      : iconAlignment === 'end'
                        ? 'flex-end'
                        : 'center'};
                    justify-content: ${justifyContent};
                    gap: ${iconNameGroupElement ? 0 : effectiveGap}px;
                  "
                  >
                    ${renderInnerContent()}
                  </div>`;

              return element;
            })}
            ${validEntities.length > 3
              ? html` <div class="more-entities">+${validEntities.length - 3} more</div> `
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const infoModule = module as InfoModule;
    const errors = [...baseValidation.errors];

    // LENIENT VALIDATION: Allow empty/incomplete entities - they will show helpful placeholders
    // Only validate entities that have been started (have some configuration)
    (infoModule.info_entities || []).forEach((entity, index) => {
      // Only validate entities that have some content
      const hasContent = entity.entity && entity.entity.trim() !== '';

      if (hasContent) {
        // Validate only truly breaking configuration errors
        // Entity format validation, etc.
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .info-module-preview {
      }
      
      .info-entities {
        width: 100%;
      }
      
      .info-entity-item {
        min-width: 0;
        flex: 1;
      }
      
      .entity-content {
        display: flex;
        min-width: 0;
        flex: 1;
      }
      
      .entity-icon {
        flex-shrink: 0;
      }
      
      .entity-name {
        font-size: 12px;
        line-height: 1.2;
      }
      
      .entity-value {
        font-size: 14px;
        font-weight: 500;
        line-height: 1.2;
      }
      
      .more-entities {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-style: italic;
      }
      
      .info-entities-section,
      .layout-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      
      .info-entities-section:first-child {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
      }
      
      .info-entities-section h4,
      .layout-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      
      .entity-item {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        background: var(--card-background-color);
      }
      
      .entity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 500;
        font-size: 14px;
      }
      
      .remove-entity-btn {
        background: none;
        border: none;
        color: var(--error-color);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .remove-entity-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      
      .add-entity-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        border: 2px dashed var(--primary-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
      }
      
      .add-entity-btn:hover {
        background: var(--primary-color);
        color: white;
      }
      
      .entity-display-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 8px 0;
      }
      
      /* Control button styles */
      .control-btn {
        padding: 8px 4px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        user-select: none;
        font-size: 10px;
      }
      
      .control-btn:hover:not(.active) {
        border-color: var(--primary-color) !important;
        background: var(--primary-color) !important;
        color: white !important;
        opacity: 0.8;
      }
      
      .control-btn ha-icon {
        font-size: 14px;
      }
      
      .control-button-group {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        overflow: visible;
        position: relative;
      }
      
      .control-button-group .control-btn:not(:last-child) {
        border-right: none;
      }
      
      .control-button-group .control-btn:first-child {
        border-radius: 4px 0 0 4px;
      }
      
      .control-button-group .control-btn:last-child {
        border-radius: 0 4px 4px 0;
      }
      
      .control-button-group .control-btn:only-child {
        border-radius: 4px;
      }

      .control-button-group .control-btn.active {
        position: relative;
        z-index: 2;
        border-radius: 4px !important;
      }
      
      /* Position-specific layout styles */
      .position-left {
        flex-direction: row;
      }
      
      .position-right {
        flex-direction: row-reverse;
      }
      
      .position-top {
        flex-direction: column;
      }
      
      .position-bottom {
        flex-direction: column-reverse;
      }

      /* Gap control styles */
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
        width: 48px !important;
        max-width: 48px !important;
        min-width: 48px !important;
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

      /* Legacy hover effects removed - now handled by new hover effects system */

      /* Template Section Styles */
      .template-section {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        border: 1px solid var(--divider-color);
        margin-bottom: 32px;
      }

      .template-header {
        margin-bottom: 16px;
      }

      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .switch-label {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
      }

      /* Toggle Switch Styles */
      .switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }

      .switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--disabled-color);
        transition: 0.3s;
        border-radius: 24px;
      }

      .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }

      input:checked + .slider {
        background-color: var(--primary-color);
      }

      input:checked + .slider:before {
        transform: translateX(20px);
      }

      .slider.round {
        border-radius: 24px;
      }

      .slider.round:before {
        border-radius: 50%;
      }

      .template-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .template-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-editor {
        min-height: 120px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
        resize: vertical;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--code-editor-background-color, #1e1e1e);
        color: var(--primary-text-color);
        outline: none;
        transition: border-color 0.2s ease;
      }

      .template-editor:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color);
      }

      .template-help {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
      }

      .template-help p {
        margin: 8px 0;
        font-weight: 500;
      }

      .template-help ul {
        margin: 4px 0;
        padding-left: 16px;
      }

      .template-help li {
        margin: 2px 0;
      }

      .template-help code {
        background: rgba(var(--rgb-primary-color), 0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
      }
    `;
  }

  // Action handling properties
  private clickTimeout: any = null;
  private holdTimeout: any = null;
  private isHolding = false;

  // Check if the info module has any active actions
  private hasActiveActions(infoModule: InfoModule): boolean {
    const hasTapAction =
      infoModule.tap_action &&
      infoModule.tap_action.action !== 'default' &&
      infoModule.tap_action.action !== 'nothing';
    const hasHoldAction =
      infoModule.hold_action &&
      infoModule.hold_action.action !== 'default' &&
      infoModule.hold_action.action !== 'nothing';
    const hasDoubleAction =
      infoModule.double_tap_action &&
      infoModule.double_tap_action.action !== 'default' &&
      infoModule.double_tap_action.action !== 'nothing';

    return hasTapAction || hasHoldAction || hasDoubleAction;
  }

  // Event handlers for info module interactions
  private handleClick(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();

    // Clear any existing timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    // Set a timeout to handle single click with delay
    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, infoModule, hass, config);
    }, 300); // 300ms delay to allow for double-click detection
  }

  private handleDoubleClick(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();

    // Clear the single click timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }

    // Handle double-click action
    this.handleDoubleAction(event, infoModule, hass, config);
  }

  private handleMouseDown(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.startHold(event, infoModule, hass, config);
  }

  private handleMouseUp(event: Event, infoModule: InfoModule, hass: HomeAssistant): void {
    this.endHold(event, infoModule, hass);
  }

  private handleMouseLeave(event: Event, infoModule: InfoModule, hass: HomeAssistant): void {
    this.endHold(event, infoModule, hass);
  }

  private handleTouchStart(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.startHold(event, infoModule, hass, config);
  }

  private handleTouchEnd(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.endHold(event, infoModule, hass);
  }

  private startHold(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, infoModule, hass, config);
    }, 500); // 500ms hold time
  }

  private endHold(event: Event, infoModule: InfoModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    this.isHolding = false;
  }

  private async handleTapAction(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): Promise<void> {
    // Don't trigger tap action if we're in the middle of a hold
    if (this.isHolding) return;

    // Execute on Default (undefined) or any action except 'nothing'
    if (!infoModule.tap_action || infoModule.tap_action.action !== 'nothing') {
      await UltraLinkComponent.handleAction(
        (infoModule.tap_action as any) || ({ action: 'default' } as any),
        hass,
        event.target as HTMLElement,
        config,
        (infoModule as any).entity,
        infoModule
      );
    }
  }

  private async handleDoubleAction(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): Promise<void> {
    if (!infoModule.double_tap_action || infoModule.double_tap_action.action !== 'nothing') {
      await UltraLinkComponent.handleAction(
        (infoModule.double_tap_action as any) || ({ action: 'default' } as any),
        hass,
        event.target as HTMLElement,
        config,
        (infoModule as any).entity,
        infoModule
      );
    }
  }

  private async handleHoldAction(
    event: Event,
    infoModule: InfoModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): Promise<void> {
    if (!infoModule.hold_action || infoModule.hold_action.action !== 'nothing') {
      await UltraLinkComponent.handleAction(
        (infoModule.hold_action as any) || ({ action: 'default' } as any),
        hass,
        event.target as HTMLElement,
        config,
        (infoModule as any).entity,
        infoModule
      );
    }
  }

  private _addEntity(
    infoModule: InfoModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newEntity: InfoEntityConfig = {
      id: this.generateId('entity'),
      entity: 'weather.forecast_home',
      name: 'Temperature',
      icon: 'mdi:thermometer',
      show_icon: true,
      show_name: true,
      show_state: true,
      text_size: 14,
      name_size: 12,
      icon_size: 26,
      text_bold: false,
      text_italic: false,
      text_uppercase: false,
      text_strikethrough: false,
      name_bold: false,
      name_italic: false,
      name_uppercase: false,
      name_strikethrough: false,
      icon_color: 'var(--primary-color)',
      name_color: 'var(--secondary-text-color)',
      text_color: 'var(--primary-text-color)',
      state_color: 'var(--primary-text-color)',
      click_action: 'more-info',
      navigation_path: '',
      url: '',
      service: '',
      service_data: {},
      template_mode: false,
      template: '',
      dynamic_icon_template_mode: false,
      dynamic_icon_template: '',
      dynamic_color_template_mode: false,
      dynamic_color_template: '',
      // Unified template system
      unified_template_mode: false,
      unified_template: '',
      ignore_entity_state_config: false,
      // Icon positioning and alignment
      icon_position: 'left',
      icon_alignment: 'center',
      name_alignment: 'start',
      state_alignment: 'start',
      overall_alignment: 'center',
      icon_gap: 8,
      // Name/Value layout direction (works with any icon position)
      name_value_layout: 'vertical',
      name_value_gap: 2,
      // Content distribution control
      content_distribution: 'normal',
    };

    const updatedEntities = [...infoModule.info_entities, newEntity];

    // If this is the first entity and no module-level tap action is set, auto-set it
    const moduleUpdates: Partial<InfoModule> = { info_entities: updatedEntities };
    if (
      updatedEntities.length === 1 &&
      (!infoModule.tap_action ||
        infoModule.tap_action.action === 'nothing' ||
        infoModule.tap_action.action === 'default')
    ) {
      moduleUpdates.tap_action = {
        action: 'more-info',
        entity: newEntity.entity,
      };
    }

    updateModule(moduleUpdates);
  }

  private _removeEntity(
    infoModule: InfoModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    if (infoModule.info_entities.length <= 1) return;

    const updatedEntities = infoModule.info_entities.filter((_, i) => i !== index);
    updateModule({ info_entities: updatedEntities });
  }

  private _handleEntityChange(
    infoModule: InfoModule,
    index: number,
    entityId: string,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const updates: Partial<InfoEntityConfig> = { entity: entityId };

    // Auto-populate name and icon from entity when switching
    if (entityId && hass?.states[entityId]) {
      const entityState = hass.states[entityId];
      const friendlyName = entityState.attributes?.friendly_name || entityId.split('.').pop() || '';

      // Use the centralized icon service
      const entityIcon = EntityIconService.getEntityIcon(entityId, hass);

      // Always update name when switching entities
      updates.name = friendlyName;

      // Always update icon when switching entities if available
      if (entityIcon) {
        updates.icon = entityIcon;
      }
    }

    // Update entity in the entities array
    const updatedEntities = infoModule.info_entities.map((entity, i) =>
      i === index ? { ...entity, ...updates } : entity
    );
    const moduleUpdates: any = { info_entities: updatedEntities };

    // Auto-set module-level tap action to default (smart resolution based on entity type)
    if (entityId && hass?.states[entityId]) {
      const shouldUpdateTap =
        !infoModule.tap_action ||
        infoModule.tap_action.action === 'nothing' ||
        infoModule.tap_action.action === 'default' ||
        infoModule.tap_action.action === 'more-info';

      if (shouldUpdateTap) {
        moduleUpdates.tap_action = {
          action: 'default',
          entity: entityId,
        };
      }
    }

    // Apply all updates in one call to avoid race conditions
    updateModule(moduleUpdates);

    // Force UI refresh
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('ultra-card-actions-refresh', {
          detail: { moduleId: infoModule.id },
          bubbles: true,
          composed: true,
        })
      );
    }, 50);
  }

  private _updateEntity(
    infoModule: InfoModule,
    index: number,
    updates: Partial<InfoEntityConfig>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    // Ensure we have at least one entity
    if (!infoModule.info_entities || infoModule.info_entities.length === 0) {
      const defaultEntity = this.createDefault().info_entities[0];
      infoModule.info_entities = [{ ...defaultEntity, ...updates }];
      updateModule({ info_entities: infoModule.info_entities });
      return;
    }

    // Ensure the entity at the index exists
    if (index >= infoModule.info_entities.length) {
      const defaultEntity = this.createDefault().info_entities[0];
      while (infoModule.info_entities.length <= index) {
        infoModule.info_entities.push({ ...defaultEntity });
      }
    }

    const updatedEntities = infoModule.info_entities.map((entity, i) =>
      i === index ? { ...entity, ...updates } : entity
    );
    updateModule({ info_entities: updatedEntities });
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    if (
      !moduleWithDesign.background_image_type ||
      moduleWithDesign.background_image_type === 'none'
    ) {
      return 'none';
    }

    switch (moduleWithDesign.background_image_type) {
      case 'upload':
      case 'url':
        if (moduleWithDesign.background_image) {
          return `url("${moduleWithDesign.background_image}")`;
        }
        break;

      case 'entity':
        if (
          moduleWithDesign.background_image_entity &&
          hass?.states[moduleWithDesign.background_image_entity]
        ) {
          const entityState = hass.states[moduleWithDesign.background_image_entity];
          let imageUrl = '';

          // Try to get image from entity
          if (entityState.attributes?.entity_picture) {
            imageUrl = entityState.attributes.entity_picture;
          } else if (entityState.attributes?.image) {
            imageUrl = entityState.attributes.image;
          } else if (entityState.state && typeof entityState.state === 'string') {
            // Handle cases where state itself is an image path
            if (entityState.state.startsWith('/') || entityState.state.startsWith('http')) {
              imageUrl = entityState.state;
            }
          }

          if (imageUrl) {
            // Handle Home Assistant local paths
            if (imageUrl.startsWith('/local/') || imageUrl.startsWith('/media/')) {
              imageUrl = imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = imageUrl;
            }
            return `url("${imageUrl}")`;
          }
        }
        break;
    }

    return 'none';
  }

  private styleObjectToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
        return `${kebabKey}: ${value}`;
      })
      .join('; ');
  }

  // Helper method to ensure border radius values have proper units
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

  private async _handleTemplateChange(
    template: string,
    infoModule: InfoModule,
    entityIndex: number,
    hass: HomeAssistant
  ): Promise<void> {
    if (!template || !hass) return;

    // Clear previous debounce timer
    if (this._templateInputDebounce) {
      clearTimeout(this._templateInputDebounce);
    }

    // Aggressively debounce API calls - only call after 3 seconds of no typing
    // This prevents API flooding while still providing live preview for finished templates
    this._templateInputDebounce = setTimeout(async () => {
      try {
        // Only evaluate if template looks complete (starts with {{ and ends with }})
        const trimmed = template.trim();
        if (!trimmed.startsWith('{{') || !trimmed.endsWith('}}')) {
          return; // Don't make API call for incomplete templates
        }

        const result = await hass.callApi<string>('POST', 'template', { template });

        // Store result in template cache with the same key format used by subscriptions
        if (!hass.__uvc_template_strings) {
          hass.__uvc_template_strings = {} as any;
        }

        const templateHash = this._hashString(template);
        // Use only template hash and index for key to prevent subscription leaks when module ID changes
        const templateKey = `info_entity_${entityIndex}_${templateHash}`;
        hass.__uvc_template_strings[templateKey] = result;

        // Trigger UI update for any listeners (editor popup + main card)
        if (typeof window !== 'undefined') {
          // Use global debounced update
          if (!window._ultraCardUpdateTimer) {
            window._ultraCardUpdateTimer = setTimeout(() => {
              window.dispatchEvent(new CustomEvent('ultra-card-template-update'));
              window._ultraCardUpdateTimer = null;
            }, 50);
          }
        }
      } catch (error) {
        // Silent fail - template may be incomplete or invalid
      }
    }, 3000); // Wait 3 seconds after user stops typing
  }

  /**
   * Check if an entity has a custom icon or entity_picture and return the appropriate URL
   * @param entityState The entity state object
   * @param hass Home Assistant instance
   * @returns The entity picture URL or null if not available
   */
  private _getEntityPicture(entityState: any, hass: HomeAssistant): string | null {
    if (!entityState || !hass) return null;

    const entityId = entityState.entity_id;
    if (!entityId) return null;

    // First check for entity_picture (most common for person, device_tracker, camera, media_player)
    const entityPicture = entityState.attributes?.entity_picture;
    if (entityPicture) {
      // Convert relative URL to absolute URL if needed
      if (entityPicture.startsWith('/')) {
        const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
        return `${baseUrl.replace(/\/$/, '')}${entityPicture}`;
      }
      return entityPicture;
    }

    // Check for other image attributes that might contain entity pictures
    const imageAttributes = [
      'image',
      'picture',
      'thumbnail',
      'avatar',
      'photo',
      'icon_url',
      'image_url',
    ];

    for (const attr of imageAttributes) {
      const imageUrl = entityState.attributes?.[attr];
      if (imageUrl && typeof imageUrl === 'string') {
        // Convert relative URL to absolute URL if needed
        if (imageUrl.startsWith('/')) {
          const baseUrl = (hass as any).hassUrl ? (hass as any).hassUrl() : '';
          return `${baseUrl.replace(/\/$/, '')}${imageUrl}`;
        }
        return imageUrl;
      }
    }

    return null;
  }

  /**
   * Check if an entity should use its picture instead of an icon
   * @param entityState The entity state object
   * @returns True if entity picture should be used
   */
  private _shouldUseEntityPicture(entityState: any): boolean {
    if (!entityState) return false;

    const entityId = entityState.entity_id;
    if (!entityId) return false;

    // Check for entity_picture first (most common)
    if (entityState.attributes?.entity_picture) return true;

    // Check for other image attributes
    const imageAttributes = [
      'image',
      'picture',
      'thumbnail',
      'avatar',
      'photo',
      'icon_url',
      'image_url',
    ];

    return imageAttributes.some(
      attr =>
        entityState.attributes?.[attr] &&
        typeof entityState.attributes[attr] === 'string' &&
        entityState.attributes[attr].trim() !== ''
    );
  }
}
