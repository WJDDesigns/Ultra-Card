import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UltraCardConfig, AccordionModule } from '../types';
import { getModuleRegistry } from './module-registry';
import { logicService } from '../services/logic-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';

export class UltraAccordionModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'accordion',
    title: 'Accordion',
    description: 'Collapsible container with customizable header for organizing modules',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:chevron-down',
    category: 'layout',
    tags: ['layout', 'accordion', 'collapsible', 'container', 'organization'],
  };

  createDefault(id?: string, hass?: HomeAssistant): AccordionModule {
    return {
      id: id || this.generateId('accordion'),
      type: 'accordion',
      modules: [],
      title_mode: 'custom',
      title_text: 'Accordion Title',
      title_entity: '',
      show_entity_name: false,
      icon: 'mdi:chevron-down',
      header_alignment: 'apart',
      icon_side: 'right',
      default_open: false,
      // Open/Close Logic
      open_mode: 'manual',
      open_conditions: [],
      // Global action configuration
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderDesignTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const accordionModule = module as AccordionModule;
    const lang = hass?.locale?.language || 'en';
    const moduleWithDesign = accordionModule as any;
    const d = moduleWithDesign.design || {};

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
        <!-- Header Design Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.accordion.design.header_title', lang, 'Header Design')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.accordion.design.header_desc',
              lang,
              'Customize the appearance of the accordion header bar.'
            )}
          </div>

          <!-- Header Text Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.accordion.design.header_text_color', lang, 'Header Text Color')}
              .value=${d.header_text_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                const value = e.detail.value;
                const design = { ...d, header_text_color: value };
                updateModule({ design } as any);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Header Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.accordion.design.header_bg_color', lang, 'Header Background Color')}
              .value=${d.header_background_color || ''}
              .defaultValue=${'var(--card-background-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                const value = e.detail.value;
                const design = { ...d, header_background_color: value };
                updateModule({ design } as any);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Header Font Size -->
          ${this.renderFieldSection(
            localize('editor.accordion.design.header_font_size', lang, 'Header Font Size'),
            localize(
              'editor.accordion.design.header_font_size_desc',
              lang,
              'Font size for the header title text (in pixels).'
            ),
            hass,
            { header_font_size: d.header_font_size || 16 },
            [this.numberField('header_font_size', 8, 48, 1)],
            (e: CustomEvent) => {
              const design = { ...d, header_font_size: e.detail.value.header_font_size };
              updateModule({ design } as any);
            }
          )}

          <!-- Header Font Weight -->
          ${this.renderFieldSection(
            localize('editor.accordion.design.header_font_weight', lang, 'Header Font Weight'),
            localize(
              'editor.accordion.design.header_font_weight_desc',
              lang,
              'Font weight for the header title text.'
            ),
            hass,
            { header_font_weight: d.header_font_weight || 'normal' },
            [
              this.selectField('header_font_weight', [
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Bold' },
                { value: '300', label: 'Light' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semi-Bold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra Bold' },
              ]),
            ],
            (e: CustomEvent) => {
              const design = { ...d, header_font_weight: e.detail.value.header_font_weight };
              updateModule({ design } as any);
            }
          )}
        </div>

        <!-- Content Design Section -->
        <div class="design-subsection">
          <div class="subsection-title">
            ${localize('editor.accordion.design.content_title', lang, 'Content Design')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.accordion.design.content_desc',
              lang,
              'Customize the appearance of the accordion content area when expanded.'
            )}
          </div>

          <!-- Content Background Color -->
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${localize('editor.accordion.design.content_bg_color', lang, 'Content Background Color')}
              .value=${d.content_background_color || ''}
              .defaultValue=${'transparent'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) => {
                const value = e.detail.value;
                const design = { ...d, content_background_color: value };
                updateModule({ design } as any);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Content Padding -->
          ${this.renderFieldSection(
            localize('editor.accordion.design.content_padding', lang, 'Content Padding'),
            localize(
              'editor.accordion.design.content_padding_desc',
              lang,
              'Padding around the content area (in pixels).'
            ),
            hass,
            { content_padding: d.content_padding || 16 },
            [this.numberField('content_padding', 0, 48, 1)],
            (e: CustomEvent) => {
              const design = { ...d, content_padding: e.detail.value.content_padding };
              updateModule({ design } as any);
            }
          )}
        </div>

        <!-- Standard Design Tab Content (from GlobalDesignTab) -->
        <div style="margin-top: 24px;">
          <div
            style="font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;"
          >
            ${localize('editor.accordion.design.general_title', lang, 'General Container Design')}
          </div>
          ${super.renderDesignTab(module, hass, config, updateModule)}
        </div>
      </div>
    `;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const accordionModule = module as AccordionModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}

      <div class="module-general-settings">
        <!-- Title Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.accordion.title.section_title', lang, 'Title Configuration'),
          localize(
            'editor.accordion.title.section_desc',
            lang,
            'Configure the accordion header title source and content.'
          ),
          [
            {
              title: localize('editor.accordion.title.mode', lang, 'Title Mode'),
              description: localize(
                'editor.accordion.title.mode_desc',
                lang,
                'Choose whether to use custom text or entity state as title.'
              ),
              hass,
              data: { title_mode: accordionModule.title_mode || 'custom' },
              schema: [
                this.selectField('title_mode', [
                  { value: 'custom', label: localize('editor.common.custom_text', lang, 'Custom Text') },
                  { value: 'entity', label: localize('editor.common.entity_state', lang, 'Entity State') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                const next = e.detail.value.title_mode;
                const prev = accordionModule.title_mode || 'custom';
                if (next === prev) return;
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Conditional: Custom Title Text -->
        ${accordionModule.title_mode === 'custom'
          ? html`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup(
                  localize('editor.accordion.title.custom_config', lang, 'Custom Title Configuration'),
                  html`
                    <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
                      ${localize('editor.accordion.title.custom_text', lang, 'Title Text')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
                    >
                      ${localize(
                        'editor.accordion.title.custom_text_desc',
                        lang,
                        'Enter the custom text to display in the accordion header.'
                      )}
                    </div>
                    <ha-textfield
                      .value=${accordionModule.title_text || ''}
                      placeholder="Enter title text"
                      style="width: 100%;"
                      @input=${(e: Event) => {
                        const target = e.target as any;
                        updateModule({ title_text: target.value });
                      }}
                    ></ha-textfield>
                  `
                )}
              </div>
            `
          : ''}

        <!-- Conditional: Entity Title -->
        ${accordionModule.title_mode === 'entity'
          ? html`
              <div style="margin-top: -16px; margin-bottom: 32px;">
                ${this.renderConditionalFieldsGroup(
                  localize('editor.accordion.title.entity_config', lang, 'Entity Title Configuration'),
                  html`
                    ${this.renderFieldSection(
                      localize('editor.accordion.title.entity', lang, 'Title Entity'),
                      localize(
                        'editor.accordion.title.entity_desc',
                        lang,
                        'Select an entity whose state will be used as the title.'
                      ),
                      hass,
                      { title_entity: accordionModule.title_entity || '' },
                      [this.entityField('title_entity')],
                      (e: CustomEvent) => {
                        updateModule(e.detail.value);
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      }
                    )}
                    
                    <!-- Show Entity Name Toggle -->
                    ${this.renderSettingsSection(
                      localize('editor.accordion.title.show_name', lang, 'Display Options'),
                      localize(
                        'editor.accordion.title.show_name_desc',
                        lang,
                        'Choose whether to show the entity name along with the state.'
                      ),
                      [
                        {
                          title: localize('editor.accordion.title.show_entity_name', lang, 'Show Entity Name'),
                          description: localize(
                            'editor.accordion.title.show_entity_name_desc',
                            lang,
                            'Display the entity friendly name before the state value.'
                          ),
                          hass,
                          data: { show_entity_name: accordionModule.show_entity_name || false },
                          schema: [this.booleanField('show_entity_name')],
                          onChange: (e: CustomEvent) => {
                            updateModule(e.detail.value);
                            setTimeout(() => {
                              this.triggerPreviewUpdate();
                            }, 50);
                          },
                        },
                      ]
                    )}
                  `
                )}
              </div>
            `
          : ''}

        <!-- Icon Configuration Section -->
        ${this.renderSettingsSection(
          localize('editor.accordion.icon.section_title', lang, 'Control Icon'),
          localize(
            'editor.accordion.icon.section_desc',
            lang,
            'Configure the control icon displayed in the accordion header (defaults to chevron-down).'
          ),
          [
            {
              title: localize('editor.accordion.icon.custom', lang, 'Icon'),
              description: localize(
                'editor.accordion.icon.custom_desc',
                lang,
                'Select the icon to display as the control indicator.'
              ),
              hass,
              data: { icon: accordionModule.icon || 'mdi:chevron-down' },
              schema: [this.iconField('icon')],
              onChange: (e: CustomEvent) => {
                updateModule(e.detail.value);
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
            },
          ]
        )}

        <!-- Header Alignment Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.accordion.alignment.section_title', lang, 'Header Alignment')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.accordion.alignment.section_desc',
              lang,
              'Choose how the title and icon are positioned in the header.'
            )}
          </div>

          <!-- Alignment Mode: Center or Apart -->
          <div style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.accordion.alignment.mode', lang, 'Alignment Mode')}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[
                { value: 'center', icon: 'mdi:align-horizontal-center', title: localize('editor.common.center', lang, 'Center') },
                { value: 'apart', icon: 'mdi:arrow-left-right', title: localize('editor.common.apart', lang, 'Apart') },
              ].map(
                align => html`
                  <button
                    class="alignment-btn ${(accordionModule.header_alignment || 'apart') === align.value ? 'active' : ''}"
                    @click=${() => {
                      updateModule({ header_alignment: align.value as 'center' | 'apart' });
                      setTimeout(() => {
                        this.triggerPreviewUpdate();
                      }, 50);
                    }}
                    title="${align.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(accordionModule.header_alignment || 'apart') === align.value
                      ? 'var(--primary-color)'
                      : 'var(--card-background-color)'}; color: ${(accordionModule.header_alignment || 'apart') === align.value ? 'white' : 'var(--primary-text-color)'}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${align.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>

          <!-- Icon Side: Left or Right -->
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.accordion.alignment.icon_side', lang, 'Icon Side')}
            </div>
            <div style="display: flex; gap: 8px;">
              ${[
                { value: 'left', icon: 'mdi:arrow-left', title: localize('editor.common.left', lang, 'Left') },
                { value: 'right', icon: 'mdi:arrow-right', title: localize('editor.common.right', lang, 'Right') },
              ].map(
                side => html`
                  <button
                    class="alignment-btn ${(accordionModule.icon_side || 'right') === side.value ? 'active' : ''}"
                    @click=${() => {
                      updateModule({ icon_side: side.value as 'left' | 'right' });
                      setTimeout(() => {
                        this.triggerPreviewUpdate();
                      }, 50);
                    }}
                    title="${side.title}"
                    style="flex: 1; padding: 12px; border: 1px solid var(--divider-color); border-radius: 4px; background: ${(accordionModule.icon_side || 'right') === side.value
                      ? 'var(--primary-color)'
                      : 'var(--card-background-color)'}; color: ${(accordionModule.icon_side || 'right') === side.value ? 'white' : 'var(--primary-text-color)'}; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;"
                  >
                    <ha-icon icon="${side.icon}" style="--mdc-icon-size: 24px;"></ha-icon>
                  </button>
                `
              )}
            </div>
          </div>
        </div>

        <!-- Open/Close Logic Section -->
        ${this._renderOpenCloseLogic(accordionModule, hass, updateModule)}

        <!-- Default State Section (only shown when open_mode is manual) -->
        ${(accordionModule.open_mode || 'manual') === 'manual'
          ? this.renderSettingsSection(
              localize('editor.accordion.state.section_title', lang, 'Default State'),
              localize(
                'editor.accordion.state.section_desc',
                lang,
                'Configure whether this accordion starts open or closed when the card loads.'
              ),
              [
                {
                  title: localize('editor.accordion.state.default_open', lang, 'Open by Default'),
                  description: localize(
                    'editor.accordion.state.default_open_desc',
                    lang,
                    'When enabled, the accordion will be expanded when the card initially loads.'
                  ),
                  hass,
                  data: { default_open: accordionModule.default_open || false },
                  schema: [this.booleanField('default_open')],
                  onChange: (e: CustomEvent) => {
                    updateModule(e.detail.value);
                    setTimeout(() => {
                      this.triggerPreviewUpdate();
                    }, 50);
                  },
                },
              ]
            )
          : ''}
      </div>
    `;
  }

  private _renderOpenCloseLogic(
    accordionModule: AccordionModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const conditions = accordionModule.open_conditions || [];
    const openMode = accordionModule.open_mode || 'manual';
    const lang = hass?.locale?.language || 'en';

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.accordion.open_logic.section_title', lang, 'Open/Close Logic')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize(
            'editor.accordion.open_logic.section_desc',
            lang,
            'Control when this accordion automatically opens or closes based on conditions.'
          )}
        </div>

        <!-- Open Mode Selection -->
        ${this.renderFieldSection(
          localize('editor.accordion.open_logic.mode_title', lang, 'Accordion State Control'),
          localize(
            'editor.accordion.open_logic.mode_desc',
            lang,
            'Choose how the accordion state is controlled.'
          ),
          hass,
          { open_mode: openMode },
          [
            this.selectField('open_mode', [
              {
                value: 'manual',
                label: localize('editor.accordion.open_logic.mode_manual', lang, 'Manual'),
              },
              {
                value: 'always',
                label: localize('editor.accordion.open_logic.mode_always', lang, 'Always Open'),
              },
              {
                value: 'every',
                label: localize(
                  'editor.accordion.open_logic.mode_every',
                  lang,
                  'Open if EVERY condition is met'
                ),
              },
              {
                value: 'any',
                label: localize('editor.accordion.open_logic.mode_any', lang, 'Open if ANY condition is met'),
              },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ open_mode: e.detail.value.open_mode } as any);
            setTimeout(() => {
              this.triggerPreviewUpdate();
            }, 50);
          }
        )}

        <!-- Conditions List -->
        ${openMode !== 'manual' && openMode !== 'always'
          ? html`
              <div style="margin-top: 24px;">
                <div
                  style="display:flex; align-items:center; justify-content: space-between; margin-bottom: 12px;"
                >
                  <div style="font-size: 16px; font-weight: 600;">
                    ${localize('editor.accordion.open_logic.conditions', lang, 'Conditions')}
                  </div>
                  <button
                    @click=${() => {
                      const newCond = {
                        id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        type: 'entity_state',
                        ui_expanded: true,
                        entity: '',
                        operator: '=',
                        value: '',
                      } as any;
                      const next = [...conditions, newCond];
                      updateModule({ open_conditions: next } as any);
                    }}
                    style="display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px dashed var(--primary-color); background:none; color:var(--primary-color); border-radius:6px; cursor:pointer;"
                  >
                    <ha-icon icon="mdi:plus"></ha-icon>
                    ${localize('editor.accordion.open_logic.add_condition', lang, 'Add Condition')}
                  </button>
                </div>

                <div style="display:flex; flex-direction: column; gap: 12px;">
                  ${conditions.length === 0
                    ? html`
                        <div
                          style="text-align: center; padding: 24px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${localize(
                            'editor.accordion.open_logic.no_conditions',
                            lang,
                            'No conditions added yet. Click "Add Condition" to get started.'
                          )}
                        </div>
                      `
                    : ''}
                  ${conditions.map((cond, index) => this._renderOpenCondition(cond, index, conditions, hass, updateModule))}
                </div>
              </div>
            `
          : openMode === 'always'
          ? html`
              <div
                style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 8px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
              >
                ${localize(
                  'editor.accordion.open_logic.always_note',
                  lang,
                  'Accordion will always remain open. Users can still manually close it, but it will reopen automatically.'
                )}
              </div>
            `
          : html`
              <div
                style="margin-top: 16px; padding: 16px; background: rgba(var(--rgb-secondary-text-color), 0.05); border-radius: 8px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
              >
                ${localize(
                  'editor.accordion.open_logic.manual_note',
                  lang,
                  'Accordion state is controlled manually by user clicks. Set Default State above to choose initial state.'
                )}
              </div>
            `}
      </div>
    `;
  }

  private _renderOpenCondition(
    cond: any,
    index: number,
    conditions: any[],
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lang = hass?.locale?.language || 'en';
    const onChange = (updates: Record<string, any>) => {
      const next = [...conditions];
      next[index] = { ...cond, ...updates };
      updateModule({ open_conditions: next } as any);
    };
    const remove = () => {
      const next = conditions.filter((_, i) => i !== index);
      updateModule({ open_conditions: next } as any);
    };

    const expanded = cond.ui_expanded !== false;
    const headerLabel = cond.custom_name || `Condition ${index + 1}`;

    return html`
      <div
        class="uc-condition-item"
        style="border:1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); overflow: hidden;"
      >
        <div
          class="uc-condition-header"
          style="display:flex; align-items:center; justify-content: space-between; gap:10px; padding: 12px 14px; border-bottom: ${expanded
            ? '1px solid var(--divider-color)'
            : 'none'};"
        >
          <div style="display:flex; align-items:center; gap:10px; min-width:0;">
            <button
              @click=${() => onChange({ ui_expanded: !expanded })}
              title=${expanded ? 'Collapse' : 'Expand'}
              style="background:none; border:none; color:var(--secondary-text-color); cursor:pointer; padding:4px;"
            >
              <ha-icon icon=${expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}></ha-icon>
            </button>
            <span
              style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
              >${headerLabel}</span
            >
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button
              @click=${() => {
                const copy = {
                  ...cond,
                  id: `cond_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                };
                const next = [...conditions];
                next.splice(index + 1, 0, copy);
                updateModule({ open_conditions: next } as any);
              }}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--secondary-text-color);"
              title="Duplicate Condition"
            >
              <ha-icon icon="mdi:content-copy" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
            <button
              @click=${remove}
              style="background:none; border:none; padding:4px; cursor:pointer; color: var(--error-color);"
              title="Remove Condition"
            >
              <ha-icon icon="mdi:trash-can-outline" style="--mdc-icon-size: 18px;"></ha-icon>
            </button>
          </div>
        </div>

        ${expanded
          ? html`
              <div style="padding: 12px 14px; display:flex; flex-direction:column; gap:12px;">
                ${this.renderFieldSection(
                  localize('editor.accordion.open_logic.custom_name', lang, 'Custom Name'),
                  localize(
                    'editor.accordion.open_logic.custom_name_desc',
                    lang,
                    'Optional: Give this condition a custom name'
                  ),
                  hass,
                  { custom_name: cond.custom_name || '' },
                  [this.textField('custom_name')],
                  (e: CustomEvent) => onChange(e.detail.value)
                )}
                ${this.renderFieldSection(
                  localize('editor.accordion.open_logic.condition_type', lang, 'Condition Type'),
                  '',
                  hass,
                  { type: cond.type || 'entity_state' },
                  [
                    this.selectField('type', [
                      {
                        value: 'entity_state',
                        label: localize('editor.accordion.open_logic.type_entity_state', lang, 'Entity State'),
                      },
                      {
                        value: 'entity_attribute',
                        label: localize(
                          'editor.accordion.open_logic.type_entity_attribute',
                          lang,
                          'Entity Attribute'
                        ),
                      },
                      {
                        value: 'time',
                        label: localize('editor.accordion.open_logic.type_time', lang, 'Time Range'),
                      },
                      {
                        value: 'template',
                        label: localize('editor.accordion.open_logic.type_template', lang, 'Template'),
                      },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const newType = e.detail.value.type;
                    const base: any = { type: newType };
                    if (newType === 'entity_state') {
                      Object.assign(base, { entity: '', operator: '=', value: '' });
                    } else if (newType === 'entity_attribute') {
                      Object.assign(base, { entity: '', attribute: '', operator: '=', value: '' });
                    } else if (newType === 'time') {
                      Object.assign(base, { time_from: '00:00', time_to: '23:59' });
                    } else if (newType === 'template') {
                      Object.assign(base, { template: '' });
                    }
                    onChange(base);
                  }
                )}
                ${(() => {
                  if ((cond.type || 'entity_state') === 'entity_state') {
                    return html`
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.entity', lang, 'Entity'),
                        '',
                        hass,
                        { entity: cond.entity || '' },
                        [this.entityField('entity')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.operator', lang, 'Operator'),
                        '',
                        hass,
                        { operator: cond.operator || '=' },
                        [
                          this.selectField('operator', [
                            { value: '=', label: '=' },
                            { value: '!=', label: '!=' },
                            { value: '>', label: '>' },
                            { value: '>=', label: '>=' },
                            { value: '<', label: '<' },
                            { value: '<=', label: '<=' },
                            { value: 'contains', label: 'contains' },
                            { value: 'not_contains', label: 'not_contains' },
                            { value: 'has_value', label: 'has_value' },
                            { value: 'no_value', label: 'no_value' },
                          ]),
                        ],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.value', lang, 'Value'),
                        '',
                        hass,
                        { value: cond.value || '' },
                        [this.textField('value')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                    `;
                  }

                  if (cond.type === 'entity_attribute') {
                    return html`
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.entity', lang, 'Entity'),
                        '',
                        hass,
                        { entity: cond.entity || '' },
                        [this.entityField('entity')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.attribute', lang, 'Attribute'),
                        '',
                        hass,
                        { attribute: cond.attribute || '' },
                        [this.textField('attribute')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.operator', lang, 'Operator'),
                        '',
                        hass,
                        { operator: cond.operator || '=' },
                        [
                          this.selectField('operator', [
                            { value: '=', label: '=' },
                            { value: '!=', label: '!=' },
                            { value: '>', label: '>' },
                            { value: '>=', label: '>=' },
                            { value: '<', label: '<' },
                            { value: '<=', label: '<=' },
                            { value: 'contains', label: 'contains' },
                            { value: 'not_contains', label: 'not_contains' },
                          ]),
                        ],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.value', lang, 'Value'),
                        '',
                        hass,
                        { value: cond.value || '' },
                        [this.textField('value')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                    `;
                  }

                  if (cond.type === 'time') {
                    return html`
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.time_from', lang, 'From'),
                        '',
                        hass,
                        { time_from: cond.time_from || '00:00' },
                        [this.textField('time_from')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                      ${this.renderFieldSection(
                        localize('editor.accordion.open_logic.time_to', lang, 'To'),
                        '',
                        hass,
                        { time_to: cond.time_to || '23:59' },
                        [this.textField('time_to')],
                        (e: CustomEvent) => onChange(e.detail.value)
                      )}
                    `;
                  }

                  return html`
                    <div class="field-container" style="margin-bottom: 16px;">
                      <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                        ${localize('editor.accordion.open_logic.template', lang, 'Template')}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                      >
                        ${localize(
                          'editor.accordion.open_logic.template_desc',
                          lang,
                          'Jinja2 template that should evaluate to true/false to open the accordion.'
                        )}
                      </div>
                      <ultra-template-editor
                        .hass=${hass}
                        .value=${cond.template || ''}
                        .placeholder=${"{% if states('sensor.example') | int > 50 %}true{% else %}false{% endif %}"}
                        .minHeight=${100}
                        .maxHeight=${300}
                        @value-changed=${(e: CustomEvent) => onChange({ template: e.detail.value })}
                      ></ultra-template-editor>
                    </div>
                  `;
                })()}
              </div>
            `
          : ''}
      </div>
    `;
  }

  private accordionStates = new Map<string, boolean>();

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const accordionModule = module as AccordionModule;
    const moduleWithDesign = accordionModule as any;
    const d = moduleWithDesign.design || {};
    const lang = hass?.locale?.language || 'en';
    
    // Evaluate open/close logic
    const openMode = accordionModule.open_mode || 'manual';
    let logicDeterminedState: boolean | null = null;
    
    if (openMode === 'always') {
      logicDeterminedState = true;
    } else if (openMode === 'every' || openMode === 'any') {
      // Use logic service to evaluate open conditions
      logicService.setHass(hass);
      const conditionsResult = logicService.evaluateDisplayConditions(
        accordionModule.open_conditions || [],
        openMode
      );
      logicDeterminedState = conditionsResult;
    }
    
    // Initialize accordion state if not exists
    if (!this.accordionStates.has(accordionModule.id)) {
      // Use logic-determined state if available, otherwise use default_open
      const initialState = logicDeterminedState !== null ? logicDeterminedState : (accordionModule.default_open || false);
      this.accordionStates.set(accordionModule.id, initialState);
    } else if (logicDeterminedState !== null) {
      // If logic determines state, update it (overriding manual state)
      this.accordionStates.set(accordionModule.id, logicDeterminedState);
    }
    
    const isOpen = this.accordionStates.get(accordionModule.id) || false;
    
    // Determine title text
    let titleText = '';
    if (accordionModule.title_mode === 'entity' && accordionModule.title_entity) {
      const entityState = hass?.states[accordionModule.title_entity];
      const entityName = entityState?.attributes?.friendly_name || accordionModule.title_entity.split('.')[1] || accordionModule.title_entity;
      const entityStateValue = entityState?.state || accordionModule.title_entity;
      
      if (accordionModule.show_entity_name) {
        titleText = `${entityName}: ${entityStateValue}`;
      } else {
        titleText = entityStateValue;
      }
    } else {
      titleText = accordionModule.title_text || 'Accordion Title';
    }
    
    // Get the control icon (chevron)
    const iconToDisplay = accordionModule.icon || 'mdi:chevron-down';
    const headerAlignment = accordionModule.header_alignment || 'apart';
    const iconSide = accordionModule.icon_side || 'right';
    
    // Calculate header layout based on alignment mode and icon side
    let headerJustifyContent = 'space-between';
    let titleOrder = 1;
    let iconOrder = 2;
    
    if (headerAlignment === 'center') {
      // Center mode: icon and text together
      headerJustifyContent = 'center';
      if (iconSide === 'left') {
        // Icon on left, text on right, both centered together
        titleOrder = 2;
        iconOrder = 1;
      } else {
        // Text on left, icon on right, both centered together
        titleOrder = 1;
        iconOrder = 2;
      }
    } else {
      // Apart mode: icon and text spread out
      headerJustifyContent = 'space-between';
      if (iconSide === 'left') {
        // Icon on far left, text on far right
        titleOrder = 2;
        iconOrder = 1;
      } else {
        // Text on far left, icon on far right
        titleOrder = 1;
        iconOrder = 2;
      }
    }
    
    // Header styles
    const headerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: headerJustifyContent,
      padding: '12px 16px',
      cursor: 'pointer',
      backgroundColor: d.header_background_color || 'var(--card-background-color)',
      color: d.header_text_color || 'var(--primary-text-color)',
      fontSize: d.header_font_size ? `${d.header_font_size}px` : '16px',
      fontWeight: d.header_font_weight || 'normal',
      borderBottom: '1px solid var(--divider-color)',
      transition: 'background-color 0.2s',
      userSelect: 'none' as const,
      gap: headerAlignment === 'center' ? '8px' : '0',
    };
    
    // Content styles
    const contentStyles = {
      maxHeight: isOpen ? '2000px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease-in-out',
      backgroundColor: d.content_background_color || 'transparent',
      padding: isOpen ? `${d.content_padding || 16}px` : '0',
    };
    
    // Chevron icon styles
    const chevronStyles = {
      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s ease',
      order: iconOrder,
      flexShrink: 0,
    };
    
    // Title styles
    const titleStyles = {
      order: titleOrder,
      flexShrink: headerAlignment === 'apart' ? 1 : 0,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    };
    
    // Container styles for the entire accordion
    const containerStyles = {
      border: '1px solid var(--divider-color)',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: d.background_color || 'var(--card-background-color)',
    };
    
    // Toggle handler
    const handleToggle = (e: Event) => {
      e.stopPropagation(); // Prevent nested accordion toggles
      const currentState = this.accordionStates.get(accordionModule.id) || false;
      this.accordionStates.set(accordionModule.id, !currentState);
      this.triggerPreviewUpdate(true);
    };
    
    // Render child modules
    const hasChildren = accordionModule.modules && accordionModule.modules.length > 0;
    const registry = getModuleRegistry();
    
    return html`
      <div class="ultra-accordion-container" style=${this.styleObjectToCss(containerStyles)}>
        <!-- Accordion Header -->
        <div 
          class="ultra-accordion-header" 
          style=${this.styleObjectToCss(headerStyles)}
          @click=${handleToggle}
        >
          <!-- Title -->
          <span class="ultra-accordion-title" style=${this.styleObjectToCss(titleStyles)}>${titleText}</span>
          
          <!-- Control Icon (Chevron) -->
          <ha-icon 
            icon="${iconToDisplay}" 
            style=${this.styleObjectToCss(chevronStyles) + '; --mdc-icon-size: 24px;'}
          ></ha-icon>
        </div>
        
        <!-- Accordion Content -->
        <div 
          class="ultra-accordion-content" 
          style=${this.styleObjectToCss(contentStyles)}
        >
          ${isOpen && hasChildren
            ? accordionModule.modules.map(childModule => {
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

                // Render child module
                return html`
                  <div class="accordion-child-module" style="margin-bottom: 8px;">
                    ${childModuleHandler.renderPreview(childModule, hass, config, previewContext)}
                  </div>
                `;
              })
            : isOpen && !hasChildren
            ? html`
                <div
                  style="padding: 24px; text-align: center; color: var(--secondary-text-color); font-style: italic;"
                >
                  ${localize(
                    'editor.accordion.preview.no_modules',
                    lang,
                    'No modules added. Add modules to this accordion in the Layout tab.'
                  )}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  // Helper method to convert style object to CSS string
  private styleObjectToCss(styles: Record<string, string | number>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const accordionModule = module as AccordionModule;
    const errors = [...baseValidation.errors];

    // Validate modules array exists
    if (!accordionModule.modules) {
      errors.push('Modules array is required');
    }

    // Validate title mode and corresponding fields
    if (accordionModule.title_mode === 'custom' && !accordionModule.title_text?.trim()) {
      errors.push('Title text is required when using custom title mode');
    }

    if (accordionModule.title_mode === 'entity' && !accordionModule.title_entity?.trim()) {
      errors.push('Title entity is required when using entity title mode');
    }
    
    // Note: Removed icon_mode and icon_position validation as they are no longer used

    // Validate nested modules - allow 2 levels of nesting but prevent deeper nesting
    if (accordionModule.modules && accordionModule.modules.length > 0) {
      for (const childModule of accordionModule.modules) {
        // Allow layout modules (horizontal, vertical, accordion) at level 1
        if (childModule.type === 'horizontal' || childModule.type === 'vertical' || childModule.type === 'accordion') {
          const layoutChild = childModule as any;

          // Check level 2 nesting - allow layout modules but prevent level 3
          if (layoutChild.modules && layoutChild.modules.length > 0) {
            for (const nestedModule of layoutChild.modules) {
              if (nestedModule.type === 'horizontal' || nestedModule.type === 'vertical' || nestedModule.type === 'accordion') {
                const deepLayoutModule = nestedModule as any;

                // Check level 3 nesting - prevent any layout modules at this level
                if (deepLayoutModule.modules && deepLayoutModule.modules.length > 0) {
                  for (const deepNestedModule of deepLayoutModule.modules) {
                    if (
                      deepNestedModule.type === 'horizontal' ||
                      deepNestedModule.type === 'vertical' ||
                      deepNestedModule.type === 'accordion'
                    ) {
                      errors.push(
                        'Layout modules cannot be nested more than 2 levels deep. Remove layout modules from the third level.'
                      );
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

