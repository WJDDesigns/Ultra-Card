import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { UltraBarModule, BAR_TEMPLATE_KEYS } from '../bar-module';
import { installSettingsMethods } from '../uc-lazy-settings';
import { CardModule, BarModule, UltraCardConfig } from '../../types';
import '../../components/ultra-color-picker';
import '../../components/uc-gradient-editor';
import '../../components/bar-side-actions';
import { localize } from '../../localize/localize';
import { createDefaultGradientStops } from '../../components/uc-gradient-editor';

/**
 * Bar module settings UI. Lives in the `core-settings` chunk (see
 * uc-lazy-settings.ts) so dashboards never download it. Declared as a subclass
 * so the moved code keeps `this.` access to the module helpers; it is never
 * instantiated, the module calls the method with itself as `this`.
 */
export class UltraBarModuleSettings extends UltraBarModule {
  renderGeneralTabContent(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const barModule = module as BarModule;
    const lang = hass?.locale?.language || 'en';
    const showPercentageText = this.normalizeBoolean(barModule.show_percentage, true);
    const showValueInstead = this.normalizeBoolean(barModule.show_value, false);
    const hasUnavailableDifferenceFallbackEntity =
      barModule.percentage_type === 'difference' &&
      !!barModule.entity &&
      !hass?.states?.[barModule.entity];
    const differenceFallbackEntityValue = hasUnavailableDifferenceFallbackEntity
      ? ''
      : barModule.entity || '';

    // Stable schema for percentage type select (memoized by language)
    const percentageTypeSchema = [
      this.selectField('percentage_type', [
        { value: 'entity', label: localize('editor.bar.perc_type.entity', lang, 'Entity (0-100)') },
        {
          value: 'attribute',
          label: localize('editor.bar.perc_type.attribute', lang, 'Entity Attribute'),
        },
        {
          value: 'difference',
          label: localize('editor.bar.perc_type.difference', lang, 'Difference'),
        },
        {
          value: 'time_progress',
          label: localize('editor.bar.perc_type.time_progress', lang, 'Time Progress (Real-time)'),
        },
        {
          value: 'range',
          label: localize('editor.bar.perc_type.range', lang, 'Range (Start to End)'),
        },
      ]),
    ];

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <!-- Bar Settings (single settings-section box wraps everything below
             through to just before "Bar Appearance" so the percentage type,
             configuration sub-modes, Bar Percentage Entity, and Limit Value Entity
             are all visually contained — no floating outside-the-box items). -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px; letter-spacing: 0.5px;"
          >
            ${localize('editor.bar.bar_settings.title', lang, 'Bar Settings')}
          </div>
          <div
            style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
          >
            ${localize(
              'editor.bar.bar_settings.desc',
              lang,
              'Configure how the bar percentage is calculated and displayed.'
            )}
          </div>
          <div class="field-group percentage-type-group" style="margin-bottom: 16px;">
          ${this.renderFieldSection(
            localize('editor.bar.percentage_type.title', lang, 'Percentage Type'),
            localize(
              'editor.bar.percentage_type.desc',
              lang,
              'Choose how the bar percentage is calculated'
            ),
            hass,
            { percentage_type: barModule.percentage_type || 'entity' },
            percentageTypeSchema,
            (e: CustomEvent) => {
              const next = e.detail.value?.percentage_type;
              if (next === undefined || next === barModule.percentage_type) return;

              const update: Record<string, any> = { percentage_type: next };
              if (next !== 'entity' && next !== 'template') {
                update.percentage_template = '';
              }
              // Difference mode doesn't require the fallback `entity`. If the current
              // fallback points to an unavailable entity, clear it during mode switch
              // so the visual editor won't stay stuck on an invalid selection.
              if (next === 'difference' && barModule.entity && !hass?.states?.[barModule.entity]) {
                update.entity = '';
              }
              updateModule(update);
            }
          )}
        </div>

          <!-- Entity Attribute Fields -->
          ${
            barModule.percentage_type === 'attribute'
              ? this.renderConditionalFieldsGroup(
                  localize('editor.bar.attr_config.title', lang, 'Entity Attribute Configuration'),
                  html`
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                    >
                      ${localize(
                        'editor.bar.attr_config.desc',
                        lang,
                        'Configure entity attribute settings'
                      )}
                    </div>
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'percentage_attribute_entity',
                      barModule.percentage_attribute_entity || '',
                      (value: string) => updateModule({ percentage_attribute_entity: value }),
                      undefined,
                      localize('editor.bar.attr_config.attribute_entity', lang, 'Attribute Entity')
                    )}
                    ${this.renderFieldSection(
                      localize('editor.bar.attr_config.attribute_name', lang, 'Attribute Name'),
                      localize(
                        'editor.bar.attr_config.attribute_name_desc',
                        lang,
                        'Enter the name of the attribute that contains the percentage value (e.g., "battery_level")'
                      ),
                      hass,
                      { percentage_attribute_name: barModule.percentage_attribute_name || '' },
                      [this.textField('percentage_attribute_name')],
                      (e: CustomEvent) =>
                        updateModule({
                          percentage_attribute_name: e.detail.value.percentage_attribute_name,
                        })
                    )}
                  `
                )
              : ''
          }

          <!-- Difference Fields -->
          ${
            barModule.percentage_type === 'difference'
              ? this.renderConditionalFieldsGroup(
                  localize(
                    'editor.bar.diff_config.title',
                    lang,
                    'Difference Calculation Configuration'
                  ),
                  html`
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                    >
                      ${localize(
                        'editor.bar.diff_config.desc',
                        lang,
                        'Configure difference calculation settings'
                      )}
                    </div>
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'percentage_current_entity',
                      barModule.percentage_current_entity || '',
                      (value: string) => updateModule({ percentage_current_entity: value }),
                      undefined,
                      localize(
                        'editor.bar.diff_config.current_entity',
                        lang,
                        'Current Value Entity'
                      )
                    )}
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'percentage_total_entity',
                      barModule.percentage_total_entity || '',
                      (value: string) => updateModule({ percentage_total_entity: value }),
                      undefined,
                      localize('editor.bar.diff_config.total_entity', lang, 'Total Value Entity')
                    )}
                  `
                )
              : ''
          }

          <!-- Time Progress Fields -->
          ${
            barModule.percentage_type === 'time_progress'
              ? this.renderConditionalFieldsGroup(
                  localize(
                    'editor.bar.time_progress_config.title',
                    lang,
                    'Time Progress Configuration'
                  ),
                  html`
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                    >
                      ${localize(
                        'editor.bar.time_progress_config.desc',
                        lang,
                        'Configure real-time progress between two timestamp entities. Updates smoothly in the browser without backend load.'
                      )}
                    </div>
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'time_progress_start_entity',
                      (barModule as any).time_progress_start_entity || '',
                      (value: string) => updateModule({ time_progress_start_entity: value }),
                      undefined,
                      localize(
                        'editor.bar.time_progress_config.start_entity',
                        lang,
                        'Start Timestamp Entity'
                      )
                    )}
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'time_progress_end_entity',
                      (barModule as any).time_progress_end_entity || '',
                      (value: string) => updateModule({ time_progress_end_entity: value }),
                      undefined,
                      localize(
                        'editor.bar.time_progress_config.end_entity',
                        lang,
                        'End Timestamp Entity'
                      )
                    )}
                    ${this.renderSettingsSection('', '', [
                      {
                        title: localize(
                          'editor.bar.time_progress_config.direction',
                          lang,
                          'Progress Direction'
                        ),
                        description: localize(
                          'editor.bar.time_progress_config.direction_desc',
                          lang,
                          'Forward shows elapsed time from start to now. Backward shows remaining time from now to end.'
                        ),
                        hass,
                        data: {
                          time_progress_direction:
                            (barModule as any).time_progress_direction || 'forward',
                        },
                        schema: [
                          this.selectField('time_progress_direction', [
                            {
                              value: 'forward',
                              label: localize(
                                'editor.bar.time_progress.forward',
                                lang,
                                'Forward (Elapsed)'
                              ),
                            },
                            {
                              value: 'backward',
                              label: localize(
                                'editor.bar.time_progress.backward',
                                lang,
                                'Backward (Remaining)'
                              ),
                            },
                          ]),
                        ],
                        onChange: (e: CustomEvent) => updateModule(e.detail.value),
                      },
                    ])}
                    ${this.renderSliderField(
                      localize(
                        'editor.bar.time_progress_config.update_interval',
                        lang,
                        'Update Interval (ms)'
                      ),
                      localize(
                        'editor.bar.time_progress_config.update_interval_desc',
                        lang,
                        'How often to update the progress bar in milliseconds. Default: 1000 (1 second). Lower values = smoother but more CPU usage.'
                      ),
                      (barModule as any).time_progress_update_interval || 1000,
                      1000,
                      100,
                      10000,
                      100,
                      (value: number) => updateModule({ time_progress_update_interval: value }),
                      'ms'
                    )}
                  `
                )
              : ''
          }

          <!-- Range Mode Configuration -->
          ${
            barModule.percentage_type === 'range'
              ? this.renderConditionalFieldsGroup(
                  localize('editor.bar.range_config.title', lang, 'Range Configuration'),
                  html`
                    <div
                      style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                    >
                      ${localize(
                        'editor.bar.range_config.desc',
                        lang,
                        'Configure the start and end values for the range visualization.'
                      )}
                    </div>
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'range_start_entity',
                      (barModule as any).range_start_entity || '',
                      (value: string) => updateModule({ range_start_entity: value }),
                      undefined,
                      localize('editor.bar.range_config.start_entity', lang, 'Range Start Entity')
                    )}
                    ${this.renderFieldSection(
                      localize(
                        'editor.bar.range_config.start_attribute',
                        lang,
                        'Start Attribute (Optional)'
                      ),
                      localize(
                        'editor.bar.range_config.start_attribute_desc',
                        lang,
                        'If the value is in an attribute, enter the attribute name here.'
                      ),
                      hass,
                      {
                        range_start_attribute: (barModule as any).range_start_attribute || '',
                      },
                      [this.textField('range_start_attribute')],
                      (e: CustomEvent) =>
                        updateModule({
                          range_start_attribute: e.detail.value.range_start_attribute,
                        })
                    )}
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'range_end_entity',
                      (barModule as any).range_end_entity || '',
                      (value: string) => updateModule({ range_end_entity: value }),
                      undefined,
                      localize('editor.bar.range_config.end_entity', lang, 'Range End Entity')
                    )}
                    ${this.renderFieldSection(
                      localize(
                        'editor.bar.range_config.end_attribute',
                        lang,
                        'End Attribute (Optional)'
                      ),
                      localize(
                        'editor.bar.range_config.end_attribute_desc',
                        lang,
                        'If the value is in an attribute, enter the attribute name here.'
                      ),
                      hass,
                      {
                        range_end_attribute: (barModule as any).range_end_attribute || '',
                      },
                      [this.textField('range_end_attribute')],
                      (e: CustomEvent) =>
                        updateModule({
                          range_end_attribute: e.detail.value.range_end_attribute,
                        })
                    )}

                    <!-- Current Value Marker (Optional) -->
                    <div
                      style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; border-left: 3px solid var(--warning-color);"
                    >
                      <div
                        style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"
                      >
                        <ha-icon
                          icon="mdi:map-marker"
                          style="color: var(--warning-color);"
                        ></ha-icon>
                        ${localize(
                          'editor.bar.range_config.current_marker_title',
                          lang,
                          'Current Value Marker (Optional)'
                        )}
                      </div>
                      <div
                        style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;"
                      >
                        ${localize(
                          'editor.bar.range_config.current_marker_desc',
                          lang,
                          'Optionally show a marker indicating the current/average value within the range.'
                        )}
                      </div>

                      <div style="margin-bottom: 16px;">
                        ${this.renderEntityPickerWithVariables(
                          hass,
                          config,
                          'range_current_entity',
                          (barModule as any).range_current_entity || '',
                          (value: string) => updateModule({ range_current_entity: value }),
                          undefined,
                          localize(
                            'editor.bar.range_config.current_entity',
                            lang,
                            'Current Value Entity'
                          )
                        )}
                      </div>
                      ${this.renderSettingsSection('', '', [
                        {
                          title: localize(
                            'editor.bar.range_config.current_attribute',
                            lang,
                            'Current Attribute (Optional)'
                          ),
                          description: localize(
                            'editor.bar.range_config.current_attribute_desc',
                            lang,
                            'If the value is in an attribute, enter the attribute name here.'
                          ),
                          hass,
                          data: {
                            range_current_attribute:
                              (barModule as any).range_current_attribute || '',
                          },
                          schema: [this.textField('range_current_attribute')],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              range_current_attribute: e.detail.value.range_current_attribute,
                            }),
                        },
                      ])}

                      <div style="margin-top: 16px;">
                        <div
                          style="font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.range_config.current_color', lang, 'Marker Color')}
                        </div>
                        <ultra-color-picker
                          .hass=${hass}
                          .value=${(barModule as any).range_current_color || 'var(--accent-color)'}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ range_current_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  `
                )
              : ''
          }

          <!-- Manual Min/Max Range Configuration -->
          ${html`
            <div
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; border-left: 3px solid var(--primary-color);"
            >
              <div
                style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;"
              >
                <ha-icon
                  icon="mdi:arrow-expand-horizontal"
                  style="color: var(--primary-color);"
                ></ha-icon>
                ${localize('editor.bar.range.title', lang, 'Value Range (Min/Max)')}
              </div>
              <div
                style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 16px;"
              >
                ${barModule.percentage_type === 'difference'
                  ? localize(
                      'editor.bar.range.desc_difference',
                      lang,
                      'Override the visible range. Enter values in the same unit as your entities (e.g. km). Leave blank to auto-detect from the Total Entity.'
                    )
                  : localize(
                      'editor.bar.range.desc',
                      lang,
                      'Override auto-detected range with numbers. For dynamic min/max or labels, enable the unified template (value_min, value_max, left_label, right_label).'
                    )}
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Min Value -->
                ${this.renderFieldSection(
                  localize('editor.bar.range.min', lang, 'Minimum'),
                  '',
                  hass,
                  {
                    percentage_min:
                      barModule.percentage_min !== undefined
                        ? String(barModule.percentage_min)
                        : '',
                  },
                  [this.textField('percentage_min')],
                  (e: CustomEvent) => {
                    const val = (e.detail.value.percentage_min || '').trim();
                    clearTimeout(this._templateInputDebounce);
                    this._templateInputDebounce = setTimeout(() => {
                      if (val === '') {
                        updateModule({ percentage_min: undefined });
                      } else {
                        let normalized = val;
                        if (normalized.includes(',') && !normalized.includes('.')) {
                          normalized = normalized.replace(',', '.');
                        }
                        const num = parseFloat(normalized);
                        updateModule({
                          percentage_min: isNaN(num) ? undefined : num,
                        });
                      }
                      this.triggerPreviewUpdate();
                    }, 300);
                  }
                )}

                <!-- Max Value -->
                ${this.renderFieldSection(
                  localize('editor.bar.range.max', lang, 'Maximum'),
                  '',
                  hass,
                  {
                    percentage_max:
                      barModule.percentage_max !== undefined
                        ? String(barModule.percentage_max)
                        : '',
                  },
                  [this.textField('percentage_max')],
                  (e: CustomEvent) => {
                    const val = (e.detail.value.percentage_max || '').trim();
                    clearTimeout(this._templateInputDebounce);
                    this._templateInputDebounce = setTimeout(() => {
                      if (val === '') {
                        updateModule({ percentage_max: undefined });
                      } else {
                        let normalized = val;
                        if (normalized.includes(',') && !normalized.includes('.')) {
                          normalized = normalized.replace(',', '.');
                        }
                        const num = parseFloat(normalized);
                        updateModule({
                          percentage_max: isNaN(num) ? undefined : num,
                        });
                      }
                      this.triggerPreviewUpdate();
                    }, 300);
                  }
                )}
              </div>
            </div>
          `}

          <!-- Bar Percentage Entity (shown for entity mode and as optional fallback for difference mode) -->
          ${
            !barModule.percentage_type ||
            barModule.percentage_type === 'entity' ||
            barModule.percentage_type === 'difference'
              ? html`
                  <div style="margin-top: 24px;">
                    ${this.renderEntityPickerWithVariables(
                      hass,
                      config,
                      'entity',
                      differenceFallbackEntityValue,
                      (value: string) => updateModule({ entity: value }),
                      ['sensor', 'input_number'],
                      barModule.percentage_type === 'difference'
                        ? localize(
                            'editor.bar.entity.fallback_title',
                            lang,
                            'Fallback Entity (optional)'
                          )
                        : localize('editor.bar.entity.title', lang, 'Bar Percentage Entity')
                    )}
                    ${!barModule.entity && barModule.percentage_type !== 'difference'
                      ? html`
                          <div
                            style="color: var(--warning-color); font-size: 12px; margin-top: 4px; font-style: italic;"
                          >
                            <ha-icon
                              icon="mdi:information-outline"
                              style="font-size: 14px; margin-right: 4px;"
                            ></ha-icon>
                            ${localize(
                              'editor.bar.entity.no_entity_warning',
                              lang,
                              'No entity selected - Please choose a sensor with values between 0-100'
                            )}
                          </div>
                        `
                      : html`
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);"
                          >
                            ${barModule.percentage_type === 'difference'
                              ? localize(
                                  'editor.bar.entity.fallback_desc',
                                  lang,
                                  'Optional fallback entity for text/labels. Difference mode uses Current and Total entities for bar calculation.'
                                )
                              : localize(
                                  'editor.bar.entity.desc_present',
                                  lang,
                                  'The entity that provides the percentage value for the bar.'
                                )}
                          </div>
                        `}
                  </div>
                `
              : ''
          }

          <!-- Limit Value Entity -->
          <div style="margin-top: 24px;">
            ${this.renderEntityPickerWithVariables(
              hass,
              config,
              'limit_entity',
              barModule.limit_entity || '',
              (value: string) => updateModule({ limit_entity: value }),
              undefined,
              localize('editor.bar.limit_entity.title', lang, 'Limit Value Entity (optional)')
            )}
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);"
            >
              ${localize('editor.bar.limit_entity.desc', lang, 'Optional: Add a vertical indicator line on the bar (e.g. charge limit for EV battery).')}
            </div>
          </div>
        </div>
        </div>

        <!-- Bar Appearance Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${localize('editor.bar.appearance.title', lang, 'Bar Appearance')}
          </div>

          <!-- Bar Style -->
          <div class="field-group" style="margin-bottom: 16px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 4px;"
            >
              ${localize('editor.bar.appearance.style', lang, 'Bar Style')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              ${localize(
                'editor.bar.appearance.style_desc',
                lang,
                'Choose the visual style of the progress bar.'
              )}
            </div>
            ${this.renderUcForm(
              hass,
              { bar_style: barModule.bar_style || 'flat' },
              [
                this.selectField('bar_style', [
                  {
                    value: 'flat',
                    label: localize('editor.bar.appearance.style_flat', lang, 'Flat (Default)'),
                  },
                  {
                    value: 'glossy',
                    label: localize('editor.bar.appearance.style_glossy', lang, 'Glossy'),
                  },
                  {
                    value: 'embossed',
                    label: localize('editor.bar.appearance.style_embossed', lang, 'Embossed'),
                  },
                  {
                    value: 'inset',
                    label: localize('editor.bar.appearance.style_inset', lang, 'Inset'),
                  },
                  {
                    value: 'gradient-overlay',
                    label: localize(
                      'editor.bar.appearance.style_gradient',
                      lang,
                      'Gradient Overlay'
                    ),
                  },
                  {
                    value: 'neon-glow',
                    label: localize('editor.bar.appearance.style_neon', lang, 'Neon Glow'),
                  },
                  {
                    value: 'outline',
                    label: localize('editor.bar.appearance.style_outline', lang, 'Outline'),
                  },
                  {
                    value: 'glass',
                    label: localize('editor.bar.appearance.style_glass', lang, 'Glass'),
                  },
                  {
                    value: 'metallic',
                    label: localize('editor.bar.appearance.style_metallic', lang, 'Metallic'),
                  },
                  {
                    value: 'neumorphic',
                    label: localize('editor.bar.appearance.style_neumorphic', lang, 'Neumorphic'),
                  },
                  {
                    value: 'dashed',
                    label: localize('editor.bar.appearance.style_dashed', lang, 'Dashed'),
                  },
                  {
                    value: 'dots',
                    label: localize('editor.bar.appearance.style_dots', lang, 'Dots'),
                  },
                  {
                    value: 'minimal',
                    label: localize('editor.bar.appearance.style_minimal', lang, 'Minimal'),
                  },
                ]),
              ],
              (e: CustomEvent) => {
                const next = e.detail.value.bar_style;
                const prev = barModule.bar_style || 'flat';
                if (next === prev) return;
                updateModule({ bar_style: next });
                // Trigger re-render to update dropdown UI
                setTimeout(() => {
                  this.triggerPreviewUpdate();
                }, 50);
              },
              false
            )}
          </div>

          <!-- Bar Fill Direction -->
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="field-title"
              style="font-size: 16px !important; font-weight: 600 !important;"
            >
              ${localize('editor.bar.appearance.direction', lang, 'Fill Direction')}
            </div>
            <div
              class="field-description"
              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
            >
              ${localize(
                'editor.bar.appearance.direction_desc',
                lang,
                'Choose which direction the bar fills from as the value increases.'
              )}
            </div>
            <div
              style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
            >
              <button
                type="button"
                style="padding: 8px 12px; border: 2px solid ${
                  (barModule.bar_direction || 'left-to-right') === 'left-to-right'
                    ? 'var(--primary-color)'
                    : 'var(--divider-color)'
                }; background: ${
                  (barModule.bar_direction || 'left-to-right') === 'left-to-right'
                    ? 'var(--primary-color)'
                    : 'transparent'
                }; color: ${
                  (barModule.bar_direction || 'left-to-right') === 'left-to-right'
                    ? 'white'
                    : 'var(--primary-text-color)'
                }; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                @click=${() => updateModule({ bar_direction: 'left-to-right' })}
              >
                <ha-icon
                  icon="mdi:arrow-right"
                  style="font-size: 16px; flex-shrink: 0;"
                ></ha-icon>
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >${localize('editor.bar.appearance.left_to_right', lang, 'Left to Right')}</span
                >
              </button>
              <button
                type="button"
                style="padding: 8px 12px; border: 2px solid ${
                  (barModule.bar_direction || 'left-to-right') === 'right-to-left'
                    ? 'var(--primary-color)'
                    : 'var(--divider-color)'
                }; background: ${
                  (barModule.bar_direction || 'left-to-right') === 'right-to-left'
                    ? 'var(--primary-color)'
                    : 'transparent'
                }; color: ${
                  (barModule.bar_direction || 'left-to-right') === 'right-to-left'
                    ? 'white'
                    : 'var(--primary-text-color)'
                }; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                @click=${() => updateModule({ bar_direction: 'right-to-left' })}
              >
                <ha-icon
                  icon="mdi:arrow-left"
                  style="font-size: 16px; flex-shrink: 0;"
                ></ha-icon>
                <span
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                  >${localize('editor.bar.appearance.right_to_left', lang, 'Right to Left')}</span
                >
              </button>
            </div>
          </div>

          <!-- Bar Height -->
          ${this.renderSliderField(
            localize('editor.bar.appearance.height', lang, 'Bar Height'),
            localize(
              'editor.bar.appearance.height_desc',
              lang,
              'Adjust the thickness of the progress bar in pixels.'
            ),
            (barModule as any).height ?? 20,
            20,
            8,
            60,
            2,
            (v: number) => {
              updateModule({ height: v });
            },
            'px'
          )}

          <!-- Border Radius -->
          ${this.renderSliderField(
            localize('editor.bar.appearance.border_radius', lang, 'Border Radius'),
            localize(
              'editor.bar.appearance.border_radius_desc',
              lang,
              'Control the rounded corners of the bar.'
            ),
            barModule.border_radius ?? 10,
            10,
            0,
            50,
            1,
            (v: number) => {
              updateModule({ border_radius: v });
            },
            'px'
          )}

          <!-- Bar Width -->
          ${this.renderSliderField(
            localize('editor.bar.appearance.width', lang, 'Bar Width'),
            localize(
              'editor.bar.appearance.width_desc',
              lang,
              'Set the width of the bar as a percentage of the container.'
            ),
            barModule.bar_width || 100,
            100,
            10,
            100,
            5,
            (v: number) => {
              updateModule({ bar_width: v });
            },
            '%'
          )}

          <!-- Bar Alignment with Icons -->
          ${
            (barModule.bar_width || 100) < 100
              ? html`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important;"
                    >
                      ${localize('editor.bar.appearance.alignment', lang, 'Bar Alignment')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.bar.appearance.alignment_desc',
                        lang,
                        "Choose how to align the bar when it's less than 100% width."
                      )}
                    </div>
                    <div
                      style="display: flex; gap: 8px; justify-content: flex-start; flex-wrap: wrap;"
                    >
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                          'center') === 'left'
                          ? 'var(--primary-color)'
                          : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                          'center') === 'left'
                          ? 'var(--primary-color)'
                          : 'transparent'}; color: ${(barModule.bar_alignment || 'center') ===
                        'left'
                          ? 'white'
                          : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${() => updateModule({ bar_alignment: 'left' })}
                      >
                        <ha-icon
                          icon="mdi:format-align-left"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${localize('editor.common.left', lang, 'Left')}</span
                        >
                      </button>
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                          'center') === 'center'
                          ? 'var(--primary-color)'
                          : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                          'center') === 'center'
                          ? 'var(--primary-color)'
                          : 'transparent'}; color: ${(barModule.bar_alignment || 'center') ===
                        'center'
                          ? 'white'
                          : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${() => updateModule({ bar_alignment: 'center' })}
                      >
                        <ha-icon
                          icon="mdi:format-align-center"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${localize('editor.common.center', lang, 'Center')}</span
                        >
                      </button>
                      <button
                        type="button"
                        style="padding: 8px 12px; border: 2px solid ${(barModule.bar_alignment ||
                          'center') === 'right'
                          ? 'var(--primary-color)'
                          : 'var(--divider-color)'}; background: ${(barModule.bar_alignment ||
                          'center') === 'right'
                          ? 'var(--primary-color)'
                          : 'transparent'}; color: ${(barModule.bar_alignment || 'center') ===
                        'right'
                          ? 'white'
                          : 'var(--primary-text-color)'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; box-sizing: border-box;"
                        @click=${() => updateModule({ bar_alignment: 'right' })}
                      >
                        <ha-icon
                          icon="mdi:format-align-right"
                          style="font-size: 16px; flex-shrink: 0;"
                        ></ha-icon>
                        <span
                          style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                          >${localize('editor.common.right', lang, 'Right')}</span
                        >
                      </button>
                    </div>
                  </div>
                `
              : ''
          }

          <!-- Label Alignment -->
          ${
            barModule.left_enabled || barModule.right_enabled
              ? html`
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important;"
                    >
                      ${localize('editor.bar.labels.alignment', lang, 'Label Alignment')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.bar.labels.alignment_desc',
                        lang,
                        'Control how the left and right side labels are positioned.'
                      )}
                    </div>
                    ${this.renderUcForm(
                      hass,
                      { label_alignment: barModule.label_alignment || 'space-between' },
                      [
                        this.selectField('label_alignment', [
                          {
                            value: 'left',
                            label: localize('editor.common.left', lang, 'Left'),
                          },
                          {
                            value: 'center',
                            label: localize('editor.common.center', lang, 'Center'),
                          },
                          {
                            value: 'right',
                            label: localize('editor.common.right', lang, 'Right'),
                          },
                          {
                            value: 'space-between',
                            label: localize('editor.common.space_between', lang, 'Space Between'),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.label_alignment;
                        const prev = barModule.label_alignment || 'space-between';
                        if (next === prev) return;
                        updateModule({ label_alignment: next });
                        // Trigger re-render to update dropdown UI
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>
                `
              : ''
          }

          <!-- Glass Blur Amount (only show when glass style is selected) -->
          ${
            barModule.bar_style === 'glass'
              ? html`
                  <div class="field-container" style="margin-bottom: 24px;">
                    ${this.renderSliderField(
                      localize('editor.bar.appearance.glass_blur', lang, 'Glass Blur'),
                      localize(
                        'editor.bar.appearance.glass_blur_desc',
                        lang,
                        'Adjust the blur intensity of the glass effect.'
                      ),
                      barModule.glass_blur_amount || 8,
                      8,
                      0,
                      20,
                      1,
                      (v: number) => {
                        updateModule({ glass_blur_amount: v });
                      },
                      'px'
                    )}
                  </div>
                `
              : ''
          }
        </div>

        <!-- Scale/Tick Marks Configuration Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${this.renderFieldSection(
            localize('editor.bar.scale.title', lang, 'Scale / Tick Marks'),
            localize(
              'editor.bar.scale.desc',
              lang,
              'Add tick marks and labels along the bar to show the scale. Useful for visualizing ranges like temperature or time.'
            ),
            hass,
            { show_scale: (barModule as any).show_scale || false },
            [this.booleanField('show_scale')],
            (e: CustomEvent) => updateModule({ show_scale: e.detail.value.show_scale })
          )}

          ${
            (barModule as any).show_scale
              ? html`
                  <!-- Scale Divisions -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                    >
                      ${localize('editor.bar.scale.divisions', lang, 'Number of Divisions')}
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                    >
                      ${localize(
                        'editor.bar.scale.divisions_desc',
                        lang,
                        'How many segments to divide the scale into (e.g., 4 = marks at 0%, 25%, 50%, 75%, 100%).'
                      )}
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <ha-slider
                        style="flex: 1;"
                        .min=${2}
                        .max=${20}
                        .step=${1}
                        .value=${(barModule as any).scale_divisions || 5}
                        @change=${(e: Event) =>
                          updateModule({ scale_divisions: parseInt((e.target as any).value, 10) })}
                      ></ha-slider>
                      <span style="min-width: 30px; text-align: center; font-weight: 600;">
                        ${(barModule as any).scale_divisions || 5}
                      </span>
                    </div>
                  </div>

                  <!-- Show Labels Toggle -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    ${this.renderFieldSection(
                      localize('editor.bar.scale.show_labels', lang, 'Show Labels'),
                      localize(
                        'editor.bar.scale.show_labels_desc',
                        lang,
                        'Display numeric values at each tick mark.'
                      ),
                      hass,
                      { scale_show_labels: (barModule as any).scale_show_labels !== false },
                      [this.booleanField('scale_show_labels')],
                      (e: CustomEvent) =>
                        updateModule({ scale_show_labels: e.detail.value.scale_show_labels })
                    )}
                    ${(barModule as any).scale_show_labels !== false
                      ? html`
                          <!-- Label Size -->
                          <div class="field-group" style="margin-bottom: 16px;">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${localize('editor.bar.scale.label_size', lang, 'Label Size')}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <ha-slider
                                style="flex: 1;"
                                .min=${8}
                                .max=${16}
                                .step=${1}
                                .value=${(barModule as any).scale_label_size || 10}
                                @change=${(e: Event) =>
                                  updateModule({
                                    scale_label_size: parseInt((e.target as any).value, 10),
                                  })}
                              ></ha-slider>
                              <span style="min-width: 40px; text-align: center; font-weight: 600;">
                                ${(barModule as any).scale_label_size || 10}px
                              </span>
                            </div>
                          </div>

                          <!-- Label Color -->
                          <div class="field-group" style="margin-bottom: 16px;">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                            >
                              ${localize('editor.bar.scale.label_color', lang, 'Label Color')}
                            </div>
                            <ultra-color-picker
                              .hass=${hass}
                              .value=${(barModule as any).scale_label_color || ''}
                              .placeholder=${'var(--secondary-text-color)'}
                              @value-changed=${(e: CustomEvent) =>
                                updateModule({ scale_label_color: e.detail.value })}
                            ></ultra-color-picker>
                          </div>
                        `
                      : ''}
                    ${this.renderFieldSection(
                      localize(
                        'editor.bar.scale.clamp_edge_labels',
                        lang,
                        'Clamp Edge Labels Inward'
                      ),
                      localize(
                        'editor.bar.scale.clamp_edge_labels_desc',
                        lang,
                        'Slightly nudge the first and last labels inward to reduce clipping on tight layouts.'
                      ),
                      hass,
                      {
                        scale_clamp_edge_labels: this.normalizeBoolean(
                          (barModule as any).scale_clamp_edge_labels,
                          true
                        ),
                      },
                      [this.booleanField('scale_clamp_edge_labels')],
                      (e: CustomEvent) =>
                        updateModule({
                          scale_clamp_edge_labels: this.normalizeBoolean(
                            e.detail.value.scale_clamp_edge_labels,
                            true
                          ),
                        })
                    )}
                    ${this.renderFieldSection(
                      localize(
                        'editor.bar.scale.mobile_options_enabled',
                        lang,
                        'Enable Mobile Label Options'
                      ),
                      localize(
                        'editor.bar.scale.mobile_options_enabled_desc',
                        lang,
                        'Apply mobile-specific label behavior below the configured viewport width.'
                      ),
                      hass,
                      {
                        scale_mobile_options_enabled: this.normalizeBoolean(
                          (barModule as any).scale_mobile_options_enabled,
                          false
                        ),
                      },
                      [this.booleanField('scale_mobile_options_enabled')],
                      (e: CustomEvent) =>
                        updateModule({
                          scale_mobile_options_enabled: this.normalizeBoolean(
                            e.detail.value.scale_mobile_options_enabled,
                            false
                          ),
                        })
                    )}
                    ${this.normalizeBoolean((barModule as any).scale_mobile_options_enabled, false)
                      ? html`
                          <div class="field-group" style="margin-bottom: 16px;">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${localize(
                                'editor.bar.scale.mobile_breakpoint',
                                lang,
                                'Mobile Breakpoint'
                              )}
                            </div>
                            <div
                              class="field-description"
                              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                            >
                              ${localize(
                                'editor.bar.scale.mobile_breakpoint_desc',
                                lang,
                                'Apply mobile label options when viewport width is at or below this value.'
                              )}
                            </div>
                            <div style="display: flex; align-items: center; gap: 12px;">
                              <ha-slider
                                style="flex: 1;"
                                .min=${320}
                                .max=${640}
                                .step=${10}
                                .value=${(barModule as any).scale_mobile_breakpoint || 420}
                                @change=${(e: Event) =>
                                  updateModule({
                                    scale_mobile_breakpoint: parseInt((e.target as any).value, 10),
                                  })}
                              ></ha-slider>
                              <span style="min-width: 52px; text-align: center; font-weight: 600;">
                                ${(barModule as any).scale_mobile_breakpoint || 420}px
                              </span>
                            </div>
                          </div>

                          ${this.renderFieldSection(
                            localize(
                              'editor.bar.scale.mobile_reduce_density',
                              lang,
                              'Reduce Label Density on Mobile'
                            ),
                            localize(
                              'editor.bar.scale.mobile_reduce_density_desc',
                              lang,
                              'Hide every second label on mobile to prevent overlap while keeping all ticks.'
                            ),
                            hass,
                            {
                              scale_mobile_reduce_label_density: this.normalizeBoolean(
                                (barModule as any).scale_mobile_reduce_label_density,
                                false
                              ),
                            },
                            [this.booleanField('scale_mobile_reduce_label_density')],
                            (e: CustomEvent) =>
                              updateModule({
                                scale_mobile_reduce_label_density: this.normalizeBoolean(
                                  e.detail.value.scale_mobile_reduce_label_density,
                                  false
                                ),
                              })
                          )}
                          ${this.renderFieldSection(
                            localize(
                              'editor.bar.scale.mobile_abbreviate_labels',
                              lang,
                              'Abbreviate Labels on Mobile'
                            ),
                            localize(
                              'editor.bar.scale.mobile_abbreviate_labels_desc',
                              lang,
                              'Shorten numeric labels on mobile (e.g. 1200 -> 1.2k, 700 km -> 700).'
                            ),
                            hass,
                            {
                              scale_mobile_abbreviate_labels: this.normalizeBoolean(
                                (barModule as any).scale_mobile_abbreviate_labels,
                                false
                              ),
                            },
                            [this.booleanField('scale_mobile_abbreviate_labels')],
                            (e: CustomEvent) =>
                              updateModule({
                                scale_mobile_abbreviate_labels: this.normalizeBoolean(
                                  e.detail.value.scale_mobile_abbreviate_labels,
                                  false
                                ),
                              })
                          )}
                        `
                      : ''}

                    <!-- Tick Color -->
                    <div class="field-group" style="margin-bottom: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                      >
                        ${localize('editor.bar.scale.tick_color', lang, 'Tick Color')}
                      </div>
                      <ultra-color-picker
                        .hass=${hass}
                        .value=${(barModule as any).scale_tick_color || ''}
                        .placeholder=${'var(--divider-color)'}
                        @value-changed=${(e: CustomEvent) =>
                          updateModule({ scale_tick_color: e.detail.value })}
                      ></ultra-color-picker>
                    </div>

                    <!-- Custom Tick Positions -->
                    <div class="field-group" style="margin-bottom: 16px;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        ${localize('editor.bar.scale.custom_ticks', lang, 'Custom Tick Positions')}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                      >
                        ${localize(
                          'editor.bar.scale.custom_ticks_desc',
                          lang,
                          "Comma-separated values in your entity's unit. Overrides the number of divisions (e.g. 10,20,30,40). Leave blank to use evenly spaced divisions."
                        )}
                      </div>
                      ${this.renderUcForm(
                        hass,
                        { scale_custom_ticks: (barModule as any).scale_custom_ticks || '' },
                        [this.textField('scale_custom_ticks')],
                        (e: CustomEvent) =>
                          updateModule({ scale_custom_ticks: e.detail.value.scale_custom_ticks })
                      )}
                    </div>

                    <!-- Custom Tick Labels -->
                    ${(barModule as any).scale_custom_ticks?.trim()
                      ? html`
                          <div class="field-group" style="margin-bottom: 16px;">
                            <div
                              class="field-title"
                              style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                            >
                              ${localize(
                                'editor.bar.scale.custom_labels',
                                lang,
                                'Custom Tick Labels'
                              )}
                            </div>
                            <div
                              class="field-description"
                              style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                            >
                              ${localize(
                                'editor.bar.scale.custom_labels_desc',
                                lang,
                                'Optional comma-separated labels matching each custom tick (e.g. Reserve,1/4,1/2,3/4,Full). Leave a slot empty to show that tick\u2019s numeric value, or enter "-" (a single dash) to hide that tick\u2019s label while keeping its tick mark.'
                              )}
                            </div>
                            ${this.renderUcForm(
                              hass,
                              {
                                scale_custom_labels: (barModule as any).scale_custom_labels || '',
                              },
                              [this.textField('scale_custom_labels')],
                              (e: CustomEvent) =>
                                updateModule({
                                  scale_custom_labels: e.detail.value.scale_custom_labels,
                                })
                            )}
                            <div
                              style="font-size: 12px; font-style: italic; color: var(--secondary-text-color); margin-top: 6px; line-height: 1.4;"
                            >
                              ${localize(
                                'editor.bar.scale.custom_labels_hint',
                                lang,
                                'Tip: use "-" in any slot to hide that tick\u2019s label. Accepted hide tokens: -, _, none, {none}, hide.'
                              )}
                            </div>
                          </div>
                        `
                      : ''}

                    <!-- Scale Position -->
                    <div class="field-group" style="margin-bottom: 0;">
                      <div
                        class="field-title"
                        style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                      >
                        ${localize('editor.bar.scale.position', lang, 'Scale Position')}
                      </div>
                      <div
                        class="field-description"
                        style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                      >
                        ${localize(
                          'editor.bar.scale.position_desc',
                          lang,
                          'Position the scale above or below the bar.'
                        )}
                      </div>
                      <div style="display: flex; gap: 8px;">
                        <button
                          type="button"
                          style="padding: 8px 16px; border: 2px solid ${(barModule as any)
                            .scale_position === 'above'
                            ? 'var(--primary-color)'
                            : 'var(--divider-color)'}; background: ${(barModule as any)
                            .scale_position === 'above'
                            ? 'var(--primary-color)'
                            : 'transparent'}; color: ${(barModule as any).scale_position === 'above'
                            ? 'var(--text-primary-color)'
                            : 'var(--primary-text-color)'}; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px;"
                          @click=${() => updateModule({ scale_position: 'above' })}
                        >
                          <ha-icon icon="mdi:arrow-up" style="--mdc-icon-size: 16px;"></ha-icon>
                          ${localize('editor.bar.scale.position_above', lang, 'Above')}
                        </button>
                        <button
                          type="button"
                          style="padding: 8px 16px; border: 2px solid ${(barModule as any)
                            .scale_position !== 'above'
                            ? 'var(--primary-color)'
                            : 'var(--divider-color)'}; background: ${(barModule as any)
                            .scale_position !== 'above'
                            ? 'var(--primary-color)'
                            : 'transparent'}; color: ${(barModule as any).scale_position !== 'above'
                            ? 'var(--text-primary-color)'
                            : 'var(--primary-text-color)'}; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px;"
                          @click=${() => updateModule({ scale_position: 'below' })}
                        >
                          <ha-icon icon="mdi:arrow-down" style="--mdc-icon-size: 16px;"></ha-icon>
                          ${localize('editor.bar.scale.position_below', lang, 'Below')}
                        </button>
                      </div>
                    </div>
                  </div>
                `
              : html`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${localize(
                      'editor.bar.scale.enable_toggle',
                      lang,
                      'Enable the toggle above to configure scale settings'
                    )}
                  </div>
                `
          }
        </div>

        <!-- Minimal Style Icon Configuration Section -->
        ${
          barModule.bar_style === 'minimal'
            ? html`
                <div
                  class="settings-section"
                  style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
                >
                  <div
                    class="section-title"
                    style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
                  >
                    ${localize('editor.bar.minimal.icon_config', lang, 'Minimal Style Icon')}
                  </div>

                  <!-- Enable Icon Toggle -->
                  ${this.renderFieldSection(
                    localize('editor.bar.minimal.icon_enabled', lang, 'Enable Icon'),
                    localize(
                      'editor.bar.minimal.icon_enabled_desc',
                      lang,
                      'Enable icon display to replace or enhance the dot indicator in minimal bar style.'
                    ),
                    hass,
                    { minimal_icon_enabled: barModule.minimal_icon_enabled || false },
                    [this.booleanField('minimal_icon_enabled')],
                    (e: CustomEvent) =>
                      updateModule({ minimal_icon_enabled: e.detail.value.minimal_icon_enabled })
                  )}
                  ${barModule.minimal_icon_enabled
                    ? html`
                        ${this.renderIconField(
                          localize('editor.bar.minimal.icon', lang, 'Icon'),
                          localize(
                            'editor.bar.minimal.icon_desc',
                            lang,
                            'Select the icon to display (e.g., mdi:battery).'
                          ),
                          hass,
                          barModule.minimal_icon || '',
                          v => updateModule({ minimal_icon: v })
                        )}

                        <!-- Icon Display Mode -->
                        <div class="field-group" style="margin-bottom: 16px;">
                          <div
                            class="field-title"
                            style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 4px;"
                          >
                            ${localize('editor.bar.minimal.icon_mode', lang, 'Display Mode')}
                          </div>
                          <div
                            class="field-description"
                            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 8px;"
                          >
                            ${localize(
                              'editor.bar.minimal.icon_mode_desc',
                              lang,
                              'Choose how the icon is displayed with the dot.'
                            )}
                          </div>
                          ${this.renderUcForm(
                            hass,
                            { minimal_icon_mode: barModule.minimal_icon_mode || 'icon-in-dot' },
                            [
                              this.selectField('minimal_icon_mode', [
                                {
                                  value: 'dot-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_dot_only',
                                    lang,
                                    'Dot Only'
                                  ),
                                },
                                {
                                  value: 'icon-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_only',
                                    lang,
                                    'Icon Only'
                                  ),
                                },
                                {
                                  value: 'icon-in-dot',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_in_dot',
                                    lang,
                                    'Icon in Dot'
                                  ),
                                },
                              ]),
                            ],
                            (e: CustomEvent) => {
                              const next = e.detail.value.minimal_icon_mode;
                              const prev = barModule.minimal_icon_mode || 'icon-in-dot';
                              if (next === prev) return;
                              updateModule({ minimal_icon_mode: next });
                              setTimeout(() => {
                                this.triggerPreviewUpdate();
                              }, 50);
                            },
                            false
                          )}
                        </div>

                        <!-- Icon Size Auto Toggle -->
                        ${this.renderFieldSection(
                          localize('editor.bar.minimal.icon_size_auto', lang, 'Auto Size'),
                          localize(
                            'editor.bar.minimal.icon_size_auto_desc',
                            lang,
                            'Automatically scale icon size based on bar height.'
                          ),
                          hass,
                          { minimal_icon_size_auto: barModule.minimal_icon_size_auto !== false },
                          [this.booleanField('minimal_icon_size_auto')],
                          (e: CustomEvent) =>
                            updateModule({
                              minimal_icon_size_auto: e.detail.value.minimal_icon_size_auto,
                            })
                        )}

                        <!-- Manual Icon Size (only if auto is disabled) -->
                        ${barModule.minimal_icon_size_auto === false
                          ? html`
                              ${this.renderSliderField(
                                localize('editor.bar.minimal.icon_size', lang, 'Icon Size'),
                                localize(
                                  'editor.bar.minimal.icon_size_desc',
                                  lang,
                                  'Manually set the icon size in pixels.'
                                ),
                                barModule.minimal_icon_size || 24,
                                24,
                                8,
                                48,
                                1,
                                (v: number) => {
                                  updateModule({ minimal_icon_size: v });
                                },
                                'px'
                              )}
                            `
                          : ''}

                        <!-- Use Dot Color Toggle -->
                        ${this.renderFieldSection(
                          localize('editor.bar.minimal.use_dot_color', lang, 'Use Dot Color'),
                          localize(
                            'editor.bar.minimal.use_dot_color_desc',
                            lang,
                            'Use the dot color (including gradient colors) for the icon.'
                          ),
                          hass,
                          {
                            minimal_icon_use_dot_color:
                              barModule.minimal_icon_use_dot_color !== false,
                          },
                          [this.booleanField('minimal_icon_use_dot_color')],
                          (e: CustomEvent) =>
                            updateModule({
                              minimal_icon_use_dot_color: e.detail.value.minimal_icon_use_dot_color,
                            })
                        )}

                        <!-- Custom Icon Color (only if use_dot_color is false) -->
                        ${barModule.minimal_icon_use_dot_color === false
                          ? html`
                              <div class="field-container" style="margin-bottom: 16px;">
                                <div class="field-title">
                                  ${localize('editor.bar.minimal.icon_color', lang, 'Icon Color')}
                                </div>
                                <div class="field-description">
                                  ${localize(
                                    'editor.bar.minimal.icon_color_desc',
                                    lang,
                                    'Set a custom color for the icon.'
                                  )}
                                </div>
                                <ultra-color-picker
                                  style="width: 100%;"
                                  .value=${barModule.minimal_icon_color || ''}
                                  .defaultValue=${'var(--primary-color)'}
                                  .hass=${hass}
                                  @value-changed=${(e: CustomEvent) =>
                                    updateModule({ minimal_icon_color: e.detail.value })}
                                ></ultra-color-picker>
                              </div>
                            `
                          : ''}
                      `
                    : html`
                        <div
                          style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                        >
                          ${localize(
                            'editor.bar.minimal.enable_toggle',
                            lang,
                            'Enable the toggle above to configure icon settings'
                          )}
                        </div>
                      `}
                </div>
              `
            : ''
        }

        <!-- Percentage Text Display Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${this.renderFieldSection(
            localize('editor.bar.text_display.title', lang, 'Text Display'),
            localize(
              'editor.bar.text_display.desc',
              lang,
              'Control the visibility and appearance of text values shown directly on the bar. For difference and template modes, you can choose to display raw entity values instead of percentages.'
            ),
            hass,
            { show_percentage: showPercentageText },
            [this.booleanField('show_percentage')],
            (e: CustomEvent) => {
              const nextShowPercentage = this.normalizeBoolean(
                e.detail.value.show_percentage,
                true
              );
              updateModule({
                show_percentage: nextShowPercentage,
                ...(nextShowPercentage ? {} : { show_value: false }),
              });
            }
          )}

          ${
            showPercentageText
              ? html`
                  <!-- Display Type Toggle - Only show for difference and template types -->
                  ${barModule.percentage_type === 'difference'
                    ? html`
                        ${this.renderFieldSection(
                          localize(
                            'editor.bar.text_display.show_value',
                            lang,
                            'Show Value Instead of Percentage'
                          ),
                          localize(
                            'editor.bar.text_display.show_value_desc',
                            lang,
                            'When enabled, shows the actual entity value instead of percentage. Useful for displaying raw sensor values like "45 kWh" instead of "75%".'
                          ),
                          hass,
                          { show_value: showValueInstead },
                          [this.booleanField('show_value')],
                          (e: CustomEvent) =>
                            updateModule({
                              show_value: this.normalizeBoolean(e.detail.value.show_value, false),
                            })
                        )}
                      `
                    : ''}
                  ${this.renderSliderField(
                    localize('editor.bar.text_display.text_size', lang, 'Text Size'),
                    localize(
                      'editor.bar.text_display.text_size_desc',
                      lang,
                      'Adjust the size of the text displayed on the bar.'
                    ),
                    barModule.percentage_text_size || 14,
                    14,
                    8,
                    100,
                    1,
                    (v: number) => {
                      updateModule({ percentage_text_size: v });
                    },
                    'px'
                  )}
                  <div class="field-group" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${localize('editor.bar.text_display.text_alignment', lang, 'Text Alignment')}
                    </div>
                    ${this.renderUcForm(
                      hass,
                      {
                        percentage_text_alignment: barModule.percentage_text_alignment || 'center',
                      },
                      [
                        this.selectField('percentage_text_alignment', [
                          {
                            value: 'left',
                            label: localize('editor.common.left', lang, 'Left'),
                          },
                          {
                            value: 'center',
                            label: localize('editor.common.center', lang, 'Center'),
                          },
                          {
                            value: 'right',
                            label: localize('editor.common.right', lang, 'Right'),
                          },
                          {
                            value: 'follow-fill',
                            label: localize(
                              'editor.bar.text_display.follow_fill',
                              lang,
                              'Follow Fill'
                            ),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.percentage_text_alignment;
                        const prev = barModule.percentage_text_alignment || 'center';
                        if (next === prev) return;
                        updateModule({ percentage_text_alignment: next });
                        // Trigger re-render to update dropdown UI
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>

                  <!-- Text Formatting -->
                  <div class="field-container" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${localize(
                        'editor.bar.text_display.text_formatting',
                        lang,
                        'Text Formatting'
                      )}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.text_display.text_formatting_desc',
                        lang,
                        'Apply formatting styles to the percentage text.'
                      )}
                    </div>
                    <div class="format-buttons" style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <button
                        class="format-btn ${barModule.percentage_text_bold ? 'active' : ''}"
                        @click=${() =>
                          updateModule({ percentage_text_bold: !barModule.percentage_text_bold })}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${barModule.percentage_text_bold
                          ? 'var(--primary-color)'
                          : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${barModule.percentage_text_bold
                          ? 'var(--text-primary-color)'
                          : 'var(--primary-text-color)'};"
                        title="Bold"
                      >
                        <ha-icon icon="mdi:format-bold"></ha-icon>
                      </button>
                      <button
                        class="format-btn ${barModule.percentage_text_italic ? 'active' : ''}"
                        @click=${() =>
                          updateModule({
                            percentage_text_italic: !barModule.percentage_text_italic,
                          })}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${barModule.percentage_text_italic
                          ? 'var(--primary-color)'
                          : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${barModule.percentage_text_italic
                          ? 'var(--text-primary-color)'
                          : 'var(--primary-text-color)'};"
                        title="Italic"
                      >
                        <ha-icon icon="mdi:format-italic"></ha-icon>
                      </button>
                      <button
                        class="format-btn ${barModule.percentage_text_strikethrough
                          ? 'active'
                          : ''}"
                        @click=${() =>
                          updateModule({
                            percentage_text_strikethrough: !barModule.percentage_text_strikethrough,
                          })}
                        style="padding: 8px; border: 1px solid var(--divider-color, #cccccc); border-radius: 4px; background: ${barModule.percentage_text_strikethrough
                          ? 'var(--primary-color)'
                          : 'var(--secondary-background-color)'}; cursor: pointer; transition: all 0.2s ease; color: ${barModule.percentage_text_strikethrough
                          ? 'var(--text-primary-color)'
                          : 'var(--primary-text-color)'};"
                        title="Strikethrough"
                      >
                        <ha-icon icon="mdi:format-strikethrough"></ha-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Text Color -->
                  <div class="field-container" style="margin-bottom: 16px;">
                    <div class="field-title">
                      ${localize('editor.bar.colors.text_color', lang, 'Text Color')}
                    </div>
                    <div class="field-description">
                      ${localize(
                        'editor.bar.colors.text_color_desc',
                        lang,
                        'Choose the color for the text displayed on the bar.'
                      )}
                    </div>
                    <ultra-color-picker
                      style="width: 100%;"
                      .value=${barModule.percentage_text_color || ''}
                      .defaultValue=${'var(--primary-text-color)'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ percentage_text_color: e.detail.value })}
                    ></ultra-color-picker>
                  </div>
                `
              : ''
          }
        </div>

        <!-- Unified Template Section (wrapped in a settings-section box so the
             title, help button, toggle and template editor are visually contained
             alongside every other module section). -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="switch-container"
            style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px;"
          >
            <div
              class="switch-label-row"
              style="display:flex;align-items:center;gap:8px;"
            >
              <span class="switch-label" style="font-size:16px;font-weight:600;white-space:nowrap;">
                ${localize('editor.bar.unified_template.toggle', lang, 'Template Mode')}
              </span>
              <button
                type="button"
                class="help-btn"
                style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;background:var(--primary-color, #03a9f4);border:none;color:var(--text-primary-color, #fff);cursor:pointer;border-radius:50%;line-height:0;"
                title="${localize('editor.bar.unified_template.cheatsheet', lang, 'Template cheatsheet')}"
                @click=${(e: Event) => {
                  (e.currentTarget as HTMLElement).dispatchEvent(
                    new CustomEvent('uc-open-template-cheatsheet', {
                      bubbles: true,
                      composed: true,
                      detail: { module: 'bar' },
                    })
                  );
                }}
              >
                <ha-icon icon="mdi:help-circle" style="--mdc-icon-size:18px;width:18px;height:18px;color:var(--text-primary-color, #fff);"></ha-icon>
              </button>
            </div>
            ${this.renderUcForm(
              hass,
              { unified_template_mode: barModule.unified_template_mode || false },
              [this.booleanField('unified_template_mode')],
              (e: CustomEvent) =>
                updateModule({ unified_template_mode: e.detail.value.unified_template_mode })
            )}
          </div>
          <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; line-height: 1.5;">
            ${localize(
              'editor.bar.unified_template.desc',
              lang,
              'One Jinja template returning JSON: value, label, color, left_label, right_label, value_min, value_max, ticks.'
            )}
          </div>
          ${
            barModule.unified_template_mode
              ? html`
                  <div
                    style="margin-top:12px;"
                    @mousedown=${(e: Event) => {
                      const t = e.target as HTMLElement;
                      if (!t.closest('ultra-template-editor') && !t.closest('.cm-editor'))
                        e.stopPropagation();
                    }}
                    @dragstart=${(e: Event) => e.stopPropagation()}
                    @insert-snippet=${(e: CustomEvent) => {
                      const ed = (e.currentTarget as HTMLElement).querySelector(
                        'ultra-template-editor'
                      );
                      (ed as any)?.insertAtCursor?.(e.detail?.value ?? '');
                    }}
                  >
                    <ultra-template-editor
                      .hass=${hass}
                      .value=${barModule.unified_template || ''}
                      .placeholder=${'{\n  "value": "{{ states(\'sensor.battery_level\') | float }}",\n  "label": "{{ friendly_name }}"\n}'}
                      .minHeight=${120}
                      .maxHeight=${400}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ unified_template: e.detail.value })}
                    ></ultra-template-editor>
                    ${this.renderTemplateKeyWarning(
                      barModule.unified_template,
                      BAR_TEMPLATE_KEYS,
                      lang
                    )}
                  </div>
                `
              : ''
          }
        </div>

        <!-- Left Side Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${this.renderFieldSection(
            localize('editor.bar.left.title', lang, 'Left Side'),
            '',
            hass,
            { left_enabled: barModule.left_enabled || false },
            [this.booleanField('left_enabled')],
            (e: CustomEvent) => {
              const enabled = e.detail.value.left_enabled;
              if (enabled) {
                updateModule({
                  left_enabled: true,
                  left_title: barModule.left_title || 'Fuel',
                  left_entity: barModule.left_entity || '',
                  left_title_size: barModule.left_title_size || 14,
                  left_value_size: barModule.left_value_size || 14,
                  left_title_color: barModule.left_title_color || 'var(--primary-text-color)',
                  left_value_color: barModule.left_value_color || 'var(--primary-text-color)',
                });
              } else {
                updateModule({
                  left_enabled: false,
                  left_title: '',
                  left_entity: '',
                });
              }
            }
          )}

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${localize('editor.bar.left.desc', lang, "Configure the title and entity value displayed on the left side of the bar. This is useful for showing labels like 'Range' or 'Battery' along with their values.")}
          </div>

          ${
            barModule.left_enabled
              ? html`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ left_title: barModule.left_title || '' }}
                      .schema=${[{ name: 'left_title', selector: { text: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ left_title: e.detail.value.left_title })}
                    ></ha-form>
                  </div>

                  <!-- Left Entity (value source) -->
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ left_entity: barModule.left_entity || '' }}
                      .schema=${[{ name: 'left_entity', selector: { entity: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ left_entity: e.detail.value.left_entity })}
                    ></ha-form>
                  </div>

                  ${this.renderSliderField(
                    localize('editor.bar.left.title_size', lang, 'Title Size'),
                    '',
                    barModule.left_title_size || 14,
                    14,
                    8,
                    32,
                    1,
                    (v: number) => {
                      updateModule({ left_title_size: v });
                    },
                    'px'
                  )}
                  ${this.renderSliderField(
                    localize('editor.bar.left.value_size', lang, 'Value Size'),
                    '',
                    barModule.left_value_size || 14,
                    14,
                    8,
                    32,
                    1,
                    (v: number) => {
                      updateModule({ left_value_size: v });
                    },
                    'px'
                  )}
                  <!-- Left Side Actions (isolated component) -->
                  <bar-side-actions
                    .hass=${hass}
                    .side=${'left'}
                    .tapAction=${barModule.left_tap_action}
                    .holdAction=${barModule.left_hold_action}
                    .doubleTapAction=${barModule.left_double_tap_action}
                    @actions-changed=${(e: CustomEvent) => {
                      e.stopPropagation();
                      updateModule(e.detail.updates);
                    }}
                  ></bar-side-actions>
                `
              : html`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${localize(
                      'editor.bar.left.enable_toggle',
                      lang,
                      'Enable the toggle above to configure left side settings'
                    )}
                  </div>
                `
          }
        </div>

        <!-- Right Side Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          ${this.renderFieldSection(
            localize('editor.bar.right.title', lang, 'Right Side'),
            '',
            hass,
            { right_enabled: barModule.right_enabled || false },
            [this.booleanField('right_enabled')],
            (e: CustomEvent) => {
              const enabled = e.detail.value.right_enabled;
              if (enabled) {
                updateModule({
                  right_enabled: true,
                  right_title: barModule.right_title || 'Range',
                  right_entity: barModule.right_entity || '',
                  right_title_size: barModule.right_title_size || 14,
                  right_value_size: barModule.right_value_size || 14,
                  right_title_color: barModule.right_title_color || 'var(--primary-text-color)',
                  right_value_color: barModule.right_value_color || 'var(--primary-text-color)',
                });
              } else {
                updateModule({
                  right_enabled: false,
                  right_title: '',
                  right_entity: '',
                });
              }
            }
          )}

          <div
            class="field-description"
            style="font-size: 13px !important; font-weight: 400 !important; margin-bottom: 16px;"
          >
            ${localize('editor.bar.right.desc', lang, "Configure the title and entity value displayed on the right side of the bar. This is ideal for complementary information like 'Time to Full' or secondary measurements.")}
          </div>

          ${
            barModule.right_enabled
              ? html`
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ right_title: barModule.right_title || '' }}
                      .schema=${[{ name: 'right_title', selector: { text: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ right_title: e.detail.value.right_title })}
                    ></ha-form>
                  </div>
                  <div class="field-group" style="margin-bottom: 16px;">
                    <ha-form
                      .hass=${hass}
                      .data=${{ right_entity: barModule.right_entity || '' }}
                      .schema=${[{ name: 'right_entity', selector: { entity: {} }, label: '' }]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ right_entity: e.detail.value.right_entity })}
                    ></ha-form>
                  </div>

                  ${this.renderSliderField(
                    localize('editor.bar.right.title_size', lang, 'Title Size'),
                    '',
                    barModule.right_title_size || 14,
                    14,
                    8,
                    32,
                    1,
                    (v: number) => {
                      updateModule({ right_title_size: v });
                    },
                    'px'
                  )}
                  ${this.renderSliderField(
                    localize('editor.bar.right.value_size', lang, 'Value Size'),
                    '',
                    barModule.right_value_size || 14,
                    14,
                    8,
                    32,
                    1,
                    (v: number) => {
                      updateModule({ right_value_size: v });
                    },
                    'px'
                  )}
                  <!-- Right Side Actions (isolated component) -->
                  <bar-side-actions
                    .hass=${hass}
                    .side=${'right'}
                    .tapAction=${barModule.right_tap_action}
                    .holdAction=${barModule.right_hold_action}
                    .doubleTapAction=${barModule.right_double_tap_action}
                    @actions-changed=${(e: CustomEvent) => {
                      e.stopPropagation();
                      updateModule(e.detail.updates);
                    }}
                  ></bar-side-actions>
                `
              : html`
                  <div
                    style="text-align: center; padding: 20px; color: var(--secondary-text-color); font-style: italic;"
                  >
                    ${localize(
                      'editor.bar.right.enable_toggle',
                      lang,
                      'Enable the toggle above to configure right side settings'
                    )}
                  </div>
                `
          }
        </div>

        <!-- Colors Section -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; padding-bottom: 0; border-bottom: none; letter-spacing: 0.5px;"
          >
            ${localize('editor.bar.colors.title', lang, 'Colors')}
          </div>

          
          <div class="field-group" style="margin-bottom: 24px;">
            <div
              class="colors-grid"
              style="display: grid; grid-template-columns: 1fr; gap: 16px;"
            >
              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${localize('editor.bar.colors.bar_color', lang, 'Bar Color')}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${barModule.bar_color || ''}
                  .defaultValue=${'var(--primary-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) => updateModule({ bar_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${localize('editor.bar.colors.background_color', lang, 'Background Color')}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${barModule.bar_background_color || ''}
                  .defaultValue=${'transparent'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ bar_background_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${localize('editor.bar.colors.border_color', lang, 'Border Color')}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${barModule.bar_border_color || ''}
                  .defaultValue=${'var(--divider-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ bar_border_color: e.detail.value })}
                ></ultra-color-picker>
              </div>

              <div class="color-item">
                <div
                  class="field-title"
                  style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                >
                  ${localize('editor.bar.colors.limit_indicator', lang, 'Limit Indicator')}
                </div>
                <ultra-color-picker style="width: 100%;"
                  .value=${barModule.limit_color || ''}
                  .defaultValue=${'var(--warning-color)'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ limit_color: e.detail.value })}
                ></ultra-color-picker>
              </div>


              ${
                barModule.bar_style === 'minimal'
                  ? html`
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.dot_color', lang, 'Dot Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${(barModule as any).dot_color || ''}
                          .defaultValue=${'var(--primary-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ dot_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    `
                  : ''
              }
            </div>
          </div>

          <!-- Minimal Style Icon Configuration -->
          ${
            barModule.bar_style === 'minimal'
              ? html`
                  ${this.renderFieldSection(
                    localize('editor.bar.minimal.icon_enabled', lang, 'Enable Icon'),
                    localize(
                      'editor.bar.minimal.icon_enabled_desc',
                      lang,
                      'Show an icon on the minimal bar indicator'
                    ),
                    hass,
                    { minimal_icon_enabled: barModule.minimal_icon_enabled || false },
                    [this.booleanField('minimal_icon_enabled')],
                    (e: CustomEvent) =>
                      updateModule({ minimal_icon_enabled: e.detail.value.minimal_icon_enabled })
                  )}
                  ${barModule.minimal_icon_enabled
                    ? html`
                        <!-- Icon Selection -->
                        <div class="field-group" style="margin-top: 16px;">
                          ${this.renderFieldSection(
                            localize('editor.bar.minimal.icon', lang, 'Icon'),
                            localize(
                              'editor.bar.minimal.icon_desc',
                              lang,
                              'Choose an icon to display (e.g., mdi:battery)'
                            ),
                            hass,
                            { minimal_icon: barModule.minimal_icon || '' },
                            [this.iconField('minimal_icon')],
                            (e: CustomEvent) => updateModule(e.detail.value)
                          )}
                        </div>

                        <!-- Icon Display Mode -->
                        <div class="field-group" style="margin-top: 16px;">
                          ${this.renderFieldSection(
                            localize('editor.bar.minimal.icon_mode', lang, 'Display Mode'),
                            localize(
                              'editor.bar.minimal.icon_mode_desc',
                              lang,
                              'How to display the icon'
                            ),
                            hass,
                            { minimal_icon_mode: barModule.minimal_icon_mode || 'icon-in-dot' },
                            [
                              this.selectField('minimal_icon_mode', [
                                {
                                  value: 'dot-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_dot_only',
                                    lang,
                                    'Dot Only'
                                  ),
                                },
                                {
                                  value: 'icon-only',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_only',
                                    lang,
                                    'Icon Only'
                                  ),
                                },
                                {
                                  value: 'icon-in-dot',
                                  label: localize(
                                    'editor.bar.minimal.mode_icon_in_dot',
                                    lang,
                                    'Icon in Dot'
                                  ),
                                },
                              ]),
                            ],
                            (e: CustomEvent) => {
                              updateModule(e.detail.value);
                              setTimeout(() => this.triggerPreviewUpdate(), 50);
                            }
                          )}
                        </div>

                        <!-- Icon Size Controls -->
                        ${this.renderFieldSection(
                          localize('editor.bar.minimal.icon_size_auto', lang, 'Auto-Scale Icon'),
                          localize(
                            'editor.bar.minimal.icon_size_auto_desc',
                            lang,
                            'Automatically scale icon with bar height'
                          ),
                          hass,
                          { minimal_icon_size_auto: barModule.minimal_icon_size_auto !== false },
                          [this.booleanField('minimal_icon_size_auto')],
                          (e: CustomEvent) =>
                            updateModule({
                              minimal_icon_size_auto: e.detail.value.minimal_icon_size_auto,
                            })
                        )}
                        ${barModule.minimal_icon_size_auto === false
                          ? html`
                              ${this.renderSliderField(
                                localize('editor.bar.minimal.icon_size', lang, 'Icon Size'),
                                localize(
                                  'editor.bar.minimal.icon_size_desc',
                                  lang,
                                  'Custom icon size in pixels'
                                ),
                                barModule.minimal_icon_size || 24,
                                24,
                                8,
                                48,
                                2,
                                (v: number) => {
                                  updateModule({ minimal_icon_size: v });
                                },
                                'px'
                              )}
                            `
                          : ''}

                        <!-- Icon Color Controls -->
                        ${this.renderFieldSection(
                          localize('editor.bar.minimal.use_dot_color', lang, 'Use Dot Color'),
                          localize(
                            'editor.bar.minimal.use_dot_color_desc',
                            lang,
                            'Use the dot color for the icon (matches gradient)'
                          ),
                          hass,
                          {
                            minimal_icon_use_dot_color:
                              barModule.minimal_icon_use_dot_color !== false,
                          },
                          [this.booleanField('minimal_icon_use_dot_color')],
                          (e: CustomEvent) =>
                            updateModule({
                              minimal_icon_use_dot_color: e.detail.value.minimal_icon_use_dot_color,
                            })
                        )}
                        ${barModule.minimal_icon_use_dot_color === false
                          ? html`
                              <div class="field-container" style="margin-top: 16px;">
                                <div class="field-title">
                                  ${localize('editor.bar.minimal.icon_color', lang, 'Icon Color')}
                                </div>
                                <div class="field-description">
                                  ${localize(
                                    'editor.bar.minimal.icon_color_desc',
                                    lang,
                                    'Custom color for the icon'
                                  )}
                                </div>
                                <ultra-color-picker
                                  style="width: 100%;"
                                  .value=${barModule.minimal_icon_color || ''}
                                  .defaultValue=${'var(--primary-color)'}
                                  .hass=${hass}
                                  @value-changed=${(e: CustomEvent) =>
                                    updateModule({ minimal_icon_color: e.detail.value })}
                                ></ultra-color-picker>
                              </div>
                            `
                          : ''}
                      `
                    : ''}
                `
              : ''
          }

          <!-- Left Side Colors -->
          ${
            barModule.left_enabled
              ? html`
                  <div class="field-group" style="margin-bottom: 24px;">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px; color: var(--primary-color);"
                    >
                      ${localize('editor.bar.colors.left_side', lang, 'Left Side Colors')}
                    </div>
                    <div
                      class="colors-grid"
                      style="display: grid; grid-template-columns: 1fr; gap: 16px;"
                    >
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.title_color', lang, 'Title Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${barModule.left_title_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ left_title_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>

                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.value_color', lang, 'Value Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${barModule.left_value_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ left_value_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                `
              : ''
          }

          <!-- Right Side Colors -->
          ${
            barModule.right_enabled
              ? html`
                  <div class="field-group">
                    <div
                      class="field-title"
                      style="font-size: 16px !important; font-weight: 600 !important; margin-bottom: 12px; color: var(--primary-color);"
                    >
                      ${localize('editor.bar.colors.right_side', lang, 'Right Side Colors')}
                    </div>
                    <div
                      class="colors-grid"
                      style="display: grid; grid-template-columns: 1fr; gap: 16px;"
                    >
                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.title_color', lang, 'Title Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${barModule.right_title_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ right_title_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>

                      <div class="color-item">
                        <div
                          class="field-title"
                          style="font-size: 14px !important; font-weight: 600 !important; margin-bottom: 8px;"
                        >
                          ${localize('editor.bar.colors.value_color', lang, 'Value Color')}
                        </div>
                        <ultra-color-picker
                          style="width: 100%;"
                          .value=${barModule.right_value_color || ''}
                          .defaultValue=${'var(--primary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ right_value_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  </div>
                `
              : ''
          }
        </div>

        <!-- Gradient Mode -->
        <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;">
          ${this.renderFieldSection(
            localize('editor.bar.gradient.title', lang, 'Gradient Mode'),
            localize(
              'editor.bar.gradient.desc',
              lang,
              'Apply a color gradient to the bar fill. When enabled, choose how the gradient is displayed and customize the color stops below.'
            ),
            hass,
            { use_gradient: barModule.use_gradient || false },
            [this.booleanField('use_gradient')],
            (e: CustomEvent) => {
              const useGradient = e.detail.value.use_gradient;
              const updates: Partial<BarModule> = { use_gradient: useGradient };
              if (
                useGradient &&
                (!barModule.gradient_stops || barModule.gradient_stops.length === 0)
              ) {
                updates.gradient_stops = createDefaultGradientStops();
                updates.gradient_display_mode = barModule.gradient_display_mode || 'full';
              }
              updateModule(updates);
            }
          )}

          ${
            barModule.use_gradient
              ? html`
                  <div class="field-group" style="margin-bottom: 12px;">
                    ${this.renderUcForm(
                      hass,
                      { gradient_display_mode: barModule.gradient_display_mode || 'full' },
                      [
                        this.selectField('gradient_display_mode', [
                          {
                            value: 'full',
                            label: localize('editor.bar.gradient.full', lang, 'Full'),
                          },
                          {
                            value: 'cropped',
                            label: localize('editor.bar.gradient.cropped', lang, 'Cropped'),
                          },
                          {
                            value: 'value-based',
                            label: localize('editor.bar.gradient.value_based', lang, 'Value-Based'),
                          },
                        ]),
                      ],
                      (e: CustomEvent) => {
                        const next = e.detail.value.gradient_display_mode;
                        const prev = barModule.gradient_display_mode || 'full';
                        if (next === prev) return;
                        updateModule({ gradient_display_mode: next });
                        // Trigger re-render to update dropdown UI
                        setTimeout(() => {
                          this.triggerPreviewUpdate();
                        }, 50);
                      },
                      false
                    )}
                  </div>
                  <uc-gradient-editor
                    .stops=${barModule.gradient_stops || createDefaultGradientStops()}
                    .barSize=${this.getBarSizeFromHeight((barModule as any).height ?? 20)}
                    .barRadius=${this.getBarRadiusFromStyle(barModule.border_radius || 10)}
                    .barStyle=${barModule.bar_style || 'flat'}
                    @gradient-changed=${(e: CustomEvent) => {
                      updateModule({ gradient_stops: e.detail.stops });
                    }}
                  ></uc-gradient-editor>
                `
              : ''
          }
        </div>

        <!-- Bar Animation -->
        <div class="settings-section" style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-top: 16px;">
          ${this.renderFieldSection(
            localize('editor.bar.animation.title', lang, 'Bar Animation'),
            localize(
              'editor.bar.animation.desc',
              lang,
              "Animate the bar fill using presets like charging stripes, pulse, shimmer, and more. You can trigger animations based on an entity's state or attribute, and optionally override the animation when another condition is met."
            ),
            hass,
            { bar_animation_enabled: (barModule as any).bar_animation_enabled || false },
            [this.booleanField('bar_animation_enabled')],
            (e: CustomEvent) =>
              updateModule({ bar_animation_enabled: e.detail.value.bar_animation_enabled })
          )}
          ${
            (barModule as any).bar_animation_enabled
              ? html`
                  <div class="conditional-fields-group" style="margin: 16px 0;">
                    <div class="conditional-fields-header">
                      ${localize('editor.bar.animation.trigger.title', lang, 'Animation Trigger')}
                    </div>
                    <div class="conditional-fields-content">
                      <div
                        style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                      >
                        ${localize(
                          'editor.bar.animation.trigger.desc',
                          lang,
                          'Select an entity to watch and define the value + animation to apply when it matches.'
                        )}
                      </div>
                      ${this.renderEntityPickerWithVariables(
                        hass,
                        config,
                        'bar_animation_entity',
                        (barModule as any).bar_animation_entity || '',
                        (value: string) => updateModule({ bar_animation_entity: value }),
                        undefined,
                        localize('editor.common.entity', lang, 'Entity')
                      )}
                      ${this.renderSettingsSection('', '', [
                        {
                          title: localize(
                            'editor.bar.animation.trigger.type',
                            lang,
                            'Trigger Type'
                          ),
                          description: localize(
                            'editor.bar.animation.trigger.type_desc',
                            lang,
                            'Choose whether to compare the entity state or an attribute'
                          ),
                          hass,
                          data: {
                            bar_animation_trigger_type:
                              (barModule as any).bar_animation_trigger_type || 'state',
                          },
                          schema: [
                            this.selectField('bar_animation_trigger_type', [
                              {
                                value: 'state',
                                label: localize('editor.common.state', lang, 'State'),
                              },
                              {
                                value: 'attribute',
                                label: localize('editor.common.attribute', lang, 'Attribute'),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => updateModule(e.detail.value),
                        },
                        ...(((barModule as any).bar_animation_trigger_type || 'state') ===
                        'attribute'
                          ? [
                              {
                                title: localize(
                                  'editor.common.attribute_name',
                                  lang,
                                  'Attribute Name'
                                ),
                                description: localize(
                                  'editor.bar.animation.trigger.attribute_name_desc',
                                  lang,
                                  'Name of the attribute to compare (e.g., charging_status)'
                                ),
                                hass,
                                data: {
                                  bar_animation_attribute:
                                    (barModule as any).bar_animation_attribute || '',
                                },
                                schema: [this.textField('bar_animation_attribute')],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_attribute: e.detail.value.bar_animation_attribute,
                                  }),
                              },
                            ]
                          : []),
                        ...(((barModule as any).bar_animation_entity || '').trim()
                          ? [
                              {
                                title: localize(
                                  'editor.bar.animation.trigger.match_value',
                                  lang,
                                  'Match Value'
                                ),
                                description: localize(
                                  'editor.bar.animation.trigger.match_value_desc',
                                  lang,
                                  'Text to compare against the state or attribute (comparison is string-based).'
                                ),
                                hass,
                                data: {
                                  bar_animation_value: (barModule as any).bar_animation_value || '',
                                },
                                schema: [this.textField('bar_animation_value')],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_value: e.detail.value.bar_animation_value,
                                  }),
                              },
                            ]
                          : []),
                        {
                          title: localize('editor.bar.animation.type', lang, 'Animation Type'),
                          description: localize(
                            'editor.bar.animation.type_desc',
                            lang,
                            'Select how the bar should animate when triggered.'
                          ),
                          hass,
                          data: {
                            bar_animation_type: (barModule as any).bar_animation_type || 'none',
                          },
                          schema: [
                            this.selectField('bar_animation_type', [
                              {
                                value: 'none',
                                label: localize('editor.common.none', lang, 'None'),
                              },
                              {
                                value: 'charging',
                                label: localize(
                                  'editor.bar.animation.types.charging',
                                  lang,
                                  'Charging (Diagonal Lines)'
                                ),
                              },
                              {
                                value: 'pulse',
                                label: localize('editor.bar.animation.types.pulse', lang, 'Pulse'),
                              },
                              {
                                value: 'blinking',
                                label: localize(
                                  'editor.bar.animation.types.blinking',
                                  lang,
                                  'Blinking'
                                ),
                              },
                              {
                                value: 'bouncing',
                                label: localize(
                                  'editor.bar.animation.types.bouncing',
                                  lang,
                                  'Bouncing'
                                ),
                              },
                              {
                                value: 'glow',
                                label: localize('editor.bar.animation.types.glow', lang, 'Glow'),
                              },
                              {
                                value: 'rainbow',
                                label: localize(
                                  'editor.bar.animation.types.rainbow',
                                  lang,
                                  'Rainbow'
                                ),
                              },
                              {
                                value: 'bubbles',
                                label: localize(
                                  'editor.bar.animation.types.bubbles',
                                  lang,
                                  'Bubbles'
                                ),
                              },
                              {
                                value: 'fill',
                                label: localize('editor.bar.animation.types.fill', lang, 'Fill'),
                              },
                              {
                                value: 'ripple',
                                label: localize(
                                  'editor.bar.animation.types.ripple',
                                  lang,
                                  'Ripple'
                                ),
                              },
                              {
                                value: 'traffic',
                                label: localize(
                                  'editor.bar.animation.types.traffic',
                                  lang,
                                  'Traffic (Barber Pole)'
                                ),
                              },

                              {
                                value: 'heartbeat',
                                label: localize(
                                  'editor.bar.animation.types.heartbeat',
                                  lang,
                                  'Heartbeat'
                                ),
                              },
                              {
                                value: 'flicker',
                                label: localize(
                                  'editor.bar.animation.types.flicker',
                                  lang,
                                  'Flicker'
                                ),
                              },
                              {
                                value: 'shimmer',
                                label: localize(
                                  'editor.bar.animation.types.shimmer',
                                  lang,
                                  'Shimmer'
                                ),
                              },
                              {
                                value: 'vibrate',
                                label: localize(
                                  'editor.bar.animation.types.vibrate',
                                  lang,
                                  'Vibrate'
                                ),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => updateModule(e.detail.value),
                        },
                        {
                          title: localize(
                            'editor.bar.animation.direction',
                            lang,
                            'Animation Direction'
                          ),
                          description: localize(
                            'editor.bar.animation.direction_desc',
                            lang,
                            'Choose a fixed direction, or derive direction from a sensor value.'
                          ),
                          hass,
                          data: {
                            bar_animation_direction:
                              (barModule as any).bar_animation_direction || 'normal',
                          },
                          schema: [
                            this.selectField('bar_animation_direction', [
                              {
                                value: 'normal',
                                label: localize(
                                  'editor.bar.animation.direction_modes.normal',
                                  lang,
                                  'Normal'
                                ),
                              },
                              {
                                value: 'reverse',
                                label: localize(
                                  'editor.bar.animation.direction_modes.reverse',
                                  lang,
                                  'Reverse'
                                ),
                              },
                              {
                                value: 'sensor',
                                label: localize(
                                  'editor.bar.animation.direction_modes.sensor',
                                  lang,
                                  'From Sensor'
                                ),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => updateModule(e.detail.value),
                        },
                        ...(((barModule as any).bar_animation_direction || 'normal') === 'sensor'
                          ? [
                              {
                                title: localize(
                                  'editor.bar.animation.direction_entity',
                                  lang,
                                  'Direction Sensor'
                                ),
                                description: localize(
                                  'editor.bar.animation.direction_entity_desc',
                                  lang,
                                  'Negative values reverse the animation. Positive values keep normal direction.'
                                ),
                                hass,
                                data: {
                                  bar_animation_direction_entity:
                                    (barModule as any).bar_animation_direction_entity || '',
                                },
                                schema: [
                                  {
                                    name: 'bar_animation_direction_entity',
                                    selector: { entity: {} },
                                  } as any,
                                ],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_direction_entity:
                                      e.detail.value.bar_animation_direction_entity,
                                  }),
                              },
                              {
                                title: localize(
                                  'editor.bar.animation.direction_attribute',
                                  lang,
                                  'Direction Attribute (Optional)'
                                ),
                                description: localize(
                                  'editor.bar.animation.direction_attribute_desc',
                                  lang,
                                  'Read this attribute instead of entity state when deriving direction.'
                                ),
                                hass,
                                data: {
                                  bar_animation_direction_attribute:
                                    (barModule as any).bar_animation_direction_attribute || '',
                                },
                                schema: [this.textField('bar_animation_direction_attribute')],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_direction_attribute:
                                      e.detail.value.bar_animation_direction_attribute,
                                  }),
                              },
                            ]
                          : []),
                        {
                          title: localize(
                            'editor.bar.animation.speed_mode',
                            lang,
                            'Animation Speed Source'
                          ),
                          description: localize(
                            'editor.bar.animation.speed_mode_desc',
                            lang,
                            'Use a fixed speed value, or derive speed from a sensor.'
                          ),
                          hass,
                          data: {
                            bar_animation_speed_mode:
                              (barModule as any).bar_animation_speed_mode || 'fixed',
                          },
                          schema: [
                            this.selectField('bar_animation_speed_mode', [
                              {
                                value: 'fixed',
                                label: localize(
                                  'editor.bar.animation.speed_modes.fixed',
                                  lang,
                                  'Fixed'
                                ),
                              },
                              {
                                value: 'sensor',
                                label: localize(
                                  'editor.bar.animation.speed_modes.sensor',
                                  lang,
                                  'From Sensor'
                                ),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => updateModule(e.detail.value),
                        },
                        {
                          title: localize('editor.bar.animation.speed', lang, 'Base Speed'),
                          description: localize(
                            'editor.bar.animation.speed_desc',
                            lang,
                            '1 = default speed. Higher values animate faster.'
                          ),
                          hass,
                          data: {
                            bar_animation_speed:
                              Number((barModule as any).bar_animation_speed ?? 1) || 1,
                          },
                          schema: [this.numberField('bar_animation_speed', 0.1, 20, 0.1)],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              bar_animation_speed: e.detail.value.bar_animation_speed,
                            }),
                        },
                        ...(((barModule as any).bar_animation_speed_mode || 'fixed') === 'sensor'
                          ? [
                              {
                                title: localize(
                                  'editor.bar.animation.speed_entity',
                                  lang,
                                  'Speed Sensor'
                                ),
                                description: localize(
                                  'editor.bar.animation.speed_entity_desc',
                                  lang,
                                  'Entity whose numeric value controls animation speed.'
                                ),
                                hass,
                                data: {
                                  bar_animation_speed_entity:
                                    (barModule as any).bar_animation_speed_entity || '',
                                },
                                schema: [
                                  {
                                    name: 'bar_animation_speed_entity',
                                    selector: { entity: {} },
                                  } as any,
                                ],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_speed_entity:
                                      e.detail.value.bar_animation_speed_entity,
                                  }),
                              },
                              {
                                title: localize(
                                  'editor.bar.animation.speed_attribute',
                                  lang,
                                  'Speed Attribute (Optional)'
                                ),
                                description: localize(
                                  'editor.bar.animation.speed_attribute_desc',
                                  lang,
                                  'Read this attribute instead of entity state when deriving speed.'
                                ),
                                hass,
                                data: {
                                  bar_animation_speed_attribute:
                                    (barModule as any).bar_animation_speed_attribute || '',
                                },
                                schema: [this.textField('bar_animation_speed_attribute')],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_speed_attribute:
                                      e.detail.value.bar_animation_speed_attribute,
                                  }),
                              },
                              {
                                title: localize(
                                  'editor.bar.animation.speed_multiplier',
                                  lang,
                                  'Sensor Multiplier'
                                ),
                                description: localize(
                                  'editor.bar.animation.speed_multiplier_desc',
                                  lang,
                                  'Scales sensor values before converting to animation speed.'
                                ),
                                hass,
                                data: {
                                  bar_animation_speed_multiplier:
                                    Number(
                                      (barModule as any).bar_animation_speed_multiplier ?? 1
                                    ) || 1,
                                },
                                schema: [
                                  this.numberField('bar_animation_speed_multiplier', 0, 1000, 0.1),
                                ],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_speed_multiplier:
                                      e.detail.value.bar_animation_speed_multiplier,
                                  }),
                              },
                            ]
                          : []),
                      ])}
                    </div>
                  </div>

                  <div class="conditional-fields-group" style="margin: 16px 0;">
                    <div class="conditional-fields-header">
                      ${localize(
                        'editor.bar.animation.override.title',
                        lang,
                        'Action Animation Override'
                      )}
                    </div>
                    <div class="conditional-fields-content">
                      <div
                        style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
                      >
                        ${localize(
                          'editor.bar.animation.override.desc',
                          lang,
                          'Select an Action Entity and state to define when this animation should override the regular animation'
                        )}
                      </div>
                      ${this.renderEntityPickerWithVariables(
                        hass,
                        config,
                        'bar_animation_override_entity',
                        (barModule as any).bar_animation_override_entity || '',
                        (value: string) => updateModule({ bar_animation_override_entity: value }),
                        undefined,
                        localize('editor.common.entity', lang, 'Entity')
                      )}
                      ${this.renderSettingsSection('', '', [
                        {
                          title: localize(
                            'editor.bar.animation.trigger.type',
                            lang,
                            'Trigger Type'
                          ),
                          description: localize(
                            'editor.bar.animation.override.type_desc',
                            lang,
                            'Compare the entity state or one of its attributes'
                          ),
                          hass,
                          data: {
                            bar_animation_override_trigger_type:
                              (barModule as any).bar_animation_override_trigger_type || 'state',
                          },
                          schema: [
                            this.selectField('bar_animation_override_trigger_type', [
                              {
                                value: 'state',
                                label: localize('editor.common.state', lang, 'State'),
                              },
                              {
                                value: 'attribute',
                                label: localize('editor.common.attribute', lang, 'Attribute'),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => {
                            const next = e.detail.value.bar_animation_override_trigger_type;
                            const prev =
                              (barModule as any).bar_animation_override_trigger_type || 'state';
                            if (next === prev) return;
                            updateModule(e.detail.value);
                          },
                        },
                        ...(((barModule as any).bar_animation_override_trigger_type || 'state') ===
                        'attribute'
                          ? [
                              {
                                title: localize(
                                  'editor.common.attribute_name',
                                  lang,
                                  'Attribute Name'
                                ),
                                description: localize(
                                  'editor.bar.animation.override.attribute_name_desc',
                                  lang,
                                  'Name of the attribute to compare'
                                ),
                                hass,
                                data: {
                                  bar_animation_override_attribute:
                                    (barModule as any).bar_animation_override_attribute || '',
                                },
                                schema: [this.textField('bar_animation_override_attribute')],
                                onChange: (e: CustomEvent) =>
                                  updateModule({
                                    bar_animation_override_attribute:
                                      e.detail.value.bar_animation_override_attribute,
                                  }),
                              },
                            ]
                          : []),
                        {
                          title: localize(
                            'editor.bar.animation.override.match_value',
                            lang,
                            'Override Match Value'
                          ),
                          description: localize(
                            'editor.bar.animation.override.match_value_desc',
                            lang,
                            'String comparison against state or attribute'
                          ),
                          hass,
                          data: {
                            bar_animation_override_value:
                              (barModule as any).bar_animation_override_value || '',
                          },
                          schema: [this.textField('bar_animation_override_value')],
                          onChange: (e: CustomEvent) =>
                            updateModule({
                              bar_animation_override_value:
                                e.detail.value.bar_animation_override_value,
                            }),
                        },
                        {
                          title: localize(
                            'editor.bar.animation.override.type',
                            lang,
                            'Override Animation Type'
                          ),
                          description: localize(
                            'editor.bar.animation.override.type_desc',
                            lang,
                            'Animation to use when override condition matches.'
                          ),
                          hass,
                          data: {
                            bar_animation_override_type:
                              (barModule as any).bar_animation_override_type || 'none',
                          },
                          schema: [
                            this.selectField('bar_animation_override_type', [
                              {
                                value: 'none',
                                label: localize('editor.common.none', lang, 'None'),
                              },
                              {
                                value: 'charging',
                                label: localize(
                                  'editor.bar.animation.types.charging',
                                  lang,
                                  'Charging (Diagonal Lines)'
                                ),
                              },
                              {
                                value: 'pulse',
                                label: localize('editor.bar.animation.types.pulse', lang, 'Pulse'),
                              },
                              {
                                value: 'blinking',
                                label: localize(
                                  'editor.bar.animation.types.blinking',
                                  lang,
                                  'Blinking'
                                ),
                              },
                              {
                                value: 'bouncing',
                                label: localize(
                                  'editor.bar.animation.types.bouncing',
                                  lang,
                                  'Bouncing'
                                ),
                              },
                              {
                                value: 'glow',
                                label: localize('editor.bar.animation.types.glow', lang, 'Glow'),
                              },
                              {
                                value: 'rainbow',
                                label: localize(
                                  'editor.bar.animation.types.rainbow',
                                  lang,
                                  'Rainbow'
                                ),
                              },
                              {
                                value: 'bubbles',
                                label: localize(
                                  'editor.bar.animation.types.bubbles',
                                  lang,
                                  'Bubbles'
                                ),
                              },
                              {
                                value: 'fill',
                                label: localize('editor.bar.animation.types.fill', lang, 'Fill'),
                              },
                              {
                                value: 'ripple',
                                label: localize(
                                  'editor.bar.animation.types.ripple',
                                  lang,
                                  'Ripple'
                                ),
                              },
                              {
                                value: 'traffic',
                                label: localize(
                                  'editor.bar.animation.types.traffic',
                                  lang,
                                  'Traffic (Barber Pole)'
                                ),
                              },

                              {
                                value: 'heartbeat',
                                label: localize(
                                  'editor.bar.animation.types.heartbeat',
                                  lang,
                                  'Heartbeat'
                                ),
                              },
                              {
                                value: 'flicker',
                                label: localize(
                                  'editor.bar.animation.types.flicker',
                                  lang,
                                  'Flicker'
                                ),
                              },
                              {
                                value: 'shimmer',
                                label: localize(
                                  'editor.bar.animation.types.shimmer',
                                  lang,
                                  'Shimmer'
                                ),
                              },
                              {
                                value: 'vibrate',
                                label: localize(
                                  'editor.bar.animation.types.vibrate',
                                  lang,
                                  'Vibrate'
                                ),
                              },
                            ]),
                          ],
                          onChange: (e: CustomEvent) => updateModule(e.detail.value),
                        },
                      ])}
                    </div>
                  </div>
                `
              : ''
          }
        </div>

        <!-- Action Animation Override removed as standalone: now included inside Bar Animation section above -->
      </div>
    `;
  }
}

installSettingsMethods(UltraBarModule, UltraBarModuleSettings);

export function renderBarGeneralTab(
  host: UltraBarModule,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  return UltraBarModuleSettings.prototype.renderGeneralTabContent.call(
    host as UltraBarModuleSettings,
    module,
    hass,
    config,
    updateModule
  );
}
