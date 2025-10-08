// Animated Clock Module Editor
// Clean, organized UI following Ultra Card design patterns

import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { AnimatedClockModule, UltraCardConfig, CardModule } from '../types';
import { localize } from '../localize/localize';
import { uploadImage } from '../utils/image-upload';

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
          <label
            style="display: block; font-size: 14px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
          >
            ${localize('editor.animated_clock.clock_size', lang, 'Clock Size')}
          </label>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">
            ${localize(
              'editor.animated_clock.clock_size_desc',
              lang,
              'Scale factor for clock size (0-200)'
            )}
          </div>
          <div
            style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center;"
          >
            <input
              type="range"
              min="0"
              max="200"
              step="1"
              .value="${clockModule.clock_size || 100}"
              @input="${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const val = parseInt(target.value);
                updateModule({ clock_size: val });
                setTimeout(() => context.triggerPreviewUpdate(), 50);
              }}"
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
              style="font-size: 13px; color: var(--secondary-text-color); min-width: 40px; text-align: right;"
              >${clockModule.clock_size || 100}</span
            >
            <button
              @click="${() => {
                updateModule({ clock_size: 100 });
                setTimeout(() => context.triggerPreviewUpdate(), 50);
              }}"
              title="Reset to default (100)"
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
            >
              <ha-icon icon="mdi:refresh" style="font-size: 18px;"></ha-icon>
            </button>
          </div>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_hour_hand !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_hour_hand: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.analog_show_hour_hand', lang, 'Hour Hand')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_minute_hand !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_minute_hand: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.analog_show_minute_hand', lang, 'Minute Hand')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.analog_show_seconds', lang, 'Second Hand')}</span
          >
        </label>
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
                <label
                  style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color); margin-top: 8px;"
                >
                  <ha-switch
                    .checked="${clockModule.analog_smooth_seconds !== false}"
                    @change="${(e: Event) => {
                      const target = e.target as any;
                      updateModule({ analog_smooth_seconds: target.checked });
                      setTimeout(() => context.triggerPreviewUpdate(), 50);
                    }}"
                  ></ha-switch>
                  <span style="font-size: 13px; color: var(--secondary-text-color);"
                    >${localize(
                      'editor.animated_clock.analog_smooth_seconds',
                      lang,
                      'Smooth Sweeping Motion'
                    )}</span
                  >
                </label>
              </div>
            `
          : ''}
      </div>

      <!-- Hour Markers -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_hour_markers !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_hour_markers: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize(
              'editor.animated_clock.analog_show_hour_markers',
              lang,
              'Hour Markers'
            )}</span
          >
        </label>
        ${clockModule.analog_show_hour_markers !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_hour_marker_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_hour_marker_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Center Dot -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_center_dot !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_center_dot: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.analog_show_center_dot', lang, 'Center Dot')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_numbers === true}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_numbers: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize(
              'editor.animated_clock.analog_show_numbers',
              lang,
              'Clock Numbers (1-12)'
            )}</span
          >
        </label>
        ${clockModule.analog_show_numbers === true
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_numbers_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_numbers_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Hour Tick Marks (12 major ticks) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_hour_ticks === true}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_hour_ticks: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize(
              'editor.animated_clock.analog_show_hour_ticks',
              lang,
              'Hour Tick Marks'
            )}</span
          >
        </label>
        ${clockModule.analog_show_hour_ticks === true
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_hour_ticks_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_hour_ticks_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Minute Tick Marks (48 minor ticks) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.analog_show_minute_ticks === true}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ analog_show_minute_ticks: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize(
              'editor.animated_clock.analog_show_minute_ticks',
              lang,
              'Minute Tick Marks'
            )}</span
          >
        </label>
        ${clockModule.analog_show_minute_ticks === true
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.analog_minute_ticks_color ||
                  clockModule.clock_color ||
                  'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_minute_ticks_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>

      <!-- Clock Face Section -->
      <div style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;">
        <div
          style="font-size: 14px; font-weight: 600; color: var(--primary-text-color); margin-bottom: 12px;"
        >
          ${localize('editor.animated_clock.clock_face', lang, 'Clock Face')}
        </div>

        <!-- Face Outline Color -->
        <div style="margin-bottom: 16px;">
          <label
            style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
          >
            ${localize('editor.animated_clock.face_outline', lang, 'Outline Color')}
          </label>
          <ultra-color-picker
            .value="${clockModule.analog_face_outline_color ||
            clockModule.clock_color ||
            'var(--primary-text-color)'}"
            .hass="${hass}"
            @value-changed="${(e: CustomEvent) => {
              updateModule({ analog_face_outline_color: e.detail.value });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
            style="width: 100%; height: 40px;"
          ></ultra-color-picker>
        </div>

        <!-- Face Background -->
        <div style="margin-top: 16px;">
          ${context.renderFieldSection(
            localize('editor.animated_clock.face_background_type', lang, 'Background Type'),
            '',
            hass,
            { analog_face_background_type: clockModule.analog_face_background_type || 'color' },
            [
              context.selectField('analog_face_background_type', [
                { value: 'color', label: 'Color' },
                { value: 'upload', label: 'Upload Image' },
                { value: 'entity', label: 'Entity Image' },
                { value: 'url', label: 'Image URL' },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.analog_face_background_type;
              const prev = clockModule.analog_face_background_type;
              if (next === prev) return;
              updateModule(e.detail.value);
              // Ensure the editor UI re-renders to show conditional fields
              if ((context as any)?.requestUpdate) {
                (context as any).requestUpdate();
              }
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            },
            false
          )}
        </div>

        <!-- Background Color (shown when type is 'color') -->
        ${(clockModule.analog_face_background_type || 'color') === 'color'
          ? html`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${localize('editor.animated_clock.face_background', lang, 'Background Color')}
                </label>
                <ultra-color-picker
                  .value="${clockModule.analog_face_background_color ||
                  clockModule.clock_background ||
                  'var(--card-background-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ analog_face_background_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
              </div>
            `
          : ''}

        <!-- Entity Image (shown when type is 'entity') -->
        ${clockModule.analog_face_background_type === 'entity'
          ? html`
              <div style="margin-bottom: 16px;">
                <ha-form
                  .hass=${hass}
                  .data=${{
                    entity: clockModule.analog_face_background_image_entity || '',
                  }}
                  .schema=${[
                    {
                      name: 'entity',
                      selector: { entity: {} },
                    },
                  ]}
                  .computeLabel=${() =>
                    localize(
                      'editor.animated_clock.background_entity',
                      lang,
                      'Background Image Entity'
                    )}
                  @value-changed=${(e: CustomEvent) => {
                    updateModule({
                      analog_face_background_image_entity: e.detail.value.entity,
                    });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}
                ></ha-form>
              </div>
            `
          : ''}

        <!-- Upload Image (shown when type is 'upload') -->
        ${clockModule.analog_face_background_type === 'upload'
          ? html`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${localize(
                    'editor.animated_clock.upload_background',
                    lang,
                    'Upload Background Image'
                  )}
                </label>
                <div style="margin-top: 8px;">
                  <label
                    style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--primary-color); color: var(--text-primary-color); border-radius: 6px; cursor: pointer;"
                  >
                    <ha-icon icon="mdi:upload"></ha-icon>
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      @change="${async (e: Event) => {
                        const input = e.target as HTMLInputElement;
                        const file = input.files?.[0];
                        if (!file || !hass) return;
                        try {
                          const imagePath = await uploadImage(hass, file);
                          updateModule({ analog_face_background_image_upload: imagePath });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        } catch (error) {
                          console.error('Image upload failed:', error);
                          alert(
                            `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                          );
                        }
                      }}"
                      style="display: none"
                    />
                  </label>
                  <div
                    style="margin-top: 8px; padding: 8px; background: var(--secondary-background-color); border-radius: 4px; font-size: 12px;"
                  >
                    ${clockModule.analog_face_background_image_upload
                      ? html`<span title="${clockModule.analog_face_background_image_upload}">
                          ${truncatePath(clockModule.analog_face_background_image_upload)}
                        </span>`
                      : html`<span style="color: var(--secondary-text-color);"
                          >No file chosen</span
                        >`}
                  </div>
                </div>
              </div>
            `
          : ''}

        <!-- Image URL (shown when type is 'url') -->
        ${clockModule.analog_face_background_type === 'url'
          ? html`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${localize('editor.animated_clock.background_url', lang, 'Image URL')}
                </label>
                <input
                  type="text"
                  .value="${clockModule.analog_face_background_image_url || ''}"
                  @input="${(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    updateModule({ analog_face_background_image_url: target.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            `
          : ''}

        <!-- Background Image Options (shown when type is not 'color') -->
        ${clockModule.analog_face_background_type &&
        clockModule.analog_face_background_type !== 'color'
          ? html`
              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${localize('editor.animated_clock.background_size', lang, 'Background Size')}
                </label>
                ${context.renderFieldSection(
                  '',
                  '',
                  hass,
                  {
                    analog_face_background_size: clockModule.analog_face_background_size || 'cover',
                  },
                  [
                    context.selectField('analog_face_background_size', [
                      { value: 'cover', label: 'Cover' },
                      { value: 'contain', label: 'Contain' },
                      { value: 'auto', label: 'Auto' },
                      { value: '100% 100%', label: 'Stretch' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    updateModule(e.detail.value);
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  },
                  false
                )}
              </div>

              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${localize(
                    'editor.animated_clock.background_position',
                    lang,
                    'Background Position'
                  )}
                </label>
                ${context.renderFieldSection(
                  '',
                  '',
                  hass,
                  {
                    analog_face_background_position:
                      clockModule.analog_face_background_position || 'center',
                  },
                  [
                    context.selectField('analog_face_background_position', [
                      { value: 'center', label: 'Center' },
                      { value: 'top', label: 'Top' },
                      { value: 'bottom', label: 'Bottom' },
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    updateModule(e.detail.value);
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  },
                  false
                )}
              </div>

              <div style="margin-bottom: 16px;">
                <label
                  style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
                >
                  ${localize('editor.animated_clock.background_repeat', lang, 'Background Repeat')}
                </label>
                ${context.renderFieldSection(
                  '',
                  '',
                  hass,
                  {
                    analog_face_background_repeat:
                      clockModule.analog_face_background_repeat || 'no-repeat',
                  },
                  [
                    context.selectField('analog_face_background_repeat', [
                      { value: 'no-repeat', label: 'No Repeat' },
                      { value: 'repeat', label: 'Repeat' },
                      { value: 'repeat-x', label: 'Repeat X' },
                      { value: 'repeat-y', label: 'Repeat Y' },
                    ]),
                  ],
                  (e: CustomEvent) => {
                    updateModule(e.detail.value);
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  },
                  false
                )}
              </div>
            `
          : ''}
      </div>
    `;
  }

  // Neon Clock (has specific color properties)
  if (style === 'neon') {
    return html`
      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_hours', lang, 'Hours')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_minutes', lang, 'Minutes')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_seconds', lang, 'Seconds')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_separators', lang, 'Separators (:)')}</span
          >
        </label>
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >${localize('editor.animated_clock.show_ampm', lang, 'AM/PM')}</span
                >
              </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_hours', lang, 'Hours')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_minutes', lang, 'Minutes')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_separators', lang, 'Separators (:)')}</span
          >
        </label>
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >${localize('editor.animated_clock.show_ampm', lang, 'AM/PM')}</span
                >
              </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${clockModule.show_hours !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.digital_hours_color || '#ff3333'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ digital_hours_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${clockModule.show_minutes !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.digital_minutes_color || '#ff3333'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ digital_minutes_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${clockModule.show_seconds !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.digital_seconds_color || '#ff3333'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ digital_seconds_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.digital_separator_color || '#ff3333'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ digital_separator_color: e.detail.value });
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.digital_ampm_color || '#33ff33'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ digital_ampm_color: e.detail.value });
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

  // Minimal Clock (individual colors)
  if (style === 'minimal') {
    return html`
      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${clockModule.show_hours !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.minimal_hours_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ minimal_hours_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${clockModule.show_minutes !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.minimal_minutes_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ minimal_minutes_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${clockModule.show_seconds !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.minimal_seconds_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ minimal_seconds_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.minimal_separator_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ minimal_separator_color: e.detail.value });
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.minimal_ampm_color || 'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ minimal_ampm_color: e.detail.value });
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

  // Retro 7-Segment (individual colors for background, tiles, and digits)
  if (style === 'retro') {
    return html`
      <!-- Display Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Display Background
        </label>
        <ultra-color-picker
          .value="${clockModule.retro_background_color ||
          'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => {
            updateModule({ retro_background_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${clockModule.show_hours !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_hours_tile_color || 'rgba(0, 0, 0, 0.3)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_hours_tile_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Digit Color</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_hours_color || '#ffa500'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_hours_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${clockModule.show_minutes !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_minutes_tile_color || 'rgba(0, 0, 0, 0.3)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_minutes_tile_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Digit Color</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_minutes_color || '#ffa500'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_minutes_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${clockModule.show_seconds !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_seconds_tile_color || 'rgba(0, 0, 0, 0.3)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_seconds_tile_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Digit Color</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_seconds_color || '#ffa500'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_seconds_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${clockModule.show_separators !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Tile Background</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_separator_tile_color || 'rgba(0, 0, 0, 0.3)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_separator_tile_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Colon Color</label
                >
                <ultra-color-picker
                  .value="${clockModule.retro_separator_color || '#ffa500'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ retro_separator_color: e.detail.value });
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.retro_ampm_color || '#00ff00'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ retro_ampm_color: e.detail.value });
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

  // Material Design (individual colors)
  if (style === 'material') {
    return html`
      <!-- Card Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Card Background
        </label>
        <ultra-color-picker
          .value="${clockModule.material_background_color || 'var(--card-background-color)'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => {
            updateModule({ material_background_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${clockModule.show_hours !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.material_hours_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ material_hours_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${clockModule.show_minutes !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.material_minutes_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ material_minutes_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${clockModule.show_seconds !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.material_seconds_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ material_seconds_color: e.detail.value });
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.material_separator_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ material_separator_color: e.detail.value });
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${clockModule.show_ampm !== false
                ? html`
                    <div style="margin-top: 8px; padding-left: 40px;">
                      <ultra-color-picker
                        .value="${clockModule.material_ampm_color || 'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ material_ampm_color: e.detail.value });
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

  // Binary Clock (individual colors for filled/empty dots)
  if (style === 'binary') {
    return html`
      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${clockModule.show_hours !== false
          ? html`
              <div
                style="margin-top: 12px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Empty Dots</label
                >
                <ultra-color-picker
                  .value="${clockModule.binary_hours_empty_color || 'rgba(128, 128, 128, 0.2)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_hours_empty_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Filled Dots</label
                >
                <ultra-color-picker
                  .value="${clockModule.binary_hours_filled_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_hours_filled_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                ${clockModule.show_labels !== false
                  ? html`
                      <label
                        style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                        >Label (HH)</label
                      >
                      <ultra-color-picker
                        .value="${clockModule.binary_hours_label_color ||
                        'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ binary_hours_label_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${clockModule.show_minutes !== false
          ? html`
              <div
                style="margin-top: 12px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Empty Dots</label
                >
                <ultra-color-picker
                  .value="${clockModule.binary_minutes_empty_color || 'rgba(128, 128, 128, 0.2)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_minutes_empty_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Filled Dots</label
                >
                <ultra-color-picker
                  .value="${clockModule.binary_minutes_filled_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_minutes_filled_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                ${clockModule.show_labels !== false
                  ? html`
                      <label
                        style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                        >Label (MM)</label
                      >
                      <ultra-color-picker
                        .value="${clockModule.binary_minutes_label_color ||
                        'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ binary_minutes_label_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>

      <!-- Seconds -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Seconds</span
          >
        </label>
        ${clockModule.show_seconds !== false
          ? html`
              <div
                style="margin-top: 12px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Empty Dots</label
                >
                <ultra-color-picker
                  .value="${clockModule.binary_seconds_empty_color || 'rgba(128, 128, 128, 0.2)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_seconds_empty_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                  >Filled Dots</label
                >
                <ultra-color-picker
                  .value="${clockModule.binary_seconds_filled_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_seconds_filled_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px; margin-bottom: 16px;"
                ></ultra-color-picker>
                ${clockModule.show_labels !== false
                  ? html`
                      <label
                        style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;"
                        >Label (SS)</label
                      >
                      <ultra-color-picker
                        .value="${clockModule.binary_seconds_label_color ||
                        'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ binary_seconds_label_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                    `
                  : ''}
              </div>
            `
          : ''}
      </div>

      <!-- Labels (H M S) -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_labels !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_labels: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Labels (HH MM SS)</span
          >
        </label>
      </div>

      <!-- Separators -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Separators (:)</span
          >
        </label>
        ${clockModule.show_separators !== false
          ? html`
              <div style="margin-top: 8px; padding-left: 40px;">
                <ultra-color-picker
                  .value="${clockModule.binary_separator_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ binary_separator_color: e.detail.value });
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

  // Text Clock (word) - with size controls
  if (style === 'word') {
    return html`
      <!-- Prefix ("It is") -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_prefix !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_prefix: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >"It is" Prefix</span
          >
        </label>
        ${clockModule.show_prefix !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);">Color</label>
                <ultra-color-picker
                  .value="${clockModule.text_prefix_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ text_prefix_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Font Size (px)</label
                >
                <input
                  type="number"
                  .value="${clockModule.text_prefix_size || 38}"
                  @input="${(e: Event) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 38;
                    updateModule({ text_prefix_size: value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  min="10"
                  max="100"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                />
              </div>
            `
          : ''}
      </div>

      <!-- Hours -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Hours</span
          >
        </label>
        ${clockModule.show_hours !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);">Color</label>
                <ultra-color-picker
                  .value="${clockModule.text_hours_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ text_hours_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Font Size (px)</label
                >
                <input
                  type="number"
                  .value="${clockModule.text_hours_size || 48}"
                  @input="${(e: Event) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 48;
                    updateModule({ text_hours_size: value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  min="10"
                  max="100"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                />
              </div>
            `
          : ''}
      </div>

      <!-- Minutes -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >Minutes</span
          >
        </label>
        ${clockModule.show_minutes !== false
          ? html`
              <div
                style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
              >
                <label style="font-size: 12px; color: var(--secondary-text-color);">Color</label>
                <ultra-color-picker
                  .value="${clockModule.text_minutes_color || 'var(--primary-text-color)'}"
                  .hass="${hass}"
                  @value-changed="${(e: CustomEvent) => {
                    updateModule({ text_minutes_color: e.detail.value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  style="width: 100%; height: 40px;"
                ></ultra-color-picker>
                <label style="font-size: 12px; color: var(--secondary-text-color);"
                  >Font Size (px)</label
                >
                <input
                  type="number"
                  .value="${clockModule.text_minutes_size || 48}"
                  @input="${(e: Event) => {
                    const value = parseInt((e.target as HTMLInputElement).value) || 48;
                    updateModule({ text_minutes_size: value });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                  min="10"
                  max="100"
                  style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                />
              </div>
            `
          : ''}
      </div>

      <!-- AM/PM (12-hour format only) -->
      ${clockModule.time_format === '12'
        ? html`
            <div style="margin-bottom: 20px;">
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
              ${clockModule.show_ampm !== false
                ? html`
                    <div
                      style="margin-top: 8px; padding-left: 40px; display: flex; flex-direction: column; gap: 8px;"
                    >
                      <label style="font-size: 12px; color: var(--secondary-text-color);"
                        >Color</label
                      >
                      <ultra-color-picker
                        .value="${clockModule.text_ampm_color || 'var(--primary-text-color)'}"
                        .hass="${hass}"
                        @value-changed="${(e: CustomEvent) => {
                          updateModule({ text_ampm_color: e.detail.value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        style="width: 100%; height: 40px;"
                      ></ultra-color-picker>
                      <label style="font-size: 12px; color: var(--secondary-text-color);"
                        >Font Size (px)</label
                      >
                      <input
                        type="number"
                        .value="${clockModule.text_ampm_size || 24}"
                        @input="${(e: Event) => {
                          const value = parseInt((e.target as HTMLInputElement).value) || 24;
                          updateModule({ text_ampm_size: value });
                          setTimeout(() => context.triggerPreviewUpdate(), 50);
                        }}"
                        min="10"
                        max="100"
                        style="width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px;"
                      />
                    </div>
                  `
                : ''}
            </div>
          `
        : ''}
    `;
  }

  // Terminal Clock
  if (style === 'terminal') {
    return html`
      <!-- Terminal Background Color -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: block; font-size: 13px; font-weight: 500; color: var(--primary-text-color); margin-bottom: 6px;"
        >
          Terminal Background
        </label>
        <ultra-color-picker
          .value="${clockModule.terminal_background_color || '#1e1e1e'}"
          .hass="${hass}"
          @value-changed="${(e: CustomEvent) => {
            updateModule({ terminal_background_color: e.detail.value });
            setTimeout(() => context.triggerPreviewUpdate(), 50);
          }}"
          style="width: 100%; height: 40px;"
        ></ultra-color-picker>
      </div>

      <div
        style="border-top: 1px solid var(--divider-color); padding-top: 20px; margin-top: 20px;"
      ></div>

      <!-- Terminal Prompt -->
      <div style="margin-bottom: 20px;">
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_prompt !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_prompt: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_prompt', lang, 'Terminal Prompt')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_command !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_command: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_command', lang, 'Terminal Command')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_hours !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_hours: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_hours', lang, 'Hours')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_minutes !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_minutes: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_minutes', lang, 'Minutes')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_seconds !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_seconds: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_seconds', lang, 'Seconds')}</span
          >
        </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_separators !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_separators: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_separators', lang, 'Separators (:)')}</span
          >
        </label>
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
              <label
                style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
              >
                <ha-switch
                  .checked="${clockModule.show_ampm !== false}"
                  @change="${(e: Event) => {
                    const target = e.target as any;
                    updateModule({ show_ampm: target.checked });
                    setTimeout(() => context.triggerPreviewUpdate(), 50);
                  }}"
                ></ha-switch>
                <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
                  >AM/PM</span
                >
              </label>
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
        <label
          style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 6px; background: var(--primary-background-color);"
        >
          <ha-switch
            .checked="${clockModule.show_cursor !== false}"
            @change="${(e: Event) => {
              const target = e.target as any;
              updateModule({ show_cursor: target.checked });
              setTimeout(() => context.triggerPreviewUpdate(), 50);
            }}"
          ></ha-switch>
          <span style="font-size: 14px; font-weight: 500; color: var(--primary-text-color);"
            >${localize('editor.animated_clock.show_cursor', lang, 'Blinking Cursor')}</span
          >
        </label>
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
