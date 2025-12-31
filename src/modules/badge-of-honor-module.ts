import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, BadgeOfHonorModule, UltraCardConfig } from '../types';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import '../components/ultra-color-picker';

/**
 * Badge of Honor Module - Pro Feature
 *
 * A beautiful animated badge that celebrates Ultra Card Pro membership.
 * Features:
 * - Rotating circular text with customizable content
 * - Smooth gradient color transitions (blue/green/purple theme)
 * - Central icon or UC logo
 * - Multiple animation styles (rotate, pulse, glow)
 * - Customizable size, colors, and speed
 */
export class UltraBadgeOfHonorModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'badge_of_honor',
    title: 'Badge of Honor',
    description: 'Animated Pro membership badge with rotating text and gradient effects',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:certificate',
    category: 'content',
    tags: ['badge', 'pro', 'premium', 'certificate', 'animated'],
  };

  createDefault(id?: string, hass?: HomeAssistant): BadgeOfHonorModule {
    return {
      id: id || this.generateId('badge_of_honor'),
      type: 'badge_of_honor',

      // Badge text configuration (fixed - not user configurable)
      badge_text: 'Ultra Card Pro • ',
      badge_text_repeat: 4, // How many times to repeat the text

      // Visual settings
      badge_size: 120,
      inner_badge_ratio: 0.6, // Inner circle is 60% of outer

      // Color scheme
      gradient_color_1: '#4ecdc4', // Teal
      gradient_color_2: '#44a8b3', // Blue-teal
      gradient_color_3: '#7c5ce0', // Purple
      gradient_color_4: '#6366f1', // Indigo

      // Animation settings
      rotation_speed: 10, // Seconds for full rotation
      rotation_direction: 'clockwise',
      enable_color_shift: true,
      color_shift_speed: 8, // Seconds for color cycle
      enable_glow: true,
      glow_intensity: 0.4,
      enable_pulse: false,
      pulse_speed: 2,

      // Inner content
      inner_content_type: 'icon', // 'icon', 'text', 'image'
      inner_icon: 'mdi:crown',
      inner_text: 'PRO',
      inner_image_url: '',

      // Inner styling
      inner_background_type: 'gradient', // 'solid', 'gradient', 'transparent'
      inner_background_color: '#1a1a2e',
      inner_text_color: '#ffffff',
      inner_icon_color: '#ffffff',

      // Text styling
      text_font_size: 10,
      text_font_weight: 700,
      text_letter_spacing: 2,

      // Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },

      // Hover
      enable_hover_effect: true,
      hover_scale: 1.05,

      // Logic
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as BadgeOfHonorModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as BadgeOfHonorModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const badgeModule = module as BadgeOfHonorModule;
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
      <style>
        ${this.injectUcFormStyles()} ${this.getEditorStyles()}
      </style>

      <!-- Size & Layout Section -->
      ${this.renderSizeSection(badgeModule, hass, updateModule, lang)}

      <!-- Colors Section -->
      ${this.renderColorsSection(badgeModule, hass, updateModule, lang)}

      <!-- Animation Section -->
      ${this.renderAnimationSection(badgeModule, hass, updateModule, lang)}

      <!-- Inner Content Section -->
      ${this.renderInnerContentSection(badgeModule, hass, updateModule, lang)}
    `;
  }

  private renderProLockUI(lang: string): TemplateResult {
    return html`
      <div
        class="pro-lock-container"
        style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        text-align: center;
        background: var(--secondary-background-color);
        border-radius: 12px;
        margin: 16px;
      "
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          ${localize('editor.pro.feature_locked', lang, 'Pro Feature')}
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 16px; max-width: 300px;"
        >
          ${localize(
            'editor.pro.badge_description',
            lang,
            'Badge of Honor is an exclusive Pro feature that displays a beautiful animated badge celebrating your Ultra Card Pro membership.'
          )}
        </div>
        <a
          href="https://ultracard.io/pro"
          target="_blank"
          style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: var(--primary-color);
            color: var(--text-primary-color, white);
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          "
        >
          <ha-icon icon="mdi:crown" style="--mdi-icon-size: 20px;"></ha-icon>
          ${localize('editor.pro.upgrade_button', lang, 'Upgrade to Pro')}
        </a>
      </div>
    `;
  }

  private renderSizeSection(
    module: BadgeOfHonorModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<BadgeOfHonorModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.badge.size_title', lang, 'SIZE & LAYOUT')}
        </div>

        <!-- Badge Size -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">${localize('editor.badge.badge_size', lang, 'Badge Size')}</div>
          <div class="field-description">
            ${localize('editor.badge.badge_size_desc', lang, 'Overall size of the badge in pixels')}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="60"
              max="300"
              step="10"
              .value="${module.badge_size || 120}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                updateModule({ badge_size: parseInt(target.value) });
              }}
            />
            <input
              type="number"
              class="gap-input"
              min="60"
              max="300"
              step="10"
              .value="${module.badge_size || 120}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = parseInt(target.value);
                if (!isNaN(value)) updateModule({ badge_size: value });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => updateModule({ badge_size: 120 })}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Inner Badge Ratio -->
        <div class="field-container">
          <div class="field-title">
            ${localize('editor.badge.inner_ratio', lang, 'Inner Badge Ratio')}
          </div>
          <div class="field-description">
            ${localize(
              'editor.badge.inner_ratio_desc',
              lang,
              'Size of inner circle relative to outer (0.4 - 0.8)'
            )}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="0.4"
              max="0.8"
              step="0.05"
              .value="${module.inner_badge_ratio || 0.6}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                updateModule({ inner_badge_ratio: parseFloat(target.value) });
              }}
            />
            <input
              type="number"
              class="gap-input"
              min="0.4"
              max="0.8"
              step="0.05"
              .value="${module.inner_badge_ratio || 0.6}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = parseFloat(target.value);
                if (!isNaN(value)) updateModule({ inner_badge_ratio: value });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => updateModule({ inner_badge_ratio: 0.6 })}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderColorsSection(
    module: BadgeOfHonorModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<BadgeOfHonorModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.badge.colors_title', lang, 'GRADIENT COLORS')}
        </div>
        <div
          class="section-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
        >
          ${localize(
            'editor.badge.colors_desc',
            lang,
            'Set the gradient colors that shift around the badge ring. The colors will smoothly transition creating a beautiful animated effect.'
          )}
        </div>

        <!-- Color Pickers Grid -->
        <div
          style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;"
        >
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.badge.color_1', lang, 'Color 1 (Teal)')}
            </div>
            <ultra-color-picker
              .label=${''}
              .value=${module.gradient_color_1 || '#4ecdc4'}
              .defaultValue=${'#4ecdc4'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ gradient_color_1: e.detail.value })}
            ></ultra-color-picker>
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.badge.color_2', lang, 'Color 2 (Blue-Teal)')}
            </div>
            <ultra-color-picker
              .label=${''}
              .value=${module.gradient_color_2 || '#44a8b3'}
              .defaultValue=${'#44a8b3'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ gradient_color_2: e.detail.value })}
            ></ultra-color-picker>
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.badge.color_3', lang, 'Color 3 (Purple)')}
            </div>
            <ultra-color-picker
              .label=${''}
              .value=${module.gradient_color_3 || '#7c5ce0'}
              .defaultValue=${'#7c5ce0'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ gradient_color_3: e.detail.value })}
            ></ultra-color-picker>
          </div>
          <div class="field-group">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
              ${localize('editor.badge.color_4', lang, 'Color 4 (Indigo)')}
            </div>
            <ultra-color-picker
              .label=${''}
              .value=${module.gradient_color_4 || '#6366f1'}
              .defaultValue=${'#6366f1'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ gradient_color_4: e.detail.value })}
            ></ultra-color-picker>
          </div>
        </div>

        <!-- Inner Background Color -->
        <div class="field-group" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.badge.inner_bg', lang, 'Inner Background Type')}
          </div>
          <div
            class="field-description"
            style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
          >
            ${localize('editor.badge.inner_bg_desc', lang, 'Background style for the inner circle')}
          </div>
          ${this.renderUcForm(
            hass,
            { inner_background_type: module.inner_background_type || 'gradient' },
            [
              this.selectField('inner_background_type', [
                { value: 'gradient', label: localize('editor.badge.bg_gradient', lang, 'Gradient') },
                { value: 'solid', label: localize('editor.badge.bg_solid', lang, 'Solid Color') },
                {
                  value: 'transparent',
                  label: localize('editor.badge.bg_transparent', lang, 'Transparent'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.inner_background_type;
              if (next !== module.inner_background_type) {
                updateModule({ inner_background_type: next });
              }
            },
            false
          )}
        </div>

        ${module.inner_background_type === 'solid'
          ? html`
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  ${localize('editor.badge.inner_color', lang, 'Inner Background Color')}
                </div>
                <ultra-color-picker
                  .label=${''}
                  .value=${module.inner_background_color || '#1a1a2e'}
                  .defaultValue=${'#1a1a2e'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ inner_background_color: e.detail.value })}
                ></ultra-color-picker>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderAnimationSection(
    module: BadgeOfHonorModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<BadgeOfHonorModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.badge.animation_title', lang, 'ANIMATION')}
        </div>

        <!-- Rotation Speed -->
        <div class="field-container" style="margin-bottom: 16px;">
          <div class="field-title">
            ${localize('editor.badge.rotation_speed', lang, 'Rotation Speed')}
          </div>
          <div class="field-description">
            ${localize(
              'editor.badge.rotation_speed_desc',
              lang,
              'Time in seconds for one full rotation (lower = faster)'
            )}
          </div>
          <div class="gap-control-container" style="display: flex; align-items: center; gap: 12px;">
            <input
              type="range"
              class="gap-slider"
              min="3"
              max="30"
              step="1"
              .value="${module.rotation_speed || 10}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                updateModule({ rotation_speed: parseInt(target.value) });
              }}
            />
            <input
              type="number"
              class="gap-input"
              min="3"
              max="30"
              step="1"
              .value="${module.rotation_speed || 10}"
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = parseInt(target.value);
                if (!isNaN(value)) updateModule({ rotation_speed: value });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => updateModule({ rotation_speed: 10 })}
              title="Reset to default"
            >
              <ha-icon icon="mdi:refresh"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Rotation Direction -->
        <div class="field-group" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.badge.rotation_direction', lang, 'Rotation Direction')}
          </div>
          ${this.renderUcForm(
            hass,
            { rotation_direction: module.rotation_direction || 'clockwise' },
            [
              this.selectField('rotation_direction', [
                {
                  value: 'clockwise',
                  label: localize('editor.badge.clockwise', lang, 'Clockwise'),
                },
                {
                  value: 'counter-clockwise',
                  label: localize('editor.badge.counter_clockwise', lang, 'Counter-Clockwise'),
                },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.rotation_direction;
              if (next !== module.rotation_direction) {
                updateModule({ rotation_direction: next });
              }
            },
            false
          )}
        </div>

        <!-- Color Shift Toggle -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: var(--primary-background-color); border-radius: 8px;"
        >
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">
              ${localize('editor.badge.color_shift', lang, 'Color Shift Animation')}
            </div>
            <div class="field-description" style="font-size: 12px; margin-bottom: 0;">
              ${localize(
                'editor.badge.color_shift_desc',
                lang,
                'Animate gradient colors shifting around the ring'
              )}
            </div>
          </div>
          <ha-switch
            .checked=${module.enable_color_shift !== false}
            @change=${(e: Event) => {
              const target = e.target as any;
              updateModule({ enable_color_shift: target.checked });
            }}
          ></ha-switch>
        </div>

        ${module.enable_color_shift !== false
          ? html`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${localize('editor.badge.color_shift_speed', lang, 'Color Shift Speed')}
                </div>
                <div class="field-description">
                  ${localize(
                    'editor.badge.color_shift_speed_desc',
                    lang,
                    'Time in seconds for full color cycle'
                  )}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="2"
                    max="20"
                    step="1"
                    .value="${module.color_shift_speed || 8}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      updateModule({ color_shift_speed: parseInt(target.value) });
                    }}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="2"
                    max="20"
                    step="1"
                    .value="${module.color_shift_speed || 8}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = parseInt(target.value);
                      if (!isNaN(value)) updateModule({ color_shift_speed: value });
                    }}
                  />
                  <button
                    class="reset-btn"
                    @click=${() => updateModule({ color_shift_speed: 8 })}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `
          : ''}

        <!-- Glow Effect Toggle -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 12px; background: var(--primary-background-color); border-radius: 8px;"
        >
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">
              ${localize('editor.badge.glow', lang, 'Glow Effect')}
            </div>
            <div class="field-description" style="font-size: 12px; margin-bottom: 0;">
              ${localize(
                'editor.badge.glow_desc',
                lang,
                'Add a soft glow around the badge'
              )}
            </div>
          </div>
          <ha-switch
            .checked=${module.enable_glow !== false}
            @change=${(e: Event) => {
              const target = e.target as any;
              updateModule({ enable_glow: target.checked });
            }}
          ></ha-switch>
        </div>

        ${module.enable_glow !== false
          ? html`
              <div class="field-container" style="margin-bottom: 16px;">
                <div class="field-title">
                  ${localize('editor.badge.glow_intensity', lang, 'Glow Intensity')}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="0.1"
                    max="1"
                    step="0.1"
                    .value="${module.glow_intensity || 0.4}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      updateModule({ glow_intensity: parseFloat(target.value) });
                    }}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="0.1"
                    max="1"
                    step="0.1"
                    .value="${module.glow_intensity || 0.4}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = parseFloat(target.value);
                      if (!isNaN(value)) updateModule({ glow_intensity: value });
                    }}
                  />
                  <button
                    class="reset-btn"
                    @click=${() => updateModule({ glow_intensity: 0.4 })}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `
          : ''}

        <!-- Pulse Effect Toggle -->
        <div
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--primary-background-color); border-radius: 8px;"
        >
          <div>
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 2px;">
              ${localize('editor.badge.pulse', lang, 'Pulse Effect')}
            </div>
            <div class="field-description" style="font-size: 12px; margin-bottom: 0;">
              ${localize('editor.badge.pulse_desc', lang, 'Add a subtle pulsing animation')}
            </div>
          </div>
          <ha-switch
            .checked=${module.enable_pulse || false}
            @change=${(e: Event) => {
              const target = e.target as any;
              updateModule({ enable_pulse: target.checked });
            }}
          ></ha-switch>
        </div>

        ${module.enable_pulse
          ? html`
              <div class="field-container" style="margin-top: 16px;">
                <div class="field-title">
                  ${localize('editor.badge.pulse_speed', lang, 'Pulse Speed')}
                </div>
                <div
                  class="gap-control-container"
                  style="display: flex; align-items: center; gap: 12px;"
                >
                  <input
                    type="range"
                    class="gap-slider"
                    min="0.5"
                    max="5"
                    step="0.5"
                    .value="${module.pulse_speed || 2}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      updateModule({ pulse_speed: parseFloat(target.value) });
                    }}
                  />
                  <input
                    type="number"
                    class="gap-input"
                    min="0.5"
                    max="5"
                    step="0.5"
                    .value="${module.pulse_speed || 2}"
                    @input=${(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      const value = parseFloat(target.value);
                      if (!isNaN(value)) updateModule({ pulse_speed: value });
                    }}
                  />
                  <button
                    class="reset-btn"
                    @click=${() => updateModule({ pulse_speed: 2 })}
                    title="Reset to default"
                  >
                    <ha-icon icon="mdi:refresh"></ha-icon>
                  </button>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private renderInnerContentSection(
    module: BadgeOfHonorModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<BadgeOfHonorModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
        >
          ${localize('editor.badge.inner_content_title', lang, 'INNER CONTENT')}
        </div>
        <div
          class="section-description"
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;"
        >
          ${localize(
            'editor.badge.inner_content_desc',
            lang,
            'Choose what to display in the center of the badge.'
          )}
        </div>

        <!-- Inner Content Type -->
        <div class="field-group" style="margin-bottom: 16px;">
          <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
            ${localize('editor.badge.inner_type', lang, 'Content Type')}
          </div>
          ${this.renderUcForm(
            hass,
            { inner_content_type: module.inner_content_type || 'icon' },
            [
              this.selectField('inner_content_type', [
                { value: 'icon', label: localize('editor.badge.type_icon', lang, 'Icon') },
                { value: 'text', label: localize('editor.badge.type_text', lang, 'Text') },
                { value: 'image', label: localize('editor.badge.type_image', lang, 'Image') },
              ]),
            ],
            (e: CustomEvent) => {
              const next = e.detail.value.inner_content_type;
              if (next !== module.inner_content_type) {
                updateModule({ inner_content_type: next });
              }
            },
            false
          )}
        </div>

        <!-- Icon Content -->
        ${module.inner_content_type === 'icon' || !module.inner_content_type
          ? html`
              <div class="field-group" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${localize('editor.badge.inner_icon', lang, 'Icon')}
                </div>
                <ha-form
                  .hass=${hass}
                  .data=${{ inner_icon: module.inner_icon || 'mdi:crown' }}
                  .schema=${[{ name: 'inner_icon', selector: { icon: {} }, label: '' }]}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ inner_icon: e.detail.value.inner_icon })}
                ></ha-form>
              </div>
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  ${localize('editor.badge.icon_color', lang, 'Icon Color')}
                </div>
                <ultra-color-picker
                  .label=${''}
                  .value=${module.inner_icon_color || '#ffffff'}
                  .defaultValue=${'#ffffff'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ inner_icon_color: e.detail.value })}
                ></ultra-color-picker>
              </div>
            `
          : ''}

        <!-- Text Content -->
        ${module.inner_content_type === 'text'
          ? html`
              <div class="field-group" style="margin-bottom: 16px;">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${localize('editor.badge.inner_text', lang, 'Text')}
                </div>
                <ha-form
                  .hass=${hass}
                  .data=${{ inner_text: module.inner_text || 'PRO' }}
                  .schema=${[{ name: 'inner_text', selector: { text: {} }, label: '' }]}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ inner_text: e.detail.value.inner_text })}
                ></ha-form>
              </div>
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                >
                  ${localize('editor.badge.text_color', lang, 'Text Color')}
                </div>
                <ultra-color-picker
                  .label=${''}
                  .value=${module.inner_text_color || '#ffffff'}
                  .defaultValue=${'#ffffff'}
                  .hass=${hass}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ inner_text_color: e.detail.value })}
                ></ultra-color-picker>
              </div>
            `
          : ''}

        <!-- Image Content -->
        ${module.inner_content_type === 'image'
          ? html`
              <div class="field-group">
                <div
                  class="field-title"
                  style="font-size: 16px; font-weight: 600; margin-bottom: 4px;"
                >
                  ${localize('editor.badge.inner_image', lang, 'Image URL')}
                </div>
                <div
                  class="field-description"
                  style="font-size: 13px; font-weight: 400; margin-bottom: 12px;"
                >
                  ${localize(
                    'editor.badge.inner_image_desc',
                    lang,
                    'Enter a URL or local path to an image'
                  )}
                </div>
                <ha-form
                  .hass=${hass}
                  .data=${{ inner_image_url: module.inner_image_url || '' }}
                  .schema=${[{ name: 'inner_image_url', selector: { text: {} }, label: '' }]}
                  @value-changed=${(e: CustomEvent) =>
                    updateModule({ inner_image_url: e.detail.value.inner_image_url })}
                ></ha-form>
              </div>
            `
          : ''}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const badgeModule = module as BadgeOfHonorModule;

    // Badge dimensions
    const size = badgeModule.badge_size || 120;
    const innerRatio = badgeModule.inner_badge_ratio || 0.6;
    const innerSize = size * innerRatio;
    const ringWidth = (size - innerSize) / 2;

    // Colors
    const color1 = badgeModule.gradient_color_1 || '#4ecdc4';
    const color2 = badgeModule.gradient_color_2 || '#44a8b3';
    const color3 = badgeModule.gradient_color_3 || '#7c5ce0';
    const color4 = badgeModule.gradient_color_4 || '#6366f1';

    // Animation settings
    const rotationSpeed = badgeModule.rotation_speed || 10;
    const rotationDirection = badgeModule.rotation_direction === 'counter-clockwise' ? 'reverse' : 'normal';
    const colorShiftSpeed = badgeModule.color_shift_speed || 8;
    const glowIntensity = badgeModule.glow_intensity || 0.4;
    const pulseSpeed = badgeModule.pulse_speed || 2;

    // Text settings - FIXED TEXT, not configurable
    const badgeText = 'ULTRA CARD PRO  •  ULTRA CARD PRO  •  ';
    const fontSize = Math.max(7, Math.min(12, size * 0.075));
    const letterSpacing = 2;
    const fontWeight = 600;

    // Generate unique animation names for this instance
    const uniqueId = module.id || 'badge';

    // Calculate circumference for text path
    const textRadius = size / 2 - ringWidth / 2;
    const circumference = 2 * Math.PI * textRadius;

    // Inner content
    const innerContentType = badgeModule.inner_content_type || 'icon';
    const innerIcon = badgeModule.inner_icon || 'mdi:crown';
    const innerText = badgeModule.inner_text || 'PRO';
    const innerImageUrl = badgeModule.inner_image_url || '';
    const innerBgType = badgeModule.inner_background_type || 'gradient';
    const innerBgColor = badgeModule.inner_background_color || '#1a1a2e';
    const innerTextColor = badgeModule.inner_text_color || '#ffffff';
    const innerIconColor = badgeModule.inner_icon_color || '#ffffff';

    // Generate inner background style
    let innerBgStyle = '';
    if (innerBgType === 'gradient') {
      innerBgStyle = `background: linear-gradient(135deg, ${color1}22 0%, ${color3}22 100%); backdrop-filter: blur(10px);`;
    } else if (innerBgType === 'solid') {
      innerBgStyle = `background: ${innerBgColor};`;
    } else {
      innerBgStyle = 'background: transparent;';
    }

    return html`
      <style>
        @keyframes badge-rotate-${uniqueId} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Smooth lava lamp - continuous rotation */
        @keyframes badge-lava-spin-${uniqueId} {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes badge-pulse-${uniqueId} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        @keyframes badge-glow-pulse-${uniqueId} {
          0%, 100% {
            filter: blur(0px);
            opacity: 1;
          }
          50% {
            filter: blur(2px);
            opacity: 0.9;
          }
        }

        .badge-of-honor-container-${uniqueId} {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: ${size}px;
          height: ${size}px;
          margin: 0 auto;
          ${badgeModule.enable_pulse ? `animation: badge-pulse-${uniqueId} ${pulseSpeed}s ease-in-out infinite;` : ''}
        }

        .badge-outer-ring-${uniqueId} {
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          overflow: hidden;
          ${badgeModule.enable_glow !== false ? `box-shadow: 0 0 ${size * 0.15 * glowIntensity}px ${color1}90, 0 0 ${size * 0.25 * glowIntensity}px ${color2}70, 0 0 ${size * 0.4 * glowIntensity}px ${color3}50;` : ''}
        }

        .badge-gradient-layer-${uniqueId} {
          position: absolute;
          width: 140%;
          height: 140%;
          top: -20%;
          left: -20%;
          background: conic-gradient(
            from 0deg,
            ${color1},
            ${color2},
            ${color3},
            ${color4},
            ${color1}
          );
          ${badgeModule.enable_color_shift !== false ? `animation: badge-lava-spin-${uniqueId} ${colorShiftSpeed}s linear infinite;` : ''}
        }

        .badge-text-ring-${uniqueId} {
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          animation: badge-rotate-${uniqueId} ${rotationSpeed}s linear infinite;
          animation-direction: ${rotationDirection};
        }

        .badge-text-ring-${uniqueId} svg {
          width: 100%;
          height: 100%;
        }

        .badge-text-ring-${uniqueId} textPath {
          fill: white;
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          letter-spacing: ${letterSpacing}px;
          text-transform: uppercase;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .badge-inner-circle-${uniqueId} {
          position: absolute;
          width: ${innerSize}px;
          height: ${innerSize}px;
          border-radius: 50%;
          ${innerBgStyle}
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .badge-inner-content-${uniqueId} {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-inner-content-${uniqueId} ha-icon {
          color: ${innerIconColor};
          --mdc-icon-size: ${innerSize * 0.5}px;
        }

        .badge-inner-content-${uniqueId} .inner-text {
          color: ${innerTextColor};
          font-size: ${innerSize * 0.35}px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .badge-inner-content-${uniqueId} .inner-image {
          width: ${innerSize * 0.7}px;
          height: ${innerSize * 0.7}px;
          object-fit: contain;
          border-radius: 50%;
        }

        .badge-of-honor-wrapper-${uniqueId} {
          transition: transform 0.3s ease;
          cursor: ${badgeModule.tap_action?.action !== 'nothing' ? 'pointer' : 'default'};
        }

        .badge-of-honor-wrapper-${uniqueId}:hover {
          transform: scale(${badgeModule.enable_hover_effect !== false ? (badgeModule.hover_scale || 1.05) : 1});
        }
      </style>

      <div class="badge-of-honor-wrapper-${uniqueId}">
        <div class="badge-of-honor-container-${uniqueId}">
          <!-- Outer gradient ring with glow -->
          <div class="badge-outer-ring-${uniqueId}">
            <div class="badge-gradient-layer-${uniqueId}"></div>
          </div>

          <!-- Rotating text ring -->
          <div class="badge-text-ring-${uniqueId}">
            <svg viewBox="0 0 ${size} ${size}">
              <defs>
                <path
                  id="badge-text-path-${uniqueId}"
                  d="M ${size / 2}, ${size / 2} m -${textRadius}, 0 a ${textRadius},${textRadius} 0 1,1 ${textRadius * 2},0 a ${textRadius},${textRadius} 0 1,1 -${textRadius * 2},0"
                  fill="none"
                />
              </defs>
              <text textLength="${Math.floor(2 * Math.PI * textRadius * 0.98)}" lengthAdjust="spacing">
                <textPath href="#badge-text-path-${uniqueId}" startOffset="0%">
                  ${badgeText}
                </textPath>
              </text>
            </svg>
          </div>

          <!-- Inner circle with content -->
          <div class="badge-inner-circle-${uniqueId}">
            <div class="badge-inner-content-${uniqueId}">
              ${innerContentType === 'icon' || !innerContentType
                ? html`<ha-icon icon="${innerIcon}"></ha-icon>`
                : ''}
              ${innerContentType === 'text'
                ? html`<span class="inner-text">${innerText}</span>`
                : ''}
              ${innerContentType === 'image' && innerImageUrl
                ? html`<img class="inner-image" src="${innerImageUrl}" alt="Badge" />`
                : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const badgeModule = module as BadgeOfHonorModule;
    const errors = [...baseValidation.errors];

    if (badgeModule.badge_size && (badgeModule.badge_size < 60 || badgeModule.badge_size > 300)) {
      errors.push('Badge size must be between 60 and 300 pixels');
    }

    if (
      badgeModule.inner_badge_ratio &&
      (badgeModule.inner_badge_ratio < 0.4 || badgeModule.inner_badge_ratio > 0.8)
    ) {
      errors.push('Inner badge ratio must be between 0.4 and 0.8');
    }

    if (
      badgeModule.rotation_speed &&
      (badgeModule.rotation_speed < 3 || badgeModule.rotation_speed > 30)
    ) {
      errors.push('Rotation speed must be between 3 and 30 seconds');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private getEditorStyles(): string {
    return `
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        margin-bottom: 16px;
        letter-spacing: 0.5px;
      }

      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
      }

      .field-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .field-description {
        font-size: 13px;
        font-weight: 400;
        margin-bottom: 12px;
        color: var(--secondary-text-color);
      }

      .field-group {
        margin-bottom: 16px;
      }

      .field-container {
        margin-bottom: 16px;
      }

      .gap-control-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gap-slider {
        flex: 1;
        height: 6px;
        background: var(--divider-color, #cccccc);
        border-radius: 3px;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .gap-slider::-webkit-slider-thumb {
        appearance: none;
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--primary-color);
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .gap-slider:hover {
        background: var(--primary-color);
        opacity: 0.7;
      }

      .gap-slider:hover::-webkit-slider-thumb {
        transform: scale(1.1);
      }

      .gap-slider:hover::-moz-range-thumb {
        transform: scale(1.1);
      }

      .gap-input {
        min-width: 80px;
        max-width: 120px;
        padding: 4px 8px !important;
        border: 1px solid var(--divider-color, #cccccc);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        text-align: left;
        transition: all 0.2s ease;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .gap-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(var(--rgb-primary-color), 0.2);
      }

      .reset-btn {
        width: 36px;
        height: 36px;
        padding: 0;
        border: 1px solid var(--divider-color, #cccccc);
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

      .reset-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
        border-color: var(--primary-color);
      }

      .reset-btn ha-icon {
        font-size: 16px;
      }
    `;
  }

  getStyles(): string {
    return `
      .badge-of-honor-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    `;
  }
}
