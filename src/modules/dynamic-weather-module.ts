import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, DynamicWeatherModule, UltraCardConfig } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucDynamicWeatherService } from '../services/uc-dynamic-weather-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { getAllEffectTypes, getEffectDisplayName, mapWeatherConditionToEffect } from '../utils/weather-condition-mapper';
import { localize } from '../localize/localize';

export class UltraDynamicWeatherModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'dynamic_weather',
    title: 'Dynamic Weather (Pro)',
    description:
      'Add animated weather effects (rain, snow, fog, sun beams) to your dashboard view. Pro feature only.',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:weather-partly-rainy',
    category: 'media',
    tags: ['weather', 'effects', 'pro', 'premium', 'animated', 'rain', 'snow', 'fog'],
  };

  createDefault(id?: string, hass?: HomeAssistant): DynamicWeatherModule {
    // Auto-detect suitable weather entity
    const autoWeatherEntity = this._findWeatherEntity(hass);

    return {
      id: id || this.generateId('dynamic_weather'),
      type: 'dynamic_weather',

      // Core Settings
      enabled: true,
      mode: 'automatic',
      weather_entity: autoWeatherEntity,
      manual_effect: 'rain',

      // Display Settings
      position: 'background',
      opacity: 50,

      // Effect-specific Settings
      matrix_rain_color: '#00ff00',

      // Mobile Settings
      enable_on_mobile: true,
      respect_reduced_motion: true,

      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /**
   * Find a weather entity for automatic mode
   */
  private _findWeatherEntity(hass?: HomeAssistant): string {
    if (!hass) return '';

    const weatherEntities = Object.keys(hass.states).filter((entity) =>
      entity.startsWith('weather.')
    );

    return weatherEntities.length > 0 ? weatherEntities[0] : '';
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const weatherModule = module as DynamicWeatherModule;
    const lang = hass?.locale?.language || 'en';

    // Check Pro authentication
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    // If not Pro, show lock UI
    if (!isPro) {
      return this.renderProLockUI(lang);
    }

    return html`
      <div class="uc-dynamic-weather-settings">
        ${this.injectUcFormStyles()}

        <!-- Module Info -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:weather-partly-rainy"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">Dynamic Weather Effects (Pro)</div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                View-wide animated weather effects with automatic or manual control
              </div>
            </div>
          </div>

          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color);"
          >
            <div style="font-size: 13px; line-height: 1.5;">
              <strong>Note:</strong> This module controls weather effects for the entire view. It
              will not display as a visible card. Only the topmost enabled module with passing logic
              conditions will render.
            </div>
          </div>

          <div
            style="margin-top: 12px; padding: 10px; background: rgba(var(--rgb-warning-color), 0.12); border-radius: 6px; border-left: 4px solid var(--warning-color); color: var(--warning-color); font-size: 12px; line-height: 1.4;"
          >
            ⚠️ Lightning effects (Rain Storm) include rapid flashes.
          </div>
        </div>

        <!-- Core Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            CORE SETTINGS
          </div>

          <!-- Enable Toggle -->
          ${this.renderSettingsSection('', '', [
            {
              title: 'Enable Weather Effects',
              description: 'Turn the weather effects on or off',
              hass,
              data: { enabled: weatherModule.enabled },
              schema: [this.booleanField('enabled')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ])}

          <!-- Mode Selection -->
          ${this.renderFieldSection(
            'Mode',
            'Choose how weather effects are controlled',
            hass,
            { mode: weatherModule.mode || 'automatic' },
            [
              this.selectField('mode', [
                { value: 'automatic', label: 'Automatic (from weather entity)' },
                { value: 'manual', label: 'Manual (select effect)' },
              ]),
            ],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          <!-- Automatic Mode Settings -->
          ${weatherModule.mode === 'automatic'
            ? html`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup(
                    'Automatic Mode',
                    html`
                      ${this.renderFieldSection(
                        'Weather Entity',
                        'Select the weather entity to monitor for automatic effects',
                        hass,
                        { weather_entity: weatherModule.weather_entity || '' },
                        [this.entityField('weather_entity')],
                        (e: CustomEvent) => updateModule(e.detail.value)
                      )}

                      <!-- Current Effect Preview -->
                      ${weatherModule.weather_entity && hass.states[weatherModule.weather_entity]
                        ? html`
                            <div style="margin-top: 16px; padding: 12px; background: rgba(var(--rgb-primary-color), 0.1); border-radius: 6px;">
                              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                                Current Detection:
                              </div>
                              <div style="font-size: 13px; color: var(--secondary-text-color);">
                                Weather State: <strong>${hass.states[weatherModule.weather_entity].state}</strong>
                              </div>
                              <div style="font-size: 13px; color: var(--secondary-text-color);">
                                Effect: <strong>${getEffectDisplayName(mapWeatherConditionToEffect(hass, weatherModule.weather_entity))}</strong>
                              </div>
                            </div>
                          `
                        : ''}
                    `
                  )}
                </div>
              `
            : ''}

          <!-- Manual Mode Settings -->
          ${weatherModule.mode === 'manual'
            ? html`
                <div style="margin-top: 16px;">
                  ${this.renderConditionalFieldsGroup(
                    'Manual Mode',
                    html`
                      ${this.renderFieldSection(
                        'Weather Effect',
                        'Choose which weather effect to display',
                        hass,
                        { manual_effect: weatherModule.manual_effect || 'rain' },
                        [
                          this.selectField(
                            'manual_effect',
                            getAllEffectTypes().map((e) => ({ value: e.value, label: e.label }))
                          ),
                        ],
                        (e: CustomEvent) => {
                          updateModule(e.detail.value);
                          setTimeout(() => {
                            this.triggerPreviewUpdate();
                          }, 50);
                        }
                      )}

                      <!-- Matrix Rain Color Picker (only shown when matrix_rain is selected) -->
                      ${weatherModule.manual_effect === 'matrix_rain'
                        ? html`
                            <div style="margin-top: 16px;">
                              <ultra-color-picker
                                .label=${'Matrix Rain Color'}
                                .value=${weatherModule.matrix_rain_color || '#00ff00'}
                                .defaultValue=${'#00ff00'}
                                .hass=${hass}
                                @value-changed=${(e: CustomEvent) => {
                                  updateModule({ matrix_rain_color: e.detail.value });
                                }}
                              ></ultra-color-picker>
                            </div>
                          `
                        : ''}
                    `
                  )}
                </div>
              `
            : ''}
        </div>

        <!-- Display Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            DISPLAY SETTINGS
          </div>

          <!-- Position -->
          ${this.renderFieldSection(
            'Position',
            'Place effects in the foreground (above cards) or background (behind cards)',
            hass,
            { position: weatherModule.position || 'background' },
            [
              this.selectField('position', [
                { value: 'background', label: 'Background (behind cards)' },
                { value: 'foreground', label: 'Foreground (above cards)' },
              ]),
            ],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}

          <!-- Opacity Slider -->
          <div style="margin-top: 24px; margin-bottom: 12px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              Opacity
            </div>
            <div class="field-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px;">
              Control the transparency of weather effects (0-100%)
            </div>
            <div class="number-range-control" style="display: flex; gap: 8px; align-items: center;">
              <input
                type="range"
                class="range-slider"
                min="0"
                max="100"
                step="1"
                .value="${weatherModule.opacity ?? 50}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  updateModule({ opacity: value });
                }}
                style="flex: 0 0 65%; height: 6px; background: var(--divider-color); border-radius: 3px; cursor: pointer;"
              />
              <input
                type="number"
                class="range-input"
                min="0"
                max="100"
                step="1"
                .value="${weatherModule.opacity ?? 50}"
                @input=${(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const value = parseInt(target.value);
                  if (!isNaN(value)) {
                    updateModule({ opacity: value });
                  }
                }}
                style="flex: 0 0 20%; padding: 6px 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 13px; text-align: center;"
              />
              <button
                class="range-reset-btn"
                @click=${() => updateModule({ opacity: 50 })}
                title="Reset to default (50)"
                style="width: 32px; height: 32px; padding: 0; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); cursor: pointer; display: flex; align-items: center; justify-content: center;"
              >
                <ha-icon icon="mdi:refresh" style="font-size: 14px;"></ha-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile & Accessibility Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            MOBILE & ACCESSIBILITY
          </div>

          ${this.renderSettingsSection('', '', [
            {
              title: 'Enable on Mobile',
              description: 'Show weather effects on mobile devices (reduced particle count)',
              hass,
              data: { enable_on_mobile: weatherModule.enable_on_mobile },
              schema: [this.booleanField('enable_on_mobile')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
            {
              title: 'Respect Reduced Motion',
              description: 'Disable effects when user prefers reduced motion',
              hass,
              data: { respect_reduced_motion: weatherModule.respect_reduced_motion },
              schema: [this.booleanField('respect_reduced_motion')],
              onChange: (e: CustomEvent) => updateModule(e.detail.value),
            },
          ])}
        </div>
      </div>
    `;
  }

  /**
   * Render Pro lock UI
   */
  private renderProLockUI(lang: string): TemplateResult {
    return html`
      <div
        style="padding: 32px; text-align: center; background: var(--secondary-background-color); border-radius: 8px; margin: 16px;"
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--warning-color); --mdi-icon-size: 64px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${localize('editor.pro_feature', lang)}
        </div>
        <div style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 24px;">
          Dynamic Weather Effects is a Pro feature. Upgrade to unlock animated weather effects
          including rain, snow, fog, and sun beams.
        </div>
        <a
          href="https://ultracardpro.com"
          target="_blank"
          style="display: inline-block; padding: 12px 24px; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
        >
          Upgrade to Pro
        </a>
      </div>
    `;
  }

  /**
   * Render Logic Tab
   */
  renderLogicTab(
    module: CardModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updateModule);
  }

  /**
   * Render preview (doesn't show anything in card view - this is a view-wide effect)
   */
  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const weatherModule = module as DynamicWeatherModule;

    // Check if we're in edit mode (URL contains edit=1) or a preview context
    const isEditMode = (() => {
      if (previewContext === 'dashboard') {
        return true;
      }
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('edit') === '1';
      } catch {
        return false;
      }
    })();

    const showPlaceholder =
      previewContext === 'live' || previewContext === 'ha-preview' || previewContext === 'dashboard' || isEditMode;

    // Note: Registration is handled by UltraCard._registerDynamicWeatherModules()
    // which uses a stable card instance ID. We don't register here to avoid
    // duplicate registrations with unstable IDs.

    // In editor/preview contexts, show informational placeholder
    if (showPlaceholder) {
      return html`
        <div
          style="padding: 16px; text-align: center; color: var(--secondary-text-color); font-style: italic; background: rgba(var(--rgb-primary-color), 0.05); border-radius: 8px; border: 2px dashed var(--divider-color);"
        >
          <ha-icon
            icon="mdi:weather-partly-rainy"
            style="--mdi-icon-size: 48px; color: var(--primary-color); margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            Dynamic Weather Effects
          </div>
          <div style="font-size: 12px;">
            ${weatherModule.enabled
              ? weatherModule.mode === 'automatic'
                ? `Auto: ${weatherModule.weather_entity || 'No entity selected'}`
                : `Manual: ${getEffectDisplayName(weatherModule.manual_effect || 'none')}`
              : 'Disabled'}
          </div>
          <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">
            Effects are rendered view-wide. Check your dashboard to see them in action.
          </div>
        </div>
      `;
    }

    // Hide completely on dashboard (no visible element at all)
    return html``;
  }

  /**
   * Validate module configuration
   */
  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const weatherModule = module as DynamicWeatherModule;
    const errors: string[] = [];

    if (weatherModule.mode === 'automatic' && !weatherModule.weather_entity) {
      errors.push('Weather entity is required in automatic mode');
    }

    if (weatherModule.mode === 'manual' && !weatherModule.manual_effect) {
      errors.push('Manual effect selection is required in manual mode');
    }

    if (weatherModule.opacity < 0 || weatherModule.opacity > 100) {
      errors.push('Opacity must be between 0 and 100');
    }

    return { valid: errors.length === 0, errors };
  }
}

