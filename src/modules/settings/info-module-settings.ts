import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraInfoModule, INFO_TEMPLATE_KEYS } from '../info-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, InfoModule, InfoEntityConfig, UltraCardConfig } from '../../types';
import { localize } from '../../localize/localize';
import { EntityIconService } from '../../services/entity-icon-service';
import '../../components/ultra-color-picker';

/**
 * Info module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraInfoModuleSettings extends UltraInfoModule {
  renderGeneralTabContent(
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
      name_value_order: entity.name_value_order || 'name-first',
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
          color: var(--text-primary-color, #fff) !important;
          border-radius: 2px !important;
        }

        .apply-size-btn {
          margin-top: 8px;
          width: 100%;
          padding: 8px 10px;
          border: 1px solid var(--divider-color);
          border-radius: 6px;
          background: var(--uc-pane-bg, var(--card-background-color));
          color: var(--primary-text-color);
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .apply-size-btn:hover {
          border-color: var(--primary-color);
          background: color-mix(in srgb, var(--primary-color) 12%, transparent);
        }
      </style>
      <div class="module-general-settings" data-uc-role="pane">
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
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'entity',
              entity.entity || '',
              (value: string) => {
                const prev = infoModule.info_entities?.[0]?.entity || '';
                if (value === prev) return;
                this._handleEntityChange(infoModule, 0, value, hass, updateModule);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
              undefined,
              localize('editor.info.entity', lang, 'Entity')
            )}
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);"
            >
              ${localize(
                'editor.info.entity_desc',
                lang,
                'Select the entity whose state, icon, and attributes will be displayed.'
              )}
            </div>
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

                ${this.renderFieldSection(
                  localize(
                    'editor.info.icon_section.show_entity_picture',
                    lang,
                    'Show Entity Picture'
                  ),
                  localize(
                    'editor.info.icon_section.show_entity_picture_desc',
                    lang,
                    'When enabled, entity_picture replaces the configured icon when available.'
                  ),
                  hass,
                  { show_entity_picture: entity.show_entity_picture !== false },
                  [this.booleanField('show_entity_picture')],
                  (e: CustomEvent) => {
                    this._updateEntity(
                      infoModule,
                      0,
                      { show_entity_picture: e.detail.value.show_entity_picture },
                      updateModule
                    );
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }
                )}

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

                <div class="field-container" style="margin-bottom: 16px;">
                  <div class="field-title">
                    ${localize('editor.info.display_attribute', lang, 'Display Attribute')}
                  </div>
                  <div class="field-description">
                    ${localize(
                      'editor.info.display_attribute_desc',
                      lang,
                      'Show an entity attribute instead of the main state'
                    )}
                  </div>
                  ${this.renderUcForm(
                    hass,
                    { attribute: entity.attribute || '' },
                    [this.selectField('attribute', this._getEntityAttributes(entity.entity, hass))],
                    (e: CustomEvent) => {
                      const next = e.detail.value.attribute;
                      const prev = infoModule.info_entities[0]?.attribute || '';
                      if (next === prev) return;
                      this._updateEntity(infoModule, 0, { attribute: next }, updateModule);
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    },
                    false
                  )}
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
              ${localize('editor.info.name_value_layout.orientation', lang, 'Layout Direction')}
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
                : entity.icon_position === 'left' || entity.icon_position === 'right'
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
            ${this.renderSegmentedField(
              '',
              '',
              entity.name_value_layout || 'vertical',
              [
                { value: 'vertical', label: 'Vertical', icon: 'mdi:arrow-up-down' },
                { value: 'horizontal', label: 'Horizontal', icon: 'mdi:arrow-left-right' },
              ],
              next => {
                this._updateEntity(infoModule, 0, { name_value_layout: next as any }, updateModule);
                setTimeout(() => this.triggerPreviewUpdate(), 200);
              }
            )}
          </div>

          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px;"
            >
              ${localize('editor.info.name_value_order', lang, 'Name & Value Order')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
            >
              ${(entity.name_value_layout || 'vertical') === 'horizontal'
                ? localize(
                    'editor.info.name_value_order_desc_horizontal',
                    lang,
                    'Which one comes first on the line'
                  )
                : localize(
                    'editor.info.name_value_order_desc_vertical',
                    lang,
                    'Which one sits on top of the other'
                  )}
            </div>
            ${this.renderSegmentedField(
              '',
              '',
              entity.name_value_order || 'name-first',
              [
                {
                  value: 'name-first',
                  label: localize('editor.info.name_first', lang, 'Name First'),
                  icon: 'mdi:format-text',
                },
                {
                  value: 'value-first',
                  label: localize('editor.info.value_first', lang, 'Value First'),
                  icon: 'mdi:numeric',
                },
              ],
              next => {
                this._updateEntity(infoModule, 0, { name_value_order: next as any }, updateModule);
                setTimeout(() => this.triggerPreviewUpdate(), 200);
              }
            )}
          </div>

          <div class="field-container" style="margin-bottom: 24px;">
            ${this.renderSliderField(
              localize('editor.info.name_value_gap', lang, 'Name & Value Gap'),
              localize(
                'editor.info.name_value_gap_desc',
                lang,
                'Space between the name and value in pixels'
              ),
              entity.name_value_gap !== undefined ? entity.name_value_gap : 2,
              2,
              0,
              32,
              1,
              (v: number) => {
                this._updateEntity(infoModule, 0, { name_value_gap: v }, updateModule);
                setTimeout(() => this.triggerPreviewUpdate(), 200);
              }
            )}
          </div>
        </div>

        <!-- Unified Template Section -->
        <div class="template-section" style="margin-bottom: 24px;">
          <div class="template-header">
            <div class="switch-container">
              <div class="switch-label-row">
                <label class="switch-label"
                  >${localize(
                    'editor.info.unified_template_section.title',
                    lang,
                    'Template Mode'
                  )}</label
                >
                <button
                  class="help-btn"
                  style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:var(--text-primary-color, #fff);cursor:pointer;border-radius:50%;line-height:0;"
                  title="${localize(
                    'editor.info.template_cheatsheet',
                    lang,
                    'Template Cheatsheet'
                  )}"
                  @click=${(e: Event) => {
                    (e.currentTarget as HTMLElement).dispatchEvent(
                      new CustomEvent('uc-open-template-cheatsheet', {
                        detail: { module: 'info' },
                        bubbles: true,
                        composed: true,
                      })
                    );
                  }}
                >
                  <ha-icon
                    icon="mdi:help-circle"
                    style="--mdc-icon-size:18px;width:18px;height:18px;color:var(--text-primary-color, #fff);"
                  ></ha-icon>
                </button>
              </div>
              ${this.renderUcForm(
                hass,
                { unified_template_mode: entity.unified_template_mode || false },
                [this.booleanField('unified_template_mode')],
                (e: CustomEvent) =>
                  this._updateEntity(
                    infoModule,
                    0,
                    {
                      unified_template_mode: e.detail.value.unified_template_mode,
                    },
                    updateModule
                  )
              )}
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
                  @insert-snippet=${(e: CustomEvent) => {
                    const editor = (e.currentTarget as HTMLElement).querySelector(
                      'ultra-template-editor'
                    );
                    (editor as any)?.insertAtCursor?.(e.detail?.value ?? '');
                  }}
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
                  ${this.renderTemplateKeyWarning(
                    entity.unified_template,
                    INFO_TEMPLATE_KEYS,
                    lang
                  )}
                  <div class="template-help">
                    <p><strong>Entity context variables available:</strong></p>
                    <ul>
                      <li>
                        <code>entity</code>, <code>state</code>, <code>name</code>,
                        <code>attributes</code>, <code>unit</code>, <code>domain</code>
                      </li>
                    </ul>
                    <p><strong>Return JSON for multiple properties:</strong></p>
                    <ul>
                      <li>
                        Supported keys: <code>icon</code>, <code>icon_color</code>,
                        <code>name</code>, <code>name_color</code>, <code>state_text</code>,
                        <code>state_color</code>, <code>container_background_color</code>
                      </li>
                    </ul>
                    <code
                      style="display: block; background: var(--code-editor-background-color, #1e1e1e); padding: 12px; border-radius: 4px; font-size: 11px;"
                    >
                      {<br />
                      &nbsp;&nbsp;"icon": "{% if state|int > 25 %}mdi:fire{% else %}mdi:snowflake{%
                      endif %}",<br />
                      &nbsp;&nbsp;"icon_color": "red",<br />
                      &nbsp;&nbsp;"state_text": "{{ state }} {{ unit }}"<br />
                      }
                    </code>
                  </div>
                </div>
              `
            : ''}
        </div>

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
          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 12px; color: var(--secondary-text-color);"
          >
            ${localize(
              'editor.info.size_section.desc',
              lang,
              'These controls affect the selected entity only.'
            )}
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${entity.show_icon !== false
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    ${this.renderSliderField(
                      localize('editor.info.icon_size', lang, 'Icon Size'),
                      localize('editor.info.icon_size_desc', lang, 'Size of the icon in pixels'),
                      Number(entity.icon_size) || 26,
                      26,
                      12,
                      48,
                      1,
                      (v: number) => {
                        this._updateEntity(infoModule, 0, { icon_size: v }, updateModule);
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    )}
                  </div>
                `
              : ''}
            ${entity.show_name !== false
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    ${this.renderSliderField(
                      localize('editor.info.name_size', lang, 'Name Size'),
                      localize(
                        'editor.info.name_size_desc',
                        lang,
                        'Size of the entity name text in pixels'
                      ),
                      entity.name_size || 12,
                      12,
                      8,
                      32,
                      1,
                      (v: number) => {
                        this._updateEntity(infoModule, 0, { name_size: v }, updateModule);
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    )}
                  </div>
                `
              : ''}

            <div class="field-container" style="margin-bottom: 24px;">
              ${this.renderSliderField(
                localize('editor.info.value_size', lang, 'Value Size'),
                localize(
                  'editor.info.value_size_desc',
                  lang,
                  'Size of the entity value text in pixels'
                ),
                entity.text_size || 14,
                14,
                8,
                32,
                1,
                (v: number) => {
                  this._updateEntity(infoModule, 0, { text_size: v }, updateModule);
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }
              )}
            </div>

            ${entity.show_icon !== false
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    ${this.renderSliderField(
                      localize('editor.info.icon_gap', lang, 'Icon Gap'),
                      localize(
                        'editor.info.icon_gap_desc',
                        lang,
                        'Space between the icon and content in pixels'
                      ),
                      entity.icon_gap || 8,
                      8,
                      0,
                      32,
                      1,
                      (v: number) => {
                        this._updateEntity(infoModule, 0, { icon_gap: v }, updateModule);
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    )}
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
                ${this.renderUcForm(
                  hass,
                  { allow_wrap: infoModule.allow_wrap !== false },
                  [this.booleanField('allow_wrap')],
                  (e: CustomEvent) => {
                    updateModule({ allow_wrap: e.detail.value.allow_wrap });
                    setTimeout(() => this.triggerPreviewUpdate(), 50);
                  }
                )}
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
            ${this.renderSegmentedField(
              '',
              '',
              entity.icon_position || 'left',
              [
                { value: 'left', label: 'Left', icon: 'mdi:arrow-left' },
                { value: 'top', label: 'Top', icon: 'mdi:arrow-up' },
                { value: 'right', label: 'Right', icon: 'mdi:arrow-right' },
                { value: 'bottom', label: 'Bottom', icon: 'mdi:arrow-down' },
              ],
              next => {
                this._updateEntity(infoModule, 0, { icon_position: next as any }, updateModule);
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
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
            ${this.renderSegmentedField(
              '',
              '',
              entity.content_distribution || 'normal',
              [
                { value: 'normal', label: 'Normal', icon: 'mdi:format-align-left' },
                {
                  value: 'space-between',
                  label: 'Space Between',
                  icon: 'mdi:arrow-left-right',
                },
                {
                  value: 'space-around',
                  label: 'Space Around',
                  icon: 'mdi:arrow-expand-horizontal',
                },
                {
                  value: 'space-evenly',
                  label: 'Space Evenly',
                  icon: 'mdi:arrow-expand-all',
                },
              ],
              next => {
                this._updateEntity(
                  infoModule,
                  0,
                  { content_distribution: next as any },
                  updateModule
                );
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )}
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
              ${this.renderSegmentedField(
                '',
                '',
                entity.overall_alignment || 'center',
                [
                  { value: 'left', label: 'Left', icon: 'mdi:format-align-left' },
                  { value: 'center', label: 'Center', icon: 'mdi:format-align-center' },
                  { value: 'right', label: 'Right', icon: 'mdi:format-align-right' },
                ],
                next => {
                  this._updateEntity(
                    infoModule,
                    0,
                    { overall_alignment: next as any },
                    updateModule
                  );
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }
              )}
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
              ${this.renderSegmentedField(
                '',
                '',
                entity.name_alignment || 'start',
                [
                  { value: 'start', label: 'Start', icon: 'mdi:format-align-left' },
                  { value: 'center', label: 'Center', icon: 'mdi:format-align-center' },
                  { value: 'end', label: 'End', icon: 'mdi:format-align-right' },
                ],
                next => {
                  this._updateEntity(infoModule, 0, { name_alignment: next as any }, updateModule);
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }
              )}
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
              ${this.renderSegmentedField(
                '',
                '',
                entity.icon_alignment || 'center',
                [
                  { value: 'start', label: 'Start', icon: 'mdi:format-align-left' },
                  { value: 'center', label: 'Center', icon: 'mdi:format-align-center' },
                  { value: 'end', label: 'End', icon: 'mdi:format-align-right' },
                ],
                next => {
                  this._updateEntity(infoModule, 0, { icon_alignment: next as any }, updateModule);
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }
              )}
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
              ${this.renderSegmentedField(
                '',
                '',
                entity.state_alignment || 'start',
                [
                  { value: 'start', label: 'Start', icon: 'mdi:format-align-left' },
                  { value: 'center', label: 'Center', icon: 'mdi:format-align-center' },
                  { value: 'end', label: 'End', icon: 'mdi:format-align-right' },
                ],
                next => {
                  this._updateEntity(infoModule, 0, { state_alignment: next as any }, updateModule);
                  setTimeout(() => this.triggerPreviewUpdate(), 50);
                }
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _syncPrimaryEntityActions(
    infoModule: InfoModule,
    moduleUpdates: Record<string, unknown>,
    primaryEntity: string
  ): void {
    const syncAction = (action: any): any => {
      if (!action || typeof action !== 'object') return action;
      if (action.target) return action;
      if (
        action.action === 'more-info' ||
        action.action === 'toggle' ||
        action.action === 'default'
      ) {
        return { ...action, entity: primaryEntity };
      }
      return action;
    };

    const tapSource =
      moduleUpdates.tap_action !== undefined
        ? moduleUpdates.tap_action
        : (infoModule as any).tap_action;
    const holdSource =
      moduleUpdates.hold_action !== undefined
        ? moduleUpdates.hold_action
        : (infoModule as any).hold_action;
    const doubleTapSource =
      moduleUpdates.double_tap_action !== undefined
        ? moduleUpdates.double_tap_action
        : (infoModule as any).double_tap_action;

    const tapAction = syncAction(tapSource);
    const holdAction = syncAction(holdSource);
    const doubleTapAction = syncAction(doubleTapSource);

    if (tapAction !== (infoModule as any).tap_action) {
      moduleUpdates.tap_action = tapAction;
    }
    if (holdAction !== (infoModule as any).hold_action) {
      moduleUpdates.hold_action = holdAction;
    }
    if (doubleTapAction !== (infoModule as any).double_tap_action) {
      moduleUpdates.double_tap_action = doubleTapAction;
    }
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

    // Info module actions implicitly follow the first info entity.
    // Keep action entities synchronized when that primary entity changes.
    if (index === 0 && entityId) {
      this._syncPrimaryEntityActions(infoModule, moduleUpdates, entityId);
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
}

installSettingsMethods(UltraInfoModule, UltraInfoModuleSettings);

export function renderInfoGeneralTab(
  host: UltraInfoModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraInfoModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraInfoModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}

/* data-uc-role="pane" required for pane-token settings chrome */
