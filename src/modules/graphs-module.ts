import { html, svg, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, GraphsModule, GraphEntityConfig, UltraCardConfig } from '../types';
import { TemplateService } from '../services/template-service';
import { UcHoverEffectsService } from '../services/uc-hover-effects-service';
import { UltraLinkComponent, UltraLinkConfig } from '../components/ultra-link';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { FormUtils } from '../utils/form-utils';
import '../entity-picker';
import '../components/ultra-color-picker';
import { getImageUrl } from '../utils/image-upload';
import { formatEntityState } from '../utils/number-format';
import { localize } from '../localize/localize';

export class UltraGraphsModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'graphs',
    title: 'Graphs',
    description: 'Display interactive charts and graphs with Home Assistant data',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:chart-line',
    category: 'data',
    tags: ['charts', 'graphs', 'data', 'visualization', 'statistics', 'analytics'],
  };

  private _templateService?: TemplateService;
  private _updateInterval: any = null;
  // Cache removed for instant updates

  // History data storage - per module instance
  private _historyData: { [moduleId: string]: any } = {};
  private _historyError: { [moduleId: string]: string | null } = {};
  private _historyLoading: { [moduleId: string]: boolean } = {};
  private _deferredHistoryScheduled: { [moduleId: string]: boolean } = {};

  // Ultra-light cache (localStorage) for instantly restoring the last real
  // historical curve on reload (similar to mini-graph behavior)
  private _getCacheStore(): Record<string, any> {
    const w = window as any;
    if (!w.__ultraGraphsCache) {
      try {
        const raw = localStorage.getItem('__ultraGraphsCache');
        w.__ultraGraphsCache = raw ? JSON.parse(raw) : {};
      } catch (e) {
        w.__ultraGraphsCache = {};
      }
    }
    return w.__ultraGraphsCache as Record<string, any>;
  }

  private _persistCacheStore(store: Record<string, any>): void {
    try {
      localStorage.setItem('__ultraGraphsCache', JSON.stringify(store));
    } catch {
      // ignore quota
    }
  }

  private _makeCacheKey(module: GraphsModule): string {
    const dataSource = module.data_source || 'history';

    if (dataSource === 'forecast') {
      return `forecast::${module.forecast_entity}::${module.forecast_type}::${module.time_period}`;
    }

    // History mode key
    const ids = (module.entities || [])
      .filter(e => e.entity)
      .map(e => `${e.entity}|${e.attribute || 'state'}`)
      .join(';');
    return `history::${ids}::${module.time_period}`;
  }

  private _tryReadCache(module: GraphsModule): any | null {
    const store = this._getCacheStore();
    const key = this._makeCacheKey(module);
    const item = store[key];
    if (!item) return null;
    const now = Date.now();
    if (item.expiresAt && item.expiresAt > now && item.data) {
      return item.data;
    }
    delete store[key];
    this._persistCacheStore(store);
    return null;
  }

  private _writeCache(module: GraphsModule, data: any): void {
    const store = this._getCacheStore();
    const key = this._makeCacheKey(module);
    store[key] = { expiresAt: Date.now() + 5 * 60 * 1000, data };
    this._persistCacheStore(store);
  }

  // Click handling properties for event management
  private clickTimeout: any = null;
  private holdTimeout: any = null;
  private isHolding = false;

  // Track expanded state of entity cards
  private expandedEntities: Set<number> = new Set();

  // Chart rendering constants
  private readonly DEFAULT_COLORS = [
    '#2196F3', // Blue
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#F44336', // Red
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FFEB3B', // Yellow
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#E91E63', // Pink
  ];

  private readonly FORECAST_ATTRIBUTE_LABELS: Record<string, string> = {
    temperature: 'Temperature',
    precipitation: 'Precipitation',
    wind_speed: 'Wind Speed',
    humidity: 'Humidity',
    pressure: 'Pressure',
    cloud_coverage: 'Cloud Coverage',
  };

  private readonly FORECAST_ATTRIBUTE_UNITS: Record<string, string> = {
    temperature: '°',
    precipitation: 'mm',
    wind_speed: 'km/h',
    humidity: '%',
    pressure: 'hPa',
    cloud_coverage: '%',
  };

  createDefault(id?: string, hass?: HomeAssistant): GraphsModule {
    const defaultId = id || this.generateId('graphs');

    return {
      id: defaultId,
      type: 'graphs',
      name: 'New Graph',

      // Data source defaults
      data_source: 'history', // backward compatible default
      forecast_type: 'hourly',
      forecast_entity: '',

      // Chart configuration
      chart_type: 'line',
      entities: [],

      // Time period
      time_period: '24h',

      // Chart appearance
      title: 'Chart',
      chart_width: '100%',
      // New: percentage-based width control (backwards compatible with chart_width)
      chart_width_percent: 100,
      chart_height: 345,
      background_color: 'transparent',
      // New: title visibility & alignment defaults
      show_title: true,
      chart_alignment: 'center',
      show_display_name: true,
      show_entity_value: true,
      info_position: 'top_left',

      // Chart options
      show_legend: true,
      legend_position: 'bottom_left',
      show_grid: true,
      smooth_curves: true,
      show_tooltips: true,
      // New: pie/donut slice labels
      show_slice_labels: true,

      // Global link configuration
      tap_action: { action: 'default' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },

      // Templates
      template_mode: false,
      template: '',

      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    } as any;
  }

  private getChartTypeOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'line', label: localize('editor.graphs.types.line', lang, 'Line Chart') },
      { value: 'bar', label: localize('editor.graphs.types.bar', lang, 'Bar Chart') },
      { value: 'pie', label: localize('editor.graphs.types.pie', lang, 'Pie Chart') },
      { value: 'donut', label: localize('editor.graphs.types.donut', lang, 'Donut Chart') },
    ];
  }

  private getTimePeriodOptions(
    lang: string,
    dataSource?: string
  ): Array<{ value: string; label: string }> {
    const prefix = dataSource === 'forecast' ? 'Next' : 'Last';
    return [
      { value: '1h', label: localize('editor.graphs.period.1h', lang, `${prefix} Hour`) },
      { value: '3h', label: localize('editor.graphs.period.3h', lang, `${prefix} 3 Hours`) },
      { value: '6h', label: localize('editor.graphs.period.6h', lang, `${prefix} 6 Hours`) },
      { value: '12h', label: localize('editor.graphs.period.12h', lang, `${prefix} 12 Hours`) },
      { value: '24h', label: localize('editor.graphs.period.24h', lang, `${prefix} 24 Hours`) },
      { value: '2d', label: localize('editor.graphs.period.2d', lang, `${prefix} 2 Days`) },
      { value: '7d', label: localize('editor.graphs.period.7d', lang, `${prefix} Week`) },
      { value: '30d', label: localize('editor.graphs.period.30d', lang, `${prefix} Month`) },
      { value: '90d', label: localize('editor.graphs.period.90d', lang, `${prefix} 3 Months`) },
      { value: '365d', label: localize('editor.graphs.period.365d', lang, `${prefix} Year`) },
    ];
  }

  private getAggregationOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'mean', label: localize('editor.graphs.agg.mean', lang, 'Average') },
      { value: 'sum', label: localize('editor.graphs.agg.sum', lang, 'Sum') },
      { value: 'min', label: localize('editor.graphs.agg.min', lang, 'Minimum') },
      { value: 'max', label: localize('editor.graphs.agg.max', lang, 'Maximum') },
      { value: 'median', label: localize('editor.graphs.agg.median', lang, 'Median') },
      { value: 'first', label: localize('editor.graphs.agg.first', lang, 'First Value') },
      { value: 'last', label: localize('editor.graphs.agg.last', lang, 'Last Value') },
      { value: 'count', label: localize('editor.graphs.agg.count', lang, 'Count') },
      { value: 'delta', label: localize('editor.graphs.agg.delta', lang, 'Change') },
    ];
  }

  private getLegendPositionOptions(lang: string): Array<{ value: string; label: string }> {
    return [
      { value: 'top', label: localize('editor.graphs.position.top', lang, 'Top') },
      { value: 'bottom', label: localize('editor.graphs.position.bottom', lang, 'Bottom') },
      { value: 'left', label: localize('editor.graphs.position.left', lang, 'Left') },
      { value: 'right', label: localize('editor.graphs.position.right', lang, 'Right') },
      { value: 'none', label: localize('editor.graphs.position.hidden', lang, 'Hidden') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const graphsModule = module as GraphsModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      <div class="uc-graphs-general-tab">
        ${FormUtils.injectCleanFormStyles()}

        <!-- Data Source Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:database" style="color: var(--primary-color);"></ha-icon>
            ${localize('editor.graphs.data_source.title', lang, 'Data Source')}
          </div>

          ${this.renderFieldSection(
            localize('editor.graphs.data_source.mode', lang, 'Mode'),
            localize(
              'editor.graphs.data_source.desc',
              lang,
              'Choose between historical data or weather forecasts.'
            ),
            hass,
            { data_source: graphsModule.data_source || 'history' },
            [
              this.selectField('data_source', [
                {
                  value: 'history',
                  label: localize('editor.graphs.mode.history', lang, 'History'),
                },
                {
                  value: 'forecast',
                  label: localize('editor.graphs.mode.forecast', lang, 'Forecast'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.data_source;
              if (next === (graphsModule.data_source || 'history')) return;
              updateModule({ data_source: next });
              // Clear cached data when switching modes
              delete this._historyData[graphsModule.id];
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
          ${graphsModule.data_source === 'forecast'
            ? html`
                <div class="conditional-fields-group" style="padding: 16px; margin-top: 12px;">
                  ${FormUtils.renderField(
                    localize('editor.graphs.forecast_entity', lang, 'Weather Entity'),
                    localize(
                      'editor.graphs.forecast_entity_desc',
                      lang,
                      'Select a weather entity for forecasts.'
                    ),
                    hass,
                    { forecast_entity: graphsModule.forecast_entity || '' },
                    [
                      FormUtils.createSchemaItem('forecast_entity', {
                        entity: { domain: 'weather' },
                      }),
                    ],
                    (e: CustomEvent) => {
                      updateModule({
                        forecast_entity: e.detail.value?.forecast_entity || e.detail.value,
                      });
                    }
                  )}
                  <div style="margin-top: 16px;">
                    ${this.renderFieldSection(
                      localize('editor.graphs.forecast_type', lang, 'Forecast Type'),
                      localize(
                        'editor.graphs.forecast_type_desc',
                        lang,
                        'Hourly or daily forecasts.'
                      ),
                      hass,
                      { forecast_type: graphsModule.forecast_type || 'hourly' },
                      [
                        this.selectField('forecast_type', [
                          {
                            value: 'hourly',
                            label: localize('editor.graphs.type.hourly', lang, 'Hourly'),
                          },
                          {
                            value: 'daily',
                            label: localize('editor.graphs.type.daily', lang, 'Daily'),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.forecast_type;
                        if (next === graphsModule.forecast_type) return;
                        updateModule({ forecast_type: next });
                        delete this._historyData[graphsModule.id];
                        delete this._historyError[graphsModule.id];
                        delete this._historyLoading[graphsModule.id];
                        delete this._deferredHistoryScheduled[graphsModule.id];
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }
                    )}
                  </div>
                </div>
              `
            : ''}
        </div>

        <!-- Chart Type Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:chart-line" style="color: var(--primary-color);"></ha-icon>
            ${localize('editor.graphs.chart_type.title', lang, 'Chart Type')}
          </div>

          ${this.renderFieldSection(
            localize('editor.graphs.chart_type.type', lang, 'Type'),
            localize(
              'editor.graphs.chart_type.desc',
              lang,
              'Select the visualization style for your data.'
            ),
            hass,
            { chart_type: graphsModule.chart_type },
            [this.selectField('chart_type', this.getChartTypeOptions(lang))],
            (e: CustomEvent) => {
              const next = e.detail.value.chart_type;
              const prev = graphsModule.chart_type;
              if (next === prev) return;
              updateModule({ chart_type: next });
              // Trigger re-render to update dropdown UI
              setTimeout(() => {
                this.triggerPreviewUpdate();
              }, 50);
            }
          )}
        </div>

        <!-- Data Sources Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:database" style="color: var(--primary-color);"></ha-icon>
            ${graphsModule.data_source === 'forecast'
              ? localize('editor.graphs.forecast_attributes.title', lang, 'Forecast Attributes')
              : localize('editor.graphs.data_sources.title', lang, 'Data Sources')}
          </div>
          ${graphsModule.data_source === 'forecast'
            ? html`<div
                style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.08); border-radius: 8px; border-left: 3px solid var(--primary-color);"
              >
                ${localize(
                  'editor.graphs.forecast_attributes.desc',
                  lang,
                  'Select which forecast values to display from the weather entity configured above. Each attribute will be shown as a separate line on the graph.'
                )}
              </div>`
            : ''}

          <div class="entities-grid" style="display: grid; gap: 12px;">
            ${graphsModule.entities?.map(
              (entity, index) => html`
                <div
                  class="entity-card"
                  style="
                    background: var(--primary-background-color); 
                    border-radius: 8px; 
                    padding: 16px; 
                    border-left: 4px solid ${entity.color || this._getDefaultColor(index)};
                    position: relative;
                    transition: all 0.2s ease;
                  "
                >
                  ${(graphsModule.entities?.length || 0) > 1
                    ? html`
                        <ha-icon-button
                          @click=${() => this._removeEntity(graphsModule, index, updateModule)}
                          style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        --mdc-icon-button-size: 32px;
                        --mdc-icon-size: 16px;
                        color: var(--error-color);
                      "
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </ha-icon-button>
                      `
                    : ''}

                  <div
                    style="display: grid; gap: 12px; margin-top: ${(graphsModule.entities?.length ||
                      0) > 1
                      ? '20px'
                      : '0'};"
                  >
                    <!-- Entity Header -->
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      <div style="flex: 1; display: flex; align-items: center; gap: 8px;">
                        <div
                          style="
                             width: 12px;
                             height: 12px;
                             background: ${entity.color || this._getDefaultColor(index)};
                             border-radius: 2px;
                             flex-shrink: 0;
                           "
                        ></div>
                        <span
                          style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                        >
                          ${entity.name ||
                          (entity.entity
                            ? hass.states[entity.entity]?.attributes.friendly_name ||
                              entity.entity.split('.')[1]
                            : `Entity ${index + 1}`)}
                        </span>
                      </div>
                    </div>

                    <!-- Basic Settings (Always Visible) -->
                    <div style="display: grid; gap: 12px;">
                      <!-- Entity Picker (History Mode Only) -->
                      ${graphsModule.data_source !== 'forecast'
                        ? FormUtils.renderField(
                            localize('editor.graphs.entity.label', lang, 'Entity'),
                            localize(
                              'editor.graphs.entity.desc',
                              lang,
                              'Select an entity to plot.'
                            ),
                            hass,
                            { entity: entity.entity || '' },
                            [FormUtils.createSchemaItem('entity', { entity: {} })],
                            (e: CustomEvent) => {
                              this._updateEntity(
                                graphsModule,
                                index,
                                {
                                  entity:
                                    (e.detail as any).value?.entity ||
                                    e.detail.value?.entity ||
                                    e.detail.value,
                                },
                                updateModule
                              );
                            }
                          )
                        : ''}

                      <!-- Forecast Attribute Selection (Forecast Mode - Always Visible) -->
                      ${graphsModule.data_source === 'forecast'
                        ? this.renderFieldSection(
                            localize(
                              'editor.graphs.entity.forecast_attr',
                              lang,
                              'Forecast Attribute'
                            ),
                            localize(
                              'editor.graphs.entity.forecast_attr_desc',
                              lang,
                              'Which forecast value to plot on the graph.'
                            ),
                            hass,
                            { forecast_attribute: entity.forecast_attribute || 'temperature' },
                            [
                              this.selectField('forecast_attribute', [
                                {
                                  value: 'temperature',
                                  label: localize(
                                    'editor.graphs.forecast.temp',
                                    lang,
                                    'Temperature'
                                  ),
                                },
                                {
                                  value: 'precipitation',
                                  label: localize(
                                    'editor.graphs.forecast.precip',
                                    lang,
                                    'Precipitation'
                                  ),
                                },
                                {
                                  value: 'wind_speed',
                                  label: localize(
                                    'editor.graphs.forecast.wind',
                                    lang,
                                    'Wind Speed'
                                  ),
                                },
                                {
                                  value: 'humidity',
                                  label: localize(
                                    'editor.graphs.forecast.humidity',
                                    lang,
                                    'Humidity'
                                  ),
                                },
                                {
                                  value: 'pressure',
                                  label: localize(
                                    'editor.graphs.forecast.pressure',
                                    lang,
                                    'Pressure'
                                  ),
                                },
                                {
                                  value: 'cloud_coverage',
                                  label: localize(
                                    'editor.graphs.forecast.clouds',
                                    lang,
                                    'Cloud Coverage'
                                  ),
                                },
                              ]),
                            ],
                            (e: CustomEvent) => {
                              const next = e.detail.value.forecast_attribute;
                              if (next === entity.forecast_attribute) return;
                              this._updateEntity(
                                graphsModule,
                                index,
                                { forecast_attribute: next },
                                updateModule
                              );
                              setTimeout(() => this.triggerPreviewUpdate(), 50);
                            }
                          )
                        : ''}

                      <!-- Display Name -->
                      <input
                        type="text"
                        .value=${entity.name || ''}
                        placeholder="${localize(
                          'editor.graphs.entity.display_name_placeholder',
                          lang,
                          'Display name (optional)'
                        )}"
                        @input=${(e: Event) => {
                          const target = e.target as HTMLInputElement;
                          this._updateEntity(
                            graphsModule,
                            index,
                            { name: target.value },
                            updateModule
                          );
                        }}
                        style="
                          padding: 10px 12px;
                          border: 1px solid var(--divider-color);
                          border-radius: 6px;
                          background: var(--secondary-background-color);
                          color: var(--primary-text-color);
                          font-size: 14px;
                          transition: border-color 0.2s ease;
                        "
                      />

                      <!-- Series Color (below name) -->
                      <div style="margin-top: 4px;">
                        <ultra-color-picker
                          .value=${entity.color || this._getDefaultColor(index)}
                          @value-changed=${(e: CustomEvent) => {
                            this._updateEntity(
                              graphsModule,
                              index,
                              { color: e.detail.value },
                              updateModule
                            );
                          }}
                          style="width: 100%; height: 40px;"
                        ></ultra-color-picker>
                      </div>

                      <!-- Primary entity toggle -->
                      <label
                        style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px; background: var(--primary-background-color);"
                      >
                        <ha-switch
                          .checked=${entity.is_primary === true ||
                          (index === 0 && !(graphsModule.entities || []).some(en => en.is_primary))}
                          @change=${(e: Event) => {
                            const target = e.target as any;
                            const entities = graphsModule.entities || [];
                            let updated;
                            if (target.checked) {
                              // Selecting this one makes it the only primary
                              updated = entities.map((en, i) => ({
                                ...en,
                                is_primary: i === index,
                              }));
                            } else {
                              // Prevent turning off the last primary
                              const othersHavePrimary = entities.some(
                                (en, i) => i !== index && en.is_primary
                              );
                              if (!othersHavePrimary) {
                                // Revert to checked to ensure at least one primary exists
                                updated = entities.map((en, i) => ({
                                  ...en,
                                  is_primary: i === index,
                                }));
                              } else {
                                updated = entities.map((en, i) =>
                                  i === index ? { ...en, is_primary: false } : en
                                );
                              }
                            }
                            updateModule({ entities: updated });
                          }}
                        ></ha-switch>
                        <span style="font-size:13px; color: var(--primary-text-color);"
                          >${localize(
                            'editor.graphs.entity.use_as_card_info',
                            lang,
                            'Use as card info'
                          )}</span
                        >
                      </label>
                    </div>

                    <!-- Advanced Options (Collapsible) -->
                    <div
                      class="entity-advanced-options"
                      style="
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.3s ease, opacity 0.2s ease;
                        opacity: 0;
                        border-top: none;
                        margin-top: 0;
                      "
                    >
                      <div style="padding-top: 16px; display: grid; gap: 16px;">
                        <!-- Attribute Selection (History Mode) -->
                        ${graphsModule.data_source !== 'forecast'
                          ? FormUtils.renderField(
                              localize('editor.graphs.entity.attribute', lang, 'Attribute'),
                              localize(
                                'editor.graphs.entity.attribute_desc',
                                lang,
                                'Use entity state or select a specific attribute to track.'
                              ),
                              hass,
                              { attribute: entity.attribute || '' },
                              [
                                FormUtils.createSchemaItem('attribute', {
                                  select: {
                                    options: [
                                      {
                                        value: '',
                                        label: localize(
                                          'editor.graphs.entity.state_default',
                                          lang,
                                          'State (default)'
                                        ),
                                      },
                                      ...this._getEntityAttributes(entity.entity, hass),
                                    ],
                                    mode: 'dropdown',
                                  },
                                }),
                              ],
                              (e: CustomEvent) => {
                                this._updateEntity(
                                  graphsModule,
                                  index,
                                  { attribute: e.detail.value.attribute },
                                  updateModule
                                );
                              }
                            )
                          : ''}

                        <!-- Line Chart Specific Options -->
                        ${['line', 'area'].includes(graphsModule.chart_type)
                          ? html`
                              <div
                                style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
                              >
                                <label
                                  style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                                >
                                  <ha-switch
                                    .checked=${entity.show_points !== false}
                                    @change=${(e: Event) => {
                                      const target = e.target as any;
                                      this._updateEntity(
                                        graphsModule,
                                        index,
                                        { show_points: target.checked },
                                        updateModule
                                      );
                                    }}
                                  ></ha-switch>
                                  <span style="font-size: 13px; color: var(--primary-text-color);"
                                    >${localize(
                                      'editor.graphs.line.show_points',
                                      lang,
                                      'Show Points'
                                    )}</span
                                  >
                                </label>

                                <label
                                  style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                                >
                                  <ha-switch
                                    .checked=${entity.fill_area === true}
                                    @change=${(e: Event) => {
                                      const target = e.target as any;
                                      this._updateEntity(
                                        graphsModule,
                                        index,
                                        { fill_area: target.checked },
                                        updateModule
                                      );
                                    }}
                                  ></ha-switch>
                                  <span style="font-size: 13px; color: var(--primary-text-color);"
                                    >${localize(
                                      'editor.graphs.line.fill_area',
                                      lang,
                                      'Fill Area'
                                    )}</span
                                  >
                                </label>
                              </div>

                              <!-- Line Width and Style -->
                              <div
                                style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"
                              >
                                <div>
                                  <label
                                    style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                                  >
                                    ${localize(
                                      'editor.graphs.line.line_width',
                                      lang,
                                      'Line Width'
                                    )}:
                                    ${entity.line_width || 2}px
                                  </label>
                                  <input
                                    type="range"
                                    min="1"
                                    max="8"
                                    step="1"
                                    .value=${entity.line_width || 2}
                                    @input=${(e: Event) => {
                                      const target = e.target as HTMLInputElement;
                                      this._updateEntity(
                                        graphsModule,
                                        index,
                                        { line_width: parseInt(target.value) },
                                        updateModule
                                      );
                                    }}
                                    style="
                                      width: 100%;
                                      height: 4px;
                                      background: var(--divider-color);
                                      border-radius: 2px;
                                      outline: none;
                                      -webkit-appearance: none;
                                    "
                                  />
                                </div>

                                ${this.renderFieldSection(
                                  localize('editor.graphs.line.line_style', lang, 'Line Style'),
                                  '',
                                  hass,
                                  { line_style: entity.line_style || 'solid' },
                                  [
                                    this.selectField('line_style', [
                                      {
                                        value: 'solid',
                                        label: localize(
                                          'editor.graphs.line_styles.solid',
                                          lang,
                                          'Solid'
                                        ),
                                      },
                                      {
                                        value: 'dashed',
                                        label: localize(
                                          'editor.graphs.line_styles.dashed',
                                          lang,
                                          'Dashed'
                                        ),
                                      },
                                      {
                                        value: 'dotted',
                                        label: localize(
                                          'editor.graphs.line_styles.dotted',
                                          lang,
                                          'Dotted'
                                        ),
                                      },
                                    ]),
                                  ],
                                  (e: CustomEvent) => {
                                    const next = e.detail.value.line_style;
                                    const prev = entity.line_style || 'solid';
                                    if (next === prev) return;
                                    this._updateEntity(
                                      graphsModule,
                                      index,
                                      { line_style: next },
                                      updateModule
                                    );
                                    // Trigger re-render to update dropdown UI
                                    setTimeout(() => {
                                      this.triggerPreviewUpdate();
                                    }, 50);
                                  }
                                )}
                              </div>
                            `
                          : ''}
                        ${['pie', 'donut'].includes(graphsModule.chart_type)
                          ? html`
                              <label
                                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                              >
                                <ha-switch
                                  .checked=${entity.label_show_name !== false}
                                  @change=${(e: Event) => {
                                    const target = e.target as any;
                                    this._updateEntity(
                                      graphsModule,
                                      index,
                                      { label_show_name: target.checked },
                                      updateModule
                                    );
                                  }}
                                ></ha-switch>
                                <span style="font-size: 13px; color: var(--primary-text-color);"
                                  >${localize(
                                    'editor.graphs.pie.show_title',
                                    lang,
                                    'Show Title in Slice'
                                  )}</span
                                >
                              </label>
                              <label
                                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--secondary-background-color);"
                              >
                                <ha-switch
                                  .checked=${entity.label_show_value !== false}
                                  @change=${(e: Event) => {
                                    const target = e.target as any;
                                    this._updateEntity(
                                      graphsModule,
                                      index,
                                      { label_show_value: target.checked },
                                      updateModule
                                    );
                                  }}
                                ></ha-switch>
                                <span style="font-size: 13px; color: var(--primary-text-color);"
                                  >${localize(
                                    'editor.graphs.pie.show_value',
                                    lang,
                                    'Show Value in Slice'
                                  )}</span
                                >
                              </label>
                            `
                          : ''}
                      </div>
                    </div>

                    <!-- Expand/Collapse Button -->
                    <div style="display:flex; justify-content:center; margin-top: 12px;">
                      <ha-button
                        @click=${(e: Event) => this._toggleEntityOptions(e, index)}
                        style="--mdc-theme-primary: var(--secondary-text-color); background: transparent;"
                      >
                        <span style="display:inline-flex; align-items:center; gap:6px;">
                          <ha-icon
                            icon="mdi:chevron-down"
                            class="entity-toggle-btn"
                            style="--mdc-icon-size:20px;"
                          ></ha-icon>
                          <span
                            >${localize(
                              'editor.graphs.entity.expand_options',
                              lang,
                              'Expand Options'
                            )}</span
                          >
                        </span>
                      </ha-button>
                    </div>
                  </div>
                </div>
              `
            ) || ''}
            ${(graphsModule.entities?.length || 0) === 0
              ? html`
                  <div
                    style="
                  text-align: center; 
                  padding: 40px 20px; 
                  color: var(--secondary-text-color); 
                  background: var(--primary-background-color); 
                  border-radius: 8px; 
                  border: 2px dashed var(--divider-color);
                "
                  >
                    <ha-icon
                      icon="mdi:chart-line"
                      style="font-size: 48px; margin-bottom: 12px; opacity: 0.5;"
                    ></ha-icon>
                    <div style="font-size: 16px; margin-bottom: 4px; font-weight: 500;">
                      ${localize(
                        'editor.graphs.data_sources.no_entities',
                        lang,
                        'No entities added'
                      )}
                    </div>
                    <div style="font-size: 14px; opacity: 0.7;">
                      ${localize(
                        'editor.graphs.data_sources.add_first_entity',
                        lang,
                        'Add your first entity to create a chart'
                      )}
                    </div>
                  </div>
                `
              : ''}

            <ha-button
              @click=${() => this._addEntity(graphsModule, updateModule)}
              style="
                margin-top: 8px; 
                width: 100%;
                --mdc-theme-primary: var(--primary-color);
                --mdc-button-outline-color: var(--primary-color);
              "
            >
              <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
              ${localize('editor.graphs.data_sources.add_entity', lang, 'Add Entity')}
            </ha-button>
          </div>
        </div>

        <!-- Display Options Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
        >
          <div
            class="section-title"
            style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;"
          >
            <ha-icon icon="mdi:cog" style="color: var(--primary-color);"></ha-icon>
            ${localize('editor.graphs.display.title', lang, 'Display Options')}
          </div>

          <div style="display: grid; gap: 16px;">
            <!-- Show Graph Title Toggle -->
            <label
              style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
            >
              <ha-switch
                .checked=${(graphsModule as any).show_title !== false}
                @change=${(e: Event) => {
                  const t = e.target as any;
                  updateModule({ show_title: t.checked } as any);
                }}
              ></ha-switch>
              <span>${localize('editor.graphs.display.show_title', lang, 'Show Graph Title')}</span>
            </label>

            <!-- Show Graph Value Toggle -->
            <label
              style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
            >
              <ha-switch
                .checked=${(graphsModule as any).show_entity_value !== false}
                @change=${(e: Event) => {
                  const t = e.target as any;
                  updateModule({ show_entity_value: t.checked } as any);
                }}
              ></ha-switch>
              <span>${localize('editor.graphs.display.show_value', lang, 'Show Graph Value')}</span>
            </label>

            <!-- Chart Title -->
            ${(graphsModule as any).show_title !== false
              ? html`<div>
                  <label
                    style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                  >
                    ${localize('editor.graphs.display.chart_title', lang, 'Chart Title')}
                  </label>
                  <input
                    type="text"
                    .value=${graphsModule.title || ''}
                    placeholder="${localize(
                      'editor.graphs.display.chart_title_placeholder',
                      lang,
                      'Enter chart title'
                    )}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      updateModule({ title: target.value });
                    }}
                    style="
                      width: 100%;
                      padding: 10px 12px;
                      border: 1px solid var(--divider-color);
                      border-radius: 6px;
                      background: var(--secondary-background-color);
                      color: var(--primary-text-color);
                      font-size: 14px;
                      transition: border-color 0.2s ease;
                      box-sizing: border-box;
                    "
                  />
                </div>`
              : ''}

            <!-- Time Period (History Mode Only) -->
            ${graphsModule.data_source !== 'forecast'
              ? this.renderFieldSection(
                  localize('editor.graphs.display.time_period', lang, 'Time Period'),
                  localize(
                    'editor.graphs.display.time_period_desc',
                    lang,
                    'How much historical data to show.'
                  ),
                  hass,
                  { time_period: graphsModule.time_period },
                  [
                    this.selectField(
                      'time_period',
                      this.getTimePeriodOptions(lang, graphsModule.data_source)
                    ),
                  ],
                  (e: CustomEvent) => {
                    const newPeriod = e.detail.value.time_period;
                    const prev = graphsModule.time_period;
                    if (newPeriod === prev) return;
                    updateModule({ time_period: newPeriod });
                    delete this._historyData[graphsModule.id];
                    delete this._historyError[graphsModule.id];
                    delete this._historyLoading[graphsModule.id];
                    delete this._deferredHistoryScheduled[graphsModule.id];
                    const updated = { ...graphsModule, time_period: newPeriod } as any;
                    this._loadHistoryData(updated, hass);
                    this._triggerHistoryLoad(updated, hass);
                    this.requestUpdate();
                    // Trigger re-render to update dropdown UI
                    setTimeout(() => {
                      this.triggerPreviewUpdate();
                    }, 50);
                  }
                )
              : ''}

            <!-- Forecast Info (Forecast Mode Only) -->
            ${graphsModule.data_source === 'forecast'
              ? html`<div
                  style="padding: 12px; background: rgba(var(--rgb-primary-color), 0.08); border-radius: 8px; border-left: 3px solid var(--primary-color); margin-bottom: 16px;"
                >
                  <div style="font-size: 13px; color: var(--primary-text-color); font-weight: 500;">
                    ${localize('editor.graphs.forecast_info.title', lang, 'Forecast Display')}
                  </div>
                  <div
                    style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >
                    ${localize(
                      'editor.graphs.forecast_info.desc',
                      lang,
                      'Forecasts display all available data from your weather service. The forecast type (hourly/daily) determines the time range shown.'
                    )}
                  </div>
                </div>`
              : ''}

            <!-- Normalize Values Toggle (only show when multiple entities) -->
            ${(graphsModule.entities?.filter(e =>
              graphsModule.data_source === 'forecast' ? e.forecast_attribute : e.entity
            ).length || 0) > 1
              ? html`
                  <div style="margin-bottom: 16px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                      <ha-switch
                        .checked=${graphsModule.normalize_values || false}
                        @change=${(e: Event) =>
                          updateModule({ normalize_values: (e.target as any).checked })}
                      ></ha-switch>
                      <span style="font-size: 14px;"
                        >${localize(
                          'editor.graphs.display.normalize_values',
                          lang,
                          'Normalize values to same scale'
                        )}</span
                      >
                    </label>
                    <div
                      style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px; margin-left: 40px;"
                    >
                      ${localize(
                        'editor.graphs.display.normalize_desc',
                        lang,
                        'Useful when comparing entities with different units (e.g., % vs miles)'
                      )}
                    </div>
                  </div>
                `
              : ''}

            <!-- Chart Height -->
            <div>
              <label
                style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
              >
                ${localize('editor.graphs.display.chart_height', lang, 'Chart Height')}
              </label>
              <div
                style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center;"
              >
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="5"
                  .value=${graphsModule.chart_height ?? 345}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const val = parseInt(target.value);
                    updateModule({ chart_height: val });
                  }}
                  style="
                    width: 100%;
                    height: 4px;
                    background: var(--divider-color);
                    border-radius: 2px;
                    outline: none;
                    -webkit-appearance: none;
                  "
                />
                <span
                  style="font-size: 13px; color: var(--secondary-text-color); min-width: 56px; text-align: right;"
                  >${graphsModule.chart_height ?? 345}px</span
                >
                <button
                  @click=${() => updateModule({ chart_height: 345 })}
                  title="${localize(
                    'editor.fields.reset_default_value',
                    lang,
                    'Reset to default ({value})'
                  ).replace('{value}', '345px')}"
                  style="
                    width: 32px;
                    height: 32px;
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
                  "
                  @mouseenter=${(e: Event) => {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.background = 'var(--primary-color)';
                    btn.style.color = 'var(--text-primary-color)';
                    btn.style.borderColor = 'var(--primary-color)';
                  }}
                  @mouseleave=${(e: Event) => {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.background = 'var(--secondary-background-color)';
                    btn.style.color = 'var(--primary-text-color)';
                    btn.style.borderColor = 'var(--divider-color)';
                  }}
                >
                  <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                </button>
              </div>
            </div>

            <!-- Chart Width (%) -->
            <div>
              <label
                style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
              >
                ${localize('editor.graphs.display.chart_width', lang, 'Chart Width (%)')}
              </label>
              <div
                style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center;"
              >
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  .value=${(graphsModule as any).chart_width_percent ?? 100}
                  @input=${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    const val = Math.max(10, Math.min(100, parseInt(target.value)));
                    updateModule({ chart_width_percent: val } as any);
                  }}
                  style="
                    width: 100%;
                    height: 4px;
                    background: var(--divider-color);
                    border-radius: 2px;
                    outline: none;
                    -webkit-appearance: none;
                  "
                />
                <span
                  style="font-size: 13px; color: var(--secondary-text-color); min-width: 56px; text-align: right;"
                  >${(graphsModule as any).chart_width_percent ?? 100}%</span
                >
                <button
                  @click=${() => updateModule({ chart_width_percent: 100 } as any)}
                  title="Reset to default (100%)"
                  style="
                    width: 32px;
                    height: 32px;
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
                  "
                  @mouseenter=${(e: Event) => {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.background = 'var(--primary-color)';
                    btn.style.color = 'var(--text-primary-color)';
                    btn.style.borderColor = 'var(--primary-color)';
                  }}
                  @mouseleave=${(e: Event) => {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.background = 'var(--secondary-background-color)';
                    btn.style.color = 'var(--primary-text-color)';
                    btn.style.borderColor = 'var(--divider-color)';
                  }}
                >
                  <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
                </button>
              </div>
              <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
                ${localize(
                  'editor.graphs.display.chart_width_desc',
                  lang,
                  'Percentage of the available module width. Alignment controls placement.'
                )}
              </div>
            </div>
            ${this.renderFieldSection(
              localize('editor.graphs.display.info_position', lang, 'Info Position'),
              localize(
                'editor.graphs.display.info_position_desc',
                lang,
                'Position of the overlay showing the name/value.'
              ),
              hass,
              { info_position: graphsModule.info_position || 'top_left' },
              [
                this.selectField('info_position', [
                  {
                    value: 'top_left',
                    label: localize('editor.graphs.position.top_left', lang, 'Top Left'),
                  },
                  {
                    value: 'top_right',
                    label: localize('editor.graphs.position.top_right', lang, 'Top Right'),
                  },
                  {
                    value: 'bottom_left',
                    label: localize('editor.graphs.position.bottom_left', lang, 'Bottom Left'),
                  },
                  {
                    value: 'bottom_right',
                    label: localize('editor.graphs.position.bottom_right', lang, 'Bottom Right'),
                  },
                  {
                    value: 'middle',
                    label: localize('editor.graphs.position.middle', lang, 'Middle'),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.info_position;
                const prev = graphsModule.info_position || 'top_left';
                if (next === prev) return;
                updateModule({ info_position: next });
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              }
            )}

            <!-- Legend Position -->
            ${graphsModule.show_legend !== false
              ? this.renderFieldSection(
                  localize('editor.graphs.display.legend_position', lang, 'Legend Position'),
                  localize(
                    'editor.graphs.display.legend_position_desc',
                    lang,
                    'Where to place the legend when enabled.'
                  ),
                  hass,
                  { legend_position: graphsModule.legend_position || 'bottom_left' },
                  [
                    this.selectField('legend_position', [
                      {
                        value: 'bottom_left',
                        label: localize('editor.graphs.position.bottom_left', lang, 'Bottom Left'),
                      },
                      {
                        value: 'bottom_right',
                        label: localize(
                          'editor.graphs.position.bottom_right',
                          lang,
                          'Bottom Right'
                        ),
                      },
                      {
                        value: 'top_left',
                        label: localize('editor.graphs.position.top_left', lang, 'Top Left'),
                      },
                      {
                        value: 'top_right',
                        label: localize('editor.graphs.position.top_right', lang, 'Top Right'),
                      },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const next = e.detail.value.legend_position;
                    const prev = graphsModule.legend_position || 'bottom_left';
                    if (next === prev) return;
                    updateModule({ legend_position: next });
                    // Trigger re-render to update dropdown UI
                    setTimeout(() => {
                      this.triggerPreviewUpdate();
                    }, 50);
                  }
                )
              : ''}

            <!-- Chart Alignment -->
            ${this.renderFieldSection(
              localize('editor.graphs.display.chart_alignment', lang, 'Chart Alignment'),
              localize(
                'editor.graphs.display.chart_alignment_desc',
                lang,
                'Alignment of the chart within its container.'
              ),
              hass,
              { chart_alignment: (graphsModule as any).chart_alignment || 'center' },
              [
                this.selectField('chart_alignment', [
                  {
                    value: 'left',
                    label: localize('editor.graphs.position.left', lang, 'Left'),
                  },
                  {
                    value: 'center',
                    label: localize('editor.graphs.position.center', lang, 'Center'),
                  },
                  {
                    value: 'right',
                    label: localize('editor.graphs.position.right', lang, 'Right'),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.chart_alignment;
                const prev = (graphsModule as any).chart_alignment || 'center';
                if (next === prev) return;
                updateModule({ chart_alignment: next } as any);
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              }
            )}

            <!-- Background Color -->
            <div>
              <label
                style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
              >
                ${localize('editor.graphs.display.background_color', lang, 'Background Color')}
              </label>
              <ultra-color-picker
                .value=${graphsModule.background_color || 'transparent'}
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ background_color: e.detail.value });
                }}
                style="width: 100%; height: 40px;"
              ></ultra-color-picker>
            </div>

            <!-- Chart Options -->
            <label
              style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 8px;"
              >${localize('editor.graphs.display.chart_options', lang, 'Chart Options')}</label
            >
            <div
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;"
            >
              <label
                style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
              >
                <ha-switch
                  .checked=${graphsModule.show_legend !== false}
                  @change=${(e: Event) => {
                    const t = e.target as any;
                    updateModule({ show_legend: t.checked });
                  }}
                ></ha-switch>
                <span>${localize('editor.graphs.display.show_legend', lang, 'Show Legend')}</span>
              </label>
              ${graphsModule.chart_type === 'line'
                ? html`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${graphsModule.show_grid !== false}
                      @change=${(e: Event) => {
                        const t = e.target as any;
                        updateModule({ show_grid: t.checked });
                      }}
                    ></ha-switch>
                    <span>${localize('editor.graphs.display.show_grid', lang, 'Show Grid')}</span>
                  </label>`
                : ''}
              ${graphsModule.chart_type === 'line' && graphsModule.show_grid !== false
                ? html`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${(graphsModule as any).show_grid_values !== false}
                      @change=${(e: Event) => {
                        const t = e.target as any;
                        updateModule({ show_grid_values: t.checked } as any);
                      }}
                    ></ha-switch>
                    <span
                      >${localize(
                        'editor.graphs.display.show_grid_values',
                        lang,
                        'Show Grid Values'
                      )}</span
                    >
                  </label>`
                : ''}
              ${['pie', 'donut'].includes(graphsModule.chart_type)
                ? html`
                    <label
                      style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                    >
                      <ha-switch
                        .checked=${Number((graphsModule as any).slice_gap || 0) > 0}
                        @change=${(e: Event) => {
                          const t = e.target as any;
                          // Use a responsive default (approx 2–4 degrees depending on count)
                          const entitiesCount = (graphsModule.entities || []).filter(
                            en => en?.entity
                          ).length;
                          const computed = Math.max(
                            2,
                            Math.min(4, Math.round(360 / Math.max(entitiesCount * 30, 1)))
                          );
                          updateModule({ slice_gap: t.checked ? computed : 0 } as any);
                        }}
                      ></ha-switch>
                      <span
                        >${localize(
                          'editor.graphs.display.add_slice_gap',
                          lang,
                          'Add Slice Gap'
                        )}</span
                      >
                    </label>
                  `
                : ''}
              ${graphsModule.chart_type === 'line'
                ? html`
                    <label
                      style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                    >
                      <ha-switch
                        .checked=${graphsModule.smooth_curves !== false}
                        @change=${(e: Event) => {
                          const t = e.target as any;
                          updateModule({ smooth_curves: t.checked });
                        }}
                      ></ha-switch>
                      <span
                        >${localize(
                          'editor.graphs.display.smooth_lines',
                          lang,
                          'Smooth Lines'
                        )}</span
                      >
                    </label>
                  `
                : ''}
              ${graphsModule.chart_type === 'line'
                ? html`<label
                    style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px; border-radius:6px;"
                  >
                    <ha-switch
                      .checked=${graphsModule.show_tooltips !== false}
                      @change=${(e: Event) => {
                        const t = e.target as any;
                        updateModule({ show_tooltips: t.checked });
                      }}
                    ></ha-switch>
                    <span
                      >${localize(
                        'editor.graphs.display.show_tooltips',
                        lang,
                        'Show Tooltips'
                      )}</span
                    >
                  </label>`
                : ''}
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
    const graphsModule = module as GraphsModule;
    // Use shared global actions tab for consistency
    return GlobalActionsTab.render(graphsModule as any, hass, updates =>
      updateModule(updates as any)
    );
  }

  renderPreview(module: CardModule, hass: HomeAssistant, config?: UltraCardConfig): TemplateResult {
    const graphsModule = module as GraphsModule;
    const moduleWithDesign = graphsModule as any;
    const designProperties = (graphsModule as any).design || {};

    // Apply template if enabled
    if (graphsModule.template_mode && graphsModule.template) {
      if (!this._templateService) {
        this._templateService = new TemplateService(hass);
      }
      // Template evaluation would be async, handle in chart rendering
    }

    // Trigger history data loading
    this._loadHistoryData(graphsModule, hass);

    // Resolve text styles (global design overrides module)
    const resolvedTextColor =
      designProperties.color || moduleWithDesign.color || 'var(--primary-text-color)';
    const resolvedFontSize = (() => {
      const fontSize = designProperties.font_size || moduleWithDesign.font_size;
      if (fontSize && typeof fontSize === 'string' && fontSize.trim() !== '') {
        // If it already has units, use as-is; otherwise add px
        if (/[a-zA-Z%]/.test(fontSize)) {
          return fontSize;
        }
        return `${fontSize}px`;
      }
      return undefined;
    })();
    const resolvedFontFamily =
      designProperties.font_family || moduleWithDesign.font_family || undefined;
    const resolvedFontWeight =
      designProperties.font_weight || moduleWithDesign.font_weight || undefined;
    const resolvedTextTransform =
      designProperties.text_transform || moduleWithDesign.text_transform || undefined;
    const resolvedFontStyle =
      designProperties.font_style || moduleWithDesign.font_style || undefined;
    const resolvedLetterSpacing =
      designProperties.letter_spacing || moduleWithDesign.letter_spacing || undefined;
    const resolvedLineHeight =
      designProperties.line_height || moduleWithDesign.line_height || undefined;
    const resolvedTextShadow = (() => {
      const h = designProperties.text_shadow_h || moduleWithDesign.text_shadow_h;
      const v = designProperties.text_shadow_v || moduleWithDesign.text_shadow_v;
      const b = designProperties.text_shadow_blur || moduleWithDesign.text_shadow_blur;
      const c = designProperties.text_shadow_color || moduleWithDesign.text_shadow_color;
      if (h || v || b || c) {
        return `${h || '0px'} ${v || '0px'} ${b || '0px'} ${c || 'rgba(0,0,0,0.2)'}`;
      }
      return undefined;
    })();
    const resolvedBackgroundColor =
      designProperties.background_color || moduleWithDesign.background_color;

    // Helper to compose a CSS text style string
    const composeTextStyle = (base: { color?: string; fontSize?: string } = {}) => {
      const parts: string[] = [];
      const color = base.color || resolvedTextColor;
      if (color) parts.push(`color: ${color}`);
      const fontSize = base.fontSize || resolvedFontSize;
      if (fontSize) parts.push(`font-size: ${fontSize}`);
      if (resolvedFontFamily) parts.push(`font-family: ${resolvedFontFamily}`);
      if (resolvedFontWeight) parts.push(`font-weight: ${resolvedFontWeight}`);
      if (resolvedTextTransform) parts.push(`text-transform: ${resolvedTextTransform}`);
      if (resolvedFontStyle) parts.push(`font-style: ${resolvedFontStyle}`);
      if (resolvedLetterSpacing) parts.push(`letter-spacing: ${resolvedLetterSpacing}`);
      if (resolvedLineHeight) parts.push(`line-height: ${resolvedLineHeight}`);
      if (resolvedTextShadow) parts.push(`text-shadow: ${resolvedTextShadow}`);
      return parts.join('; ');
    };

    // Container styles for positioning and effects - design has priority
    let containerStyles = {
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
          : '0',
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
      background:
        designProperties.background_color && designProperties.background_color !== 'transparent'
          ? designProperties.background_color
          : moduleWithDesign.background_color && moduleWithDesign.background_color !== 'transparent'
            ? moduleWithDesign.background_color
            : 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      backdropFilter: designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || '',
      border: designProperties.border_style
        ? `${designProperties.border_width || '1px'} ${designProperties.border_style} ${designProperties.border_color || 'var(--divider-color)'}`
        : this.getBorderCSS(moduleWithDesign),
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      width: designProperties.width || moduleWithDesign.width || '100%',
      height: designProperties.height || moduleWithDesign.height || '',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || '',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || '',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || '',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || '',
      overflow: designProperties.overflow || moduleWithDesign.overflow || '',
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || '',
      position: designProperties.position || moduleWithDesign.position || '',
      top: designProperties.top || moduleWithDesign.top || '',
      right: designProperties.right || moduleWithDesign.right || '',
      bottom: designProperties.bottom || moduleWithDesign.bottom || '',
      left: designProperties.left || moduleWithDesign.left || '',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || '',
      boxShadow:
        designProperties.box_shadow_h ||
        designProperties.box_shadow_v ||
        designProperties.box_shadow_blur ||
        designProperties.box_shadow_spread ||
        designProperties.box_shadow_color
          ? `${designProperties.box_shadow_h || '0px'} ${designProperties.box_shadow_v || '0px'} ${designProperties.box_shadow_blur || '0px'} ${designProperties.box_shadow_spread || '0px'} ${designProperties.box_shadow_color || 'rgba(0,0,0,0.2)'}`
          : '',
      boxSizing: 'border-box',
      display: 'block',
    } as Record<string, string>;
    if ((graphsModule as any).chart_type === 'line') {
      containerStyles.padding = '0';
    }

    // Check if we have entities configured
    const hasEntities =
      graphsModule.entities &&
      graphsModule.entities.length > 0 &&
      (graphsModule.data_source === 'forecast'
        ? graphsModule.entities.some(e => e.forecast_attribute)
        : graphsModule.entities.some(e => e.entity));

    if (!hasEntities) {
      const resolvedBgColor = resolvedBackgroundColor;
      return html`
        <div class="uc-graphs-module" style="${this.styleObjectToCss(containerStyles)}">
          <div
            class="chart-placeholder"
            style="
              height: ${Math.min(
              200,
              typeof graphsModule.chart_height === 'number'
                ? graphsModule.chart_height
                : parseInt(String(graphsModule.chart_height)) || 160
            )}px;
              background: ${this._formatColor(resolvedBgColor) || 'rgba(0, 0, 0, 0.2)'};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            ${composeTextStyle({ color: resolvedTextColor })};
            font-size: 14px;
          "
          >
            <div style="text-align: center;">
              <ha-icon icon="mdi:chart-line" style="font-size: 48px; opacity: 0.5;"></ha-icon>
              <div style="margin-top: 8px;">No entities configured</div>
              <div style="font-size: 12px; opacity: 0.7;">Add entities to display chart</div>
            </div>
          </div>
        </div>
      `;
    }

    // Primary entity for header details
    const primaryCfg =
      graphsModule.entities.find(e => e.is_primary && e.entity) ||
      graphsModule.entities.find(e => e.entity);
    const firstState = primaryCfg ? hass.states[primaryCfg.entity] : undefined;
    const primaryName =
      graphsModule.title ||
      primaryCfg?.name ||
      firstState?.attributes?.friendly_name ||
      'Chart Title';
    const primaryUnit =
      (primaryCfg?.attribute
        ? firstState?.attributes?.unit_of_measurement
        : firstState?.attributes?.unit_of_measurement) || '';
    const primaryValueRaw = primaryCfg
      ? primaryCfg.attribute
        ? (firstState?.attributes as any)?.[primaryCfg.attribute]
        : firstState?.state
      : undefined;
    const primaryValue =
      typeof primaryValueRaw === 'number' ? primaryValueRaw : parseFloat(primaryValueRaw);

    // Generate simple preview chart (or use forecast data for legend)
    let chartData = this._prepareSimpleChartData(graphsModule, hass);

    // In forecast mode, prepare chart data from stored forecast data for legend
    if (graphsModule.data_source === 'forecast' && this._historyData[graphsModule.id]) {
      const forecastData = this._historyData[graphsModule.id];
      chartData = forecastData.datasets.map((dataset: any) => ({
        name: dataset.name,
        value: dataset.values[dataset.values.length - 1] || 0, // Use last value
        color: dataset.color,
        unit: dataset.unit,
        entityId: dataset.entityId,
      }));
    }

    const headerPos = graphsModule.info_position || 'top_left';
    const showGridValues =
      graphsModule.chart_type === 'line' &&
      graphsModule.show_grid !== false &&
      (graphsModule as any).show_grid_values !== false;
    // Only add extra padding when grid values are shown AND position is on the left side
    const leftPadding = showGridValues ? '32px' : '16px';
    const posMap: Record<string, string> = {
      top_left: `top:12px; left:${leftPadding}; text-align:left;`,
      top_right: 'top:12px; right:16px; text-align:right;',
      bottom_left: `bottom:12px; left:${leftPadding}; text-align:left;`,
      bottom_right: 'bottom:12px; right:16px; text-align:right;',
      middle: 'top:50%; left:50%; transform: translate(-50%, -50%); text-align:center;',
    };
    const headerDisplay = (() => {
      if (!primaryCfg || !firstState) return '';
      try {
        const stateForFormat =
          primaryValueRaw !== undefined ? String(primaryValueRaw) : firstState.state;
        return formatEntityState(hass, primaryCfg.entity!, {
          state: stateForFormat,
          includeUnit: true,
        });
      } catch (_e) {
        return `${isNaN(primaryValue) ? '' : primaryValue}${primaryUnit ? ` ${primaryUnit}` : ''}`;
      }
    })();

    const header = ['pie', 'donut'].includes((graphsModule as any).chart_type)
      ? html``
      : html`
          <div
            class="graph-header-info"
            style="
              position:absolute; 
              ${posMap[headerPos]}; 
              pointer-events:none; 
              z-index:2;
              max-width: calc(100% - 32px);
              box-sizing: border-box;
              overflow: hidden;
            "
          >
            ${(graphsModule as any).show_display_name !== false &&
            (graphsModule as any).show_title !== false
              ? html`<div
                  class="graph-title"
                  style="
                    ${composeTextStyle({
                    fontSize: resolvedFontSize || '18px',
                  })}; 
                    font-weight: 600; 
                    ${designProperties.text_align
                    ? `text-align:${designProperties.text_align};`
                    : ''};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  ${primaryName}
                </div>`
              : ''}
            ${(graphsModule as any).show_entity_value !== false
              ? html`<div
                  class="graph-value"
                  style="
                    ${composeTextStyle({
                    fontSize: resolvedFontSize || '28px',
                  })}; 
                    line-height: 1.1; 
                    font-weight: 600; 
                    margin-top: 6px; 
                    ${designProperties.text_align
                    ? `text-align:${designProperties.text_align};`
                    : ''};
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  ${headerDisplay}
                </div>`
              : ''}
          </div>
        `;

    const currentData = this._historyData[graphsModule.id];
    // Show loader only if we have no data to display yet
    const isLoading = this._historyLoading[graphsModule.id] === true && !currentData;
    const containerBgImage = this.getBackgroundImageCSS(
      { ...moduleWithDesign, ...designProperties },
      hass
    );
    const align = ((graphsModule as any).chart_alignment || 'center') as
      | 'left'
      | 'center'
      | 'right';
    const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
    const chartWidthCss = this._resolveChartWidth(graphsModule);
    const content = html`
      <div
        class="uc-graphs-module"
        style="
          ${this.styleObjectToCss(containerStyles)};
          position: relative;
          overflow: hidden;
          contain: layout style;
        "
      >
        <uc-preview-container
          .alignment=${(graphsModule as any).chart_alignment || 'center'}
          .height=${typeof graphsModule.chart_height === 'number'
            ? graphsModule.chart_height
            : parseInt(String(graphsModule.chart_height)) || 200}
        >
          <div
            style="
            display:flex; 
            width:100%; 
            height:100%;
            justify-content:${justify};
            overflow:hidden;
            box-sizing:border-box;
          "
          >
            <div
              style="
              width:${chartWidthCss}; 
              max-width:100%;
              height:100%;
              position:relative;
              overflow:hidden;
              box-sizing:border-box;
            "
            >
              ${this._renderSimpleChart(
                graphsModule,
                chartData,
                hass,
                // Pass composed text style so inner labels use global design
                (() => {
                  const moduleWithDesign = graphsModule as any;
                  const designProperties = (graphsModule as any).design || {};
                  const resolvedTextColor =
                    designProperties.color || moduleWithDesign.color || 'var(--primary-text-color)';
                  const parts: string[] = [];
                  if (resolvedTextColor) parts.push(`color: ${resolvedTextColor}`);
                  if (designProperties.font_size || moduleWithDesign.font_size)
                    parts.push(
                      `font-size: ${designProperties.font_size || moduleWithDesign.font_size}`
                    );
                  if (designProperties.font_family || moduleWithDesign.font_family)
                    parts.push(
                      `font-family: ${designProperties.font_family || moduleWithDesign.font_family}`
                    );
                  if (designProperties.font_weight || moduleWithDesign.font_weight)
                    parts.push(
                      `font-weight: ${designProperties.font_weight || moduleWithDesign.font_weight}`
                    );
                  if (designProperties.text_transform || moduleWithDesign.text_transform)
                    parts.push(
                      `text-transform: ${designProperties.text_transform || moduleWithDesign.text_transform}`
                    );
                  if (designProperties.font_style || moduleWithDesign.font_style)
                    parts.push(
                      `font-style: ${designProperties.font_style || moduleWithDesign.font_style}`
                    );
                  if (designProperties.letter_spacing || moduleWithDesign.letter_spacing)
                    parts.push(
                      `letter-spacing: ${designProperties.letter_spacing || moduleWithDesign.letter_spacing}`
                    );
                  if (designProperties.line_height || moduleWithDesign.line_height)
                    parts.push(
                      `line-height: ${designProperties.line_height || moduleWithDesign.line_height}`
                    );
                  return parts.join('; ');
                })(),
                align
              )}
            </div>
          </div>
        </uc-preview-container>
        ${header}
        ${graphsModule.show_legend !== false
          ? this._renderLegend(
              chartData,
              (graphsModule.legend_position || 'bottom_left') as
                | 'top_left'
                | 'top_right'
                | 'bottom_left'
                | 'bottom_right',
              composeTextStyle({})
            )
          : ''}
        ${isLoading
          ? html`<div
              style="
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                background: linear-gradient(
                  to bottom,
                  rgba(0,0,0,0.18),
                  rgba(0,0,0,0.12)
                );
              "
            >
              <div
                style="
                  background: rgba(0,0,0,0.35);
                  backdrop-filter: blur(2px);
                  border: 1px solid var(--divider-color);
                  border-radius: 10px;
                  padding: 10px 14px;
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  color: var(--secondary-text-color);
                  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                "
              >
                <ha-circular-progress active size="small"></ha-circular-progress>
                <span style="font-size: 13px;">Loading history…</span>
              </div>
            </div>`
          : ''}
      </div>
    `;

    // Get hover effect configuration from module design
    const hoverEffect = (graphsModule as any).design?.hover_effect;
    const hoverEffectClass = UcHoverEffectsService.getHoverEffectClass(hoverEffect);

    // Wrap in clickable div if has active links
    return this.hasActiveLink(graphsModule)
      ? html`<div
          class="graphs-module-clickable ${hoverEffectClass}"
          style="cursor: pointer; transition: all 0.2s ease; border-radius: 4px;"
          @click=${(e: Event) => this.handleClick(e, graphsModule, hass)}
          @dblclick=${(e: Event) => this.handleDoubleClick(e, graphsModule, hass)}
          @mousedown=${(e: Event) => this.handleMouseDown(e, graphsModule, hass)}
          @mouseup=${(e: Event) => this.handleMouseUp(e, graphsModule, hass)}
          @mouseleave=${(e: Event) => this.handleMouseLeave(e, graphsModule, hass)}
          @touchstart=${(e: Event) => this.handleTouchStart(e, graphsModule, hass)}
          @touchend=${(e: Event) => this.handleTouchEnd(e, graphsModule, hass)}
        >
          ${content}
        </div>`
      : hoverEffectClass
        ? html`<div class="graphs-module-container ${hoverEffectClass}">${content}</div>`
        : content;
  }

  private _prepareSimpleChartData(module: GraphsModule, hass: HomeAssistant): any[] {
    const data = [];

    for (let i = 0; i < module.entities.length; i++) {
      const entityConfig = module.entities[i];
      if (!entityConfig.entity) continue;

      const entityState = hass.states[entityConfig.entity];
      if (!entityState) continue;

      const value = entityConfig.attribute
        ? entityState.attributes[entityConfig.attribute]
        : entityState.state;

      const numValue = parseFloat(value);

      data.push({
        name: entityConfig.name || entityState.attributes.friendly_name || entityConfig.entity,
        value: isNaN(numValue) ? 0 : numValue,
        color: this._formatColor(entityConfig.color) || this._getDefaultColor(i),
        unit: entityState.attributes.unit_of_measurement || '',
        lineWidth: entityConfig.line_width ?? 2,
        showPoints: entityConfig.show_points !== false,
        fillArea: entityConfig.fill_area === true,
        lineStyle: entityConfig.line_style || 'solid',
        entityId: entityConfig.entity,
      });
    }

    return data;
  }

  private _formatColor(color: any): string {
    if (!color) return this._getDefaultColor(0);

    // Handle array format [r, g, b]
    if (Array.isArray(color) && color.length >= 3) {
      const [r, g, b] = color;
      if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return this._getDefaultColor(0);
      }
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    // Handle hex string
    if (typeof color === 'string' && color.startsWith('#')) {
      return color;
    }

    // Handle rgb string
    if (typeof color === 'string' && color.startsWith('rgb')) {
      return color;
    }

    // Handle CSS variables and transparent
    if (typeof color === 'string' && (color.startsWith('var(') || color === 'transparent')) {
      return color;
    }

    // Handle invalid values
    if (typeof color === 'string' && color.includes('NaN')) {
      return this._getDefaultColor(0);
    }

    // Default fallback
    return this._getDefaultColor(0);
  }

  private _renderSimpleChart(
    module: GraphsModule,
    data: any[],
    hass: HomeAssistant,
    textStyle?: string,
    align?: 'left' | 'center' | 'right'
  ): TemplateResult {
    // In forecast mode, data comes from _historyData, not from _prepareSimpleChartData
    // So we skip the empty data check for forecast mode
    const hasForecastData = module.data_source === 'forecast' && this._historyData[module.id];

    if (data.length === 0 && !hasForecastData) {
      return html` <div style="color: var(--secondary-text-color);">No data available</div> `;
    }

    const chartHeight =
      (typeof module.chart_height === 'number'
        ? module.chart_height
        : parseInt(String(module.chart_height)) || 345) - 80;

    if (['pie', 'donut'].includes(module.chart_type)) {
      return this._renderPieChart(module, data, chartHeight, textStyle, hass, align);
    }

    if (['line', 'area'].includes(module.chart_type)) {
      return this._renderLineChart(module, data, chartHeight, hass);
    }

    // Default to bar chart for other types
    return this._renderBarChart(module, data, chartHeight, textStyle, hass);
  }

  private _renderPieChart(
    module: GraphsModule,
    data: any[],
    chartHeight: number,
    textStyle?: string,
    hass?: HomeAssistant,
    align?: 'left' | 'center' | 'right'
  ): TemplateResult {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const diameter = Math.max(120, Math.min(chartHeight, 260));
    const radius = diameter / 2;
    const isDonut = module.chart_type === 'donut';
    const gapDeg = Number((module as any).slice_gap) || 0;
    // For pie with gap, use a tiny inner radius so gaps are uniform from inner to outer edge
    const innerRadius = isDonut
      ? Math.floor(radius * 0.72)
      : gapDeg > 0
        ? Math.max(2, Math.floor(radius * 0.04))
        : 0;
    const ringThickness = radius - innerRadius;

    // Helper to build an SVG donut/pie slice path
    const buildSlicePath = (
      rOuter: number,
      rInner: number,
      startDeg: number,
      endDeg: number
    ): string => {
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const sxOuter = Math.cos(toRad(startDeg)) * rOuter;
      const syOuter = Math.sin(toRad(startDeg)) * rOuter;
      const exOuter = Math.cos(toRad(endDeg)) * rOuter;
      const eyOuter = Math.sin(toRad(endDeg)) * rOuter;
      const largeArc = endDeg - startDeg > 180 ? 1 : 0;
      if (rInner <= 0) {
        // Pie wedge to center
        return `M0,0 L${sxOuter},${syOuter} A${rOuter},${rOuter} 0 ${largeArc} 1 ${exOuter},${eyOuter} Z`;
      }
      // Donut segment
      const sxInner = Math.cos(toRad(endDeg)) * rInner;
      const syInner = Math.sin(toRad(endDeg)) * rInner;
      const exInner = Math.cos(toRad(startDeg)) * rInner;
      const eyInner = Math.sin(toRad(startDeg)) * rInner;
      return `M${sxOuter},${syOuter} A${rOuter},${rOuter} 0 ${largeArc} 1 ${exOuter},${eyOuter} L${sxInner},${syInner} A${rInner},${rInner} 0 ${largeArc} 0 ${exInner},${eyInner} Z`;
    };

    // Compute segments (no trimming). Gaps will be drawn as uniform separators.
    let cumulative = 0;
    const segments = data.map(d => {
      const startDeg = total > 0 ? (cumulative / total) * 360 : 0;
      const sweepDeg = total > 0 ? (d.value / total) * 360 : 0;
      const endDeg = startDeg + sweepDeg;
      cumulative += d.value;
      return {
        startDeg: startDeg,
        endDeg: endDeg,
        color: d.color,
        name: d.name,
        value: d.value,
        unit: d.unit,
        entityId: d.entityId,
      };
    });

    // Wrap SVG in inline-block so flex container alignment (left/center/right)
    // in `uc-preview-container` positions the chart correctly. Without this,
    // some browsers treat the SVG as a flex item that stretches to full width.
    const marginCss = align === 'left' ? '0 auto 0 0' : align === 'right' ? '0 0 0 auto' : '0 auto';
    return html`
      <div
        style="
        display:block;
        width:${diameter}px;
        height:${diameter}px;
        margin:${marginCss};
        overflow:hidden;
        box-sizing:border-box;
      "
      >
        <svg
          width="${diameter}"
          height="${diameter}"
          viewBox="${-radius} ${-radius} ${diameter} ${diameter}"
          style="display:block; overflow:visible;"
        >
          ${segments.map(s => {
            const path = buildSlicePath(radius, innerRadius, s.startDeg, s.endDeg);
            return svg`<path d="${path}" fill="${s.color}" stroke="none" />`;
          })}
          ${gapDeg > 0
            ? (() => {
                const sepColor = 'var(--card-background-color)';
                const toRad = (deg: number) => (deg * Math.PI) / 180;
                // Separator thickness scales with diameter
                const sepWidth = Math.max(2, Math.min(6, Math.round(diameter * 0.012)));
                return svg`${segments.map(s => {
                  const ax = Math.cos(toRad(s.startDeg));
                  const ay = Math.sin(toRad(s.startDeg));
                  const x1 = ax * (innerRadius > 0 ? innerRadius : sepWidth);
                  const y1 = ay * (innerRadius > 0 ? innerRadius : sepWidth);
                  const x2 = ax * radius;
                  const y2 = ay * radius;
                  return svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${sepColor}" stroke-width="${sepWidth}" stroke-linecap="butt" />`;
                })}`;
              })()
            : ''}
          ${''}
          ${segments.map(s => {
            const mid = (s.startDeg + s.endDeg) / 2;
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const labelRadius = isDonut
              ? innerRadius + ringThickness * 0.55
              : innerRadius > 0
                ? innerRadius + ringThickness * 0.55
                : radius * 0.55;
            let lx = Math.cos(toRad(mid)) * labelRadius;
            let ly = Math.sin(toRad(mid)) * labelRadius;

            // Constrain labels to stay within the chart bounds with padding
            const maxOffset = radius * 0.85; // Stay within 85% of radius
            if (Math.abs(lx) > maxOffset) {
              lx = Math.sign(lx) * maxOffset;
            }
            if (Math.abs(ly) > maxOffset) {
              ly = Math.sign(ly) * maxOffset;
            }

            const sliceAngle = s.endDeg - s.startDeg;
            let formatted = `${s.value}${s.unit || ''}`;
            if (hass && s.entityId) {
              try {
                formatted = formatEntityState(hass, s.entityId, {
                  state: s.value,
                  includeUnit: true,
                });
              } catch (_) {}
            }
            const entityCfg = (module.entities || []).find(
              en => en && en.entity === s.entityId
            ) as any;
            const showName = entityCfg ? entityCfg.label_show_name !== false : true;
            const showNameAfterArea = showName && sliceAngle >= 15;
            const showValue = entityCfg ? entityCfg.label_show_value !== false : true;

            // Only show labels if slice is large enough to avoid overcrowding
            const minSliceAngle = 10; // Minimum angle in degrees to show labels
            const shouldShowLabels = sliceAngle >= minSliceAngle;

            return shouldShowLabels
              ? svg`<g transform="translate(${lx}, ${ly})" style="pointer-events:none;">
              ${
                showNameAfterArea
                  ? svg`<text 
                text-anchor="middle" 
                style="${textStyle || ''}; font-size:11px; font-weight:600; fill: currentColor;"
                textLength="${Math.min(s.name.length * 7, radius * 1.2)}" 
                lengthAdjust="spacingAndGlyphs"
              >${s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name}</text>`
                  : ''
              }
              ${
                showValue
                  ? svg`<text 
                y="${showNameAfterArea ? 13 : 0}" 
                text-anchor="middle" 
                style="${textStyle || ''}; font-size:11px; fill: currentColor;"
                textLength="${Math.min(formatted.length * 6, radius * 1.0)}" 
                lengthAdjust="spacingAndGlyphs"
              >${formatted.length > 10 ? formatted.substring(0, 10) + '...' : formatted}</text>`
                  : ''
              }
            </g>`
              : svg``;
          })}
        </svg>
      </div>
    `;
  }

  private _renderLineChart(
    module: GraphsModule,
    data: any[],
    chartHeight: number,
    hass: HomeAssistant
  ): TemplateResult {
    // Check if we have real history data stored on module
    const historyData = this._historyData[module.id];
    const error = this._historyError[module.id];
    const isLoading = this._historyLoading[module.id];

    // Always show data immediately - don't block rendering with loading state

    let timePoints: string[];
    let datasets: any[];

    if (historyData) {
      // Use real history data
      timePoints = historyData.timePoints;
      datasets = historyData.datasets;
    } else {
      // Show immediate data using current entity states (like mini graphs do)
      timePoints = this._generateTimePoints(module.time_period);
      datasets = data.map((entity, index) => {
        const entityConfig = module.entities[index];

        // Create a flat line at current state value for immediate display
        const currentValue = entity.value || 0;
        const flatValues = new Array(timePoints.length).fill(currentValue);

        return {
          name: entity.name,
          color: entity.color,
          values: flatValues,
          lineWidth: entity.lineWidth,
          showPoints: entity.showPoints,
          fillArea: entity.fillArea,
          lineStyle: entity.lineStyle,
          unit: entity.unit || '',
          entityId: entity.entityId,
        };
      });
    }

    // Always apply latest visual properties (color, width, style, points, fill)
    // so style changes are instant even when values come from cache/fast-path.
    datasets = datasets.map((dataset, i) => {
      const cfg = module.entities?.[i];
      return {
        ...dataset,
        color: this._formatColor(cfg?.color) || dataset.color || this._getDefaultColor(i),
        lineWidth: cfg?.line_width ?? dataset.lineWidth ?? 2,
        showPoints: cfg?.show_points !== false,
        fillArea: cfg?.fill_area === true,
        lineStyle: cfg?.line_style || dataset.lineStyle || 'solid',
      };
    });

    // Calculate normalization if needed
    let normalizedDatasets = datasets;
    if (module.normalize_values) {
      normalizedDatasets = datasets.map(dataset => {
        const datasetMax = Math.max(...dataset.values);
        const datasetMin = Math.min(...dataset.values);
        const datasetRange = datasetMax - datasetMin || 1; // Prevent division by zero

        return {
          ...dataset,
          originalValues: dataset.values,
          values: dataset.values.map(value => ((value - datasetMin) / datasetRange) * 100),
          normalizedMin: datasetMin,
          normalizedMax: datasetMax,
        };
      });
    }

    const maxValue = Math.max(...normalizedDatasets.flatMap(d => d.values));
    const minValue = Math.min(...normalizedDatasets.flatMap(d => d.values));
    const valueRange = maxValue - minValue;

    const grid = module.show_grid !== false;
    // Get the background color - handle transparent specially
    const moduleWithDesignForBg = module as any;
    const designForBg = (module as any).design || {};
    let bgFill = designForBg.background_color || moduleWithDesignForBg.background_color;

    // If background_color is explicitly set to 'transparent', use card background
    if (bgFill === 'transparent') {
      bgFill = 'var(--card-background-color)';
    } else if (!bgFill) {
      // Default fallback
      bgFill = 'var(--card-background-color, transparent)';
    } else {
      // Format the color (handles hex, rgb, CSS vars)
      bgFill = this._formatColor(bgFill);
    }

    // Helper to optionally smooth line
    const toPath = (pts: string[]): string => {
      if (!module.smooth_curves) {
        return pts
          .map((point, i) => {
            const [x, y] = point.split(',');
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ');
      }

      // Use Catmull-Rom spline for smooth curves that pass through points
      if (pts.length < 2) {
        const [x, y] = pts[0].split(',');
        return `M ${x} ${y}`;
      }

      let path = '';
      const points = pts.map(p => {
        const [x, y] = p.split(',');
        return { x: parseFloat(x), y: parseFloat(y) };
      });

      // Start at first point
      path = `M ${points[0].x} ${points[0].y}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        // Calculate control points for cubic bezier
        const tension = 0.5;
        const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
        const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
        const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
        const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      return path;
    };

    // Add debug info for data source
    const isUsingRealData = Boolean(historyData && historyData.source === 'history');
    const dataSourceInfo = isUsingRealData ? 'Real HA History' : 'Fallback Data';

    return html`
      <div
        class="line-chart-container"
        style="
          width: 100%; 
          height: ${chartHeight}px; 
          position: relative; 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0;
          overflow: visible;
          contain: layout style;
        "
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          style="
            display: block; 
            width: 100%; 
            height: 100%; 
            margin: 0; 
            padding: 0;
            overflow: hidden;
          "
        >
          ${grid
            ? svg`${Array.from({ length: 4 }, (_, i) => {
                const y = ((i + 1) * 100) / 5; // 20,40,60,80 across full height
                const gridValue = maxValue - ((i + 1) / 5) * valueRange;
                const showValues = (module as any).show_grid_values !== false;
                return svg`
                  <line x1="0" y1="${y}" x2="300" y2="${y}" stroke="rgba(255,255,255,.08)" stroke-width="0.5" />
                  ${
                    showValues
                      ? svg`<text 
                          x="2" 
                          y="${y - 2}" 
                          font-size="8" 
                          fill="var(--secondary-text-color)" 
                          opacity="0.6"
                        >${Math.round(gridValue)}</text>`
                      : ''
                  }
                `;
              })}`
            : ''}
          ${(() => {
            const topPad = 8; // percent headroom to avoid touching top
            return normalizedDatasets.map(dataset => {
              const pathPoints = dataset.values.map((value, index) => {
                const x = (index / (timePoints.length - 1)) * 300;
                // Bottom-align with headroom: highest value at topPad, lowest at 100
                const y =
                  valueRange > 0
                    ? topPad + ((maxValue - value) / valueRange) * (100 - topPad)
                    : 100;
                return `${x},${y}`;
              });
              const pathString = toPath(pathPoints);
              const lastX = pathPoints[pathPoints.length - 1].split(',')[0];
              const fillColor = this._colorWithAlpha(dataset.color, 0.25);
              const dash =
                dataset.lineStyle === 'dashed'
                  ? '4 3'
                  : dataset.lineStyle === 'dotted'
                    ? '1 3'
                    : 'none';
              return svg`<g>
                ${dataset.fillArea === true ? svg`<path d="${pathString} L ${lastX} 100 L 0 100 Z" fill="${fillColor}" stroke="none" />` : ''}
                <path d="${pathString}" stroke="${dataset.color}" stroke-width="${dataset.lineWidth ?? 2}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dash}" />
                ${
                  dataset.showPoints !== false
                    ? svg`${dataset.values.map((value, index) => {
                        const x = (index / (timePoints.length - 1)) * 300;
                        const y =
                          valueRange > 0
                            ? topPad + ((maxValue - value) / valueRange) * (100 - topPad)
                            : 100;
                        // For dots, ensure we have a valid fill color
                        const dotFill =
                          bgFill === 'transparent' ? 'var(--card-background-color)' : bgFill;
                        const circleId = `point-${module.id}-${index}-${datasets.indexOf(dataset)}`;
                        return svg`
                          <circle 
                            id="${circleId}"
                            cx="${x}" 
                            cy="${y}" 
                            r="3" 
                            fill="${dotFill}" 
                            stroke="${dataset.color}" 
                            stroke-width="1.5"
                            style="cursor: ${module.show_tooltips !== false ? 'pointer' : 'default'};"
                            @mouseenter=${
                              module.show_tooltips !== false
                                ? (e: MouseEvent) => {
                                    const displayValue = (dataset as any).originalValues
                                      ? (dataset as any).originalValues[index]
                                      : value;
                                    let valueText = `${displayValue}${dataset.unit || ''}`;
                                    if ((dataset as any).entityId) {
                                      valueText = formatEntityState(
                                        hass,
                                        (dataset as any).entityId,
                                        {
                                          state: displayValue,
                                          includeUnit: true,
                                        }
                                      );
                                    }
                                    this._showTooltip(
                                      e,
                                      module.id,
                                      dataset.name,
                                      valueText,
                                      timePoints[index]
                                    );
                                  }
                                : null
                            }
                            @mouseleave=${module.show_tooltips !== false ? (e: MouseEvent) => this._hideTooltip(module.id, e) : null}
                          >
                            ${
                              module.show_tooltips !== false
                                ? svg`
                              <animate 
                                attributeName="r" 
                                begin="mouseenter" 
                                dur="0.2s" 
                                from="3" 
                                to="5" 
                                fill="freeze" 
                              />
                              <animate 
                                attributeName="r" 
                                begin="mouseleave" 
                                dur="0.2s" 
                                from="5" 
                                to="3" 
                                fill="freeze" 
                              />
                            `
                                : ''
                            }
                          </circle>
                        `;
                      })}`
                    : ''
                }
              </g>`;
            });
          })()}
        </svg>
      </div>
    `;
  }

  private _renderLegend(
    data: any[],
    pos: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right',
    textStyle?: string
  ): TemplateResult {
    const map: Record<string, string> = {
      top_left: 'top:8px; left:8px; justify-content:flex-start;',
      top_right: 'top:8px; right:8px; justify-content:flex-end;',
      bottom_left: 'bottom:8px; left:8px; justify-content:flex-start;',
      bottom_right: 'bottom:8px; right:8px; justify-content:flex-end;',
    };
    return html`<div
      class="graph-legend"
      style="
        position:absolute; 
        ${map[pos]}; 
        display:flex; 
        gap:8px; 
        flex-wrap:wrap; 
        font-size:12px; 
        ${textStyle || ''}; 
        z-index:2;
        max-width: calc(100% - 16px);
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      "
    >
      ${data.map(
        d =>
          html`<div
            style="
            display:flex; 
            align-items:center; 
            gap:4px;
            min-width: 0;
            flex-shrink: 1;
          "
          >
            <span
              style="
              width:10px; 
              height:10px; 
              background:${d.color}; 
              border-radius:2px;
              flex-shrink: 0;
            "
            ></span>
            <span
              style="
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              min-width: 0;
            "
              >${d.name}</span
            >
          </div>`
      )}
    </div>`;
  }

  private _colorWithAlpha(color: string, alpha: number): string {
    if (!color) return `rgba(33, 150, 243, ${alpha})`;
    if (color.startsWith('#')) {
      // Convert hex to rgba
      const hex = color.replace('#', '');
      const bigint = parseInt(
        hex.length === 3
          ? hex
              .split('')
              .map(c => c + c)
              .join('')
          : hex,
        16
      );
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    return color;
  }

  private _renderBarChart(
    module: GraphsModule,
    data: any[],
    chartHeight: number,
    textStyle?: string,
    hass?: HomeAssistant
  ): TemplateResult {
    const maxValue = Math.max(...data.map(d => d.value));

    return html`
      <div
        class="bar-chart-container"
        style="
          width:100%; 
          height:${chartHeight}px; 
          display:flex; 
          align-items:center; 
          justify-content:${(() => {
          const a = ((module as any).chart_alignment || 'center') as string;
          return a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
        })()};
          overflow: hidden;
          box-sizing: border-box;
        "
      >
        <div
          style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: flex-end;
            justify-content: ${(() => {
            const a = ((module as any).chart_alignment || 'center') as string;
            if (a === 'left') return 'flex-start';
            if (a === 'right') return 'flex-end';
            return 'center';
          })()};
            gap: 8px;
            padding: 8px;
            box-sizing: border-box;
            overflow: hidden;
          "
        >
          ${data.map(d => {
            const barHeight = maxValue > 0 ? (d.value / maxValue) * (chartHeight - 40) : 0;
            return html`
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  flex: 0 0 auto;
                  width: 60px;
                  max-width: calc(100% / ${data.length});
                  box-sizing: border-box;
                "
              >
                <div
                  style="
                    font-size: 11px;
                    ${textStyle || ''};
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 100%;
                    text-align: center;
                  "
                >
                  ${(() => {
                    let formatted = `${d.value}${d.unit || ''}`;
                    if (hass && d.entityId) {
                      try {
                        formatted = formatEntityState(hass, d.entityId, {
                          state: d.value,
                          includeUnit: true,
                        });
                      } catch (_) {}
                    }
                    // Truncate long values
                    return formatted.length > 8 ? formatted.substring(0, 8) + '...' : formatted;
                  })()}
                </div>
                <div
                  style="
                    width: 100%;
                    height: ${barHeight}px;
                    background: ${d.color};
                    border-radius: 3px 3px 0 0;
                    transition: height 0.3s ease;
                    min-height: 2px;
                  "
                ></div>
                <div
                  style="
                    font-size: 10px;
                    ${textStyle || ''};
                    opacity: 0.8;
                    margin-top: 4px;
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 100%;
                  "
                  title="${d.name}"
                >
                  ${d.name.length > 8 ? d.name.substring(0, 8) + '...' : d.name}
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _showTooltip(
    event: MouseEvent,
    moduleId: string,
    seriesName: string,
    formattedValue: string,
    timePoint: string
  ): void {
    // Get the circle element
    const circle = event.target as SVGCircleElement;

    // Find or create tooltip element on body (to avoid overflow clipping)
    let tooltip = document.getElementById(`graph-tooltip-${moduleId}`) as HTMLElement;

    if (!tooltip) {
      // Create tooltip if it doesn't exist
      tooltip = document.createElement('div');
      tooltip.id = `graph-tooltip-${moduleId}`;
      tooltip.style.cssText = `
        position: fixed;
        display: none;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 10px 14px;
        font-size: 14px;
        color: var(--primary-text-color);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: 10000;
        white-space: nowrap;
      `;
      document.body.appendChild(tooltip);
    }

    // Create tooltip content
    tooltip.innerHTML = `
      <div style="font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;">${seriesName}</div>
      <div style="color: var(--secondary-text-color); font-size: 12px;">${timePoint}</div>
      <div style="font-size: 16px; margin-top: 4px; color: var(--primary-color);">${formattedValue}</div>
    `;

    // Get circle position in viewport
    const circleRect = circle.getBoundingClientRect();

    // Position tooltip above the point using fixed positioning
    const x = circleRect.left + circleRect.width / 2;
    const y = circleRect.top;

    // Show tooltip
    tooltip.style.display = 'block';

    // Position tooltip above the point with fixed positioning
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y - 10}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
  }

  private _hideTooltip(moduleId: string, event?: MouseEvent): void {
    // Get tooltip from document (it's appended to body)
    const tooltip = document.getElementById(`graph-tooltip-${moduleId}`) as HTMLElement;
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  private _generateTimePoints(timePeriod: string): string[] {
    const points: string[] = [];
    const now = new Date();

    let count = 12;
    let interval = 'hour';

    switch (timePeriod) {
      case '1h':
        count = 12;
        interval = '5min';
        break;
      case '24h':
        count = 24;
        interval = 'hour';
        break;
      case '7d':
        count = 7;
        interval = 'day';
        break;
      case '30d':
        count = 30;
        interval = 'day';
        break;
      case '90d':
        count = 12;
        interval = 'week';
        break;
      case '365d':
        count = 12;
        interval = 'month';
        break;
    }

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      if (interval === '5min') {
        date.setMinutes(date.getMinutes() - i * 5);
        points.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else if (interval === 'hour') {
        date.setHours(date.getHours() - i);
        points.push(date.toLocaleTimeString([], { hour: '2-digit' }));
      } else if (interval === 'day') {
        date.setDate(date.getDate() - i);
        points.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
      } else if (interval === 'week') {
        date.setDate(date.getDate() - i * 7);
        points.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
      } else if (interval === 'month') {
        date.setMonth(date.getMonth() - i);
        points.push(date.toLocaleDateString([], { month: 'short' }));
      }
    }

    return points;
  }

  private _generateTimeSeriesData(baseValue: number, points: number, seedKey: string): number[] {
    // This is now a fallback for when real data isn't available
    const data: number[] = [];
    let value = isNaN(baseValue) ? 50 : baseValue;

    // For odometer-like entities, generate increasing values
    const isIncreasingEntity =
      seedKey.toLowerCase().includes('odometer') ||
      seedKey.toLowerCase().includes('counter') ||
      seedKey.toLowerCase().includes('total') ||
      seedKey.toLowerCase().includes('mileage');

    // For energy/power entities that accumulate
    const isEnergyEntity =
      seedKey.toLowerCase().includes('energy') || seedKey.toLowerCase().includes('kwh');

    // Deterministic PRNG seeded by entity so style changes don't reshuffle data
    let seed = this._hashString(seedKey);
    const nextRand = () => {
      // Linear congruential generator
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed & 0xffffffff) / 0x100000000; // [0,1)
    };

    // Start from a more realistic base for odometer
    if (isIncreasingEntity && value > 1000) {
      // Start from a bit lower to show increase
      value = value * 0.95;
    }

    for (let i = 0; i < points; i++) {
      const rand = nextRand();
      const progress = i / (points - 1); // 0 to 1 progress through time

      if (isIncreasingEntity) {
        // For increasing entities like odometer, show steady increase
        const avgIncrease = (baseValue * 0.05) / points; // 5% increase over period
        const variation = rand * avgIncrease * 0.5; // Some randomness
        value = value + avgIncrease + variation;
      } else if (isEnergyEntity) {
        // Energy accumulates
        const avgIncrease = (baseValue * 0.1) / points;
        value = value + avgIncrease * rand;
      } else {
        // Original logic for other entities - but less dramatic
        const variation = (rand - 0.5) * value * 0.1; // Reduced from 0.3
        value = Math.max(0, value + variation);
      }
      data.push(Math.round(value * 10) / 10);
    }

    return data;
  }

  private _hashString(input: string): number {
    let hash = 2166136261; // FNV-1a 32-bit offset basis
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  // Manual trigger for immediate history loading (like mini-graph interaction)
  private _triggerHistoryLoad(module: GraphsModule, hass: HomeAssistant): void {
    if (!this._historyLoading[module.id]) {
      this._historyLoading[module.id] = true;
      this._deferredHistoryScheduled[module.id] = true;
      this._fetchHistoryDataAsync(module, hass);
    }
  }

  private _loadHistoryData(module: GraphsModule, hass: HomeAssistant): void {
    if (!module.entities || module.entities.length === 0) return;

    // Handle forecast mode
    if (module.data_source === 'forecast') {
      this._loadForecastData(module, hass);
      return;
    }

    // Try cache first for an instant historical curve on reload
    if (!this._historyData[module.id]) {
      const cached = this._tryReadCache(module);
      if (cached) {
        this._historyData[module.id] = { ...cached, source: 'cache' };
      }
    }

    // Check if we already have ANY data (fast path or real history)
    const existingData = this._historyData[module.id];

    // INSTANT DISPLAY: Only use fast path if we have NO data at all
    if (!existingData) {
      const fastResult = this._tryFastHistoryPath(module, hass);
      if (fastResult) {
        this._historyData[module.id] = fastResult;
      }
    }

    // DEFERRED HISTORY: Only schedule if not already done and we don't have real history
    if (!this._historyLoading[module.id] && !this._deferredHistoryScheduled[module.id]) {
      this._deferredHistoryScheduled[module.id] = true;
      this._historyLoading[module.id] = true;

      // Load immediately after fast path renders (like mini-graph does)
      // Fetch immediately; we already rendered with fast-path if available
      this._fetchHistoryDataAsync(module, hass);
    }
  }

  // Fast path method to use existing HA history data (like mini-graph does)
  private _tryFastHistoryPath(module: GraphsModule, hass: HomeAssistant): any | null {
    try {
      // Check if entities have recent history available in hass
      const entityIds = module.entities.filter(e => e.entity).map(e => e.entity!);
      if (entityIds.length === 0) return null;

      // For now, create immediate data using current states
      // This will be instant like mini-graph, then we can enhance with real history
      const timePoints = this._generateTimePoints(module.time_period);
      const datasets = module.entities
        .filter(e => e.entity)
        .map((entityConfig, index) => {
          const entityState = hass.states[entityConfig.entity!];
          if (!entityState) return null;

          // Get current value (like mini-graph does)
          let currentValue = 0;
          if (entityConfig.attribute && entityState.attributes[entityConfig.attribute]) {
            currentValue = parseFloat(entityState.attributes[entityConfig.attribute]) || 0;
          } else {
            currentValue = parseFloat(entityState.state) || 0;
          }

          // Create instant flat line at current value
          const values = new Array(timePoints.length).fill(currentValue);

          return {
            name: entityConfig.name || entityState.attributes.friendly_name || entityConfig.entity,
            color: this._formatColor(entityConfig.color) || this._getDefaultColor(index),
            values,
            lineWidth: entityConfig.line_width ?? 2,
            showPoints: entityConfig.show_points !== false,
            fillArea: entityConfig.fill_area === true,
            lineStyle: entityConfig.line_style || 'solid',
            unit: entityState?.attributes.unit_of_measurement || '',
            entityId: entityConfig.entity,
          };
        })
        .filter(d => d !== null);

      if (datasets.length === 0) return null;

      const allValues = datasets.flatMap(d => d!.values);
      const result = {
        timePoints,
        datasets: datasets as any[],
        min: Math.min(...allValues),
        max: Math.max(...allValues),
        lastUpdated: Date.now(),
        source: 'fast-path',
      };

      // debug removed

      return result;
    } catch (error) {
      // silent
      return null;
    }
  }

  private async _fetchHistoryDataAsync(module: GraphsModule, hass: HomeAssistant): Promise<void> {
    try {
      const now = new Date();
      // debug removed

      // Use shorter time periods for faster loading (like mini-graph approach)
      let hoursBack = 24; // Default
      switch (module.time_period) {
        case '1h':
          hoursBack = 1;
          break;
        case '3h':
          hoursBack = 3;
          break;
        case '6h':
          hoursBack = 6;
          break;
        case '12h':
          hoursBack = 12;
          break;
        case '24h':
          hoursBack = 24;
          break;
        case '2d':
          hoursBack = 48;
          break;
        case '7d':
          hoursBack = 168;
          break;
        case '30d':
          hoursBack = 720;
          break;
        case '90d':
          hoursBack = 2160;
          break;
        case '365d':
          hoursBack = 8760;
          break;
        default:
          hoursBack = 24;
      }

      const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

      // Fetch history for all entities
      const entityIds = module.entities.filter(e => e.entity).map(e => e.entity!);

      if (entityIds.length === 0) {
        return;
      }

      // Fetch real history data from Home Assistant
      // Store debug info globally for inspection
      (window as any).ultraCardGraphDebug = {
        entityIds,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        status: 'fetching',
      };

      // debug removed

      // Reduce data points for faster loading (mini-graph approach)
      const maxDataPoints = Math.min(100, hoursBack * 4); // Max 100 points, roughly 1 per 15min for 24h

      // Check if entities exist and have history
      entityIds.forEach(entityId => {
        const state = hass.states[entityId];
        if (!state) {
          // silent
        } else {
          // silent
        }
      });

      let history: any = {};

      try {
        // Try WebSocket API first (more reliable)
        // debug removed

        let historyData;
        let wsResult;
        try {
          // Use WebSocket API
          wsResult = await hass.callWS({
            type: 'history/history_during_period',
            start_time: startTime.toISOString(),
            end_time: now.toISOString(),
            entity_ids: entityIds,
            include_start_time_state: true,
            significant_changes_only: false,
            minimal_response: false,
          });

          // debug removed

          // The WebSocket response is an object with entity IDs as keys
          // Convert to array format matching REST API
          if (wsResult && typeof wsResult === 'object') {
            historyData = entityIds
              .map(entityId => {
                const entityHistory = wsResult[entityId] || [];
                return entityHistory;
              })
              .filter(h => h.length > 0);
          } else {
            historyData = [];
          }

          // debug removed
        } catch (wsError: any) {
          // debug removed

          // Fallback to REST API
          const startISO = startTime.toISOString();
          historyData = await hass.callApi('GET', `history/period/${startISO}`, {
            filter_entity_id: entityIds.join(','),
            end_time: now.toISOString(),
          });
        }

        // debug removed
        (window as any).ultraCardGraphDebug.response = historyData;
        (window as any).ultraCardGraphDebug.status = 'success';

        // Process the response based on its format
        if (wsResult && typeof wsResult === 'object' && !Array.isArray(wsResult)) {
          // WebSocket format: object with entity IDs as keys
          Object.entries(wsResult).forEach(([entityId, entityHistory]) => {
            if (Array.isArray(entityHistory) && entityHistory.length > 0) {
              history[entityId] = entityHistory;
              // debug removed
            }
          });
        } else if (Array.isArray(historyData)) {
          // REST API format: array of arrays
          historyData.forEach(entityHistory => {
            if (Array.isArray(entityHistory) && entityHistory.length > 0) {
              const entityId = entityHistory[0].entity_id;
              history[entityId] = entityHistory;
              // debug removed
            }
          });
        }

        // If we didn't get any history, throw an error to use fallback
        if (Object.keys(history).length === 0) {
          throw new Error('No history data returned from API');
        }
      } catch (error: any) {
        // keep quiet in UI builds; fallback silently
        (window as any).ultraCardGraphDebug.error = error;
        (window as any).ultraCardGraphDebug.errorDetails = {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          body: error.body,
          stack: error.stack,
        };
        (window as any).ultraCardGraphDebug.status = 'error';

        // Fallback: Create minimal history from current states
        for (const entityId of entityIds) {
          const state = hass.states[entityId];
          if (!state) continue;

          history[entityId] = [
            {
              entity_id: entityId,
              state: state.state,
              last_changed: new Date().toISOString(),
              last_updated: new Date().toISOString(),
              attributes: state.attributes,
            },
          ];
        }
      }

      // Process history data
      const timePoints = this._generateTimePoints(module.time_period);
      const datasets = module.entities
        .map((entityConfig, index) => {
          if (!entityConfig.entity) {
            return null;
          }

          // Check if history is an array or object
          let entityHistory;
          if (Array.isArray(history)) {
            // If history is an array, it might be the direct response
            entityHistory = history;
          } else if (history[entityConfig.entity]) {
            // If history is an object keyed by entity ID
            entityHistory = history[entityConfig.entity];
          } else {
            return null;
          }

          const entityState = hass.states[entityConfig.entity];
          const values = this._processHistoryData(
            entityHistory,
            timePoints,
            entityConfig.attribute,
            startTime,
            now
          );

          return {
            name: entityConfig.name || entityState?.attributes.friendly_name || entityConfig.entity,
            color: this._formatColor(entityConfig.color) || this._getDefaultColor(index),
            values,
            lineWidth: entityConfig.line_width ?? 2,
            showPoints: entityConfig.show_points !== false,
            fillArea: entityConfig.fill_area === true,
            lineStyle: entityConfig.line_style || 'solid',
            unit: entityState?.attributes.unit_of_measurement || '',
            entityId: entityConfig.entity,
          };
        })
        .filter(d => d !== null);

      const allValues = datasets.flatMap(d => d!.values);
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);

      // Store results in instance properties for immediate access
      this._historyData[module.id] = {
        timePoints,
        datasets: datasets as any[],
        min: minValue,
        max: maxValue,
        lastUpdated: Date.now(),
        source: 'history',
      };

      // Clear loading state
      this._historyLoading[module.id] = false;

      // Persist real history to cache for instant future reloads
      this._writeCache(module, this._historyData[module.id]);

      // debug removed

      // Trigger re-render
      this.requestUpdate();
    } catch (error) {
      // silent
      // Store error in instance properties
      this._historyError[module.id] = 'Failed to load history data';
      this._historyLoading[module.id] = false;
      this.requestUpdate();
    }
  }

  private _processHistoryData(
    historyData: any[],
    timePoints: string[],
    attribute?: string,
    startTime?: Date,
    endTime?: Date
  ): number[] {
    if (!historyData || historyData.length === 0) {
      return new Array(timePoints.length).fill(0);
    }

    // debug removed

    const values: number[] = [];
    const toNumber = (val: any): number | null => {
      if (val === null || val === undefined) return null;
      if (typeof val === 'number' && isFinite(val)) return val;
      const str = String(val).trim().toLowerCase();
      if (str === 'unknown' || str === 'unavailable' || str === 'none' || str === 'null') {
        return null;
      }
      const parsed = parseFloat(str);
      return isNaN(parsed) ? null : parsed;
    };

    // Helper function to extract state value and timestamp from different formats
    const extractStateInfo = (state: any) => {
      let stateInfo;
      // WebSocket format: { s: "value", a: {...}, lu: timestamp }
      if (state.s !== undefined && state.lu !== undefined) {
        stateInfo = {
          state: state.s,
          attributes: state.a || {},
          timestamp: state.lu * 1000, // Convert to milliseconds
        };
      }
      // REST API format: { state: "value", attributes: {...}, last_changed: "ISO string" }
      else if (state.state !== undefined && state.last_changed !== undefined) {
        stateInfo = {
          state: state.state,
          attributes: state.attributes || {},
          timestamp: new Date(state.last_changed).getTime(),
        };
      } else {
        return null;
      }

      // Filter out unavailable/unknown states for cleaner data
      if (stateInfo.state === 'unavailable' || stateInfo.state === 'unknown') {
        return null;
      }

      return stateInfo;
    };

    const start = startTime?.getTime() || Date.now() - 24 * 60 * 60 * 1000;
    const end = endTime?.getTime() || Date.now();
    const timeRange = end - start;

    // Process and sort history data by time
    const processedHistory = historyData
      .map(extractStateInfo)
      .filter(item => item !== null)
      .sort((a, b) => a!.timestamp - b!.timestamp);

    // debug removed

    // Debug: Show all history points with timestamps and values
    // debug removed

    // debug removed

    // For each time point, find the most recent numeric value at or before that time
    timePoints.forEach((timePoint, index) => {
      // Calculate the actual time for this point
      const pointProgress = index / (timePoints.length - 1);
      const pointTime = start + timeRange * pointProgress;

      // Find the most recent numeric state before/at this time
      let numericValue: number | null = null;
      for (let i = processedHistory.length - 1; i >= 0; i--) {
        const state = processedHistory[i]!;
        if (state.timestamp <= pointTime) {
          const stateValue = attribute ? state.attributes[attribute] : state.state;
          const num = toNumber(stateValue);
          if (num !== null) {
            numericValue = num;
            break;
          }
        }
      }

      // If still null, try the latest numeric value available regardless of time
      if (numericValue === null) {
        for (let i = processedHistory.length - 1; i >= 0; i--) {
          const state = processedHistory[i]!;
          const stateValue = attribute ? state.attributes[attribute] : state.state;
          const num = toNumber(stateValue);
          if (num !== null) {
            numericValue = num;
            break;
          }
        }
      }

      values.push(numericValue ?? 0);
    });

    // debug removed
    return values;
  }

  private _coerceNumber(value: any): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && isFinite(value)) return value;
    const text = String(value).trim().toLowerCase();
    if (text === 'unknown' || text === 'unavailable' || text === 'none' || text === 'null')
      return null;
    const n = parseFloat(text);
    return isNaN(n) ? null : n;
  }

  // ============================================================================
  // FORECAST DATA METHODS
  // ============================================================================

  private async _fetchForecastData(module: GraphsModule, hass: HomeAssistant): Promise<any> {
    if (!module.forecast_entity || !hass) {
      throw new Error('Forecast entity not configured');
    }

    try {
      // Call weather.get_forecasts service using WebSocket API (requires return_response)
      const response = (await hass.callWS({
        type: 'call_service',
        domain: 'weather',
        service: 'get_forecasts',
        service_data: {
          type: module.forecast_type || 'hourly',
        },
        target: {
          entity_id: module.forecast_entity,
        },
        return_response: true,
      })) as any;

      // Response format: { response: { [entity_id]: { forecast: [...] } } }
      const forecastData = response?.response?.[module.forecast_entity]?.forecast;

      if (!forecastData || !Array.isArray(forecastData)) {
        console.error('Ultra Card: Invalid forecast data received from weather service');
        throw new Error('Invalid forecast data received from weather service');
      }

      return forecastData;
    } catch (error) {
      console.error('Ultra Card: Failed to fetch forecast data:', error);
      throw error;
    }
  }

  private _processForecastData(
    forecastData: any[],
    module: GraphsModule,
    timePoints: string[]
  ): any {
    const datasets = (module.entities || [])
      .filter(e => e.forecast_attribute)
      .map((entityConfig, index) => {
        const attr = entityConfig.forecast_attribute!;

        // Extract values from forecast array
        const values = forecastData.map(forecast => {
          const val = forecast[attr];
          return typeof val === 'number' ? val : parseFloat(val) || 0;
        });

        // Limit to requested time points
        const limitedValues = values.slice(0, timePoints.length);

        return {
          name: entityConfig.name || this._getForecastAttributeLabel(attr),
          color: this._formatColor(entityConfig.color) || this._getDefaultColor(index),
          values: limitedValues,
          lineWidth: entityConfig.line_width ?? 2,
          showPoints: entityConfig.show_points !== false,
          fillArea: entityConfig.fill_area === true,
          lineStyle: entityConfig.line_style || 'solid',
          unit: this._getForecastAttributeUnit(attr),
          entityId: module.forecast_entity,
        };
      });

    const result = {
      timePoints: this._generateForecastTimePoints(forecastData, module.forecast_type),
      datasets,
      min: Math.min(...datasets.flatMap(d => d.values)),
      max: Math.max(...datasets.flatMap(d => d.values)),
      lastUpdated: Date.now(),
      source: 'forecast',
    };

    return result;
  }

  private _generateForecastTimePoints(forecastData: any[], type?: string): string[] {
    return forecastData.map(forecast => {
      const date = new Date(forecast.datetime);
      return type === 'daily'
        ? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
  }

  private _getForecastAttributeLabel(attr: string): string {
    return this.FORECAST_ATTRIBUTE_LABELS[attr] || attr;
  }

  private _getForecastAttributeUnit(attr: string): string {
    return this.FORECAST_ATTRIBUTE_UNITS[attr] || '';
  }

  private _loadForecastData(module: GraphsModule, hass: HomeAssistant): void {
    if (!module.forecast_entity) return;

    // Check cache first
    if (!this._historyData[module.id]) {
      const cached = this._tryReadCache(module);
      if (cached && cached.source === 'forecast') {
        this._historyData[module.id] = cached;
      }
    }

    // Schedule forecast fetch
    if (!this._historyLoading[module.id] && !this._deferredHistoryScheduled[module.id]) {
      this._deferredHistoryScheduled[module.id] = true;
      this._historyLoading[module.id] = true;
      this._fetchForecastDataAsync(module, hass);
    }
  }

  private async _fetchForecastDataAsync(module: GraphsModule, hass: HomeAssistant): Promise<void> {
    try {
      const forecastData = await this._fetchForecastData(module, hass);
      const timePoints = this._generateForecastTimePoints(forecastData, module.forecast_type);
      const processed = this._processForecastData(forecastData, module, timePoints);

      this._historyData[module.id] = processed;
      this._historyLoading[module.id] = false;
      this._writeCache(module, processed);
      this.requestUpdate();

      // Force a full card re-render
      setTimeout(() => {
        this.triggerPreviewUpdate();
        // Try to force the parent card element to update
        const cardElement = document.querySelector('ultra-card');
        if (cardElement && (cardElement as any).requestUpdate) {
          (cardElement as any).requestUpdate();
        }
      }, 100);
    } catch (error) {
      console.error('Ultra Card: Failed to load forecast data:', error);
      this._historyError[module.id] = 'Failed to load forecast data';
      this._historyLoading[module.id] = false;
      this.requestUpdate();
    }
  }

  // ============================================================================
  // END FORECAST DATA METHODS
  // ============================================================================

  private _getDefaultColor(index: number): string {
    return this.DEFAULT_COLORS[index % this.DEFAULT_COLORS.length];
  }

  private _addEntity(
    graphsModule: GraphsModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const newEntity: GraphEntityConfig = {
      id: this.generateId('entity'),
      entity: '',
      name: '',
      attribute: '',
      color: this._getDefaultColor(graphsModule.entities?.length || 0),
      show_points: true,
      fill_area: true,
      line_width: 2,
      line_style: 'solid',
    };

    // In forecast mode, add default forecast_attribute
    if (graphsModule.data_source === 'forecast') {
      newEntity.forecast_attribute = 'temperature';
    }

    const updatedEntities = [...(graphsModule.entities || []), newEntity];
    updateModule({ entities: updatedEntities });
  }

  private _removeEntity(
    graphsModule: GraphsModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const updatedEntities = [...(graphsModule.entities || [])];
    updatedEntities.splice(index, 1);
    updateModule({ entities: updatedEntities });
  }

  private _updateEntity(
    graphsModule: GraphsModule,
    index: number,
    updates: Partial<GraphEntityConfig>,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    const updatedEntities = [...(graphsModule.entities || [])];
    updatedEntities[index] = { ...updatedEntities[index], ...updates };

    // Clear stored history data to force re-processing with new configuration
    delete this._historyData[graphsModule.id];
    delete this._historyError[graphsModule.id];
    delete this._historyLoading[graphsModule.id];
    delete this._deferredHistoryScheduled[graphsModule.id];

    updateModule({ entities: updatedEntities });
  }

  private _toggleEntityOptions(event: Event, index: number): void {
    event.stopPropagation();

    // Find the closest entity card and then the options div
    const entityCard = (event.target as HTMLElement)?.closest('.entity-card');
    const optionsDiv = entityCard?.querySelector('.entity-advanced-options') as HTMLElement;
    const toggleButton = entityCard?.querySelector('.entity-toggle-btn') as HTMLElement;

    if (optionsDiv && toggleButton) {
      // Toggle the expanded state
      const isCurrentlyExpanded = this.expandedEntities.has(index);

      if (isCurrentlyExpanded) {
        this.expandedEntities.delete(index);
        // Collapse
        optionsDiv.style.maxHeight = '0';
        optionsDiv.style.opacity = '0';
        optionsDiv.style.marginTop = '0';
        optionsDiv.style.borderTop = 'none';
        toggleButton.style.transform = 'rotate(0deg)';
      } else {
        this.expandedEntities.add(index);
        // Expand
        optionsDiv.style.maxHeight = optionsDiv.scrollHeight + 'px';
        optionsDiv.style.opacity = '1';
        optionsDiv.style.marginTop = '16px';
        optionsDiv.style.borderTop = '1px solid var(--divider-color)';
        toggleButton.style.transform = 'rotate(180deg)';
      }
    }
  }

  private _getEntityAttributes(
    entityId: string,
    hass: HomeAssistant
  ): Array<{ value: string; label: string }> {
    if (!entityId || !hass.states[entityId]) return [];

    const attributes = hass.states[entityId].attributes;
    return Object.keys(attributes)
      .filter(attr => !['friendly_name', 'icon', 'entity_picture'].includes(attr))
      .map(attr => ({ value: attr, label: attr }));
  }

  private _renderSizeControl(
    graphsModule: GraphsModule,
    index: number,
    updateModule: (updates: Partial<CardModule>) => void,
    property: string,
    value: number,
    min: number,
    max: number,
    defaultValue: number,
    title: string,
    description: string
  ): TemplateResult {
    return html`
      <div class="field-container" style="margin-bottom: 16px;">
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 4px;"
        >
          ${title}
        </div>
        <div
          class="field-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;"
        >
          ${description}
        </div>
        <style>
          .number-range-control {
            display: flex;
            gap: 8px;
            align-items: center;
          }

          .range-slider {
            flex: 0 0 65%;
            height: 6px;
            background: var(--divider-color);
            border-radius: 3px;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 0;
          }

          .range-slider::-webkit-slider-thumb {
            appearance: none;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: var(--primary-color);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .range-slider::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: var(--primary-color);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .range-slider:hover {
            background: var(--primary-color);
            opacity: 0.7;
          }

          .range-slider:hover::-webkit-slider-thumb {
            transform: scale(1.1);
          }

          .range-slider:hover::-moz-range-thumb {
            transform: scale(1.1);
          }

          .range-input {
            flex: 0 0 20%;
            padding: 6px 8px !important;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
            background: var(--secondary-background-color);
            color: var(--primary-text-color);
            font-size: 13px;
            text-align: center;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }

          .range-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
          }

          .range-reset-btn {
            width: 32px;
            height: 32px;
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

          .range-reset-btn:hover {
            background: var(--primary-color);
            color: var(--text-primary-color);
            border-color: var(--primary-color);
          }

          .range-reset-btn ha-icon {
            font-size: 14px;
          }
        </style>
        <div class="number-range-control">
          <input
            type="range"
            class="range-slider"
            min="${min}"
            max="${max}"
            step="1"
            .value="${value}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const newValue = parseInt(target.value);
              if (index >= 0) {
                this._updateEntity(graphsModule, index, { [property]: newValue }, updateModule);
              } else {
                updateModule({ [property]: newValue });
              }
            }}
          />
          <input
            type="number"
            class="range-input"
            min="${min}"
            max="${max}"
            step="1"
            .value="${value}"
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              const newValue = parseInt(target.value);
              if (!isNaN(newValue)) {
                if (index >= 0) {
                  this._updateEntity(graphsModule, index, { [property]: newValue }, updateModule);
                } else {
                  updateModule({ [property]: newValue });
                }
              }
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const target = e.target as HTMLInputElement;
                const currentValue = parseInt(target.value) || defaultValue;
                const increment = e.key === 'ArrowUp' ? 1 : -1;
                const newValue = Math.max(min, Math.min(max, currentValue + increment));
                if (index >= 0) {
                  this._updateEntity(graphsModule, index, { [property]: newValue }, updateModule);
                } else {
                  updateModule({ [property]: newValue });
                }
              }
            }}
          />
          <button
            class="range-reset-btn"
            @click=${() => {
              if (index >= 0) {
                this._updateEntity(graphsModule, index, { [property]: defaultValue }, updateModule);
              } else {
                updateModule({ [property]: defaultValue });
              }
            }}
            title="Reset to default (${defaultValue})"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  // Link handling methods
  private hasActiveLink(module: GraphsModule): boolean {
    const hasTapAction =
      module.tap_action &&
      module.tap_action.action !== 'default' &&
      module.tap_action.action !== 'nothing';
    const hasHoldAction =
      module.hold_action &&
      module.hold_action.action !== 'default' &&
      module.hold_action.action !== 'nothing';
    const hasDoubleAction =
      module.double_tap_action &&
      module.double_tap_action.action !== 'default' &&
      module.double_tap_action.action !== 'nothing';

    return hasTapAction || hasHoldAction || hasDoubleAction;
  }

  private handleClick(
    event: Event,
    module: GraphsModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    event.preventDefault();
    if (this.clickTimeout) clearTimeout(this.clickTimeout);

    this.clickTimeout = setTimeout(() => {
      this.handleTapAction(event, module, hass, config);
    }, 300);
  }

  private handleDoubleClick(event: Event, module: GraphsModule, hass: HomeAssistant): void {
    event.preventDefault();
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
    this.handleDoubleAction(event, module, hass);
  }

  private handleMouseDown(event: Event, module: GraphsModule, hass: HomeAssistant): void {
    this.isHolding = false;
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.handleHoldAction(event, module, hass);
    }, 500);
  }

  private handleMouseUp(event: Event, module: GraphsModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
  }

  private handleMouseLeave(event: Event, module: GraphsModule, hass: HomeAssistant): void {
    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout);
      this.holdTimeout = null;
    }
    this.isHolding = false;
  }

  private handleTouchStart(event: Event, module: GraphsModule, hass: HomeAssistant): void {
    this.handleMouseDown(event, module, hass);
  }

  private handleTouchEnd(event: Event, module: GraphsModule, hass: HomeAssistant): void {
    this.handleMouseUp(event, module, hass);
  }

  private handleTapAction(
    event: Event,
    module: GraphsModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (this.isHolding) return;

    if (
      module.tap_action &&
      module.tap_action.action !== 'default' &&
      module.tap_action.action !== 'nothing'
    ) {
      // Only pass valid actions to UltraLinkComponent
      const validAction = { ...module.tap_action };
      UltraLinkComponent.handleAction(
        validAction as any,
        hass,
        event.target as HTMLElement,
        config
      );
    }
  }

  private handleHoldAction(
    event: Event,
    module: GraphsModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (
      module.hold_action &&
      module.hold_action.action !== 'default' &&
      module.hold_action.action !== 'nothing'
    ) {
      // Only pass valid actions to UltraLinkComponent
      const validAction = { ...module.hold_action };
      UltraLinkComponent.handleAction(
        validAction as any,
        hass,
        event.target as HTMLElement,
        config
      );
    }
  }

  private handleDoubleAction(
    event: Event,
    module: GraphsModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): void {
    if (
      module.double_tap_action &&
      module.double_tap_action.action !== 'default' &&
      module.double_tap_action.action !== 'nothing'
    ) {
      // Only pass valid actions to UltraLinkComponent
      const validAction = { ...module.double_tap_action };
      UltraLinkComponent.handleAction(
        validAction as any,
        hass,
        event.target as HTMLElement,
        config
      );
    }
  }

  // Helper methods for design properties
  private styleObjectToCss(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');
  }

  // Resolve chart width as CSS, preferring percentage slider when present
  private _resolveChartWidth(module: GraphsModule): string {
    const percent = (module as any).chart_width_percent;
    if (typeof percent === 'number' && isFinite(percent)) {
      const clamped = Math.max(10, Math.min(100, Math.round(percent)));
      return `${clamped}%`;
    }
    const width = (module as any).chart_width;
    if (typeof width === 'string' && width.trim() !== '') return width.trim();
    return '100%';
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return value;
    if (/^\d+$/.test(value)) return `${value}px`;
    if (/^[\d\s]+$/.test(value)) {
      return value
        .split(' ')
        .map(v => (v.trim() ? `${v}px` : v))
        .join(' ');
    }
    return value;
  }

  private getPaddingCSS(moduleWithDesign: any): string {
    return moduleWithDesign.padding_top ||
      moduleWithDesign.padding_bottom ||
      moduleWithDesign.padding_left ||
      moduleWithDesign.padding_right
      ? `${this.addPixelUnit(moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(moduleWithDesign.padding_left) || '0px'}`
      : '0';
  }

  private getMarginCSS(moduleWithDesign: any): string {
    // Standard 8px top/bottom margin for proper web design spacing
    return moduleWithDesign.margin_top ||
      moduleWithDesign.margin_bottom ||
      moduleWithDesign.margin_left ||
      moduleWithDesign.margin_right
      ? `${this.addPixelUnit(moduleWithDesign.margin_top) || '8px'} ${this.addPixelUnit(moduleWithDesign.margin_right) || '0px'} ${this.addPixelUnit(moduleWithDesign.margin_bottom) || '8px'} ${this.addPixelUnit(moduleWithDesign.margin_left) || '0px'}`
      : '8px 0';
  }

  private getBackgroundCSS(moduleWithDesign: any): string {
    return moduleWithDesign.background_color || 'transparent';
  }

  private getBackgroundImageCSS(moduleWithDesign: any, hass: HomeAssistant): string {
    const imageType = moduleWithDesign.background_image_type;
    const backgroundImage = moduleWithDesign.background_image;
    const backgroundEntity = moduleWithDesign.background_image_entity;

    if (!imageType || imageType === 'none') return 'none';

    switch (imageType) {
      case 'upload':
        if (backgroundImage) {
          // Use helper to resolve HA-relative paths (e.g., /api/image/serve/<id>/original, /local, etc.)
          const resolved = getImageUrl(hass, backgroundImage);
          return `url("${resolved}")`;
        }
        break;
      case 'url':
        if (backgroundImage) {
          return `url("${backgroundImage}")`;
        }
        break;
      case 'entity':
        if (backgroundEntity && hass) {
          const entityState = hass.states[backgroundEntity];
          if (entityState) {
            const imageUrl =
              (entityState.attributes as any)?.entity_picture ||
              (entityState.attributes as any)?.image ||
              (typeof entityState.state === 'string' ? entityState.state : '');
            if (imageUrl && imageUrl !== 'unknown' && imageUrl !== 'unavailable') {
              const resolved = getImageUrl(hass, imageUrl);
              return `url("${resolved}")`;
            }
          }
        }
        break;
    }

    return 'none';
  }

  private getBorderCSS(moduleWithDesign: any): string {
    const border = moduleWithDesign.border;
    if (!border || border.style === 'none') return 'none';
    return `${border.width || 1}px ${border.style || 'solid'} ${border.color || '#ccc'}`;
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

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const graphsModule = module as GraphsModule;
    const errors = [...baseValidation.errors];

    if (!graphsModule.chart_type) {
      errors.push('Chart type is required');
    }

    // Forecast mode validation
    if (graphsModule.data_source === 'forecast') {
      if (!graphsModule.forecast_entity) {
        errors.push('Weather entity is required for forecast mode');
      }

      if (!graphsModule.entities || graphsModule.entities.length === 0) {
        errors.push('At least one forecast attribute is required');
      } else {
        graphsModule.entities.forEach((entity, index) => {
          if (!entity.forecast_attribute) {
            errors.push(`Entity ${index + 1}: Forecast attribute selection is required`);
          }
        });
      }
    } else {
      // History mode validation
      if (!graphsModule.entities || graphsModule.entities.length === 0) {
        errors.push('At least one entity is required');
      } else {
        graphsModule.entities.forEach((entity, index) => {
          if (!entity.entity) {
            errors.push(`Entity ${index + 1}: Entity selection is required`);
          }
        });
      }
    }

    if (graphsModule.time_period === 'custom') {
      if (!graphsModule.custom_time_start) {
        errors.push('Custom start time is required');
      }
      if (!graphsModule.custom_time_end) {
        errors.push('Custom end time is required');
      }
    }

    // Template validation
    if (
      graphsModule.template_mode &&
      (!graphsModule.template || graphsModule.template.trim() === '')
    ) {
      errors.push('Template code is required when template mode is enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getStyles(): string {
    return `
      .uc-graphs-module {
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        position: relative;
        overflow: hidden;
        contain: layout style;
      }

      /* Graph content area containment */
      .uc-graphs-module .chart-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
      }

      /* Legend containment */
      .uc-graphs-module .graph-legend {
        max-width: calc(100% - 16px) !important;
        box-sizing: border-box;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .uc-graphs-module .graph-legend > div {
        min-width: 0;
        flex-shrink: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Header info containment */
      .uc-graphs-module .graph-header-info {
        max-width: calc(100% - 32px) !important;
        box-sizing: border-box;
        overflow: hidden;
      }

      .uc-graphs-module .graph-title,
      .uc-graphs-module .graph-value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }

      .entity-card {
        transition: all 0.2s ease;
      }

      .entity-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .entity-advanced-options {
        transition: max-height 0.3s ease, opacity 0.2s ease;
        opacity: 0;
      }

      .entity-advanced-options[data-expanded="true"] {
        opacity: 1;
      }

      .entity-toggle-button ha-icon {
        transition: transform 0.2s ease;
      }

      .entity-header {
        cursor: pointer;
      }

      .entity-header:hover .entity-toggle-button {
        color: var(--primary-color);
      }

      .uc-graphs-general-tab,
      .uc-graphs-actions-tab,
      .uc-graphs-other-tab {
        padding: 16px;
      }

      .entities-repeater {
        margin: 16px 0;
      }

      .entity-item {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      }

      .entity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .entity-number {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .chart-container {
        position: relative;
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
      }

      .chart-title {
        font-weight: 500;
        margin-bottom: 8px;
      }

      .chart-legend {
        margin-top: 12px;
      }

      .chart-legend.legend-top {
        margin-top: 0;
        margin-bottom: 12px;
      }

      .chart-legend.legend-left,
      .chart-legend.legend-right {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }

      .chart-legend.legend-left {
        left: 0;
      }

      .chart-legend.legend-right {
        right: 0;
      }

      .graphs-module-clickable {
        cursor: pointer;
        color: inherit;
        text-decoration: inherit;
      }

      .graphs-module-clickable.hover-enabled:hover {
        transform: scale(1.02);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      /* Standard field styling */
      .field-title {
        font-size: 16px !important;
        font-weight: 600 !important;
    
        margin-bottom: 4px !important;
      }

      .field-description {
        font-size: 13px !important;
        color: var(--secondary-text-color) !important;
        margin-bottom: 12px !important;
        opacity: 0.8 !important;
        line-height: 1.4 !important;
      }

      .section-title {
        font-size: 18px !important;
        font-weight: 700 !important;
        color: var(--primary-color) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
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

      /* Number range control styles */
      .number-range-control {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .range-slider {
        flex: 0 0 65%;
        height: 6px;
        background: var(--divider-color);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 0;
      }

      .range-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .range-slider::-moz-range-thumb {
        width: 18px;
        height: 18px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .range-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }

      .range-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }

      .range-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }

      .range-input {
        flex: 0 0 20%;
        padding: 6px 8px !important;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: center;
        transition: all 0.2s ease;
        box-sizing: border-box;
      }

      .range-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .range-reset-btn {
        width: 32px;
        height: 32px;
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

      .range-reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .range-reset-btn ha-icon {
        font-size: 14px;
      }

      /* Responsive styles */
      @media (max-width: 768px) {
        .chart-container {
          min-height: 200px;
        }
        
        .uc-graphs-module .graph-legend {
          max-width: calc(100% - 8px) !important;
          gap: 4px !important;
          font-size: 11px !important;
        }
        
        .uc-graphs-module .graph-header-info {
          max-width: calc(100% - 16px) !important;
        }
        
        .uc-graphs-module .graph-title {
          font-size: 14px !important;
        }
        
        .uc-graphs-module .graph-value {
          font-size: 20px !important;
        }
      }

      /* Animation styles */
      .uc-graphs-module[data-animation="true"] {
        animation: fadeIn 0.5s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Hover effects */
      .uc-graphs-module:hover {
        transition: box-shadow 0.3s ease;
      }

      /* Loading state */
      .chart-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--secondary-text-color);
        overflow: hidden;
      }

      .chart-error {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--error-color);
        text-align: center;
        padding: 20px;
        overflow: hidden;
        word-wrap: break-word;
        max-width: 100%;
        box-sizing: border-box;
      }
      
      /* SVG text containment for pie charts */
      .uc-graphs-module svg text {
        pointer-events: none;
        user-select: none;
      }
      
      /* Ensure tooltips stay within bounds and appear above everything */
      [id^="graph-tooltip-"] {
        position: fixed !important;
        z-index: 10000 !important;
        max-width: calc(100vw - 32px);
        word-wrap: break-word;
        box-sizing: border-box;
        pointer-events: none !important;
      }
    `;
  }

  cleanup(): void {
    if (this.clickTimeout) clearTimeout(this.clickTimeout);
    if (this.holdTimeout) clearTimeout(this.holdTimeout);
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
    }

    // Remove any tooltips created by this module
    Object.keys(this._historyData).forEach(moduleId => {
      const tooltip = document.getElementById(`graph-tooltip-${moduleId}`);
      if (tooltip && tooltip.parentNode === document.body) {
        document.body.removeChild(tooltip);
      }
    });
  }

  requestUpdate(): void {
    // Trigger a re-render by dispatching a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ultra-card-update'));
      // Also dispatch the template update event for consistency
      window.dispatchEvent(
        new CustomEvent('ultra-card-template-update', {
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}
