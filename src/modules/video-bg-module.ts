import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, VideoBackgroundModule, UltraCardConfig } from '../types';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import { ucVideoBgService } from '../services/uc-video-bg-service';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import '../components/ultra-color-picker';

export class UltraVideoBgModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'video_bg',
    title: 'Video Background',
    description:
      'Add dynamic, conditional video backgrounds to your dashboard view.',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:video-box',
    category: 'media',
    tags: ['video', 'background', 'pro', 'youtube', 'vimeo', 'dynamic', 'conditional'],
  };

  createDefault(id?: string, hass?: HomeAssistant): VideoBackgroundModule {
    return {
      id: id || this.generateId('video_bg'),
      type: 'video_bg',

      // Core Settings
      enabled: true,
      editor_only: true,
      controller_id: undefined,
      pause_when_hidden: true,
      respect_reduced_motion: true,
      enable_on_mobile: true,

      // Visual Filters
      opacity: 100,
      blur: '0px',
      brightness: '100%',
      scale: 1.0,

      // Default Video Configuration
      default_source: 'youtube',
      default_video_url: '',
      default_loop: true,
      default_muted: true,
      default_start_time: 0,

      // Conditional Rules
      rules: [],

      // Global Card Transparency
      global_card_transparency: {
        enabled: false,
        opacity: 90,
        blur_px: 0,
        color: undefined,
      },

      // Logic (visibility) defaults
      display_mode: 'always',
      display_conditions: [],
    };
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const videoBgModule = module as VideoBackgroundModule;
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
      <div class="uc-video-bg-settings">
        ${this.injectUcFormStyles()}

        <!-- Module Info -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
            <ha-icon
              icon="mdi:video-box"
              style="color: var(--primary-color); --mdi-icon-size: 32px;"
            ></ha-icon>
            <div>
              <div style="font-size: 18px; font-weight: 700;">Video Background (Pro)</div>
              <div style="font-size: 12px; color: var(--secondary-text-color);">
                View-wide dynamic video backgrounds with conditional logic
              </div>
            </div>
          </div>

          <div
            style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color);"
          >
            <div style="font-size: 13px; line-height: 1.5;">
              <strong>Note:</strong> This module controls the video background for the entire view.
              It will not display as a visible card in the dashboard. Only the topmost enabled
              module with passing logic conditions will render.
            </div>
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

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Enable Video Background</div>
              ${this.renderUcForm(
                hass,
                { enabled: videoBgModule.enabled },
                [this.booleanField('enabled')],
                (e: CustomEvent) => updateModule(e.detail.value),
                false
              )}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Turn the video background on or off
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Editor Only</div>
              ${this.renderUcForm(
                hass,
                { editor_only: videoBgModule.editor_only },
                [this.booleanField('editor_only')],
                (e: CustomEvent) => updateModule(e.detail.value),
                false
              )}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              If enabled, the background will only be visible when NOT in edit mode
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Enable on Mobile</div>
              ${this.renderUcForm(
                hass,
                { enable_on_mobile: videoBgModule.enable_on_mobile },
                [this.booleanField('enable_on_mobile')],
                (e: CustomEvent) => updateModule(e.detail.value),
                false
              )}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Enable video backgrounds on mobile devices (may impact performance)
            </div>
          </div>
        </div>

        <!-- Default Video Source -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            DEFAULT VIDEO SOURCE
          </div>

          ${this.renderFieldSection(
            'Video Source Type',
            'Choose the type of video source.',
            hass,
            { default_source: videoBgModule.default_source },
            [
              this.selectField('default_source', [
                { value: 'youtube', label: 'YouTube' },
                { value: 'vimeo', label: 'Vimeo' },
                { value: 'url', label: 'Direct URL' },
                { value: 'local', label: 'Local File' },
              ]),
            ],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          <div style="margin-bottom: 16px;">
            <div class="field-title" style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${videoBgModule.default_source === 'youtube'
                ? 'YouTube Video URL or ID'
                : videoBgModule.default_source === 'vimeo'
                  ? 'Vimeo Video URL or ID'
                  : 'Video URL'}
            </div>
            <div
              class="field-description"
              style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 12px; opacity: 0.8; line-height: 1.4;"
            >
              ${videoBgModule.default_source === 'youtube'
                ? 'Enter YouTube video URL or video ID (e.g., dQw4w9WgXcQ).'
                : videoBgModule.default_source === 'vimeo'
                  ? 'Enter Vimeo video URL or video ID (e.g., 123456789).'
                  : 'Enter the full URL to your video file.'}
            </div>
            <ha-textfield
              .value=${videoBgModule.default_video_url || ''}
              placeholder=${videoBgModule.default_source === 'youtube'
                ? 'dQw4w9WgXcQ or https://youtube.com/watch?v=...'
                : videoBgModule.default_source === 'vimeo'
                  ? '123456789 or https://vimeo.com/...'
                  : 'https://example.com/video.mp4'}
              @input=${(e: Event) => {
                const target = e.target as any;
                const input = target.shadowRoot?.querySelector('input') || target;
                const value = target.value;
                const cursorPosition = input.selectionStart;
                const cursorEnd = input.selectionEnd;

                updateModule({ default_video_url: value });

                requestAnimationFrame(() => {
                  if (input && typeof cursorPosition === 'number') {
                    target.value = value;
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                  }
                });
                setTimeout(() => {
                  if (input && typeof cursorPosition === 'number') {
                    target.value = value;
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                  }
                }, 0);
                setTimeout(() => {
                  if (input && typeof cursorPosition === 'number') {
                    target.value = value;
                    input.value = value;
                    input.setSelectionRange(cursorPosition, cursorEnd || cursorPosition);
                  }
                }, 10);
              }}
              style="width: 100%; --mdc-theme-primary: var(--primary-color);"
            ></ha-textfield>
          </div>
          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Loop Video</div>
              ${this.renderUcForm(
                hass,
                { default_loop: videoBgModule.default_loop },
                [this.booleanField('default_loop')],
                (e: CustomEvent) => updateModule(e.detail.value),
                false
              )}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Automatically restart the video when it ends
            </div>
          </div>
          ${videoBgModule.default_source === 'youtube' || videoBgModule.default_source === 'local'
            ? this.renderSliderField(
                'Start Time',
                'Start playback from this time offset.',
                videoBgModule.default_start_time ?? 0,
                0,
                0,
                3600,
                1,
                (value: number) => updateModule({ default_start_time: value }),
                's'
              )
            : ''}
        </div>

        <!-- Visual Filters -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            VISUAL FILTERS
          </div>

          ${this.renderSliderField(
            'Opacity',
            'Control the overall transparency of the video background.',
            videoBgModule.opacity ?? 100,
            100,
            0,
            100,
            1,
            (value: number) => updateModule({ opacity: value }),
            '%'
          )}
          ${this.renderSliderField(
            'Blur',
            'Apply a blur effect to the video background.',
            parseInt(videoBgModule.blur) || 0,
            0,
            0,
            30,
            1,
            (value: number) => updateModule({ blur: `${value}px` }),
            'px'
          )}
          ${this.renderSliderField(
            'Brightness',
            'Adjust the brightness of the video background.',
            parseInt(videoBgModule.brightness) || 100,
            100,
            0,
            200,
            5,
            (value: number) => updateModule({ brightness: `${value}%` }),
            '%'
          )}
          ${this.renderSliderField(
            'Scale',
            'Adjust the size of the video background. Use this to crop or zoom videos with different aspect ratios.',
            videoBgModule.scale * 100,
            100,
            50,
            200,
            5,
            (value: number) => updateModule({ scale: value / 100 }),
            '%'
          )}
        </div>

        <!-- Performance Settings -->
        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px;"
          >
            PERFORMANCE & ACCESSIBILITY
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Pause When Hidden</div>
              ${this.renderUcForm(
                hass,
                { pause_when_hidden: videoBgModule.pause_when_hidden },
                [this.booleanField('pause_when_hidden')],
                (e: CustomEvent) => updateModule(e.detail.value),
                false
              )}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Automatically pause video when the tab is hidden to save resources
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div
              style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
            >
              <div style="font-size: 16px; font-weight: 600;">Respect Reduced Motion</div>
              ${this.renderUcForm(
                hass,
                { respect_reduced_motion: videoBgModule.respect_reduced_motion },
                [this.booleanField('respect_reduced_motion')],
                (e: CustomEvent) => updateModule(e.detail.value),
                false
              )}
            </div>
            <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
              Disable video playback for users who prefer reduced motion
            </div>
          </div>
        </div>

        <!-- Global Card Transparency -->
        ${this.renderGlobalTransparencySection(videoBgModule, hass, updateModule)}
      </div>
    `;
  }

  /**
   * Render video preview
   */
  private renderVideoPreview(module: VideoBackgroundModule): TemplateResult {
    const { default_source, default_video_url, opacity, blur, brightness } = module;

    if (!default_video_url) {
      return html`<div
        style="text-align: center; padding: 24px; color: var(--secondary-text-color);"
      >
        No video URL configured
      </div>`;
    }

    // Extract video ID for YouTube/Vimeo
    let videoId = '';
    let embedUrl = '';

    if (default_source === 'youtube') {
      const match = default_video_url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/)|youtu\.be\/)([^&\n?#]+)/);
      videoId = match ? match[1] : default_video_url;
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&modestbranding=1&rel=0&playsinline=1`;
    } else if (default_source === 'vimeo') {
      const match = default_video_url.match(/vimeo\.com\/(\d+)/);
      videoId = match ? match[1] : default_video_url;
      embedUrl = `https://player.vimeo.com/video/${videoId}?muted=1&controls=1&background=0`;
    }

    const filterStyles = [];
    if (blur && blur !== '0px') filterStyles.push(`blur(${blur})`);
    if (brightness && brightness !== '100%') filterStyles.push(`brightness(${brightness})`);
    const filterCss = filterStyles.length > 0 ? `filter: ${filterStyles.join(' ')};` : '';
    const opacityCss = `opacity: ${opacity / 100};`;

    if (default_source === 'youtube' || default_source === 'vimeo') {
      return html`
        <div
          style="position: relative; width: 100%; height: 300px; background: #000; border-radius: 8px; overflow: hidden; ${filterCss} ${opacityCss}"
        >
          <iframe
            src="${embedUrl}"
            style="width: 100%; height: 100%; border: none;"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
            @error=${(e: Event) => {
              // Handle iframe load error (Error 153 or other YouTube configuration errors)
              const iframe = e.target as HTMLIFrameElement;
              console.warn('YouTube iframe error detected, reloading...');

              // Reload the iframe after a short delay
              setTimeout(() => {
                const currentSrc = iframe.src;
                iframe.src = '';
                setTimeout(() => {
                  iframe.src = currentSrc;
                }, 100);
              }, 500);
            }}
          ></iframe>
        </div>
      `;
    } else {
      // Local or URL video
      return html`
        <div
          style="position: relative; width: 100%; height: 300px; background: #000; border-radius: 8px; overflow: hidden; ${filterCss} ${opacityCss}"
        >
          <video
            src="${default_video_url}"
            style="width: 100%; height: 100%; object-fit: cover;"
            controls
            muted
            loop
          ></video>
        </div>
      `;
    }
  }

  /**
   * Render Global Card Transparency section
   */
  private renderGlobalTransparencySection(
    module: VideoBackgroundModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const transparency = module.global_card_transparency;

    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 16px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 8px;"
        >
          GLOBAL CARD TRANSPARENCY
        </div>

        <div
          style="padding: 12px; background: rgba(var(--rgb-info-color), 0.1); border-radius: 6px; border-left: 4px solid var(--info-color); margin-bottom: 16px;"
        >
          <div style="font-size: 13px; line-height: 1.5;">
            Applies a consistent transparency overlay to all Ultra Cards in this view for improved
            readability against video backgrounds. When disabled, cards follow their native styling.
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div
            style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;"
          >
            <div style="font-size: 16px; font-weight: 600; white-space: nowrap;">
              Enable Global Card Transparency
            </div>
            ${this.renderUcForm(
              hass,
              { enabled: transparency.enabled },
              [this.booleanField('enabled')],
              (e: CustomEvent) => {
                updateModule({
                  global_card_transparency: {
                    ...transparency,
                    enabled: e.detail.value.enabled,
                  },
                });
              },
              false
            )}
          </div>
          <div style="font-size: 13px; color: var(--secondary-text-color); opacity: 0.8;">
            Apply transparency effects to all Ultra Cards in the view
          </div>
        </div>
        ${transparency.enabled
          ? html`
              <div class="conditional-fields-group" style="margin-top: 16px;">
                <div class="conditional-fields-content">
                  ${this.renderSliderField(
                    'Card Opacity',
                    'Control the transparency of all Ultra Cards.',
                    transparency.opacity ?? 90,
                    90,
                    0,
                    100,
                    1,
                    (value: number) => {
                      updateModule({
                        global_card_transparency: {
                          ...transparency,
                          opacity: value,
                        },
                      });
                    },
                    '%'
                  )}
                  ${this.renderSliderField(
                    'Blur Amount',
                    'Apply backdrop blur to all Ultra Cards.',
                    transparency.blur_px ?? 0,
                    0,
                    0,
                    30,
                    1,
                    (value: number) => {
                      updateModule({
                        global_card_transparency: {
                          ...transparency,
                          blur_px: value,
                        },
                      });
                    },
                    'px'
                  )}

                  <div style="margin-top: 16px;">
                    <div
                      class="field-title"
                      style="font-size: 14px; font-weight: 600; margin-bottom: 8px;"
                    >
                      Background Color Overlay
                    </div>
                    <div
                      class="field-description"
                      style="font-size: 12px; margin-bottom: 8px; color: var(--secondary-text-color);"
                    >
                      Optional: Add a color tint to all cards.
                    </div>
                    <ultra-color-picker
                      .hass=${hass}
                      .value=${transparency.color || ''}
                      .allowEmpty=${true}
                      @value-changed=${(e: CustomEvent) => {
                        updateModule({
                          global_card_transparency: {
                            ...transparency,
                            color: e.detail.value,
                          },
                        });
                      }}
                    ></ultra-color-picker>
                  </div>
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  /**
   * Render Pro lock UI for non-Pro users
   */
  private renderProLockUI(lang: string): TemplateResult {
    return html`
      <div
        style="padding: 32px; text-align: center; background: var(--secondary-background-color); border-radius: 12px;"
      >
        <ha-icon
          icon="mdi:lock"
          style="color: var(--primary-color); --mdi-icon-size: 64px; margin-bottom: 16px;"
        ></ha-icon>
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
          Ultra Card Pro Required
        </div>
        <div
          style="font-size: 14px; color: var(--secondary-text-color); margin-bottom: 24px; line-height: 1.6;"
        >
          Video Background is a Pro feature. Install and authenticate with the Ultra Card Pro Cloud
          integration to unlock this module.
        </div>
        <a
          href="https://github.com/WJDDesigns/Ultra-Card-Pro-Cloud"
          target="_blank"
          style="display: inline-block; padding: 12px 24px; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
        >
          Get Ultra Card Pro Cloud
        </a>
      </div>
    `;
  }

  /**
   * Render Logic tab (uses standard GlobalLogicTab for conditional rules)
   */
  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module, hass, updates => updateModule(updates));
  }

  /**
   * Design tab not applicable for video background
   */
  renderDesignTab(): TemplateResult | null {
    return null;
  }

  /**
   * Actions tab not applicable for video background
   */
  renderActionsTab(): TemplateResult | null {
    return null;
  }

  /**
   * Render preview (shows video in live preview, invisible in dashboard)
   */
  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const videoBgModule = module as VideoBackgroundModule;

    // In live preview, show actual video
    if (previewContext === 'live') {
      if (!videoBgModule.enabled || !videoBgModule.default_video_url) {
        return html`
          <div
            style="padding: 24px; text-align: center; background: rgba(var(--rgb-primary-color), 0.1); border: 2px dashed var(--primary-color); border-radius: 8px;"
          >
            <ha-icon
              icon="mdi:video-box"
              style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 8px;"
            ></ha-icon>
            <div style="font-weight: 600; color: var(--primary-color);">
              Video Background Module
            </div>
            <div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">
              ${videoBgModule.enabled ? 'No video URL configured' : 'Disabled'}
            </div>
          </div>
        `;
      }

      return this.renderVideoPreview(videoBgModule);
    }

    // In HA preview and non-live contexts (editor), show a visible indicator so users can edit
    // This addresses the issue where the module was invisible and users had to hover to see the edit icon
    const isInEditor = previewContext === 'ha-preview' || previewContext === 'dashboard';

    if (isInEditor) {
      return html`
        <div
          style="
            padding: 24px;
            text-align: center;
            background: rgba(var(--rgb-primary-color), 0.1);
            border: 2px dashed var(--primary-color);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          "
          @mouseenter=${(e: Event) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(var(--rgb-primary-color), 0.15)';
            el.style.borderColor = 'var(--primary-color)';
          }}
          @mouseleave=${(e: Event) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = 'rgba(var(--rgb-primary-color), 0.1)';
            el.style.borderColor = 'var(--primary-color)';
          }}
        >
          <ha-icon
            icon="mdi:video-box"
            style="color: var(--primary-color); --mdi-icon-size: 48px; margin-bottom: 8px;"
          ></ha-icon>
          <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 4px;">
            Video Background Module
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); opacity: 0.8;">
            ${videoBgModule.enabled
              ? videoBgModule.default_video_url
                ? 'Click to edit video background settings'
                : 'No video URL configured - click to add'
              : 'Disabled - click to enable'}
          </div>
        </div>
      `;
    }

    // Only return empty for actual dashboard viewing (when not in edit mode)
    return html``;
  }

  /**
   * Custom styles for video background module
   */
  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      /* Conditional fields group styling */
      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .conditional-fields-group:hover {
        background: rgba(var(--rgb-primary-color), 0.12);
      }

      .conditional-fields-header {
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        border-bottom: 1px solid rgba(var(--rgb-primary-color), 0.2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .conditional-fields-content {
        padding: 16px;
      }

      .conditional-fields-content > .field-title:first-child {
        margin-top: 0 !important;
      }

      .conditional-fields-group {
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
    `;
  }

  /**
   * Validate module configuration
   */
  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const videoBgModule = module as VideoBackgroundModule;
    const errors: string[] = [...baseValidation.errors];

    // Validate default video URL if enabled
    if (videoBgModule.enabled && !videoBgModule.default_video_url) {
      errors.push('Default video URL is required when module is enabled');
    }

    // Validate opacity range
    if (videoBgModule.opacity < 0 || videoBgModule.opacity > 100) {
      errors.push('Opacity must be between 0 and 100');
    }

    // Validate global transparency opacity
    if (
      videoBgModule.global_card_transparency?.enabled &&
      (videoBgModule.global_card_transparency.opacity < 0 ||
        videoBgModule.global_card_transparency.opacity > 100)
    ) {
      errors.push('Global card transparency opacity must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
