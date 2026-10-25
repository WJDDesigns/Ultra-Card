// Animated Forecast Module Editor
// Comprehensive editor UI for the Animated Forecast Module

import { TemplateResult, html } from 'lit';
import type { HomeAssistant } from '../ha/types';
import {
  AnimatedForecastModule,
  AnimatedForecastChartMetric,
  UltraCardConfig,
  CardModule,
} from '../types';
import '../components/ultra-segmented';
import { localize } from '../localize/localize';
import { BaseUltraModule } from './base-module';

export function renderAnimatedForecastModuleEditor(
  context: any,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  const forecastModule = module as AnimatedForecastModule;
  const lang = hass.locale?.language || 'en';

  return html`
    ${context.injectUcFormStyles()}
    <style>${BaseUltraModule.getSliderStyles()}</style>
    <div class="module-general-settings">
      <!-- ============================================ -->
      <!-- ENTITY CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.entities.title', lang, '⚙️ Forecast Entities')}
        </div>

        <!-- Weather Entity -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.animated_forecast.weather_entity', lang, 'Weather Entity')}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${localize(
            'editor.animated_forecast.weather_entity_desc',
            lang,
            'Primary weather.* entity with forecast data'
          )}
        </div>
        ${context.renderEntityPickerWithVariables(
          hass, config, 'weather_entity', forecastModule.weather_entity || '',
          (value: string) => { updateModule({ weather_entity: value }); context.triggerPreviewUpdate(); },
          ['weather'],
          localize('editor.animated_forecast.weather_entity', lang, 'Weather Entity')
        )}

        <!-- Forecast Entity (Optional) -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          ${localize(
            'editor.animated_forecast.forecast_entity',
            lang,
            'Forecast Entity (Optional)'
          )}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${localize(
            'editor.animated_forecast.forecast_entity_desc',
            lang,
            'Separate forecast entity if available'
          )}
        </div>
        ${context.renderEntityPickerWithVariables(
          hass, config, 'forecast_entity', forecastModule.forecast_entity || '',
          (value: string) => { updateModule({ forecast_entity: value }); context.triggerPreviewUpdate(); },
          undefined,
          localize('editor.animated_forecast.forecast_entity', lang, 'Forecast Entity')
        )}
      </div>

      <!-- ============================================ -->
      <!-- CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.config.title', lang, '⚙️ Forecast Configuration')}
        </div>

        <!-- Forecast Days -->
        ${context.renderSliderField(
          localize('editor.animated_forecast.forecast_days', lang, 'Forecast Days'),
          localize('editor.animated_forecast.forecast_days_desc', lang, 'Number of forecast days (3-7)'),
          forecastModule.forecast_days || 5,
          5,
          3,
          7,
          1,
          (value: number) => updateModule({ forecast_days: value }),
          ''
        )}

        <!-- Daily / Hourly -->
        ${context.renderSegmentedField(
          localize('editor.animated_forecast.forecast_type', lang, 'Show First'),
          localize(
            'editor.animated_forecast.forecast_type_desc',
            lang,
            'Hourly needs a weather integration that provides an hourly forecast.'
          ),
          forecastModule.forecast_type || 'daily',
          [
            { value: 'daily', label: localize('editor.animated_forecast.daily', lang, 'Daily') },
            { value: 'hourly', label: localize('editor.animated_forecast.hourly', lang, 'Hourly') },
          ],
          (next: string) => {
            updateModule({ forecast_type: next as 'daily' | 'hourly' });
            context.triggerPreviewUpdate();
          }
        )}

        ${forecastModule.forecast_type !== 'hourly'
          ? context.renderFieldSection(
              localize('editor.animated_forecast.day_tap_hourly', lang, 'Tap a Day to See Its Hours'),
              localize(
                'editor.animated_forecast.day_tap_hourly_desc',
                lang,
                'Tapping a day switches to that day\'s hourly forecast. Tap Back to return. Day taps no longer run the module tap action.'
              ),
              hass,
              { day_tap_hourly: forecastModule.day_tap_hourly === true },
              [context.booleanField('day_tap_hourly')],
              (e: CustomEvent) => {
                updateModule({ day_tap_hourly: e.detail.value.day_tap_hourly });
                context.triggerPreviewUpdate();
              }
            )
          : ''}

        ${forecastModule.forecast_type === 'hourly' || forecastModule.day_tap_hourly
          ? context.renderSliderField(
              localize('editor.animated_forecast.forecast_hours', lang, 'Forecast Hours'),
              localize('editor.animated_forecast.forecast_hours_desc', lang, 'Hours shown in the hourly view (3-12)'),
              forecastModule.forecast_hours || 8,
              8,
              3,
              12,
              1,
              (value: number) => updateModule({ forecast_hours: value }),
              ''
            )
          : ''}

        ${forecastModule.forecast_type === 'hourly' || forecastModule.day_tap_hourly
          ? context.renderFieldSection(
              localize('editor.animated_forecast.hour_number_only', lang, 'Hour Number Only'),
              localize(
                'editor.animated_forecast.hour_number_only_desc',
                lang,
                'Shows just the hour, for example 14 instead of 14 Uhr. AM and PM stay for 12-hour languages.'
              ),
              hass,
              { hour_number_only: forecastModule.hour_number_only === true },
              [context.booleanField('hour_number_only')],
              (e: CustomEvent) => {
                updateModule({ hour_number_only: e.detail.value.hour_number_only });
                context.triggerPreviewUpdate();
              }
            )
          : ''}

        ${context.renderFieldSection(
          localize('editor.animated_forecast.swipe_more', lang, 'Swipe for More'),
          localize(
            'editor.animated_forecast.swipe_more_desc',
            lang,
            'Loads every day or hour your weather service offers and lets you swipe sideways through them. The Forecast Days and Hours settings become how many show at once.'
          ),
          hass,
          { swipe_more: forecastModule.swipe_more === true },
          [context.booleanField('swipe_more')],
          (e: CustomEvent) => {
            updateModule({ swipe_more: e.detail.value.swipe_more });
            context.triggerPreviewUpdate();
          }
        )}
      </div>

      <!-- ============================================ -->
      <!-- CHART SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.chart.title', lang, '📊 Chart')}
        </div>

        ${context.renderFieldSection(
          localize('editor.animated_forecast.show_chart', lang, 'Show Chart Under Forecast'),
          localize(
            'editor.animated_forecast.show_chart_desc',
            lang,
            'Adds a small bar or line row per value, lined up with each day or hour.'
          ),
          hass,
          { show_chart: forecastModule.show_chart === true },
          [context.booleanField('show_chart')],
          (e: CustomEvent) => {
            updateModule({ show_chart: e.detail.value.show_chart });
            context.triggerPreviewUpdate();
          }
        )}

        ${forecastModule.show_chart === true
          ? html`
              ${renderChartValuesList(forecastModule, lang, updateModule, context)}
              ${context.renderSliderField(
                localize('editor.animated_forecast.chart_height', lang, 'Row Height'),
                '24-120px',
                forecastModule.chart_height || 48,
                48,
                24,
                120,
                4,
                (value: number) => updateModule({ chart_height: value }),
                'px'
              )}
              ${context.renderSegmentedField(
                localize('editor.animated_forecast.chart_color_mode', lang, 'Colors'),
                localize(
                  'editor.animated_forecast.chart_color_mode_desc',
                  lang,
                  'By Value colors each bar or point by its value: UV by the WHO scale, temperature from blue to red, rain from light to dark blue, wind from green to red.'
                ),
                forecastModule.chart_color_mode || 'single',
                [
                  { value: 'single', label: localize('editor.animated_forecast.chart_color_single', lang, 'One Color') },
                  { value: 'value', label: localize('editor.animated_forecast.chart_color_value', lang, 'By Value') },
                ],
                (next: string) => {
                  updateModule({ chart_color_mode: next as 'single' | 'value' });
                  context.triggerPreviewUpdate();
                }
              )}
              ${forecastModule.chart_color_mode === 'value'
                ? ''
                : html`<div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                ${localize('editor.animated_forecast.chart_color', lang, 'Chart Color')}
              </div>
              <ultra-color-picker
                .value="${forecastModule.chart_color || ''}"
                .defaultValue=${'var(--primary-color)'}
                .hass="${hass}"
                @value-changed=${(e: CustomEvent) => {
                  updateModule({ chart_color: e.detail.value });
                  setTimeout(() => context.triggerPreviewUpdate(), 50);
                }}
              ></ultra-color-picker>`}
            `
          : ''}
      </div>

      <!-- ============================================ -->
      <!-- TEXT SIZES SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.text_sizes.title', lang, '📏 Text Sizes')}
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;"
        >
          <!-- Forecast Day Size -->
          <div>
            ${context.renderSliderField(
              localize('editor.animated_forecast.forecast_day_size', lang, 'Forecast Day Name Size'),
              '10-24px',
              forecastModule.forecast_day_size || 14,
              14,
              10,
              24,
              1,
              (value: number) => updateModule({ forecast_day_size: value }),
              'px'
            )}
          </div>

          <!-- Forecast Temp Size -->
          <div>
            ${context.renderSliderField(
              localize('editor.animated_forecast.forecast_temp_size', lang, 'Forecast Temp Size'),
              '10-24px',
              forecastModule.forecast_temp_size || 14,
              14,
              10,
              24,
              1,
              (value: number) => updateModule({ forecast_temp_size: value }),
              'px'
            )}
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- ICON SETTINGS SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.icon_settings.title', lang, '🎨 Icon Settings')}
        </div>

        <!-- Forecast Icon Size -->
        ${context.renderSliderField(
          localize('editor.animated_forecast.forecast_icon_size', lang, 'Forecast Icon Size'),
          localize('editor.animated_forecast.forecast_icon_size_desc', lang, 'Size of forecast weather icons (32-80px)'),
          forecastModule.forecast_icon_size || 48,
          48,
          32,
          80,
          4,
          (value: number) => updateModule({ forecast_icon_size: value }),
          'px'
        )}

        <!-- Icon Style -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          ${localize('editor.animated_forecast.icon_style', lang, 'Icon Style')}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${localize(
            'editor.animated_forecast.icon_style_desc',
            lang,
            'Choose between filled or outlined animated icons'
          )}
        </div>
        ${context.renderUcForm(
          hass,
          { icon_style: forecastModule.icon_style || 'fill' },
          [
            context.selectField('icon_style', [
              { value: 'fill', label: localize('editor.animated_forecast.icon_style_fill', lang, 'Filled') },
              { value: 'line', label: localize('editor.animated_forecast.icon_style_line', lang, 'Outlined') },
            ]),
          ],
          (e: CustomEvent) => {
            const next = e.detail.value.icon_style;
            const prev = forecastModule.icon_style;
            if (next === prev) return;
            updateModule(e.detail.value);
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          },
          false
        )}
      </div>

      <!-- ============================================ -->
      <!-- COLORS SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.colors.title', lang, '🎨 Colors')}
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px;"
        >
          <!-- Forecast Day Color -->
          <div>
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.animated_forecast.forecast_day_color', lang, 'Forecast Day Names')}
            </div>
            <ultra-color-picker
              .value="${forecastModule.forecast_day_color || 'var(--primary-text-color)'}"
              .hass="${hass}"
              @value-changed=${(e: CustomEvent) => {
                updateModule({ forecast_day_color: e.detail.value });
                setTimeout(() => context.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>

          <!-- Forecast Temp Color -->
          <div>
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.animated_forecast.forecast_temp_color', lang, 'Forecast Temps')}
            </div>
            <ultra-color-picker
              .value="${forecastModule.forecast_temp_color || 'var(--primary-text-color)'}"
              .hass="${hass}"
              @value-changed=${(e: CustomEvent) => {
                updateModule({ forecast_temp_color: e.detail.value });
                setTimeout(() => context.triggerPreviewUpdate(), 50);
              }}
            ></ultra-color-picker>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- BACKGROUND SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: var(--uc-r-8, 8px); padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.background.title', lang, '🎨 Background')}
        </div>

        <!-- Forecast Background -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.animated_forecast.forecast_background', lang, 'Forecast Background')}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${localize(
            'editor.animated_forecast.forecast_background_desc',
            lang,
            'Background for the forecast section (theme-aware by default)'
          )}
        </div>
        <ultra-color-picker
          .value="${forecastModule.forecast_background ||
          'rgba(var(--rgb-primary-text-color), 0.05)'}"
          .hass="${hass}"
          @value-changed=${(e: CustomEvent) => {
            updateModule({ forecast_background: e.detail.value });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }}
        ></ultra-color-picker>
      </div>
    </div>
  `;
}

const CHART_METRICS: Array<{ value: AnimatedForecastChartMetric; fallback: string }> = [
  { value: 'precipitation_probability', fallback: 'Chance of rain' },
  { value: 'precipitation', fallback: 'Rain amount' },
  { value: 'uv_index', fallback: 'UV index' },
  { value: 'temperature', fallback: 'Temperature' },
  { value: 'wind_speed', fallback: 'Wind speed' },
];

/**
 * Chart values as a list: tick to show, Bars or Line per value, arrows to set the
 * row order. Shown values keep the order of `chart_metrics`.
 */
function renderChartValuesList(
  module: AnimatedForecastModule,
  lang: string,
  updateModule: (updates: Partial<CardModule>) => void,
  context: any
): TemplateResult {
  const shown = (module.chart_metrics ?? ['precipitation_probability']).filter(m =>
    CHART_METRICS.some(c => c.value === m)
  );
  const hidden = CHART_METRICS.map(c => c.value).filter(m => !shown.includes(m));
  const ordered = [...shown, ...hidden];
  const defaultStyle = module.chart_style || 'bar';
  const label = (m: AnimatedForecastChartMetric) =>
    localize(
      `editor.animated_forecast.metric.${m}`,
      lang,
      CHART_METRICS.find(c => c.value === m)?.fallback ?? m
    );
  const apply = (updates: Partial<AnimatedForecastModule>) => {
    updateModule(updates as Partial<CardModule>);
    context.triggerPreviewUpdate();
  };
  const toggle = (m: AnimatedForecastChartMetric) =>
    apply({ chart_metrics: shown.includes(m) ? shown.filter(x => x !== m) : [...shown, m] });
  const move = (m: AnimatedForecastChartMetric, dir: -1 | 1) => {
    const i = shown.indexOf(m);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= shown.length) return;
    const next = [...shown];
    [next[i], next[j]] = [next[j], next[i]];
    apply({ chart_metrics: next });
  };
  const setStyle = (m: AnimatedForecastChartMetric, style: 'bar' | 'line') =>
    apply({ chart_metric_styles: { ...(module.chart_metric_styles || {}), [m]: style } });
  const styleOptions = [
    { value: 'bar', label: localize('editor.animated_forecast.chart_style_bar', lang, 'Bars') },
    { value: 'line', label: localize('editor.animated_forecast.chart_style_line', lang, 'Line') },
  ];
  const arrowStyle =
    'background:none;border:1px solid var(--divider-color);border-radius:6px;color:var(--primary-text-color);width:28px;height:28px;padding:0;cursor:pointer;display:grid;place-items:center;--mdc-icon-size:18px;';

  return html`
    <div class="field-section" style="margin-bottom: 16px;">
      <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
        ${localize('editor.animated_forecast.chart_metrics', lang, 'Values')}
      </div>
      <div
        class="field-description"
        style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
      >
        ${localize(
          'editor.animated_forecast.chart_values_desc',
          lang,
          'Tick the values to show, pick Bars or Line for each, and use the arrows to change their order. Values your weather integration doesn\'t provide are skipped.'
        )}
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${ordered.map(m => {
          const on = shown.includes(m);
          const i = shown.indexOf(m);
          return html`
            <div
              style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;background:rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.04);border:1px solid ${on
                ? 'var(--primary-color)'
                : 'var(--divider-color)'};"
            >
              <ha-checkbox .checked=${on} @change=${() => toggle(m)}></ha-checkbox>
              <span style="flex:1;min-width:0;font-size:14px;${on ? '' : 'opacity:0.6;'}">${label(m)}</span>
              ${on
                ? html`
                    <ultra-segmented
                      style="width:150px;flex-shrink:0;"
                      .value=${module.chart_metric_styles?.[m] || defaultStyle}
                      .options=${styleOptions}
                      @value-changed=${(e: CustomEvent) => setStyle(m, e.detail.value)}
                    ></ultra-segmented>
                    <button
                      type="button"
                      style=${arrowStyle}
                      title=${localize('editor.animated_forecast.move_up', lang, 'Move up')}
                      ?disabled=${i === 0}
                      @click=${() => move(m, -1)}
                    >
                      <ha-icon icon="mdi:chevron-up"></ha-icon>
                    </button>
                    <button
                      type="button"
                      style=${arrowStyle}
                      title=${localize('editor.animated_forecast.move_down', lang, 'Move down')}
                      ?disabled=${i === shown.length - 1}
                      @click=${() => move(m, 1)}
                    >
                      <ha-icon icon="mdi:chevron-down"></ha-icon>
                    </button>
                  `
                : ''}
            </div>
          `;
        })}
      </div>
    </div>
  `;
}
