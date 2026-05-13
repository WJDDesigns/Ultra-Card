import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  AutoEntityListModule,
  AutoEntityListPinnedEntity,
  AutoEntityListStateOperator,
  UltraCardConfig,
} from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

interface EntityRow {
  entityId: string;
  name: string;
  icon: string;
  state: string;
  domain: string;
  deviceClass: string;
  lastChanged: Date;
  isActive: boolean;
  pinned: boolean;
  pinnedColor?: string | undefined;
  entityColor?: string | undefined; // rgb()/hsl() derived from rgb_color, hs_color, color, etc.
}

const PATCH_EVENT = 'uc-module-patch-by-id';

export class UltraAutoEntityListModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'auto_entity_list',
    title: 'Auto Entities List',
    description:
      'Dynamically list entities using domain, device_class, state, and keyword filters',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:format-list-bulleted-type',
    category: 'data',
    tags: ['auto', 'entities', 'list', 'filter', 'dynamic', 'domain'],
  };

  private _expandedEntities: Set<string> = new Set();

  createDefault(id?: string): AutoEntityListModule {
    return {
      id: id || this.generateId('auto_entity_list'),
      type: 'auto_entity_list',

      include_domains: [],
      include_device_classes: [],
      include_keywords: [],
      exclude_keywords: [],
      show_unavailable: false,

      pinned_entities: [],
      hidden_entities: [],

      row_style: 'compact',

      title: 'Auto Entities List',
      show_title: true,
      max_items: 50,
      show_icon: true,
      show_state: true,
      show_last_changed: false,
      use_entity_color: false,
      row_gap: 6,
      columns: 1,
      sort_by: 'name',
      sort_direction: 'asc',

      card_height: 0,
      card_width: 0,

      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      accent_color: '',
      active_color: '',
      inactive_color: '',

      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    return { valid: base.errors.length === 0, errors: base.errors };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as AutoEntityListModule, hass, updates =>
      updateModule(updates)
    );
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as AutoEntityListModule, hass, updates =>
      updateModule(updates)
    );
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .uc-ael-remove {
        flex-shrink: 0;
        cursor: pointer;
        color: var(--error-color);
        --mdc-icon-size: 18px;
        padding: 4px;
        margin-left: 4px;
        opacity: 0.6;
        transition: opacity 0.15s ease;
      }
      .uc-ael-row:hover .uc-ael-remove {
        opacity: 1;
      }
    `;
  }

  // =============================================
  // EDITOR — GENERAL TAB
  // =============================================

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as AutoEntityListModule;
    const lang = hass?.locale?.language || 'en';

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
        .style-switcher {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
          margin-bottom: 8px;
        }
        .style-btn {
          padding: 12px 8px;
          border: 2px solid var(--divider-color);
          border-radius: 12px;
          background: var(--card-background-color);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .style-btn:hover {
          border-color: var(--primary-color);
        }
        .style-btn.active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.08);
        }
        .style-btn ha-icon {
          display: block;
          margin: 0 auto 6px;
          color: var(--primary-color);
          --mdc-icon-size: 26px;
        }
        .style-btn .st-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .style-btn .st-desc {
          font-size: 10px;
          color: var(--secondary-text-color);
          margin-top: 4px;
          line-height: 1.2;
        }
        .domain-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
          min-height: 32px;
        }
        .domain-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-radius: 16px;
          font-size: 13px;
          position: relative;
        }
        .domain-chip.exclude {
          background: var(--error-color);
        }
        .domain-chip:hover {
          padding-right: 28px;
        }
        .domain-chip .chip-remove {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.2s ease;
        }
        .domain-chip:hover .chip-remove {
          opacity: 1;
        }
        .domain-input-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .domain-input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        .add-btn {
          padding: 8px 16px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .add-btn.full-width {
          width: 100%;
          justify-content: center;
          padding: 12px;
          margin-top: 8px;
        }
        .entity-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid var(--divider-color);
        }
        .entity-info {
          flex: 1;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity-info.empty {
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
        .entity-settings {
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          border-radius: 0 8px 8px 0;
          margin-bottom: 8px;
        }
        .state-filter-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      </style>

      <div class="module-settings">
        ${this._renderStyleSection(m, hass, updateModule, lang)}
        ${m.row_style === 'card'
          ? this._renderCardSizeSection(m, hass, updateModule, lang)
          : nothing}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderFiltersSection(m, hass, updateModule, lang)}
        ${this._renderEntitySourceSection(m, hass, updateModule, lang)}
        ${this._renderColorsSection(m, hass, updateModule, lang)}
      </div>
    `;
  }

  private _renderCardSizeSection(
    m: AutoEntityListModule,
    _hass: HomeAssistant,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.auto_entity_list.section_card_size', lang, 'Card Size')}
        </div>
        ${this.renderSliderField(
          localize('editor.auto_entity_list.card_height', lang, 'Card height'),
          localize(
            'editor.auto_entity_list.card_height_desc',
            lang,
            'Minimum row height. 0 = auto (fits content).'
          ),
          m.card_height ?? 0,
          0,
          0,
          200,
          1,
          (value: number) => {
            updateModule({ card_height: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          'px'
        )}
        ${this.renderSliderField(
          localize('editor.auto_entity_list.card_width', lang, 'Card width'),
          localize(
            'editor.auto_entity_list.card_width_desc',
            lang,
            'Maximum row width in pixels. 0 = fill container.'
          ),
          m.card_width ?? 0,
          0,
          0,
          1200,
          10,
          (value: number) => {
            updateModule({ card_width: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          'px'
        )}
      </div>
    `;
  }

  private _renderStyleSection(
    m: AutoEntityListModule,
    _hass: HomeAssistant,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.auto_entity_list.section_style', lang, 'Row Style')}
        </div>
        <div class="style-switcher">
          ${(
            [
              {
                k: 'compact' as const,
                icon: 'mdi:format-list-bulleted',
                title: localize('editor.auto_entity_list.style_compact', lang, 'Compact'),
                desc: localize(
                  'editor.auto_entity_list.style_compact_desc',
                  lang,
                  'Icon + name + state'
                ),
              },
              {
                k: 'detailed' as const,
                icon: 'mdi:format-list-text',
                title: localize('editor.auto_entity_list.style_detailed', lang, 'Detailed'),
                desc: localize(
                  'editor.auto_entity_list.style_detailed_desc',
                  lang,
                  'Two-line rows'
                ),
              },
              {
                k: 'slim' as const,
                icon: 'mdi:format-align-justify',
                title: localize('editor.auto_entity_list.style_slim', lang, 'Slim'),
                desc: localize(
                  'editor.auto_entity_list.style_slim_desc',
                  lang,
                  'Name only, dense'
                ),
              },
              {
                k: 'card' as const,
                icon: 'mdi:card-text-outline',
                title: localize('editor.auto_entity_list.style_card', lang, 'Card'),
                desc: localize(
                  'editor.auto_entity_list.style_card_desc',
                  lang,
                  'Pill rows with accent'
                ),
              },
            ] as const
          ).map(
            s => html`
              <div
                class="style-btn ${m.row_style === s.k ? 'active' : ''}"
                @click=${() => {
                  updateModule({ row_style: s.k } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }}
              >
                <ha-icon icon=${s.icon}></ha-icon>
                <div class="st-title">${s.title}</div>
                <div class="st-desc">${s.desc}</div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderDisplaySection(
    m: AutoEntityListModule,
    hass: HomeAssistant,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.auto_entity_list.section_display', lang, 'Display')}
        </div>
        ${UcFormUtils.renderFieldSection(
          localize('editor.auto_entity_list.title', lang, 'Title'),
          localize('editor.auto_entity_list.title_desc', lang, 'Header above the list.'),
          hass,
          { title: m.title || '' },
          [UcFormUtils.text('title')],
          (e: CustomEvent) => {
            updateModule({ title: e.detail.value.title } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: localize('editor.auto_entity_list.show_title', lang, 'Show title'),
            description: localize(
              'editor.auto_entity_list.show_title_desc',
              lang,
              'Display header.'
            ),
            hass,
            data: { show_title: m.show_title !== false },
            schema: [this.booleanField('show_title')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_title: e.detail.value.show_title } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.auto_entity_list.show_icon', lang, 'Show icon'),
            description: localize(
              'editor.auto_entity_list.show_icon_desc',
              lang,
              "Show each entity's icon."
            ),
            hass,
            data: { show_icon: m.show_icon !== false },
            schema: [this.booleanField('show_icon')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_icon: e.detail.value.show_icon } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize('editor.auto_entity_list.show_state', lang, 'Show state'),
            description: localize(
              'editor.auto_entity_list.show_state_desc',
              lang,
              'Show current state value.'
            ),
            hass,
            data: { show_state: m.show_state !== false },
            schema: [this.booleanField('show_state')],
            onChange: (e: CustomEvent) => {
              updateModule({ show_state: e.detail.value.show_state } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize(
              'editor.auto_entity_list.show_last_changed',
              lang,
              'Show last changed'
            ),
            description: localize(
              'editor.auto_entity_list.show_last_changed_desc',
              lang,
              'Show "2m ago" style timestamp.'
            ),
            hass,
            data: { show_last_changed: !!m.show_last_changed },
            schema: [this.booleanField('show_last_changed')],
            onChange: (e: CustomEvent) => {
              updateModule({
                show_last_changed: e.detail.value.show_last_changed,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
          {
            title: localize(
              'editor.auto_entity_list.use_entity_color',
              lang,
              'Color state with entity color'
            ),
            description: localize(
              'editor.auto_entity_list.use_entity_color_desc',
              lang,
              'When an entity exposes a color (light bulb RGB, etc.) use it for the state, icon, and card accent.'
            ),
            hass,
            data: { use_entity_color: !!m.use_entity_color },
            schema: [this.booleanField('use_entity_color')],
            onChange: (e: CustomEvent) => {
              updateModule({
                use_entity_color: e.detail.value.use_entity_color,
              } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
          },
        ])}
        ${this.renderSliderField(
          localize('editor.auto_entity_list.max_items', lang, 'Max items'),
          localize(
            'editor.auto_entity_list.max_items_desc',
            lang,
            'Maximum entities to display.'
          ),
          m.max_items ?? 50,
          50,
          5,
          200,
          1,
          (value: number) => {
            updateModule({ max_items: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderSliderField(
          localize('editor.auto_entity_list.row_gap', lang, 'Row spacing'),
          localize(
            'editor.auto_entity_list.row_gap_desc',
            lang,
            'Vertical gap between rows. Applies to every style.'
          ),
          m.row_gap ?? 6,
          6,
          0,
          32,
          1,
          (value: number) => {
            updateModule({ row_gap: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          'px'
        )}
        ${this.renderSliderField(
          localize('editor.auto_entity_list.columns', lang, 'Columns'),
          localize(
            'editor.auto_entity_list.columns_desc',
            lang,
            'Arrange rows in a grid. 1 = single column (default).'
          ),
          m.columns ?? 1,
          1,
          1,
          6,
          1,
          (value: number) => {
            updateModule({ columns: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderFieldSection(
          localize('editor.auto_entity_list.sort_by', lang, 'Sort by'),
          localize('editor.auto_entity_list.sort_by_desc', lang, 'Order of entities.'),
          hass,
          { sort_by: m.sort_by || 'name' },
          [
            this.selectField('sort_by', [
              {
                value: 'name',
                label: localize('editor.auto_entity_list.sort_name', lang, 'Name A–Z'),
              },
              {
                value: 'last_changed',
                label: localize(
                  'editor.auto_entity_list.sort_last_changed',
                  lang,
                  'Last changed'
                ),
              },
              {
                value: 'state',
                label: localize('editor.auto_entity_list.sort_state', lang, 'State (text)'),
              },
              {
                value: 'domain',
                label: localize('editor.auto_entity_list.sort_domain', lang, 'Domain'),
              },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ sort_by: e.detail.value.sort_by } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.auto_entity_list.sort_direction', lang, 'Sort direction'),
          '',
          hass,
          { sort_direction: m.sort_direction || 'asc' },
          [
            this.selectField('sort_direction', [
              {
                value: 'asc',
                label: localize('editor.auto_entity_list.sort_asc', lang, 'Ascending'),
              },
              {
                value: 'desc',
                label: localize('editor.auto_entity_list.sort_desc_dir', lang, 'Descending'),
              },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({
              sort_direction: e.detail.value.sort_direction,
            } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  private _renderFiltersSection(
    m: AutoEntityListModule,
    hass: HomeAssistant,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.auto_entity_list.section_filters', lang, 'Filters')}
        </div>
        ${this._renderChipInput(
          m,
          'include_domains',
          localize('editor.auto_entity_list.include_domains', lang, 'Domains'),
          localize(
            'editor.auto_entity_list.include_domains_desc',
            lang,
            'Only entities from these domains (e.g. light, binary_sensor). Empty = all.'
          ),
          localize(
            'editor.auto_entity_list.include_domains_ph',
            lang,
            'e.g. light, sensor'
          ),
          false,
          updateModule
        )}
        ${this._renderChipInput(
          m,
          'include_device_classes',
          localize(
            'editor.auto_entity_list.include_device_classes',
            lang,
            'Device classes'
          ),
          localize(
            'editor.auto_entity_list.include_device_classes_desc',
            lang,
            'Filter by attributes.device_class (e.g. motion, door, temperature).'
          ),
          localize(
            'editor.auto_entity_list.include_device_classes_ph',
            lang,
            'e.g. motion, door'
          ),
          false,
          updateModule
        )}

        <div style="margin-top: 16px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
            ${localize(
              'editor.auto_entity_list.state_filter',
              lang,
              'State condition (optional)'
            )}
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
            ${localize(
              'editor.auto_entity_list.state_filter_desc',
              lang,
              'Only show entities whose state matches. Leave operator empty to disable.'
            )}
          </div>
          <div class="state-filter-row">
            ${this.renderFieldSection(
              '',
              '',
              hass,
              { state_filter_operator: m.state_filter_operator || '' },
              [
                this.selectField('state_filter_operator', [
                  { value: '', label: '— None —' },
                  { value: 'equals', label: '= equals' },
                  { value: 'not_equals', label: '≠ not equals' },
                  { value: 'contains', label: '∋ contains' },
                  { value: 'greater_than', label: '> greater than' },
                  { value: 'less_than', label: '< less than' },
                ]),
              ],
              (e: CustomEvent) => {
                const op = e.detail.value.state_filter_operator;
                updateModule({
                  state_filter_operator: (op || undefined) as
                    | AutoEntityListStateOperator
                    | undefined,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )}
            ${this.renderFieldSection(
              '',
              '',
              hass,
              { state_filter_value: m.state_filter_value ?? '' },
              [UcFormUtils.text('state_filter_value')],
              (e: CustomEvent) => {
                updateModule({
                  state_filter_value: e.detail.value.state_filter_value,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )}
          </div>
        </div>

        ${this._renderChipInput(
          m,
          'include_keywords',
          localize('editor.auto_entity_list.include_keywords', lang, 'Include keywords'),
          localize(
            'editor.auto_entity_list.include_keywords_desc',
            lang,
            'Entity id must contain at least one of these substrings.'
          ),
          localize('editor.auto_entity_list.keyword_ph', lang, 'e.g. living, kitchen'),
          false,
          updateModule
        )}
        ${this._renderChipInput(
          m,
          'exclude_keywords',
          localize('editor.auto_entity_list.exclude_keywords', lang, 'Exclude keywords'),
          localize(
            'editor.auto_entity_list.exclude_keywords_desc',
            lang,
            'Entity ids containing any of these substrings are ignored.'
          ),
          localize('editor.auto_entity_list.keyword_ph', lang, 'e.g. test, backup'),
          true,
          updateModule
        )}

        <div style="margin-top: 16px;">
          ${this.renderSettingsSection('', '', [
            {
              title: localize(
                'editor.auto_entity_list.show_unavailable',
                lang,
                'Show unavailable / unknown'
              ),
              description: localize(
                'editor.auto_entity_list.show_unavailable_desc',
                lang,
                'When off, entities in unavailable or unknown states are hidden.'
              ),
              hass,
              data: { show_unavailable: !!m.show_unavailable },
              schema: [this.booleanField('show_unavailable')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_unavailable: e.detail.value.show_unavailable,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ])}
        </div>
      </div>
    `;
  }

  private _renderEntitySourceSection(
    m: AutoEntityListModule,
    hass: HomeAssistant,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.auto_entity_list.section_source', lang, 'Entity source')}
        </div>
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.auto_entity_list.pinned_entities', lang, 'Pinned entities')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
          ${localize(
            'editor.auto_entity_list.pinned_entities_desc',
            lang,
            'Always appear first, regardless of filters. Expand a row for overrides.'
          )}
        </div>
        ${(m.pinned_entities || []).map((ent, index) =>
          this._renderPinnedRow(ent, index, m, hass, updateModule, lang)
        )}
        <button
          class="add-btn full-width"
          @click=${() => {
            const entities = [...(m.pinned_entities || [])];
            const row: AutoEntityListPinnedEntity = {
              id: this.generateId('ael_pin'),
              entity: '',
            };
            entities.push(row);
            updateModule({ pinned_entities: entities } as Partial<CardModule>);
            this._expandedEntities.add(row.id);
            this.triggerPreviewUpdate();
          }}
        >
          <ha-icon icon="mdi:pin"></ha-icon>
          ${localize('editor.auto_entity_list.pin_entity', lang, 'Pin entity')}
        </button>
        ${this._renderHiddenChips(m, updateModule, lang)}
      </div>
    `;
  }

  private _renderColorsSection(
    m: AutoEntityListModule,
    hass: HomeAssistant,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.auto_entity_list.section_colors', lang, 'Colors')}
        </div>
        ${(
          [
            ['text_color', 'editor.auto_entity_list.color_text', 'Text', 'var(--primary-text-color)'],
            [
              'secondary_text_color',
              'editor.auto_entity_list.color_secondary',
              'Secondary text',
              'var(--secondary-text-color)',
            ],
            [
              'card_background_color',
              'editor.auto_entity_list.color_card_bg',
              'Card background',
              'var(--card-background-color)',
            ],
            ['accent_color', 'editor.auto_entity_list.color_accent', 'Accent / Icon', 'var(--primary-color)'],
            ['active_color', 'editor.auto_entity_list.color_active', 'Active state', 'var(--success-color)'],
            ['inactive_color', 'editor.auto_entity_list.color_inactive', 'Inactive state', 'var(--secondary-text-color)'],
          ] as const
        ).map(
          ([key, locKey, fb, def]) => html`
            <div style="margin-bottom: 16px;">
              <ultra-color-picker
                .label=${localize(locKey, lang, fb)}
                .value=${(m as unknown as Record<string, string | undefined>)[key] || ''}
                .defaultValue=${def}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ [key]: e.detail.value } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }}
              ></ultra-color-picker>
            </div>
          `
        )}
      </div>
    `;
  }

  // -- generic chip input for include_domains, include_device_classes, include_keywords, exclude_keywords --
  private _renderChipInput(
    m: AutoEntityListModule,
    key:
      | 'include_domains'
      | 'include_device_classes'
      | 'include_keywords'
      | 'exclude_keywords',
    title: string,
    desc: string,
    placeholder: string,
    isExclude: boolean,
    updateModule: (u: Partial<CardModule>) => void
  ): TemplateResult {
    const values = (m[key] as string[] | undefined) || [];
    return html`
      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${title}</div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
          ${desc}
        </div>
        <div class="domain-chips">
          ${values.map(
            v => html`
              <span class="domain-chip ${isExclude ? 'exclude' : ''}">
                ${v}
                <ha-icon
                  icon="mdi:close"
                  class="chip-remove"
                  @click=${() => {
                    updateModule({
                      [key]: values.filter(x => x !== v),
                    } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                ></ha-icon>
              </span>
            `
          )}
        </div>
        <div class="domain-input-row">
          <input
            type="text"
            class="domain-input"
            placeholder=${placeholder}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const val = input.value.trim().toLowerCase();
                if (val && !values.includes(val)) {
                  updateModule({ [key]: [...values, val] } as Partial<CardModule>);
                  input.value = '';
                  this.triggerPreviewUpdate();
                }
              }
            }}
          />
          <button
            class="add-btn"
            @click=${(e: Event) => {
              const row = (e.target as HTMLElement).closest('.domain-input-row');
              const input = row?.querySelector('input') as HTMLInputElement;
              const val = input?.value.trim().toLowerCase();
              if (val && !values.includes(val)) {
                updateModule({ [key]: [...values, val] } as Partial<CardModule>);
                input.value = '';
                this.triggerPreviewUpdate();
              }
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _renderHiddenChips(
    m: AutoEntityListModule,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div style="margin-top: 24px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.auto_entity_list.hidden_entities', lang, 'Hidden entities')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
          ${localize(
            'editor.auto_entity_list.hidden_entities_desc',
            lang,
            'Removed from the auto list; click × to show again.'
          )}
        </div>
        <div class="domain-chips">
          ${(m.hidden_entities || []).map(
            id => html`
              <span class="domain-chip">
                ${id}
                <ha-icon
                  icon="mdi:close"
                  class="chip-remove"
                  @click=${() => {
                    updateModule({
                      hidden_entities: (m.hidden_entities || []).filter(x => x !== id),
                    } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                ></ha-icon>
              </span>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderPinnedRow(
    entity: AutoEntityListPinnedEntity,
    index: number,
    m: AutoEntityListModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const isExpanded = this._expandedEntities.has(entity.id);
    return html`
      <div class="entity-row">
        <div class="entity-info ${!entity.entity ? 'empty' : ''}">
          ${entity.entity ||
          localize('editor.auto_entity_list.no_entity', lang, 'No entity selected')}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${isExpanded ? 'expanded' : ''}"
          @click=${() => {
            if (this._expandedEntities.has(entity.id)) this._expandedEntities.delete(entity.id);
            else this._expandedEntities.add(entity.id);
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${() => {
            const entities = [...(m.pinned_entities || [])];
            entities.splice(index, 1);
            this._expandedEntities.delete(entity.id);
            updateModule({ pinned_entities: entities } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
      </div>
      ${isExpanded
        ? html`
            <div class="entity-settings">
              ${UcFormUtils.renderFieldSection(
                localize('editor.auto_entity_list.entity', lang, 'Entity'),
                localize('editor.auto_entity_list.entity_desc', lang, 'Entity to pin to the top.'),
                hass,
                { entity: entity.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => {
                  const entities = [...(m.pinned_entities || [])];
                  entities[index] = { ...entities[index], entity: e.detail.value.entity };
                  updateModule({ pinned_entities: entities } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )}
              ${UcFormUtils.renderFieldSection(
                localize('editor.auto_entity_list.label_override', lang, 'Label override'),
                '',
                hass,
                { label: entity.label || '' },
                [UcFormUtils.text('label')],
                (e: CustomEvent) => {
                  const entities = [...(m.pinned_entities || [])];
                  entities[index] = { ...entities[index], label: e.detail.value.label };
                  updateModule({ pinned_entities: entities } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )}
              ${UcFormUtils.renderFieldSection(
                localize('editor.auto_entity_list.icon_override', lang, 'Icon override'),
                '',
                hass,
                { icon: entity.icon || '' },
                [UcFormUtils.icon('icon')],
                (e: CustomEvent) => {
                  const entities = [...(m.pinned_entities || [])];
                  entities[index] = { ...entities[index], icon: e.detail.value.icon };
                  updateModule({ pinned_entities: entities } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )}
              <div style="margin-bottom: 16px;">
                <ultra-color-picker
                  .label=${localize(
                    'editor.auto_entity_list.row_color',
                    lang,
                    'Row color override'
                  )}
                  .value=${entity.color || ''}
                  .defaultValue=${''}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    const entities = [...(m.pinned_entities || [])];
                    entities[index] = { ...entities[index], color: e.detail.value };
                    updateModule({ pinned_entities: entities } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          `
        : ''}
    `;
  }

  // =============================================
  // PREVIEW RENDERING
  // =============================================

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as AutoEntityListModule;
    const lang = hass?.locale?.language || 'en';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    if (!hass?.states) {
      return this.renderGradientErrorState(
        localize('editor.auto_entity_list.err_ha', lang, 'Waiting for Home Assistant'),
        localize(
          'editor.auto_entity_list.err_ha_desc',
          lang,
          'Connecting to entity states…'
        ),
        'mdi:loading'
      );
    }

    const rows = this._collectEntities(m, hass);
    if (rows.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.auto_entity_list.err_empty', lang, 'No entities match'),
        localize(
          'editor.auto_entity_list.err_empty_desc',
          lang,
          'Adjust the filters in the General tab or pin some entities.'
        ),
        'mdi:format-list-bulleted-type'
      );
    }

    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';
    const accent = m.accent_color || 'var(--primary-color)';
    const active = m.active_color || 'var(--success-color)';
    const inactive = m.inactive_color || 'var(--secondary-text-color)';

    const opts: RenderOpts = {
      text,
      secondary,
      cardBg,
      accent,
      active,
      inactive,
      lang,
      showDel: previewContext === 'live',
      useEntityColor: !!m.use_entity_color,
      cardHeight: m.card_height ?? 0,
      cardWidth: m.card_width ?? 0,
      rowGap: Math.max(0, m.row_gap ?? 6),
      columns: Math.max(1, Math.min(6, m.columns ?? 1)),
    };

    const content =
      m.row_style === 'detailed'
        ? this._renderDetailed(m, rows, hass, config, opts)
        : m.row_style === 'slim'
          ? this._renderSlim(m, rows, hass, config, opts)
          : m.row_style === 'card'
            ? this._renderCard(m, rows, hass, config, opts)
            : this._renderCompact(m, rows, hass, config, opts);

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="ael-root ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false
              ? html`<div
                  class="ael-title"
                  style="color:${text};font-weight:700;margin-bottom:10px;"
                >
                  ${m.title ||
                  localize(
                    'editor.auto_entity_list.default_title',
                    lang,
                    'Auto Entities List'
                  )}
                </div>`
              : nothing}
            ${content}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  // =============================================
  // STYLE RENDERERS
  // =============================================

  private _renderCompact(
    m: AutoEntityListModule,
    rows: EntityRow[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: RenderOpts
  ): TemplateResult {
    return html`
      <div style="${this._wrapperStyle(o)}">
        ${rows.map(r => {
          const g = this._rowGestures(m, r, hass, config, 'compact');
          const stateCol = this._stateColor(r, o);
          return html`
            <div
              class="uc-ael-row"
              style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:${o.cardBg};border:1px solid var(--divider-color);"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              ${m.show_icon !== false
                ? html`<ha-icon
                    icon=${r.icon}
                    style="color:${this._iconColor(r, o)};--mdc-icon-size:22px;flex-shrink:0;"
                  ></ha-icon>`
                : nothing}
              <div
                style="flex:1;min-width:0;color:${o.text};font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
              >
                ${r.name}
              </div>
              ${m.show_state !== false
                ? html`<div
                    style="color:${stateCol};font-size:13px;flex-shrink:0;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                  >
                    ${r.state}
                  </div>`
                : nothing}
              ${m.show_last_changed
                ? html`<div style="color:${o.secondary};font-size:11px;flex-shrink:0;">
                    ${this._relativeTime(r.lastChanged)}
                  </div>`
                : nothing}
              ${this._renderRemove(m, r, o.showDel, o.lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderDetailed(
    m: AutoEntityListModule,
    rows: EntityRow[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: RenderOpts
  ): TemplateResult {
    return html`
      <div style="${this._wrapperStyle(o)}">
        ${rows.map(r => {
          const g = this._rowGestures(m, r, hass, config, 'detailed');
          const stateCol = this._stateColor(r, o);
          return html`
            <div
              class="uc-ael-row"
              style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;background:${o.cardBg};border:1px solid var(--divider-color);"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              ${m.show_icon !== false
                ? html`<ha-icon
                    icon=${r.icon}
                    style="color:${this._iconColor(r, o)};--mdc-icon-size:30px;flex-shrink:0;"
                  ></ha-icon>`
                : nothing}
              <div style="flex:1;min-width:0;">
                <div
                  style="color:${o.text};font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                >
                  ${r.name}
                </div>
                <div
                  style="margin-top:2px;color:${o.secondary};font-size:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;"
                >
                  ${m.show_state !== false
                    ? html`<span style="color:${stateCol};font-weight:600;">${r.state}</span>`
                    : nothing}
                  ${m.show_last_changed
                    ? html`<span>· ${this._relativeTime(r.lastChanged)}</span>`
                    : nothing}
                  <span style="opacity:0.6;">· ${r.entityId}</span>
                </div>
              </div>
              ${this._renderRemove(m, r, o.showDel, o.lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderSlim(
    m: AutoEntityListModule,
    rows: EntityRow[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: RenderOpts
  ): TemplateResult {
    // Dividers only make sense in a single-column dense list with no gap;
    // in a grid layout or with whitespace separation we drop them.
    const useDivider = o.rowGap === 0 && o.columns === 1;
    return html`
      <div style="${this._wrapperStyle(o)}">
        ${rows.map((r, idx) => {
          const g = this._rowGestures(m, r, hass, config, 'slim');
          const stateCol = this._stateColor(r, o);
          const isLast = idx === rows.length - 1;
          return html`
            <div
              class="uc-ael-row"
              style="display:flex;align-items:center;gap:8px;padding:6px 8px;${useDivider && !isLast
                ? 'border-bottom:1px solid var(--divider-color);'
                : ''}"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              <div
                style="flex:1;min-width:0;color:${o.text};font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
              >
                ${r.name}
              </div>
              ${m.show_state !== false
                ? html`<div style="color:${stateCol};font-size:12px;flex-shrink:0;">
                    ${r.state}
                  </div>`
                : nothing}
              ${this._renderRemove(m, r, o.showDel, o.lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCard(
    m: AutoEntityListModule,
    rows: EntityRow[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: RenderOpts
  ): TemplateResult {
    // Card-width centering only matters for the single-column layout. In a
    // multi-column grid each cell already constrains the card's width.
    const wrapperAlign: 'stretch' | 'center' =
      o.columns === 1 && o.cardWidth > 0 ? 'center' : 'stretch';
    return html`
      <div style="${this._wrapperStyle(o, wrapperAlign)}">
        ${rows.map(r => {
          const g = this._rowGestures(m, r, hass, config, 'card');
          const stateCol = this._stateColor(r, o);
          const accent = r.pinnedColor || stateCol;
          const sizeStyle =
            (o.cardHeight > 0 ? `min-height:${o.cardHeight}px;` : '') +
            (o.cardWidth > 0
              ? `width:100%;max-width:${o.cardWidth}px;`
              : 'width:100%;');
          return html`
            <div
              class="uc-ael-row"
              style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:24px;background:${o.cardBg};border-left:4px solid ${accent};box-shadow:0 1px 2px rgba(0,0,0,0.05);box-sizing:border-box;${sizeStyle}"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              ${m.show_icon !== false
                ? html`<ha-icon
                    icon=${r.icon}
                    style="color:${accent};--mdc-icon-size:24px;flex-shrink:0;"
                  ></ha-icon>`
                : nothing}
              <div style="flex:1;min-width:0;">
                <div
                  style="color:${o.text};font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
                >
                  ${r.name}
                </div>
                ${m.show_last_changed
                  ? html`<div style="color:${o.secondary};font-size:11px;margin-top:2px;">
                      ${this._relativeTime(r.lastChanged)}
                    </div>`
                  : nothing}
              </div>
              ${m.show_state !== false
                ? html`<div
                    style="color:${stateCol};font-weight:700;font-size:14px;flex-shrink:0;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
                  >
                    ${r.state}
                  </div>`
                : nothing}
              ${this._renderRemove(m, r, o.showDel, o.lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  // =============================================
  // HELPERS
  // =============================================

  /**
   * Wrapper style for the row container.
   *  - columns === 1 → simple flex column (legacy / single-list behavior)
   *  - columns >= 2  → CSS grid with N equal columns
   */
  private _wrapperStyle(o: RenderOpts, align: 'stretch' | 'center' = 'stretch'): string {
    if (o.columns > 1) {
      const justify = align === 'center' ? 'justify-items:center;' : '';
      return `display:grid;grid-template-columns:repeat(${o.columns},minmax(0,1fr));gap:${o.rowGap}px;${justify}`;
    }
    return `display:flex;flex-direction:column;gap:${o.rowGap}px;align-items:${align === 'center' ? 'center' : 'stretch'};`;
  }

  private _rowGestures(
    m: AutoEntityListModule,
    r: EntityRow,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    suffix: string
  ) {
    return this.createGestureHandlers(
      `${m.id}-${r.entityId}-${suffix}`,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: r.entityId }
          : { action: 'more-info', entity: r.entityId },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: r.entityId,
        module: m,
      },
      hass,
      config,
      ['.uc-ael-remove']
    );
  }

  private _renderRemove(
    m: AutoEntityListModule,
    r: EntityRow,
    show: boolean,
    lang: string
  ): TemplateResult {
    if (!show) return html``;
    return html`
      <ha-icon
        class="uc-ael-remove"
        icon="mdi:close"
        title=${localize('editor.auto_entity_list.preview_remove', lang, 'Remove from list')}
        @click=${(ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (r.pinned) {
            window.dispatchEvent(
              new CustomEvent(PATCH_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                  moduleId: m.id,
                  updates: {
                    pinned_entities: (m.pinned_entities || []).filter(
                      e => e.entity !== r.entityId
                    ),
                  },
                },
              })
            );
          } else {
            const hidden = [...(m.hidden_entities || [])];
            if (!hidden.includes(r.entityId)) hidden.push(r.entityId);
            window.dispatchEvent(
              new CustomEvent(PATCH_EVENT, {
                bubbles: true,
                composed: true,
                detail: { moduleId: m.id, updates: { hidden_entities: hidden } },
              })
            );
          }
          this.triggerPreviewUpdate(true);
        }}
      ></ha-icon>
    `;
  }

  private _stateColor(r: EntityRow, o: RenderOpts): string {
    const s = r.state.toLowerCase();
    if (s.startsWith('unavailable') || s.startsWith('unknown')) return o.inactive;
    if (o.useEntityColor && r.entityColor) return r.entityColor;
    return r.isActive ? o.active : o.secondary;
  }

  private _iconColor(r: EntityRow, o: RenderOpts): string {
    if (r.pinnedColor) return r.pinnedColor;
    if (o.useEntityColor && r.entityColor) return r.entityColor;
    return o.accent;
  }

  private _makeRow(
    entityId: string,
    st: HomeAssistant['states'][string],
    pin: AutoEntityListPinnedEntity | undefined
  ): EntityRow {
    const attrs = (st.attributes || {}) as Record<string, unknown>;
    const friendly = (attrs.friendly_name as string) || entityId;
    const icon =
      pin?.icon ||
      (attrs.icon as string) ||
      this._domainIcon(entityId.split('.')[0] || '');
    const stateStr = String(st.state ?? '');
    const lastChanged = st.last_changed ? new Date(st.last_changed) : new Date();
    return {
      entityId,
      name: pin?.label || friendly,
      icon,
      state: this._formatState(stateStr, attrs),
      domain: entityId.split('.')[0] || '',
      deviceClass: String(attrs.device_class || ''),
      lastChanged,
      isActive: this._isActiveState(stateStr),
      pinned: !!pin,
      pinnedColor: pin?.color,
      entityColor: this._extractEntityColor(st),
    };
  }

  /**
   * Best-effort entity color: rgb_color (lights), hs_color, color_name, color attribute.
   * Returns undefined when the entity is off / has no color set.
   */
  private _extractEntityColor(
    st: HomeAssistant['states'][string]
  ): string | undefined {
    const attrs = (st.attributes || {}) as Record<string, unknown>;
    const state = String(st.state ?? '').toLowerCase();
    // Color is only meaningful when the entity is "doing" something
    if (
      state === 'off' ||
      state === 'unavailable' ||
      state === 'unknown' ||
      state === 'idle' ||
      state === 'standby' ||
      state === ''
    ) {
      return undefined;
    }

    const rgb = attrs.rgb_color;
    if (Array.isArray(rgb) && rgb.length === 3) {
      const [r, g, b] = rgb.map(n => Math.max(0, Math.min(255, Math.round(Number(n) || 0))));
      return `rgb(${r}, ${g}, ${b})`;
    }
    const hs = attrs.hs_color;
    if (Array.isArray(hs) && hs.length === 2) {
      const h = Number(hs[0]) || 0;
      const s = Number(hs[1]) || 0;
      return `hsl(${h}, ${s}%, 50%)`;
    }
    const colorName = attrs.color_name;
    if (typeof colorName === 'string' && colorName.trim()) return colorName.trim();
    const color = attrs.color;
    if (typeof color === 'string' && color.trim()) return color.trim();
    return undefined;
  }

  private _formatState(state: string, attrs: Record<string, unknown>): string {
    const unit = attrs.unit_of_measurement as string | undefined;
    if (unit && state && state !== 'unavailable' && state !== 'unknown') {
      return `${state} ${unit}`;
    }
    return state;
  }

  private _isActiveState(state: string): boolean {
    const s = state.toLowerCase();
    return [
      'on',
      'open',
      'opened',
      'active',
      'triggered',
      'home',
      'playing',
      'unlocked',
      'detected',
      'heat',
      'cool',
      'heat_cool',
      'auto',
      'fan_only',
    ].includes(s);
  }

  private _matchesStateFilter(
    state: string,
    operator: AutoEntityListStateOperator,
    value: string
  ): boolean {
    if (value === undefined || value === null) return true;
    const v = String(value).trim();
    if (v === '') return true;
    if (operator === 'equals') return state === v;
    if (operator === 'not_equals') return state !== v;
    if (operator === 'contains') return state.toLowerCase().includes(v.toLowerCase());
    if (operator === 'greater_than') {
      const a = parseFloat(state);
      const b = parseFloat(v);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      return a > b;
    }
    if (operator === 'less_than') {
      const a = parseFloat(state);
      const b = parseFloat(v);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      return a < b;
    }
    return true;
  }

  private _domainIcon(domain: string): string {
    const icons: Record<string, string> = {
      light: 'mdi:lightbulb',
      switch: 'mdi:light-switch',
      binary_sensor: 'mdi:radiobox-marked',
      sensor: 'mdi:eye',
      climate: 'mdi:thermostat',
      cover: 'mdi:window-shutter',
      fan: 'mdi:fan',
      lock: 'mdi:lock',
      media_player: 'mdi:cast',
      person: 'mdi:account',
      device_tracker: 'mdi:map-marker',
      automation: 'mdi:robot',
      scene: 'mdi:palette',
      script: 'mdi:script-text',
      input_boolean: 'mdi:toggle-switch',
      input_number: 'mdi:ray-vertex',
      input_select: 'mdi:form-dropdown',
      camera: 'mdi:camera',
      vacuum: 'mdi:robot-vacuum',
      alarm_control_panel: 'mdi:shield-home',
      update: 'mdi:package-up',
      timer: 'mdi:timer',
      weather: 'mdi:weather-partly-cloudy',
      sun: 'mdi:white-balance-sunny',
    };
    return icons[domain] || 'mdi:circle-outline';
  }

  private _relativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // =============================================
  // DISCOVERY
  // =============================================

  private _collectEntities(m: AutoEntityListModule, hass: HomeAssistant): EntityRow[] {
    const hidden = new Set((m.hidden_entities || []).filter(Boolean));
    const pinnedIds = new Set((m.pinned_entities || []).map(p => p.entity).filter(Boolean));
    const includeDomains = (m.include_domains || []).map(s => s.toLowerCase());
    const includeDC = (m.include_device_classes || []).map(s => s.toLowerCase());
    const includeKw = (m.include_keywords || []).map(s => s.toLowerCase());
    const excludeKw = (m.exclude_keywords || []).map(s => s.toLowerCase());

    const passes = (id: string, st: HomeAssistant['states'][string]): boolean => {
      if (hidden.has(id)) return false;
      const lowerId = id.toLowerCase();
      const domain = id.split('.')[0] || '';
      const dc = String(st.attributes?.device_class || '').toLowerCase();

      if (includeDomains.length && !includeDomains.includes(domain)) return false;
      if (includeDC.length && !includeDC.includes(dc)) return false;

      if (includeKw.length && !includeKw.some(k => lowerId.includes(k))) return false;
      if (excludeKw.length && excludeKw.some(k => lowerId.includes(k))) return false;

      if (!m.show_unavailable) {
        const s = String(st.state || '').toLowerCase();
        if (s === 'unavailable' || s === 'unknown' || s === '') return false;
      }

      if (m.state_filter_operator && m.state_filter_value !== undefined) {
        if (!this._matchesStateFilter(String(st.state ?? ''), m.state_filter_operator, m.state_filter_value)) {
          return false;
        }
      }

      return true;
    };

    // Auto-discovered (excluding pinned which are merged in next)
    const autoRows: EntityRow[] = [];
    for (const [id, st] of Object.entries(hass.states)) {
      if (pinnedIds.has(id)) continue;
      if (!passes(id, st)) continue;
      autoRows.push(this._makeRow(id, st, undefined));
    }

    // Pinned entities (always shown if they exist in hass.states)
    const pinnedRows: EntityRow[] = (m.pinned_entities || [])
      .filter(p => p.entity && hass.states[p.entity])
      .map(p => this._makeRow(p.entity, hass.states[p.entity]!, p));

    // Sort the auto rows; pinned rows always come first in their declared order
    const sorted = this._sort(autoRows, m.sort_by || 'name', m.sort_direction || 'asc');

    const out = [...pinnedRows, ...sorted];
    return out.slice(0, m.max_items ?? 50);
  }

  private _sort(
    rows: EntityRow[],
    by: AutoEntityListModule['sort_by'],
    dir: AutoEntityListModule['sort_direction']
  ): EntityRow[] {
    const copy = [...rows];
    const factor = dir === 'desc' ? -1 : 1;
    copy.sort((a, b) => {
      let cmp = 0;
      if (by === 'last_changed') {
        cmp = a.lastChanged.getTime() - b.lastChanged.getTime();
      } else if (by === 'state') {
        cmp = a.state.localeCompare(b.state, undefined, { sensitivity: 'base' });
      } else if (by === 'domain') {
        cmp =
          a.domain.localeCompare(b.domain) ||
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else {
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      return cmp * factor;
    });
    return copy;
  }
}

interface RenderOpts {
  text: string;
  secondary: string;
  cardBg: string;
  accent: string;
  active: string;
  inactive: string;
  lang: string;
  showDel: boolean;
  useEntityColor: boolean;
  cardHeight: number;
  cardWidth: number;
  rowGap: number;
  columns: number;
}
