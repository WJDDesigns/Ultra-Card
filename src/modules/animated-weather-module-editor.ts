// Animated Weather Module Editor
// Comprehensive editor UI for the Animated Weather Module organized by columns

import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { AnimatedWeatherModule, UltraCardConfig, CardModule } from '../types';
import { localize } from '../localize/localize';

export function renderAnimatedWeatherModuleEditor(
  context: any,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  const weatherModule = module as AnimatedWeatherModule;
  const lang = hass.locale?.language || 'en';

  return html`
    ${context.injectUcFormStyles()}
    <style>
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
        padding: 4px 0;
        width: 100%;
        max-width: 100%;
      }
      .toggle-row .field-title {
        margin: 0 !important;
        padding: 0 !important;
        flex: 1 1 auto;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1.4;
        white-space: nowrap;
      }
      .toggle-row ha-switch {
        flex: 0 0 auto;
      }
      .full-width-field {
        width: 100%;
      }
      .full-width-field ha-form {
        width: 100%;
      }
      .full-width-color-picker {
        display: block;
        width: 100%;
      }
      .full-width-color-picker ultra-color-picker {
        display: block;
        width: 100%;
      }
    </style>
    <div class="module-general-settings">
      <!-- ============================================ -->
      <!-- COLUMN LAYOUT SETTINGS -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          Column Layout
        </div>

        <!-- Column Visibility Toggles -->
        <div class="toggle-row">
          <div class="field-title">Show Left Column</div>
          <ha-switch
            .checked=${weatherModule.show_left_column !== false}
            @change=${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_left_column: target.checked });
            }}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="field-title">Show Center Column</div>
          <ha-switch
            .checked=${weatherModule.show_center_column !== false}
            @change=${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_center_column: target.checked });
            }}
          ></ha-switch>
        </div>

        <div class="toggle-row">
          <div class="field-title">Show Right Column</div>
          <ha-switch
            .checked=${weatherModule.show_right_column !== false}
            @change=${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_right_column: target.checked });
            }}
          ></ha-switch>
        </div>

        <!-- Column Gap -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 16px;"
        >
          Horizontal Column Gap
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Space between visible columns in pixels (0-48)
        </div>
        <div class="full-width-field">
          ${context.renderUcForm(
            hass,
            { column_gap: weatherModule.column_gap ?? 12 },
            [context.numberField('column_gap', 0, 48, 1)],
            (e: CustomEvent) => updateModule(e.detail.value),
            false
          )}
        </div>
      </div>

      <!-- ============================================ -->
      <!-- ENTITY CONFIGURATION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          Weather Entities
        </div>

        <!-- Weather Entity -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          Weather Entity
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Primary weather.* entity with current conditions
        </div>
        ${context.renderUcForm(
          hass,
          { weather_entity: weatherModule.weather_entity || '' },
          [context.entityField('weather_entity', ['weather'])],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}

        <!-- Temperature Entity (Fallback) -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          Temperature Entity (Optional)
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Fallback if not using weather entity
        </div>
        ${context.renderUcForm(
          hass,
          { temperature_entity: weatherModule.temperature_entity || '' },
          [context.entityField('temperature_entity', ['sensor'])],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}

        <!-- Condition Entity (Fallback) -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          Condition Entity (Optional)
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Fallback if not using weather entity
        </div>
        ${context.renderUcForm(
          hass,
          { condition_entity: weatherModule.condition_entity || '' },
          [context.entityField('condition_entity', ['sensor'])],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}

        <!-- Custom Entity -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          Custom Entity (Optional)
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Additional info to display in left column (e.g., humidity, wind)
        </div>
        ${context.renderUcForm(
          hass,
          { custom_entity: weatherModule.custom_entity || '' },
          [context.entityField('custom_entity')],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}

        <!-- Custom Entity Name -->
        <div
          class="field-title"
          style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
        >
          Custom Entity Name (Optional)
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Override the displayed name for the custom entity
        </div>
        ${context.renderUcForm(
          hass,
          { custom_entity_name: weatherModule.custom_entity_name || '' },
          [context.textField('custom_entity_name')],
          (e: CustomEvent) => updateModule(e.detail.value),
          false
        )}
      </div>

      <!-- ============================================ -->
      <!-- GENERAL CONFIGURATION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          General Configuration
        </div>

        <!-- Temperature Unit -->
        <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
          Temperature Unit
        </div>
        <div class="field-description" style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;">
          Fahrenheit or Celsius
        </div>
        ${context.renderUcForm(
          hass,
          { temperature_unit: weatherModule.temperature_unit || 'F' },
          [
            context.selectField('temperature_unit', [
              { value: 'F', label: 'Fahrenheit (°F)' },
              { value: 'C', label: 'Celsius (°C)' },
            ]),
          ],
          (e: CustomEvent) => {
            const next = e.detail.value.temperature_unit;
            const prev = weatherModule.temperature_unit;
            if (next === prev) return;
            updateModule(e.detail.value);
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          },
          false
        )}
      </div>

      <!-- ============================================ -->
      <!-- LEFT COLUMN SETTINGS -->
      <!-- ============================================ -->
      ${weatherModule.show_left_column !== false
        ? html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid var(--primary-color);"
            >
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
              >
                Left Column Settings
              </div>

              <!-- Vertical Gap -->
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
              >
                Vertical Gap
              </div>
              <div
                class="field-description"
                style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
              >
                Space between items within left column (0-32px)
              </div>
              <div class="full-width-field">
                ${context.renderUcForm(
                  hass,
                  { left_column_gap: weatherModule.left_column_gap ?? 8 },
                  [context.numberField('left_column_gap', 0, 32, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <!-- Display Toggles -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 24px; color: var(--primary-text-color);"
              >
                Display Elements
              </div>

              <div class="toggle-row">
                <div class="field-title">Show Location</div>
                <ha-switch
                  .checked=${weatherModule.show_location !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_location: target.checked });
                  }}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div class="field-title">Show Condition</div>
                <ha-switch
                  .checked=${weatherModule.show_condition !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_condition: target.checked });
                  }}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div class="field-title">Show Custom Entity</div>
                <ha-switch
                  .checked=${weatherModule.show_custom_entity !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_custom_entity: target.checked });
                  }}
                ></ha-switch>
              </div>

              <!-- Location Configuration -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 24px; color: var(--primary-text-color);"
              >
                Location Configuration
              </div>

              <!-- Location Override Mode -->
              <div
                class="field-title"
                style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
              >
                Location Override Mode
              </div>
              <div
                class="field-description"
                style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
              >
                Use text input or entity state for location name
              </div>
              ${context.renderUcForm(
                hass,
                { location_override_mode: weatherModule.location_override_mode || 'text' },
                [
                  context.selectField('location_override_mode', [
                    { value: 'text', label: 'Text Input' },
                    { value: 'entity', label: 'Entity State' },
                  ]),
                ],
                (e: CustomEvent) => {
                  const next = e.detail.value.location_override_mode;
                  const prev = weatherModule.location_override_mode;
                  if (next === prev) return;
                  updateModule(e.detail.value);
                  setTimeout(() => context.triggerPreviewUpdate(), 50);
                },
                false
              )}
              ${weatherModule.location_override_mode === 'entity'
                ? html`
                    <!-- Location Entity -->
                    <div
                      class="field-title"
                      style="font-size: 14px; font-weight: 600; margin-bottom: 4px; margin-top: 16px;"
                    >
                      Location Entity
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
                    >
                      Entity to use for location (e.g., device_tracker for current location)
                    </div>
                    ${context.renderUcForm(
                      hass,
                      { location_entity: weatherModule.location_entity || '' },
                      [context.entityField('location_entity')],
                      (e: CustomEvent) => updateModule(e.detail.value),
                      false
                    )}
                  `
                : html`
                    <!-- Location Name Text -->
                    <div
                      class="field-title"
                      style="font-size: 14px; font-weight: 600; margin-bottom: 4px; margin-top: 16px;"
                    >
                      Location Name
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
                    >
                      Override location name (leave empty to use entity name)
                    </div>
                    ${context.renderUcForm(
                      hass,
                      { location_name: weatherModule.location_name || '' },
                      [context.textField('location_name')],
                      (e: CustomEvent) => updateModule(e.detail.value),
                      false
                    )}
                  `}

              <!-- Text Sizes -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 32px; color: var(--primary-text-color);"
              >
                Text Sizes
              </div>

              <div class="full-width-field" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                >
                  Location Size (0-64px)
                </div>
                ${context.renderUcForm(
                  hass,
                  { location_size: weatherModule.location_size || 16 },
                  [context.numberField('location_size', 0, 64, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <div class="full-width-field" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                >
                  Condition Size (0-96px)
                </div>
                ${context.renderUcForm(
                  hass,
                  { condition_size: weatherModule.condition_size || 24 },
                  [context.numberField('condition_size', 0, 96, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <div class="full-width-field">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                >
                  Custom Entity Size (0-64px)
                </div>
                ${context.renderUcForm(
                  hass,
                  { custom_entity_size: weatherModule.custom_entity_size || 18 },
                  [context.numberField('custom_entity_size', 0, 64, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <!-- Colors -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 32px; color: var(--primary-text-color);"
              >
                Colors
              </div>

              <div class="full-width-color-picker" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  Location Color
                </div>
                <ultra-color-picker
                  .value="${weatherModule.location_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ location_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>

              <div class="full-width-color-picker" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  Condition Color
                </div>
                <ultra-color-picker
                  .value="${weatherModule.condition_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ condition_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>

              <div class="full-width-color-picker">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  Custom Entity Color
                </div>
                <ultra-color-picker
                  .value="${weatherModule.custom_entity_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ custom_entity_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          `
        : ''}

      <!-- ============================================ -->
      <!-- CENTER COLUMN SETTINGS -->
      <!-- ============================================ -->
      ${weatherModule.show_center_column !== false
        ? html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid var(--primary-color);"
            >
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
              >
                Center Column Settings
              </div>

              <!-- Icon Size -->
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
              >
                Weather Icon Size
              </div>
              <div
                class="field-description"
                style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
              >
                Size of the main weather icon (0-300px)
              </div>
              <div class="full-width-field">
                ${context.renderUcForm(
                  hass,
                  { main_icon_size: weatherModule.main_icon_size || 120 },
                  [context.numberField('main_icon_size', 0, 300, 10)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <!-- Icon Style -->
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 4px; margin-top: 24px;"
              >
                Icon Style
              </div>
              <div
                class="field-description"
                style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
              >
                Choose between filled or outlined animated icons
              </div>
              ${context.renderUcForm(
                hass,
                { icon_style: weatherModule.icon_style || 'fill' },
                [
                  context.selectField('icon_style', [
                    { value: 'fill', label: 'Filled' },
                    { value: 'line', label: 'Outlined' },
                  ]),
                ],
                (e: CustomEvent) => {
                  const next = e.detail.value.icon_style;
                  const prev = weatherModule.icon_style;
                  if (next === prev) return;
                  updateModule(e.detail.value);
                  setTimeout(() => context.triggerPreviewUpdate(), 50);
                },
                false
              )}
            </div>
          `
        : ''}

      <!-- ============================================ -->
      <!-- RIGHT COLUMN SETTINGS -->
      <!-- ============================================ -->
      ${weatherModule.show_right_column !== false
        ? html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px; border-left: 4px solid var(--primary-color);"
            >
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
              >
                Right Column Settings
              </div>

              <!-- Vertical Gap -->
              <div
                class="field-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
              >
                Vertical Gap
              </div>
              <div
                class="field-description"
                style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
              >
                Space between items within right column (0-32px)
              </div>
              <div class="full-width-field">
                ${context.renderUcForm(
                  hass,
                  { right_column_gap: weatherModule.right_column_gap ?? 8 },
                  [context.numberField('right_column_gap', 0, 32, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <!-- Display Toggles -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 24px; color: var(--primary-text-color);"
              >
                Display Elements
              </div>

              <div class="toggle-row">
                <div class="field-title">Show Date</div>
                <ha-switch
                  .checked=${weatherModule.show_date !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_date: target.checked });
                  }}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div class="field-title">Show Temperature</div>
                <ha-switch
                  .checked=${weatherModule.show_temperature !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_temperature: target.checked });
                  }}
                ></ha-switch>
              </div>

              <div class="toggle-row">
                <div class="field-title">Show High/Low Range</div>
                <ha-switch
                  .checked=${weatherModule.show_temp_range !== false}
                  @change=${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_temp_range: target.checked });
                  }}
                ></ha-switch>
              </div>

              <!-- Text Sizes -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 24px; color: var(--primary-text-color);"
              >
                Text Sizes
              </div>

              <div class="full-width-field" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                >
                  Date Size (0-64px)
                </div>
                ${context.renderUcForm(
                  hass,
                  { date_size: weatherModule.date_size || 16 },
                  [context.numberField('date_size', 0, 64, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <div class="full-width-field" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                >
                  Temperature Size (0-128px)
                </div>
                ${context.renderUcForm(
                  hass,
                  { temperature_size: weatherModule.temperature_size || 64 },
                  [context.numberField('temperature_size', 0, 128, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <div class="full-width-field">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 4px;"
                >
                  High/Low Size (0-64px)
                </div>
                ${context.renderUcForm(
                  hass,
                  { temp_range_size: weatherModule.temp_range_size || 18 },
                  [context.numberField('temp_range_size', 0, 64, 1)],
                  (e: CustomEvent) => updateModule(e.detail.value),
                  false
                )}
              </div>

              <!-- Colors -->
              <div
                class="subsection-title"
                style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 32px; color: var(--primary-text-color);"
              >
                Colors
              </div>

              <div class="full-width-color-picker" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  Date Color
                </div>
                <ultra-color-picker
                  .value="${weatherModule.date_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ date_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>

              <div class="full-width-color-picker" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  Temperature Color
                </div>
                <ultra-color-picker
                  .value="${weatherModule.temperature_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ temperature_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>

              <div class="full-width-color-picker">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  High/Low Color
                </div>
                <ultra-color-picker
                  .value="${weatherModule.temp_range_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({ temp_range_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ultra-color-picker>
              </div>
            </div>
          `
        : ''}

      <!-- ============================================ -->
      <!-- BACKGROUNDS -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 24px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          Backgrounds & Borders
        </div>

        <!-- Module Background -->
        <div class="full-width-color-picker" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Module Background
          </div>
          <div
            class="field-description"
            style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
          >
            Overall background of the weather module
          </div>
          <ultra-color-picker
            .value="${weatherModule.module_background || 'transparent'}"
            .hass="${hass}"
            @value-changed=${(e: CustomEvent) => {
              updateModule({ module_background: e.detail.value });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}
          ></ultra-color-picker>
        </div>

        <!-- Module Border -->
        <div class="full-width-color-picker">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            Module Border Color
          </div>
          <div
            class="field-description"
            style="font-size: 13px; opacity: 0.7; margin-bottom: 12px;"
          >
            Border color around the module
          </div>
          <ultra-color-picker
            .value="${weatherModule.module_border || 'transparent'}"
            .hass="${hass}"
            @value-changed=${(e: CustomEvent) => {
              updateModule({ module_border: e.detail.value });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}
          ></ultra-color-picker>
        </div>
      </div>
    </div>
  `;
}
