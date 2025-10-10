// Animated Forecast Module Editor
// Comprehensive editor UI for the Animated Forecast Module

import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { AnimatedForecastModule, UltraCardConfig, CardModule } from '../types';
import { localize } from '../localize/localize';

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
    <div class="module-general-settings">
      <!-- ============================================ -->
      <!-- ENTITY CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
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
        ${context.renderUcForm(
          hass,
          { weather_entity: forecastModule.weather_entity || '' },
          [context.entityField('weather_entity', ['weather'])],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
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
        ${context.renderUcForm(
          hass,
          { forecast_entity: forecastModule.forecast_entity || '' },
          [context.entityField('forecast_entity')],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}
      </div>

      <!-- ============================================ -->
      <!-- CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.config.title', lang, '⚙️ Forecast Configuration')}
        </div>

        <!-- Forecast Days -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.animated_forecast.forecast_days', lang, 'Forecast Days')}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${localize(
            'editor.animated_forecast.forecast_days_desc',
            lang,
            'Number of forecast days (3-7)'
          )}
        </div>
        ${context.renderUcForm(
          hass,
          { forecast_days: forecastModule.forecast_days || 5 },
          [context.numberField('forecast_days', 3, 7, 1)],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}
      </div>

      <!-- ============================================ -->
      <!-- TEXT SIZES SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.text_sizes.title', lang, '📏 Text Sizes')}
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;"
        >
          <!-- Forecast Day Size -->
          <div>
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              ${localize(
                'editor.animated_forecast.forecast_day_size',
                lang,
                'Forecast Day Name Size'
              )}
            </div>
            <div
              class="field-description"
              style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;"
            >
              10-24px
            </div>
            ${context.renderUcForm(
              hass,
              { forecast_day_size: forecastModule.forecast_day_size || 14 },
              [context.numberField('forecast_day_size', 10, 24, 1)],
              (e: CustomEvent) => updateModule(e.detail.value),
              false
            )}
          </div>

          <!-- Forecast Temp Size -->
          <div>
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              ${localize('editor.animated_forecast.forecast_temp_size', lang, 'Forecast Temp Size')}
            </div>
            <div
              class="field-description"
              style="font-size: 12px; opacity: 0.7; margin-bottom: 8px;"
            >
              10-24px
            </div>
            ${context.renderUcForm(
              hass,
              { forecast_temp_size: forecastModule.forecast_temp_size || 14 },
              [context.numberField('forecast_temp_size', 10, 24, 1)],
              (e: CustomEvent) => updateModule(e.detail.value),
              false
            )}
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- ICON SETTINGS SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.animated_forecast.icon_settings.title', lang, '🎨 Icon Settings')}
        </div>

        <!-- Forecast Icon Size -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          ${localize('editor.animated_forecast.forecast_icon_size', lang, 'Forecast Icon Size')}
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          ${localize(
            'editor.animated_forecast.forecast_icon_size_desc',
            lang,
            'Size of forecast weather icons (32-80px)'
          )}
        </div>
        ${context.renderUcForm(
          hass,
          { forecast_icon_size: forecastModule.forecast_icon_size || 48 },
          [context.numberField('forecast_icon_size', 32, 80, 4)],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
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
              { value: 'fill', label: 'Filled' },
              { value: 'line', label: 'Outlined' },
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
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
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
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
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
