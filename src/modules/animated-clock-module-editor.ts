// Animated Clock Module Editor
// Clean, organized UI following Ultra Card design patterns

import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { AnimatedClockModule, UltraCardConfig, CardModule } from '../types';
import { localize } from '../localize/localize';
import { uploadImage } from '../utils/image-upload';
import { ucToastService } from '../services/uc-toast-service';
import { BaseUltraModule } from './base-module';

// Helper function to truncate long file paths
function truncatePath(path: string): string {
  if (!path) return '';
  const maxLength = 30;
  if (path.length <= maxLength) return path;
  return '...' + path.slice(-maxLength + 3);
}

export function renderAnimatedClockModuleEditor(
  context: any,
  module: CardModule,
  hass: HomeAssistant,
  config: UltraCardConfig,
  updateModule: (updates: Partial<CardModule>) => void
): TemplateResult {
  const clockModule = module as AnimatedClockModule;
  const lang = hass.locale?.language || 'en';

  return html`
    ${context.injectUcFormStyles()}
    <style>${BaseUltraModule.getSliderStyles()}</style>
    <div class="module-general-settings">
      <!-- ============================================ -->
      <!-- CLOCK CONFIGURATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
      >
        <div
          class="section-title"
          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
        >
          <ha-icon icon="mdi:clock-outline" style="color: var(--primary-color);"></ha-icon>
          ${localize('editor.animated_clock.config.title', lang, 'Clock Configuration')}
        </div>

        <!-- Clock Style -->
        ${context.renderFieldSection(
          localize('editor.animated_clock.clock_style', lang, 'Clock Style'),
          localize(
            'editor.animated_clock.clock_style_desc',
            lang,
            'Choose from 10 different clock display styles'
          ),
          hass,
          { clock_style: clockModule.clock_style || 'flip' },
          [
            context.selectField('clock_style', [
              { value: 'flip', label: 'Flip Clock' },
              { value: 'digital', label: 'Digital LED' },
              { value: 'analog', label: 'Analog Clock' },
              { value: 'binary', label: 'Binary Clock' },
              { value: 'minimal', label: 'Minimal' },
              { value: 'retro', label: 'Retro 7-Segment' },
              { value: 'word', label: 'Text Clock' },
              { value: 'neon', label: 'Neon Glow' },
              { value: 'material', label: 'Material Design' },
              { value: 'terminal', label: 'Terminal/Console' },
            ]),
          ],
          (e: CustomEvent) => {
            const next = e.detail.value.clock_style;
            const prev = clockModule.clock_style;
            if (next === prev) return;
            updateModule(e.detail.value);
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}

        <!-- Time Format (hidden for analog clock) -->
        ${clockModule.clock_style !== 'analog'
          ? html`
              <div style="margin-top: 16px;">
                ${context.renderFieldSection(
                  localize('editor.animated_clock.time_format', lang, 'Time Format'),
                  localize(
                    'editor.animated_clock.time_format_desc',
                    lang,
                    '12-hour or 24-hour time display'
                  ),
                  hass,
                  { time_format: clockModule.time_format || '12' },
                  [
                    context.selectField('time_format', [
                      { value: '12', label: '12 Hour (AM/PM)' },
                      { value: '24', label: '24 Hour' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    const next = e.detail.value.time_format;
                    const prev = clockModule.time_format;
                    if (next === prev) return;
                    updateModule(e.detail.value);
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }
                )}
              </div>
            `
          : ''}

        <!-- Clock Size Slider -->
        <div style="margin-top: 16px;">
          ${context.renderSliderField(
            localize('editor.animated_clock.clock_size', lang, 'Clock Size'),
            localize('editor.animated_clock.clock_size_desc', lang, 'Scale factor for clock size (0–200)'),
            clockModule.clock_size || 100,
            100, 0, 200, 1,
            (v: number) => {
              updateModule({ clock_size: v });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            },
            '%'
          )}
        </div>
      </div>

      <!-- ============================================ -->
      <!-- CLOCK CUSTOMIZATION SECTION -->
      <!-- ============================================ -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(var(--rgb-primary-color), 0.12);"
      >
        <div
          class="section-title"
          style="font-size: 16px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"
        >
          <ha-icon icon="mdi:palette" style="color: var(--primary-color);"></ha-icon>
          ${localize('editor.animated_clock.customization.title', lang, 'Clock Customization')}
        </div>

        ${_renderClockCustomization(clockModule, hass, updateModule, context, lang)}
      </div>
    </div>
  `;
}

/**
 * Render clock-specific customization based on selected style
 */
function _renderClockCustomization(
  clockModule: AnimatedClockModule,
  hass: HomeAssistant,
  updateModule: (updates: Partial<CardModule>) => void,
  context: any,
  lang: string
): TemplateResult {
  const style = clockModule.clock_style || 'flip';

  // Analog Clock Customization
  if (style === 'analog') {
    return html`
      <!-- Hour Hand -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.analog_show_hour_hand', lang, 'Hour Hand'),
          '',
          hass,
          { analog_show_hour_hand: clockModule.analog_show_hour_hand !== false },
          [context.booleanField('analog_show_hour_hand')],
          (e: CustomEvent) => {
            updateModule({ analog_show_hour_hand: e.detail.value.analog_show_hour_hand });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.analog_show_hour_hand !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_hour_hand_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_hour_hand_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Minute Hand -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.analog_show_minute_hand', lang, 'Minute Hand'),
          '',
          hass,
          { analog_show_minute_hand: clockModule.analog_show_minute_hand !== false },
          [context.booleanField('analog_show_minute_hand')],
          (e: CustomEvent) => {
            updateModule({ analog_show_minute_hand: e.detail.value.analog_show_minute_hand });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.analog_show_minute_hand !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_minute_hand_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_minute_hand_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Second Hand -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.analog_show_seconds', lang, 'Second Hand'),
          '',
          hass,
          { analog_show_seconds: clockModule.analog_show_seconds !== false },
          [context.booleanField('analog_show_seconds')],
          (e: CustomEvent) => {
            updateModule({ analog_show_seconds: e.detail.value.analog_show_seconds });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.analog_show_seconds !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_second_hand_color || '#ff4444'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_second_hand_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <!-- Smooth Seconds Toggle -->
                ${context.renderFieldSection(
                  localize('editor.animated_clock.analog_smooth_seconds', lang, 'Smooth Sweeping Motion'),
                  '',
                  hass,
                  { analog_smooth_seconds: clockModule.analog_smooth_seconds !== false },
                  [context.booleanField('analog_smooth_seconds')],
                  (e: CustomEvent) => {
                    updateModule({ analog_smooth_seconds: e.detail.value.analog_smooth_seconds });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }
                )}
              </div>
            `
          : ''}
      </div>

      <!-- Hour Markers -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.analog_show_center_dot', lang, 'Center Dot'),
          '',
          hass,
          { analog_show_hour_markers: clockModule.analog_show_hour_markers !== false },
          [context.booleanField('analog_show_hour_markers')],
          (e: CustomEvent) => {
            updateModule({ analog_show_hour_markers: e.detail.value.analog_show_hour_markers });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.analog_show_center_dot !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_center_dot_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_center_dot_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Clock Numbers (1-12) -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_hours', lang, 'Hours'),
          '',
          hass,
          { analog_show_numbers: clockModule.analog_show_numbers === true },
          [context.booleanField('analog_show_numbers')],
          (e: CustomEvent) => {
            updateModule({ analog_show_numbers: e.detail.value.analog_show_numbers });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_hours !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.neon_hours_color || '#00ffff'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ neon_hours_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_minutes', lang, 'Minutes'),
          '',
          hass,
          { show_minutes: clockModule.show_minutes !== false },
          [context.booleanField('show_minutes')],
          (e: CustomEvent) => {
            updateModule({ show_minutes: e.detail.value.show_minutes });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_minutes !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.neon_minutes_color || '#00ffff'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ neon_minutes_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_seconds', lang, 'Seconds'),
          '',
          hass,
          { show_seconds: clockModule.show_seconds !== false },
          [context.booleanField('show_seconds')],
          (e: CustomEvent) => {
            updateModule({ show_seconds: e.detail.value.show_seconds });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_seconds !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.neon_seconds_color || '#00ffff'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ neon_seconds_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_separators', lang, 'Separators (:)'),
          '',
          hass,
          { show_separators: clockModule.show_separators !== false },
          [context.booleanField('show_separators')],
          (e: CustomEvent) => {
            updateModule({ show_separators: e.detail.value.show_separators });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.neon_separator_color || '#ff00ff'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ neon_separator_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${clockModule.time_format === '12'
        ? html`
            <div style="margin-bottom: 20px;">
              ${context.renderFieldSection(
                localize('editor.animated_clock.show_ampm', lang, 'AM/PM'),
                '',
                hass,
                { show_ampm: clockModule.show_ampm !== false },
                [context.booleanField('show_ampm')],
                (e: CustomEvent) => {
                  updateModule({ show_ampm: e.detail.value.show_ampm });
                  setTimeout(() => context.triggerPreviewUpdate(), 50);
                }
              )}
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.neon_ampm_color || '#00ff00'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ neon_ampm_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}
    `;
  }

  // Flip Clock (has individual colors for each element + tile color)
  if (style === 'flip') {
    return html`
      <!-- Flip Tile Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          ${localize('editor.animated_clock.flip_tile_color', lang, 'Tile Background Color')}
        </label>
        <ultra-color-picker
          .value="${clockModule.flip_tile_color || 'rgba(0, 0, 0, 0.5)'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => {
            updateModule({ flip_tile_color: e.detail.value });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_hours', lang, 'Hours'),
          '',
          hass,
          { show_hours: clockModule.show_hours !== false },
          [context.booleanField('show_hours')],
          (e: CustomEvent) => {
            updateModule({ show_hours: e.detail.value.show_hours });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_hours !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.flip_hours_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ flip_hours_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_minutes', lang, 'Minutes'),
          '',
          hass,
          { show_minutes: clockModule.show_minutes !== false },
          [context.booleanField('show_minutes')],
          (e: CustomEvent) => {
            updateModule({ show_minutes: e.detail.value.show_minutes });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_minutes !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.flip_minutes_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ flip_minutes_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_separators', lang, 'Separators (:)'),
          '',
          hass,
          { show_separators: clockModule.show_separators !== false },
          [context.booleanField('show_separators')],
          (e: CustomEvent) => {
            updateModule({ show_separators: e.detail.value.show_separators });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.flip_separator_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ flip_separator_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${clockModule.time_format === '12'
        ? html`
            <div style="margin-bottom: 20px;">
              ${context.renderFieldSection(
                localize('editor.animated_clock.show_ampm', lang, 'AM/PM'),
                '',
                hass,
                { show_ampm: clockModule.show_ampm !== false },
                [context.booleanField('show_ampm')],
                (e: CustomEvent) => {
                  updateModule({ show_ampm: e.detail.value.show_ampm });
                  setTimeout(() => context.triggerPreviewUpdate(), 50);
                }
              )}
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.flip_ampm_color || 'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ flip_ampm_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}
    `;
  }

  // Digital LED Clock (individual colors for each element)
  if (style === 'digital') {
    return html`
      <!-- Clock Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Clock Background Color
        </label>
        <ultra-color-picker
          .value="${clockModule.digital_background_color || '#000'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => {
            updateModule({ digital_background_color: e.detail.value });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_prompt', lang, 'Terminal Prompt'),
          '',
          hass,
          { show_hours: clockModule.show_hours !== false },
          [context.booleanField('show_hours')],
          (e: CustomEvent) => {
            updateModule({ show_hours: e.detail.value.show_hours });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_prompt !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_line1_color || '#4ec9b0'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_line1_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Terminal Command -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_command', lang, 'Terminal Command'),
          '',
          hass,
          { show_command: clockModule.show_command !== false },
          [context.booleanField('show_command')],
          (e: CustomEvent) => {
            updateModule({ show_command: e.detail.value.show_command });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_command !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_line2_color || '#ce9178'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_line2_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_hours', lang, 'Hours'),
          '',
          hass,
          { show_hours: clockModule.show_hours !== false },
          [context.booleanField('show_hours')],
          (e: CustomEvent) => {
            updateModule({ show_hours: e.detail.value.show_hours });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_hours !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_hours_color || '#d4d4d4'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_hours_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_minutes', lang, 'Minutes'),
          '',
          hass,
          { show_minutes: clockModule.show_minutes !== false },
          [context.booleanField('show_minutes')],
          (e: CustomEvent) => {
            updateModule({ show_minutes: e.detail.value.show_minutes });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_minutes !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_minutes_color || '#d4d4d4'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_minutes_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_seconds', lang, 'Seconds'),
          '',
          hass,
          { show_seconds: clockModule.show_seconds !== false },
          [context.booleanField('show_seconds')],
          (e: CustomEvent) => {
            updateModule({ show_seconds: e.detail.value.show_seconds });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_seconds !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_seconds_color || '#d4d4d4'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_seconds_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_separators', lang, 'Separators (:)'),
          '',
          hass,
          { show_separators: clockModule.show_separators !== false },
          [context.booleanField('show_separators')],
          (e: CustomEvent) => {
            updateModule({ show_separators: e.detail.value.show_separators });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_separator_color || '#d4d4d4'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_separator_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${clockModule.time_format === '12'
        ? html`
            <div style="margin-bottom: 20px;">
              ${context.renderFieldSection(
                'AM/PM',
                '',
                hass,
                { show_ampm: clockModule.show_ampm !== false },
                [context.booleanField('show_ampm')],
                (e: CustomEvent) => {
                  updateModule({ show_ampm: e.detail.value.show_ampm });
                  setTimeout(() => context.triggerPreviewUpdate(), 50);
                }
              )}
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.terminal_ampm_color || '#d4d4d4'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ terminal_ampm_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}

      <!-- Cursor -->
      <div style="margin-bottom: 20px;">
        ${context.renderFieldSection(
          localize('editor.animated_clock.show_cursor', lang, 'Blinking Cursor'),
          '',
          hass,
          { show_cursor: clockModule.show_cursor !== false },
          [context.booleanField('show_cursor')],
          (e: CustomEvent) => {
            updateModule({ show_cursor: e.detail.value.show_cursor });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }
        )}
        ${clockModule.show_cursor !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.terminal_cursor_color || '#4ec9b0'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ terminal_cursor_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Default fallback
  return html`
    <div style="text-align: center; padding: 20px; color: var(--secondary-text-color);">
      Select a clock style to customize
    </div>
  `;
}
