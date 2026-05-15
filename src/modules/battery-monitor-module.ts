import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  BatteryMonitorModule,
  BatteryMonitorEntity,
  UltraCardConfig,
} from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

interface BatteryReading {
  entityId: string;
  name: string;
  icon: string;
  value: number;
  charging: boolean;
  manual?: BatteryMonitorEntity | undefined;
}

const PATCH_EVENT = 'uc-module-patch-by-id';

export class UltraBatteryMonitorModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'battery_monitor',
    title: 'Battery Monitor',
    description:
      'Auto-discover battery sensors and highlight low / critical devices with 5 visual styles',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:battery-alert',
    category: 'data',
    tags: ['battery', 'monitor', 'low', 'critical', 'devices', 'health', 'auto'],
  };

  private _expandedEntities: Set<string> = new Set();

  createDefault(id?: string): BatteryMonitorModule {
    return {
      id: id || this.generateId('battery_monitor'),
      type: 'battery_monitor',
      discovery_mode: 'auto',
      entities: [],
      exclude_patterns: [],
      hidden_entities: [],
      include_battery_level_attribute: true,
      include_binary_sensors: false,
      style: 'list',
      title: 'Battery Monitor',
      show_title: true,
      max_items: 25,
      show_charging_indicator: true,
      show_percentage_value: true,
      show_item_border: true,
      sort_direction: 'lowest_first',
      critical_threshold: 10,
      low_threshold: 25,
      show_only_below_threshold: false,
      critical_color: '',
      low_color: '',
      ok_color: '',
      charging_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const base = super.validate(module);
    const m = module as BatteryMonitorModule;
    const errors = [...base.errors];
    if (m.discovery_mode === 'manual' && (!m.entities || m.entities.length === 0)) {
      errors.push(
        localize(
          'editor.battery_monitor.error_manual_empty',
          'en',
          'Add at least one entity, or switch discovery to Auto or Both.'
        )
      );
    }
    return { valid: errors.length === 0, errors };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as BatteryMonitorModule, hass, updates =>
      updateModule(updates)
    );
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as BatteryMonitorModule, hass, updates =>
      updateModule(updates)
    );
  }

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      .bm-style-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }
      .bm-strip {
        display: flex;
        height: 28px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--divider-color);
      }
      .bm-strip-seg {
        flex: 1;
        min-width: 4px;
        cursor: pointer;
        position: relative;
        transition: opacity 0.15s ease;
      }
      .bm-strip-seg .uc-bm-remove {
        position: absolute;
        top: 2px;
        right: 2px;
        margin: 0;
        padding: 0;
        z-index: 1;
      }
      .bm-strip-seg:hover {
        opacity: 0.85;
        filter: brightness(1.08);
      }
      .uc-bm-remove {
        flex-shrink: 0;
        cursor: pointer;
        color: var(--error-color);
        --mdc-icon-size: 18px;
        padding: 4px;
        margin-left: 4px;
      }
    `;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as BatteryMonitorModule;
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
      </style>

      <div class="module-settings">
        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.battery_monitor.section_style', lang, 'Style')}
          </div>
          ${this.renderSegmentedField(
            '',
            '',
            m.style || 'list',
            [
              {
                value: 'list',
                label: localize('editor.battery_monitor.style_list', lang, 'List'),
                icon: 'mdi:format-list-bulleted',
              },
              {
                value: 'bars',
                label: localize('editor.battery_monitor.style_bars', lang, 'Bars'),
                icon: 'mdi:chart-bar',
              },
              {
                value: 'cards',
                label: localize('editor.battery_monitor.style_cards', lang, 'Cards'),
                icon: 'mdi:view-grid',
              },
              {
                value: 'rings',
                label: localize('editor.battery_monitor.style_rings', lang, 'Rings'),
                icon: 'mdi:circle-outline',
              },
              {
                value: 'strip',
                label: localize('editor.battery_monitor.style_strip', lang, 'Strip'),
                icon: 'mdi:palette-swatch-horizontal',
              },
            ],
            next => {
              updateModule({ style: next as 'list' | 'bars' | 'cards' | 'rings' | 'strip' } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.battery_monitor.section_display', lang, 'Display')}
          </div>
          ${UcFormUtils.renderFieldSection(
            localize('editor.battery_monitor.title', lang, 'Title'),
            localize('editor.battery_monitor.title_desc', lang, 'Header above the list.'),
            hass,
            { title: m.title || 'Battery Monitor' },
            [UcFormUtils.text('title')],
            (e: CustomEvent) => {
              updateModule({ title: e.detail.value.title } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )}
          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.battery_monitor.show_title', lang, 'Show title'),
              description: localize('editor.battery_monitor.show_title_desc', lang, 'Display header.'),
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value.show_title } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.battery_monitor.show_charging', lang, 'Show charging indicator'),
              description: localize(
                'editor.battery_monitor.show_charging_desc',
                lang,
                'When a charging binary_sensor is found.'
              ),
              hass,
              data: { show_charging_indicator: m.show_charging_indicator !== false },
              schema: [this.booleanField('show_charging_indicator')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_charging_indicator: e.detail.value.show_charging_indicator,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.battery_monitor.show_pct', lang, 'Show percentage'),
              description: localize(
                'editor.battery_monitor.show_pct_desc',
                lang,
                'Show numeric % next to each device.'
              ),
              hass,
              data: { show_percentage_value: m.show_percentage_value !== false },
              schema: [this.booleanField('show_percentage_value')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_percentage_value: e.detail.value.show_percentage_value,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.battery_monitor.show_item_border', lang, 'Show item border'),
              description: localize(
                'editor.battery_monitor.show_item_border_desc',
                lang,
                'Draw a 1px border around each device tile. Turn off for a borderless look.'
              ),
              hass,
              data: { show_item_border: m.show_item_border !== false },
              schema: [this.booleanField('show_item_border')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_item_border: e.detail.value.show_item_border,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ])}
          ${this.renderSliderField(
            localize('editor.battery_monitor.max_items', lang, 'Max items'),
            localize('editor.battery_monitor.max_items_desc', lang, 'Maximum devices to show.'),
            m.max_items ?? 25,
            25,
            5,
            100,
            1,
            (value: number) => {
              updateModule({ max_items: value } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
            ''
          )}
          ${this.renderFieldSection(
            localize('editor.battery_monitor.sort', lang, 'Sort'),
            localize('editor.battery_monitor.sort_desc', lang, 'Order of devices.'),
            hass,
            { sort_direction: m.sort_direction || 'lowest_first' },
            [
              this.selectField('sort_direction', [
                { value: 'lowest_first', label: localize('editor.battery_monitor.sort_low', lang, 'Lowest first') },
                { value: 'highest_first', label: localize('editor.battery_monitor.sort_high', lang, 'Highest first') },
                { value: 'name', label: localize('editor.battery_monitor.sort_name', lang, 'Name A–Z') },
                { value: 'unchanged', label: localize('editor.battery_monitor.sort_raw', lang, 'Unchanged') },
              ]),
            ],
            (e: CustomEvent) => {
              updateModule({ sort_direction: e.detail.value.sort_direction } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.battery_monitor.section_thresholds', lang, 'Thresholds')}
          </div>
          ${this.renderSliderField(
            localize('editor.battery_monitor.critical', lang, 'Critical threshold'),
            localize('editor.battery_monitor.critical_desc', lang, 'At or below this % uses critical color.'),
            m.critical_threshold ?? 10,
            10,
            0,
            50,
            1,
            (value: number) => {
              updateModule({ critical_threshold: value } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
            '%'
          )}
          ${this.renderSliderField(
            localize('editor.battery_monitor.low', lang, 'Low threshold'),
            localize('editor.battery_monitor.low_desc', lang, 'At or below this % uses low color (above critical).'),
            m.low_threshold ?? 25,
            25,
            0,
            100,
            1,
            (value: number) => {
              updateModule({ low_threshold: value } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            },
            '%'
          )}
          ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.battery_monitor.only_low', lang, 'Show only below low threshold'),
              description: localize(
                'editor.battery_monitor.only_low_desc',
                lang,
                'Hide devices above the low threshold.'
              ),
              hass,
              data: { show_only_below_threshold: !!m.show_only_below_threshold },
              schema: [this.booleanField('show_only_below_threshold')],
              onChange: (e: CustomEvent) => {
                updateModule({
                  show_only_below_threshold: e.detail.value.show_only_below_threshold,
                } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ])}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.battery_monitor.section_source', lang, 'Entity source')}
          </div>
          ${this.renderFieldSection(
            localize('editor.battery_monitor.discovery_mode', lang, 'Discovery mode'),
            localize(
              'editor.battery_monitor.discovery_mode_desc',
              lang,
              'Auto scans Home Assistant; manual uses the list below; both merges them.'
            ),
            hass,
            { discovery_mode: m.discovery_mode || 'auto' },
            [
              this.selectField('discovery_mode', [
                { value: 'auto', label: localize('editor.battery_monitor.mode_auto', lang, 'Auto') },
                { value: 'manual', label: localize('editor.battery_monitor.mode_manual', lang, 'Manual') },
                { value: 'both', label: localize('editor.battery_monitor.mode_both', lang, 'Both') },
              ]),
            ],
            (e: CustomEvent) => {
              updateModule({ discovery_mode: e.detail.value.discovery_mode } as Partial<CardModule>);
              this.triggerPreviewUpdate();
            }
          )}
          ${m.discovery_mode !== 'manual'
            ? this.renderSettingsSection('', '', [
                {
                  title: localize(
                    'editor.battery_monitor.include_bl_attr',
                    lang,
                    'Include battery_level attribute'
                  ),
                  description: localize(
                    'editor.battery_monitor.include_bl_attr_desc',
                    lang,
                    'Vacuums, trackers, phones, etc.'
                  ),
                  hass,
                  data: { include_battery_level_attribute: m.include_battery_level_attribute !== false },
                  schema: [this.booleanField('include_battery_level_attribute')],
                  onChange: (e: CustomEvent) => {
                    updateModule({
                      include_battery_level_attribute:
                        e.detail.value.include_battery_level_attribute,
                    } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                },
                {
                  title: localize(
                    'editor.battery_monitor.include_bin',
                    lang,
                    'Include binary_sensor battery'
                  ),
                  description: localize(
                    'editor.battery_monitor.include_bin_desc',
                    lang,
                    'Maps on=low / off=ok for device_class battery.'
                  ),
                  hass,
                  data: { include_binary_sensors: !!m.include_binary_sensors },
                  schema: [this.booleanField('include_binary_sensors')],
                  onChange: (e: CustomEvent) => {
                    updateModule({
                      include_binary_sensors: e.detail.value.include_binary_sensors,
                    } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  },
                },
              ])
            : nothing}
          ${m.discovery_mode !== 'manual' ? this._renderPatternChips(m, updateModule, lang) : nothing}
          ${m.discovery_mode !== 'manual' ? this._renderHiddenChips(m, updateModule, lang) : nothing}

          ${m.discovery_mode !== 'auto'
            ? html`
                <div style="margin-top: 16px; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                  ${localize('editor.battery_monitor.manual_entities', lang, 'Manual entities')}
                </div>
                <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
                  ${localize(
                    'editor.battery_monitor.manual_entities_desc',
                    lang,
                    'Pick entities to include. Expand a row for overrides.'
                  )}
                </div>
                ${(m.entities || []).map((ent, index) =>
                  this._renderEntityRow(ent, index, m, hass, updateModule, lang)
                )}
                <button
                  class="add-btn full-width"
                  @click=${() => {
                    const entities = [...(m.entities || [])];
                    const row: BatteryMonitorEntity = {
                      id: this.generateId('bm_ent'),
                      entity: '',
                    };
                    entities.push(row);
                    updateModule({ entities } as Partial<CardModule>);
                    this._expandedEntities.add(row.id);
                    this.triggerPreviewUpdate();
                  }}
                >
                  <ha-icon icon="mdi:plus"></ha-icon>
                  ${localize('editor.battery_monitor.add_entity', lang, 'Add entity')}
                </button>
              `
            : nothing}
        </div>

        <div class="settings-section">
          <div class="section-title">
            ${localize('editor.battery_monitor.section_colors', lang, 'Colors')}
          </div>
          ${(
            [
              ['critical_color', 'editor.battery_monitor.color_critical', 'Critical', 'var(--error-color)'],
              ['low_color', 'editor.battery_monitor.color_low', 'Low', 'var(--warning-color)'],
              ['ok_color', 'editor.battery_monitor.color_ok', 'OK', 'var(--success-color)'],
              ['charging_color', 'editor.battery_monitor.color_charging', 'Charging', 'var(--info-color)'],
              ['text_color', 'editor.battery_monitor.color_text', 'Text', 'var(--primary-text-color)'],
              [
                'secondary_text_color',
                'editor.battery_monitor.color_secondary',
                'Secondary text',
                'var(--secondary-text-color)',
              ],
              [
                'card_background_color',
                'editor.battery_monitor.color_card_bg',
                'Card background',
                'var(--card-background-color)',
              ],
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
      </div>
    `;
  }

  private _renderPatternChips(
    m: BatteryMonitorModule,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.battery_monitor.exclude_patterns', lang, 'Exclude patterns')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
          ${localize(
            'editor.battery_monitor.exclude_patterns_desc',
            lang,
            'Entity ids containing these substrings are ignored.'
          )}
        </div>
        <div class="domain-chips">
          ${(m.exclude_patterns || []).map(
            p => html`
              <span class="domain-chip exclude">
                ${p}
                <ha-icon
                  icon="mdi:close"
                  class="chip-remove"
                  @click=${() => {
                    updateModule({
                      exclude_patterns: (m.exclude_patterns || []).filter(x => x !== p),
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
            placeholder=${localize('editor.battery_monitor.pattern_ph', lang, 'e.g. test, backup')}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const val = input.value.trim().toLowerCase();
                if (val && !(m.exclude_patterns || []).includes(val)) {
                  updateModule({
                    exclude_patterns: [...(m.exclude_patterns || []), val],
                  } as Partial<CardModule>);
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
              if (val && !(m.exclude_patterns || []).includes(val)) {
                updateModule({
                  exclude_patterns: [...(m.exclude_patterns || []), val],
                } as Partial<CardModule>);
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
    m: BatteryMonitorModule,
    updateModule: (u: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div style="margin-top: 24px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          ${localize('editor.battery_monitor.hidden_entities', lang, 'Hidden entities')}
        </div>
        <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
          ${localize(
            'editor.battery_monitor.hidden_entities_desc',
            lang,
            'Removed from auto-discovery; click × to show again.'
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

  private _renderEntityRow(
    entity: BatteryMonitorEntity,
    index: number,
    m: BatteryMonitorModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const isExpanded = this._expandedEntities.has(entity.id);
    return html`
      <div class="entity-row">
        <div class="entity-info ${!entity.entity ? 'empty' : ''}">
          ${entity.entity ||
          localize('editor.battery_monitor.no_entity', lang, 'No entity selected')}
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
            const entities = [...(m.entities || [])];
            entities.splice(index, 1);
            this._expandedEntities.delete(entity.id);
            updateModule({ entities } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
      </div>
      ${isExpanded
        ? html`
            <div class="entity-settings">
              ${UcFormUtils.renderFieldSection(
                localize('editor.battery_monitor.entity', hass?.locale?.language || 'en', 'Entity'),
                localize(
                  'editor.battery_monitor.entity_desc',
                  hass?.locale?.language || 'en',
                  'Battery or related sensor.'
                ),
                hass,
                { entity: entity.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => {
                  const entities = [...(m.entities || [])];
                  entities[index] = { ...entities[index], entity: e.detail.value.entity };
                  updateModule({ entities } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )}
              ${UcFormUtils.renderFieldSection(
                localize('editor.battery_monitor.label_override', hass?.locale?.language || 'en', 'Label override'),
                '',
                hass,
                { label: entity.label || '' },
                [UcFormUtils.text('label')],
                (e: CustomEvent) => {
                  const entities = [...(m.entities || [])];
                  entities[index] = { ...entities[index], label: e.detail.value.label };
                  updateModule({ entities } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )}
              ${UcFormUtils.renderFieldSection(
                localize('editor.battery_monitor.icon_override', hass?.locale?.language || 'en', 'Icon override'),
                '',
                hass,
                { icon: entity.icon || '' },
                [UcFormUtils.icon('icon')],
                (e: CustomEvent) => {
                  const entities = [...(m.entities || [])];
                  entities[index] = { ...entities[index], icon: e.detail.value.icon };
                  updateModule({ entities } as Partial<CardModule>);
                  this.triggerPreviewUpdate();
                }
              )}
              <div style="margin-bottom: 16px;">
                <ultra-color-picker
                  .label=${localize(
                    'editor.battery_monitor.row_color',
                    hass?.locale?.language || 'en',
                    'Row color override'
                  )}
                  .value=${entity.color || ''}
                  .defaultValue=${''}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => {
                    const entities = [...(m.entities || [])];
                    entities[index] = { ...entities[index], color: e.detail.value };
                    updateModule({ entities } as Partial<CardModule>);
                    this.triggerPreviewUpdate();
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          `
        : ''}
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as BatteryMonitorModule;
    const lang = hass?.locale?.language || 'en';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    if (!hass?.states) {
      return this.renderGradientErrorState(
        localize('editor.battery_monitor.err_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.battery_monitor.err_ha_desc', lang, 'Connecting to entity states…'),
        'mdi:loading'
      );
    }

    const readings = this._collectReadings(m, hass, true);
    if (readings.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.battery_monitor.err_empty', lang, 'No batteries found'),
        localize(
          'editor.battery_monitor.err_empty_desc',
          lang,
          'Adjust discovery mode, manual entities, or thresholds in the General tab.'
        ),
        'mdi:battery-off'
      );
    }

    const crit = m.critical_threshold ?? 10;
    const low = m.low_threshold ?? 25;
    const cCrit = m.critical_color || 'var(--error-color)';
    const cLow = m.low_color || 'var(--warning-color)';
    const cOk = m.ok_color || 'var(--success-color)';
    const cChg = m.charging_color || 'var(--info-color)';
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';

    const showDel = previewContext === 'live';

    const content =
      m.style === 'list'
        ? this._renderList(m, readings, hass, config, {
            crit,
            low,
            cCrit,
            cLow,
            cOk,
            cChg,
            text,
            secondary,
            cardBg,
            lang,
            showDel,
          })
        : m.style === 'bars'
          ? this._renderBars(m, readings, hass, config, {
              crit,
              low,
              cCrit,
              cLow,
              cOk,
              cChg,
              text,
              secondary,
              cardBg,
              lang,
              showDel,
            })
          : m.style === 'cards'
            ? this._renderCards(m, readings, hass, config, {
                crit,
                low,
                cCrit,
                cLow,
                cOk,
                cChg,
                text,
                secondary,
                cardBg,
                lang,
                showDel,
              })
            : m.style === 'rings'
              ? this._renderRings(m, readings, hass, config, {
                  crit,
                  low,
                  cCrit,
                  cLow,
                  cOk,
                  cChg,
                  text,
                  secondary,
                  cardBg,
                  lang,
                  showDel,
                })
              : this._renderStrip(m, readings, hass, config, {
                  crit,
                  low,
                  cCrit,
                  cLow,
                  cOk,
                  cChg,
                  text,
                  secondary,
                  cardBg,
                  lang,
                  showDel,
                });

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="bm-root ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false
              ? html`<div class="bm-title" style="color:${text};font-weight:700;margin-bottom:10px;">
                  ${m.title || localize('editor.battery_monitor.default_title', lang, 'Battery Monitor')}
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

  private _palette(
    m: BatteryMonitorModule,
    v: number,
    charging: boolean,
    crit: number,
    low: number,
    cCrit: string,
    cLow: string,
    cOk: string,
    cChg: string
  ): string {
    if (charging) return m.charging_color || cChg;
    if (v <= crit) return m.critical_color || cCrit;
    if (v <= low) return m.low_color || cLow;
    return m.ok_color || cOk;
  }

  private _renderRemove(
    m: BatteryMonitorModule,
    r: BatteryReading,
    show: boolean,
    lang: string
  ): TemplateResult {
    if (!show) return html``;
    const isManual = !!(m.entities || []).some(e => e.entity === r.entityId);
    if (m.discovery_mode === 'auto' && isManual) {
      return html``;
    }
    if (m.discovery_mode === 'manual' && !isManual) {
      return html``;
    }
    return html`
      <ha-icon
        class="uc-bm-remove"
        icon="mdi:close"
        title=${localize('editor.battery_monitor.preview_remove', lang, 'Remove from list')}
        @click=${(ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (isManual) {
            window.dispatchEvent(
              new CustomEvent(PATCH_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                  moduleId: m.id,
                  updates: {
                    entities: (m.entities || []).filter(e => e.entity !== r.entityId),
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

  private _rowGestures(
    m: BatteryMonitorModule,
    r: BatteryReading,
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
      ['.uc-bm-remove']
    );
  }

  private _renderList(
    m: BatteryMonitorModule,
    readings: BatteryReading[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: {
      crit: number;
      low: number;
      cCrit: string;
      cLow: string;
      cOk: string;
      cChg: string;
      text: string;
      secondary: string;
      cardBg: string;
      lang: string;
      showDel: boolean;
    }
  ): TemplateResult {
    const itemBorder =
      m.show_item_border !== false ? 'border:1px solid var(--divider-color);' : '';
    return html`
      <div class="bm-list" style="display:flex;flex-direction:column;gap:8px;">
        ${readings.map(r => {
          const col = this._palette(m, r.value, r.charging, o.crit, o.low, o.cCrit, o.cLow, o.cOk, o.cChg);
          const rowColor = r.manual?.color || col;
          const g = this._rowGestures(m, r, hass, config, 'list');
          return html`
            <div
              style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${o.cardBg};${itemBorder}"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              <ha-icon
                icon=${r.manual?.icon || r.icon}
                style="color:${rowColor};--mdc-icon-size:28px;flex-shrink:0;"
              ></ha-icon>
              <div style="flex:1;min-width:0;">
                <div style="color:${o.text};font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${r.name}
                  ${m.show_charging_indicator !== false && r.charging
                    ? html`<span style="color:${o.cChg};font-size:11px;margin-left:6px;">⚡</span>`
                    : nothing}
                </div>
                <div
                  style="height:6px;border-radius:4px;background:rgba(127,127,127,0.25);margin-top:6px;overflow:hidden;"
                >
                  <div
                    style="width:${Math.max(0, Math.min(100, r.value))}%;height:100%;background:${rowColor};"
                  ></div>
                </div>
              </div>
              ${m.show_percentage_value !== false
                ? html`<div style="color:${o.secondary};font-size:13px;font-weight:600;flex-shrink:0;">
                    ${Math.round(r.value)}%
                  </div>`
                : nothing}
              ${this._renderRemove(m, r, o.showDel, o.lang)}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderBars(
    m: BatteryMonitorModule,
    readings: BatteryReading[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: {
      crit: number;
      low: number;
      cCrit: string;
      cLow: string;
      cOk: string;
      cChg: string;
      text: string;
      secondary: string;
      cardBg: string;
      lang: string;
      showDel: boolean;
    }
  ): TemplateResult {
    const itemBorder =
      m.show_item_border !== false ? 'border:1px solid var(--divider-color);' : '';
    return html`
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${readings.map(r => {
          const col = this._palette(m, r.value, r.charging, o.crit, o.low, o.cCrit, o.cLow, o.cOk, o.cChg);
          const rowColor = r.manual?.color || col;
          const g = this._rowGestures(m, r, hass, config, 'bar');
          return html`
            <div
              style="padding:10px;border-radius:10px;background:${o.cardBg};${itemBorder}"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <span style="color:${o.text};font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px;">
                  <ha-icon icon=${r.manual?.icon || r.icon} style="color:${rowColor};--mdc-icon-size:22px;"></ha-icon>
                  ${r.name}
                  ${m.show_charging_indicator !== false && r.charging
                    ? html`<span style="color:${o.cChg};">⚡</span>`
                    : nothing}
                </span>
                <span style="display:flex;align-items:center;gap:4px;">
                  ${m.show_percentage_value !== false
                    ? html`<span style="color:${o.secondary};font-weight:700;">${Math.round(r.value)}%</span>`
                    : nothing}
                  ${this._renderRemove(m, r, o.showDel, o.lang)}
                </span>
              </div>
              <div style="height:14px;border-radius:8px;background:rgba(127,127,127,0.25);overflow:hidden;">
                <div
                  style="width:${Math.max(0, Math.min(100, r.value))}%;height:100%;background:${rowColor};"
                ></div>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderCards(
    m: BatteryMonitorModule,
    readings: BatteryReading[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: {
      crit: number;
      low: number;
      cCrit: string;
      cLow: string;
      cOk: string;
      cChg: string;
      text: string;
      secondary: string;
      cardBg: string;
      lang: string;
      showDel: boolean;
    }
  ): TemplateResult {
    const showBorder = m.show_item_border !== false;
    return html`
      <div class="bm-style-grid">
        ${readings.map(r => {
          const col = this._palette(m, r.value, r.charging, o.crit, o.low, o.cCrit, o.cLow, o.cOk, o.cChg);
          const fill = r.manual?.color || col;
          const g = this._rowGestures(m, r, hass, config, 'card');
          const itemBorder = showBorder ? `border:1px solid ${fill}55;` : '';
          return html`
            <div
              style="position:relative;padding:14px;border-radius:12px;background:${fill}22;${itemBorder}text-align:center;"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              <div style="position:absolute;top:6px;right:6px;">
                ${this._renderRemove(m, r, o.showDel, o.lang)}
              </div>
              <ha-icon
                icon=${r.manual?.icon || r.icon}
                style="color:${fill};--mdc-icon-size:36px;margin-bottom:8px;"
              ></ha-icon>
              ${m.show_percentage_value !== false
                ? html`<div style="font-size:26px;font-weight:800;color:${o.text};">${Math.round(r.value)}%</div>`
                : nothing}
              <div style="font-size:12px;color:${o.secondary};margin-top:6px;line-height:1.2;">
                ${r.name}
              </div>
              ${m.show_charging_indicator !== false && r.charging
                ? html`<div style="color:${o.cChg};font-size:11px;margin-top:4px;">⚡</div>`
                : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderRings(
    m: BatteryMonitorModule,
    readings: BatteryReading[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: {
      crit: number;
      low: number;
      cCrit: string;
      cLow: string;
      cOk: string;
      cChg: string;
      text: string;
      secondary: string;
      cardBg: string;
      lang: string;
      showDel: boolean;
    }
  ): TemplateResult {
    const C = 100;
    const R = 36;
    const stroke = 8;
    const circ = 2 * Math.PI * R;
    const itemBorder =
      m.show_item_border !== false ? 'border:1px solid var(--divider-color);' : '';
    return html`
      <div class="bm-style-grid">
        ${readings.map(r => {
          const col = this._palette(m, r.value, r.charging, o.crit, o.low, o.cCrit, o.cLow, o.cOk, o.cChg);
          const strokeCol = r.manual?.color || col;
          const pct = Math.max(0, Math.min(100, r.value));
          const dash = (pct / 100) * circ;
          const g = this._rowGestures(m, r, hass, config, 'ring');
          return html`
            <div
              style="text-align:center;padding:10px;border-radius:12px;background:${o.cardBg};${itemBorder}position:relative;"
              @pointerdown=${g.onPointerDown}
              @pointermove=${g.onPointerMove}
              @pointerup=${g.onPointerUp}
              @pointerleave=${g.onPointerLeave}
              @pointercancel=${g.onPointerCancel}
            >
              <div style="position:absolute;top:4px;right:4px;">
                ${this._renderRemove(m, r, o.showDel, o.lang)}
              </div>
              <svg viewBox="0 0 ${C} ${C}" style="width:88px;height:88px;margin:0 auto;display:block;">
                <circle
                  cx="50"
                  cy="50"
                  r="${R}"
                  fill="none"
                  stroke="rgba(127,127,127,0.25)"
                  stroke-width="${stroke}"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="${R}"
                  fill="none"
                  stroke="${strokeCol}"
                  stroke-width="${stroke}"
                  stroke-dasharray="${dash} ${circ}"
                  stroke-linecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              ${m.show_percentage_value !== false
                ? html`<div style="font-weight:800;font-size:15px;color:${o.text};margin-top:4px;">
                    ${Math.round(r.value)}%
                  </div>`
                : nothing}
              <div style="font-size:11px;color:${o.secondary};margin-top:6px;line-height:1.2;min-height:2.4em;">
                ${r.name}
              </div>
              ${m.show_charging_indicator !== false && r.charging
                ? html`<div style="color:${o.cChg};font-size:10px;">⚡</div>`
                : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderStrip(
    m: BatteryMonitorModule,
    readings: BatteryReading[],
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: {
      crit: number;
      low: number;
      cCrit: string;
      cLow: string;
      cOk: string;
      cChg: string;
      text: string;
      secondary: string;
      cardBg: string;
      lang: string;
      showDel: boolean;
    }
  ): TemplateResult {
    return html`
      <div>
        <div class="bm-strip" style="margin-bottom:12px;">
          ${readings.map(r => {
            const col = this._palette(m, r.value, r.charging, o.crit, o.low, o.cCrit, o.cLow, o.cOk, o.cChg);
            const fill = r.manual?.color || col;
            const g = this._rowGestures(m, r, hass, config, 'strip');
            return html`
              <div
                class="bm-strip-seg"
                style="background:${fill};"
                title="${r.name} — ${Math.round(r.value)}%"
                @pointerdown=${g.onPointerDown}
                @pointermove=${g.onPointerMove}
                @pointerup=${g.onPointerUp}
                @pointerleave=${g.onPointerLeave}
                @pointercancel=${g.onPointerCancel}
              >
                ${this._renderRemove(m, r, o.showDel, o.lang)}
              </div>
            `;
          })}
        </div>
        <div style="font-size:12px;color:${o.secondary};">
          ${localize(
            'editor.battery_monitor.strip_hint',
            o.lang,
            'Tap a segment for more-info. Colors reflect battery level.'
          )}
        </div>
      </div>
    `;
  }

  private _makeReading(
    st: any,
    entityId: string,
    pct: number,
    manual: BatteryMonitorEntity | undefined,
    hass: HomeAssistant,
    showCharging: boolean
  ): BatteryReading {
    const charging = showCharging ? this._isCharging(entityId, hass, st) : false;
    return {
      entityId,
      name: manual?.label || st.attributes?.friendly_name || entityId,
      icon: manual?.icon || st.attributes?.icon || 'mdi:battery',
      value: pct,
      charging,
      manual,
    };
  }

  private _isCharging(entityId: string, hass: HomeAssistant, st: any): boolean {
    const a = st.attributes;
    if (a?.charging === true || a?.is_charging === true) return true;
    const bid = this._findChargingBinarySensor(entityId, hass);
    return bid ? hass.states[bid]?.state === 'on' : false;
  }

  private _findChargingBinarySensor(batteryEntityId: string, hass: HomeAssistant): string | undefined {
    const parts = batteryEntityId.split('.');
    if (parts.length < 2) return undefined;
    const base = parts[1]!;
    const candidates = [
      `binary_sensor.${base}_charging`,
      `binary_sensor.${base}_battery_charging`,
    ];
    for (const c of candidates) {
      const s = hass.states[c];
      if (s && (s.attributes?.device_class === 'battery_charging' || c.includes('charging'))) {
        return c;
      }
    }
    for (const id of Object.keys(hass.states)) {
      if (!id.startsWith('binary_sensor.')) continue;
      const s = hass.states[id];
      if (s.attributes?.device_class !== 'battery_charging') continue;
      const bn = id.split('.')[1] || '';
      if (bn.includes(base) || base.includes(bn.replace(/_battery_charging$/i, ''))) return id;
    }
    return undefined;
  }

  private _extractPct(st: any): number | null {
    const u = st.state;
    if (u === 'unavailable' || u === 'unknown') return null;
    const n = parseFloat(String(u));
    if (!Number.isNaN(n)) return Math.max(0, Math.min(100, n));
    const bl = st.attributes?.battery_level;
    if (typeof bl === 'number') return Math.max(0, Math.min(100, bl));
    if (typeof bl === 'string') {
      const p = parseFloat(bl);
      if (!Number.isNaN(p)) return Math.max(0, Math.min(100, p));
    }
    return null;
  }

  private _collectReadings(
    m: BatteryMonitorModule,
    hass: HomeAssistant,
    applyMax: boolean
  ): BatteryReading[] {
    const hidden = new Set((m.hidden_entities || []).map(x => x.trim()).filter(Boolean));
    const patterns = (m.exclude_patterns || []).map(p => p.toLowerCase());
    const passes = (id: string) =>
      !hidden.has(id) && !patterns.some(p => id.toLowerCase().includes(p));

    const found = new Map<string, BatteryReading>();
    const showChg = m.show_charging_indicator !== false;

    if (m.discovery_mode !== 'manual') {
      for (const [id, st] of Object.entries(hass.states)) {
        if (!passes(id)) continue;
        const domain = id.split('.')[0];
        const dc = st.attributes?.device_class;

        if (domain === 'sensor' && dc === 'battery') {
          const pct = this._extractPct(st);
          if (pct === null) continue;
          found.set(id, this._makeReading(st, id, pct, undefined, hass, showChg));
        } else if (
          m.include_binary_sensors &&
          domain === 'binary_sensor' &&
          dc === 'battery'
        ) {
          const low = st.state === 'on';
          const pct = low ? 0 : 100;
          found.set(id, this._makeReading(st, id, pct, undefined, hass, showChg));
        } else if (
          m.include_battery_level_attribute !== false &&
          typeof st.attributes?.battery_level === 'number'
        ) {
          const pct = Math.max(0, Math.min(100, st.attributes.battery_level as number));
          found.set(id, this._makeReading(st, id, pct, undefined, hass, showChg));
        }
      }
    }

    if (m.discovery_mode !== 'auto') {
      for (const ent of m.entities || []) {
        if (!ent.entity) continue;
        const st = hass.states[ent.entity];
        if (!st || !passes(ent.entity)) continue;
        const pct = this._extractPct(st);
        if (pct === null) continue;
        found.set(ent.entity, this._makeReading(st, ent.entity, pct, ent, hass, showChg));
      }
    }

    let list = [...found.values()];
    const lowTh = m.low_threshold ?? 25;
    const critTh = m.critical_threshold ?? 10;
    if (m.show_only_below_threshold) {
      list = list.filter(r => r.value <= lowTh);
    }

    list = this._sortReadings(list, m.sort_direction || 'lowest_first', hass);

    const max = m.max_items ?? 25;
    if (applyMax) list = list.slice(0, max);
    return list;
  }

  private _sortReadings(
    list: BatteryReading[],
    mode: BatteryMonitorModule['sort_direction'],
    _hass: HomeAssistant
  ): BatteryReading[] {
    const copy = [...list];
    if (mode === 'lowest_first') copy.sort((a, b) => a.value - b.value);
    else if (mode === 'highest_first') copy.sort((a, b) => b.value - a.value);
    else if (mode === 'name') copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return copy;
  }
}
