import { TemplateResult, html } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, MediaPlayerModule, UltraCardConfig } from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import '../components/ultra-color-picker';

// Media player supported features bitmask (from Home Assistant)
const SUPPORT_PAUSE = 1;
const SUPPORT_SEEK = 2;
const SUPPORT_VOLUME_SET = 4;
const SUPPORT_VOLUME_MUTE = 8;
const SUPPORT_PREVIOUS_TRACK = 16;
const SUPPORT_NEXT_TRACK = 32;
const SUPPORT_TURN_ON = 128;
const SUPPORT_TURN_OFF = 256;
const SUPPORT_PLAY_MEDIA = 512;
const SUPPORT_VOLUME_STEP = 1024;
const SUPPORT_SELECT_SOURCE = 2048;
const SUPPORT_STOP = 4096;
const SUPPORT_PLAY = 16384;
const SUPPORT_SHUFFLE_SET = 32768;
const SUPPORT_SELECT_SOUND_MODE = 65536;
const SUPPORT_REPEAT_SET = 262144;

/**
 * Media Player Module
 *
 * A comprehensive media player controller with multiple layout modes:
 * - Compact: Horizontal bar with album art, track info, and basic controls
 * - Card: Full card with large album art, progress bar, and complete controls
 * - Mini: Ultra-compact single line for sidebars
 *
 * Features include:
 * - Play/Pause/Stop controls
 * - Volume slider with mute toggle
 * - Skip previous/next track
 * - Shuffle and repeat toggles
 * - Source selection
 * - Progress bar with seek capability
 * - Album art with dynamic color extraction
 * - Real-time state updates
 */
export class UltraMediaPlayerModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'media_player',
    title: 'Media Player',
    description: 'Control media players with album art, progress bar, and playback controls',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:music',
    category: 'interactive',
    tags: ['media', 'music', 'player', 'audio', 'video', 'spotify', 'chromecast', 'interactive'],
  };

  // State management
  private _progressUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private _expandedModules: Set<string> = new Set();
  private _volumeDragState: Map<string, { dragging: boolean; value: number }> = new Map();
  private _extractedColors: Map<string, { primary: string; accent: string }> = new Map();
  private _lastMediaContentId: Map<string, string> = new Map();


  createDefault(id?: string, hass?: HomeAssistant): CardModule {
    // Auto-detect a media_player entity if available
    let autoEntity = '';
    if (hass?.states) {
      const mediaPlayers = Object.keys(hass.states).filter(id => id.startsWith('media_player.'));
      if (mediaPlayers.length > 0) {
        autoEntity = mediaPlayers[0];
      }
    }

    return {
      id: id || this.generateId('media_player'),
      type: 'media_player',
      entity: autoEntity,
      name: '',

      // Layout
       layout: 'card',
      card_size: 280,

      // Display toggles (most enabled by default)
      show_name: true,
      show_album_art: true,
      show_track_info: true,
      show_progress: true,
      show_duration: true,
      show_controls: true,
      show_volume: true,
      show_source: false,
      show_shuffle: false,
      show_repeat: false,
      show_sound_mode: false,
      show_stop_button: false,
      show_album_name: true,

      // Behavior
      enable_seek: true,
      auto_hide_when_off: false,
      expandable: true,

      // Visual
      dynamic_colors: false,
      blurred_background: true,
      blur_amount: 10,
      blur_opacity: 0.4,
      blur_expand: true,
      animated_visuals: false,
      visualizer_type: 'rings',

      // Icons
      fallback_icon: 'mdi:music',
      play_icon: 'mdi:play',
      pause_icon: 'mdi:pause',
      stop_icon: 'mdi:stop',
      previous_icon: 'mdi:skip-previous',
      next_icon: 'mdi:skip-next',
      shuffle_icon: 'mdi:shuffle',
      repeat_icon: 'mdi:repeat',
      repeat_one_icon: 'mdi:repeat-once',
      volume_muted_icon: 'mdi:volume-off',
      volume_low_icon: 'mdi:volume-low',
      volume_medium_icon: 'mdi:volume-medium',
      volume_high_icon: 'mdi:volume-high',

      // Colors (when not using dynamic colors)
      progress_color: 'var(--primary-color)',
      progress_background: 'var(--divider-color)',
      button_color: 'var(--primary-text-color)',
      button_active_color: 'var(--primary-color)',
      album_art_border_radius: '8px',

      // Actions
      tap_action: { action: 'more-info' },
      hold_action: { action: 'default' },
      double_tap_action: { action: 'default' },
    } as MediaPlayerModule;
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const mp = module as MediaPlayerModule;

    return html`
      <style>
        ${this.injectUcFormStyles()}
      </style>

      <!-- Entity Configuration -->
      ${this.renderSettingsSection('Entity Configuration', 'Select the media player entity to control', [
        {
          title: 'Media Player Entity',
          description: 'Select a media player entity (Spotify, Chromecast, etc.)',
          hass,
          data: { entity: mp.entity || '' },
          schema: [
            {
              name: 'entity',
              selector: { entity: { domain: 'media_player' } },
            },
          ],
          onChange: (e: CustomEvent) => updateModule({ entity: e.detail.value.entity }),
        },
      ])}

      <!-- Layout Settings -->
      ${this.renderSettingsSection('Layout', 'Choose the display layout', [
        {
          title: 'Layout Mode',
          description: 'Compact: horizontal bar, Card: full display, Mini: single line',
          hass,
          data: { layout: mp.layout || 'compact' },
          schema: [
            this.selectField('layout', [
              { value: 'compact', label: 'Compact' },
              { value: 'card', label: 'Card' },
              { value: 'mini', label: 'Mini' },
            ]),
          ],
          onChange: (e: CustomEvent) => updateModule({ layout: e.detail.value.layout }),
        },
      ])}

      ${mp.layout === 'card'
        ? html`
            <div style="margin-top: 8px; margin-bottom: 16px;">
              ${this.renderSliderField(
                'Album Art Size',
                'Size of the album art in pixels (80-400)',
                mp.card_size || 280,
                280,
                80,
                400,
                10,
                (value: number) => updateModule({ card_size: value }),
                'px'
              )}
            </div>
          `
        : ''}

      <!-- Display Options -->
      ${this.renderSettingsSection('Display Options', 'Choose what elements to show', [
        {
          title: 'Show Album Art',
          description: 'Display album artwork or fallback icon',
          hass,
          data: { show_album_art: mp.show_album_art !== false },
          schema: [this.booleanField('show_album_art')],
          onChange: (e: CustomEvent) => updateModule({ show_album_art: e.detail.value.show_album_art }),
        },
        {
          title: 'Show Track Info',
          description: 'Display track title and artist',
          hass,
          data: { show_track_info: mp.show_track_info !== false },
          schema: [this.booleanField('show_track_info')],
          onChange: (e: CustomEvent) => updateModule({ show_track_info: e.detail.value.show_track_info }),
        },
        {
          title: 'Show Album Name',
          description: 'Display album name (when available)',
          hass,
          data: { show_album_name: mp.show_album_name !== false },
          schema: [this.booleanField('show_album_name')],
          onChange: (e: CustomEvent) => updateModule({ show_album_name: e.detail.value.show_album_name }),
        },
        {
          title: 'Show Progress Bar',
          description: 'Display playback progress',
          hass,
          data: { show_progress: mp.show_progress !== false },
          schema: [this.booleanField('show_progress')],
          onChange: (e: CustomEvent) => updateModule({ show_progress: e.detail.value.show_progress }),
        },
        {
          title: 'Show Duration',
          description: 'Display current time / total duration',
          hass,
          data: { show_duration: mp.show_duration !== false },
          schema: [this.booleanField('show_duration')],
          onChange: (e: CustomEvent) => updateModule({ show_duration: e.detail.value.show_duration }),
        },
        {
          title: 'Show Controls',
          description: 'Display play/pause and skip controls',
          hass,
          data: { show_controls: mp.show_controls !== false },
          schema: [this.booleanField('show_controls')],
          onChange: (e: CustomEvent) => updateModule({ show_controls: e.detail.value.show_controls }),
        },
        {
          title: 'Show Volume',
          description: 'Display volume slider and mute button',
          hass,
          data: { show_volume: mp.show_volume !== false },
          schema: [this.booleanField('show_volume')],
          onChange: (e: CustomEvent) => updateModule({ show_volume: e.detail.value.show_volume }),
        },
        {
          title: 'Show Stop Button',
          description: 'Display a stop button alongside play/pause',
          hass,
          data: { show_stop_button: mp.show_stop_button || false },
          schema: [this.booleanField('show_stop_button')],
          onChange: (e: CustomEvent) => updateModule({ show_stop_button: e.detail.value.show_stop_button }),
        },
        {
          title: 'Show Source Selector',
          description: 'Display source/speaker selection dropdown',
          hass,
          data: { show_source: mp.show_source || false },
          schema: [this.booleanField('show_source')],
          onChange: (e: CustomEvent) => updateModule({ show_source: e.detail.value.show_source }),
        },
        {
          title: 'Show Shuffle Button',
          description: 'Display shuffle toggle button',
          hass,
          data: { show_shuffle: mp.show_shuffle || false },
          schema: [this.booleanField('show_shuffle')],
          onChange: (e: CustomEvent) => updateModule({ show_shuffle: e.detail.value.show_shuffle }),
        },
        {
          title: 'Show Repeat Button',
          description: 'Display repeat mode button',
          hass,
          data: { show_repeat: mp.show_repeat || false },
          schema: [this.booleanField('show_repeat')],
          onChange: (e: CustomEvent) => updateModule({ show_repeat: e.detail.value.show_repeat }),
        },
        {
          title: 'Show Sound Mode',
          description: 'Display sound mode selector (if supported)',
          hass,
          data: { show_sound_mode: mp.show_sound_mode || false },
          schema: [this.booleanField('show_sound_mode')],
          onChange: (e: CustomEvent) => updateModule({ show_sound_mode: e.detail.value.show_sound_mode }),
        },
      ])}

      <!-- Behavior Settings -->
      ${this.renderSettingsSection('Behavior', 'Control interactive behaviors', [
        {
          title: 'Enable Seek',
          description: 'Allow clicking progress bar to seek',
          hass,
          data: { enable_seek: mp.enable_seek !== false },
          schema: [this.booleanField('enable_seek')],
          onChange: (e: CustomEvent) => updateModule({ enable_seek: e.detail.value.enable_seek }),
        },
        {
          title: 'Auto-Hide When Off',
          description: 'Hide module when media player is off or idle',
          hass,
          data: { auto_hide_when_off: mp.auto_hide_when_off || false },
          schema: [this.booleanField('auto_hide_when_off')],
          onChange: (e: CustomEvent) => updateModule({ auto_hide_when_off: e.detail.value.auto_hide_when_off }),
        },
        {
          title: 'Expandable (Compact Mode)',
          description: 'Allow expanding compact layout to show more controls',
          hass,
          data: { expandable: mp.expandable !== false },
          schema: [this.booleanField('expandable')],
          onChange: (e: CustomEvent) => updateModule({ expandable: e.detail.value.expandable }),
        },
      ])}

      <!-- Visual Settings -->
      ${this.renderSettingsSection('Visual', 'Customize the appearance', [
        {
          title: 'Blurred Background',
          description: 'Use album art as a blurred, darkened background',
          hass,
          data: { blurred_background: mp.blurred_background !== false },
          schema: [this.booleanField('blurred_background')],
          onChange: (e: CustomEvent) => updateModule({ blurred_background: e.detail.value.blurred_background }),
        },
      ])}

      <!-- Blur Settings (when blurred background is enabled) -->
      ${mp.blurred_background !== false
        ? html`
            <div style="margin-left: 16px; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid var(--primary-color);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
                <div>
                  <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px;">Blur Amount</div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      .value=${mp.blur_amount || 10}
                      @input=${(e: Event) => updateModule({ blur_amount: parseInt((e.target as HTMLInputElement).value) })}
                      style="flex: 1; accent-color: var(--primary-color);"
                    />
                    <span style="min-width: 40px; text-align: right; font-size: 12px; color: var(--secondary-text-color);">${mp.blur_amount || 10}px</span>
                  </div>
                </div>
                <div>
                  <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px;">Blur Opacity</div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      .value=${Math.round((mp.blur_opacity || 0.4) * 100)}
                      @input=${(e: Event) => updateModule({ blur_opacity: parseInt((e.target as HTMLInputElement).value) / 100 })}
                      style="flex: 1; accent-color: var(--primary-color);"
                    />
                    <span style="min-width: 40px; text-align: right; font-size: 12px; color: var(--secondary-text-color);">${Math.round((mp.blur_opacity || 0.4) * 100)}%</span>
                  </div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <ha-switch
                  .checked=${mp.blur_expand !== false}
                  @change=${(e: Event) => updateModule({ blur_expand: (e.target as any).checked })}
                ></ha-switch>
                <div style="font-size: 13px;">Expand past card edges</div>
              </div>
            </div>
          `
        : ''}

      ${this.renderSettingsSection('', '', [
        {
          title: 'Dynamic Colors',
          description: 'Extract accent colors from album art for controls',
          hass,
          data: { dynamic_colors: mp.dynamic_colors || false },
          schema: [this.booleanField('dynamic_colors')],
          onChange: (e: CustomEvent) => updateModule({ dynamic_colors: e.detail.value.dynamic_colors }),
        },
        {
          title: 'Animated Visuals',
          description: 'Show animated visualizer behind album art when playing',
          hass,
          data: { animated_visuals: mp.animated_visuals || false },
          schema: [this.booleanField('animated_visuals')],
          onChange: (e: CustomEvent) => updateModule({ animated_visuals: e.detail.value.animated_visuals }),
        },
      ])}

      <!-- Visualizer Type (when animated visuals is enabled) -->
      ${mp.animated_visuals
        ? html`
            <div style="margin-left: 16px; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid var(--primary-color);">
              <div style="font-size: 13px; font-weight: 500; margin-bottom: 8px;">Visualizer Type</div>
              <select
                .value=${mp.visualizer_type || 'rings'}
                @change=${(e: Event) => updateModule({ visualizer_type: (e.target as HTMLSelectElement).value as any })}
                style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--divider-color); background: var(--secondary-background-color); color: var(--primary-text-color); font-size: 14px; cursor: pointer;"
              >
                <option value="rings">Rings - Pulsing circles</option>
                <option value="bars">Bars - Vertical equalizer bars</option>
                <option value="wave">Wave - Oscillating sine wave</option>
                <option value="dots">Dots - Bouncing dot pattern</option>
                <option value="spectrum">Spectrum - Radial frequency bars</option>
                <option value="pulse">Pulse - Breathing glow effect</option>
                <option value="orbit">Orbit - Rotating particles</option>
                <option value="spiral">Spiral - Rotating spiral pattern</option>
                <option value="equalizer">Equalizer - Classic EQ visualization</option>
                <option value="particles">Particles - Floating particle field</option>
              </select>
            </div>
          `
        : ''}


      <!-- Color Customization (when dynamic colors is disabled) -->
      ${!mp.dynamic_colors
        ? html`
            <div
              class="settings-section"
              style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
            >
              <div
                class="section-title"
                style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
              >
                COLOR CUSTOMIZATION
              </div>
              <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
                Customize colors for various elements
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Progress Bar Color</div>
                  <ultra-color-picker
                    .hass=${hass}
                    .value=${mp.progress_color || 'var(--primary-color)'}
                    @color-changed=${(e: CustomEvent) => updateModule({ progress_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Progress Background</div>
                  <ultra-color-picker
                    .hass=${hass}
                    .value=${mp.progress_background || 'var(--divider-color)'}
                    @color-changed=${(e: CustomEvent) => updateModule({ progress_background: e.detail.value })}
                  ></ultra-color-picker>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Button Color</div>
                  <ultra-color-picker
                    .hass=${hass}
                    .value=${mp.button_color || 'var(--primary-text-color)'}
                    @color-changed=${(e: CustomEvent) => updateModule({ button_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
                <div>
                  <div style="font-size: 14px; font-weight: 500; margin-bottom: 8px;">Active Button Color</div>
                  <ultra-color-picker
                    .hass=${hass}
                    .value=${mp.button_active_color || 'var(--primary-color)'}
                    @color-changed=${(e: CustomEvent) => updateModule({ button_active_color: e.detail.value })}
                  ></ultra-color-picker>
                </div>
              </div>
            </div>
          `
        : ''}

      <!-- Icon Customization -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ICON CUSTOMIZATION
        </div>
        <div style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px;">
          Customize icons for controls and states
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          ${this.renderFieldSection(
            'Fallback Icon',
            'Icon when no album art available',
            hass,
            { fallback_icon: mp.fallback_icon || 'mdi:music' },
            [this.iconField('fallback_icon')],
            (e: CustomEvent) => updateModule({ fallback_icon: e.detail.value.fallback_icon })
          )}
          ${this.renderFieldSection(
            'Play Icon',
            'Icon for play button',
            hass,
            { play_icon: mp.play_icon || 'mdi:play' },
            [this.iconField('play_icon')],
            (e: CustomEvent) => updateModule({ play_icon: e.detail.value.play_icon })
          )}
          ${this.renderFieldSection(
            'Pause Icon',
            'Icon for pause button',
            hass,
            { pause_icon: mp.pause_icon || 'mdi:pause' },
            [this.iconField('pause_icon')],
            (e: CustomEvent) => updateModule({ pause_icon: e.detail.value.pause_icon })
          )}
          ${this.renderFieldSection(
            'Previous Icon',
            'Icon for previous track button',
            hass,
            { previous_icon: mp.previous_icon || 'mdi:skip-previous' },
            [this.iconField('previous_icon')],
            (e: CustomEvent) => updateModule({ previous_icon: e.detail.value.previous_icon })
          )}
          ${this.renderFieldSection(
            'Next Icon',
            'Icon for next track button',
            hass,
            { next_icon: mp.next_icon || 'mdi:skip-next' },
            [this.iconField('next_icon')],
            (e: CustomEvent) => updateModule({ next_icon: e.detail.value.next_icon })
          )}
        </div>

        <div style="margin-top: 16px;">
          ${this.renderFieldSection(
            'Album Art Border Radius',
            'Border radius for album art (e.g., 8px, 50%)',
            hass,
            { album_art_border_radius: mp.album_art_border_radius || '8px' },
            [this.textField('album_art_border_radius')],
            (e: CustomEvent) => updateModule({ album_art_border_radius: e.detail.value.album_art_border_radius })
          )}
        </div>
      </div>

      <!-- Link Configuration -->
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        ${UltraLinkComponent.render(
          hass,
          {
            tap_action: mp.tap_action || { action: 'more-info' },
            hold_action: mp.hold_action || { action: 'default' },
            double_tap_action: mp.double_tap_action || { action: 'default' },
          },
          (updates: any) => {
            const moduleUpdates: Partial<MediaPlayerModule> = {};
            if (updates.tap_action) moduleUpdates.tap_action = updates.tap_action;
            if (updates.hold_action) moduleUpdates.hold_action = updates.hold_action;
            if (updates.double_tap_action) moduleUpdates.double_tap_action = updates.double_tap_action;
            updateModule(moduleUpdates);
          },
          'Link Configuration'
        )}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const mp = module as MediaPlayerModule;
    const entityId = this.resolveEntity(mp.entity, config);
    const stateObj = entityId ? hass.states[entityId] : undefined;

    // Handle missing entity
    if (!entityId || !stateObj) {
      return this.renderGradientErrorState(
        'Configure Entity',
        'Select a media player entity in the General tab',
        'mdi:music-off'
      );
    }

    // Auto-hide when off/idle
    const state = stateObj.state;
    if (mp.auto_hide_when_off && (state === 'off' || state === 'idle' || state === 'unavailable')) {
      return html`<div class="media-player-hidden"></div>`;
    }

    // Render based on layout mode
    switch (mp.layout) {
      case 'card':
        return this.renderCardLayout(mp, hass, stateObj, config);
      case 'mini':
        return this.renderMiniLayout(mp, hass, stateObj, config);
      case 'compact':
      default:
        return this.renderCompactLayout(mp, hass, stateObj, config);
    }
  }

  // ============================
  // LAYOUT RENDERERS
  // ============================

  private renderCompactLayout(
    mp: MediaPlayerModule,
    hass: HomeAssistant,
    stateObj: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const isExpanded = this._expandedModules.has(mp.id);
    const state = stateObj.state;
    const isPlaying = state === 'playing';
    const attrs = stateObj.attributes;
    const entityPicture = attrs.entity_picture || attrs.entity_picture_local;
    
    // Get dynamic colors if enabled
    const dynamicStyles = mp.dynamic_colors ? this.getDynamicColorStyles(mp, stateObj) : '';

    return html`
      <style>
        ${this.getStyles()}
        ${dynamicStyles}
      </style>
      <div
        class="media-player-container media-player-compact ${mp.dynamic_colors ? 'mp-dynamic-colors' : ''}"
      >
        <!-- Blurred Background -->
        ${mp.blurred_background !== false && entityPicture
          ? html`<div class="mp-blurred-bg ${mp.blur_expand !== false ? 'mp-blur-expand' : 'mp-blur-contained'}" style="background-image: url('${entityPicture}'); filter: blur(${mp.blur_amount || 10}px); opacity: ${mp.blur_opacity || 0.4};"></div>`
          : ''}
        
        <!-- Main Row -->
        <div class="mp-compact-row">
          <!-- Album Art -->
          ${mp.show_album_art !== false ? this.renderAlbumArt(mp, stateObj, 48) : ''}

          <!-- Track Info -->
          <div class="mp-track-info">
            ${mp.show_track_info !== false
              ? html`
                  <div class="mp-track-title">${attrs.media_title || mp.name || stateObj.attributes.friendly_name || 'No media'}</div>
                  <div class="mp-track-artist">${attrs.media_artist || attrs.app_name || state}</div>
                `
              : html`
                  <div class="mp-track-title">${mp.name || stateObj.attributes.friendly_name}</div>
                  <div class="mp-track-artist">${state}</div>
                `}
          </div>

          <!-- Quick Controls -->
          ${mp.show_controls !== false
            ? html`
                <div class="mp-quick-controls">
                  ${this.renderPlayPauseButton(mp, hass, stateObj)}
                  ${mp.expandable !== false
                    ? html`
                        <button
                          class="mp-control-btn mp-expand-btn"
                          @click=${(e: Event) => this.toggleExpand(e, mp.id)}
                          title="${isExpanded ? 'Collapse' : 'Expand'}"
                        >
                          <ha-icon icon="${isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                        </button>
                      `
                    : ''}
                </div>
              `
            : ''}
        </div>

        <!-- Progress Bar (thin line at bottom) -->
        ${mp.show_progress !== false && (state === 'playing' || state === 'paused')
          ? this.renderProgressBar(mp, hass, stateObj, true)
          : ''}

        <!-- Expanded Controls -->
        ${isExpanded ? this.renderExpandedControls(mp, hass, stateObj) : ''}
      </div>
    `;
  }

  private renderCardLayout(
    mp: MediaPlayerModule,
    hass: HomeAssistant,
    stateObj: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const state = stateObj.state;
    const isPlaying = state === 'playing';
    const attrs = stateObj.attributes;
    const cardSize = mp.card_size || 280;
    const entityPicture = attrs.entity_picture || attrs.entity_picture_local;
    
    // Get dynamic colors - always extract for visualizer, apply to controls only if dynamic_colors is on
    const dynamicStyles = this.getDynamicColorStyles(mp, stateObj);

    return html`
      <style>
        ${this.getStyles()}
        ${dynamicStyles}
      </style>
      <div class="media-player-container media-player-card ${mp.dynamic_colors ? 'mp-dynamic-colors' : ''}">
        <!-- Blurred Background -->
        ${mp.blurred_background !== false && entityPicture
          ? html`<div class="mp-blurred-bg ${mp.blur_expand !== false ? 'mp-blur-expand' : 'mp-blur-contained'}" style="background-image: url('${entityPicture}'); filter: blur(${mp.blur_amount || 10}px); opacity: ${mp.blur_opacity || 0.4};"></div>`
          : ''}

        <!-- Album Art with Visualizer -->
        <div class="mp-art-wrapper" style="width: ${cardSize}px; height: ${cardSize}px;">
          ${mp.animated_visuals && state === 'playing'
            ? this.renderVisualizer(mp.visualizer_type || 'rings')
            : ''}
          ${mp.show_album_art !== false ? this.renderAlbumArt(mp, stateObj, cardSize, true) : ''}
        </div>

        <!-- Track Info -->
        ${mp.show_track_info !== false
          ? html`
              <div class="mp-card-track-info">
                <div class="mp-card-title">${attrs.media_title || mp.name || stateObj.attributes.friendly_name || 'No media'}</div>
                <div class="mp-card-artist">${attrs.media_artist || attrs.app_name || ''}</div>
                ${mp.show_album_name !== false && attrs.media_album_name
                  ? html`<div class="mp-card-album">${attrs.media_album_name}</div>`
                  : ''}
              </div>
            `
          : ''}

        <!-- Progress Bar -->
        ${mp.show_progress !== false && (state === 'playing' || state === 'paused')
          ? this.renderProgressBar(mp, hass, stateObj, false)
          : ''}

        <!-- Control Buttons -->
        ${mp.show_controls !== false
          ? html`
              <div class="mp-card-controls">
                ${mp.show_shuffle ? this.renderShuffleButton(mp, hass, stateObj) : ''}
                ${this.supportsFeature(stateObj, SUPPORT_PREVIOUS_TRACK)
                  ? html`
                      <button class="mp-control-btn" @click=${(e: Event) => this.handlePrevious(e, hass, stateObj)}>
                        <ha-icon icon="${mp.previous_icon || 'mdi:skip-previous'}"></ha-icon>
                      </button>
                    `
                  : ''}
                ${this.renderPlayPauseButton(mp, hass, stateObj, true)}
                ${mp.show_stop_button && this.supportsFeature(stateObj, SUPPORT_STOP)
                  ? html`
                      <button class="mp-control-btn" @click=${(e: Event) => this.handleStop(e, hass, stateObj)}>
                        <ha-icon icon="${mp.stop_icon || 'mdi:stop'}"></ha-icon>
                      </button>
                    `
                  : ''}
                ${this.supportsFeature(stateObj, SUPPORT_NEXT_TRACK)
                  ? html`
                      <button class="mp-control-btn" @click=${(e: Event) => this.handleNext(e, hass, stateObj)}>
                        <ha-icon icon="${mp.next_icon || 'mdi:skip-next'}"></ha-icon>
                      </button>
                    `
                  : ''}
                ${mp.show_repeat ? this.renderRepeatButton(mp, hass, stateObj) : ''}
              </div>
            `
          : ''}

        <!-- Volume Control -->
        ${mp.show_volume !== false && this.supportsFeature(stateObj, SUPPORT_VOLUME_SET)
          ? this.renderVolumeControl(mp, hass, stateObj)
          : ''}

        <!-- Source Selector -->
        ${mp.show_source && this.supportsFeature(stateObj, SUPPORT_SELECT_SOURCE) && stateObj.attributes.source_list?.length
          ? this.renderSourceSelector(mp, hass, stateObj)
          : ''}

        <!-- Sound Mode Selector -->
        ${mp.show_sound_mode &&
        this.supportsFeature(stateObj, SUPPORT_SELECT_SOUND_MODE) &&
        stateObj.attributes.sound_mode_list?.length
          ? this.renderSoundModeSelector(mp, hass, stateObj)
          : ''}
      </div>
    `;
  }

  private renderMiniLayout(
    mp: MediaPlayerModule,
    hass: HomeAssistant,
    stateObj: any,
    config?: UltraCardConfig
  ): TemplateResult {
    const state = stateObj.state;
    const isPlaying = state === 'playing';
    const attrs = stateObj.attributes;

    // Build "Now Playing" text
    let nowPlaying = mp.name || attrs.friendly_name || 'Media Player';
    if (attrs.media_title) {
      nowPlaying = attrs.media_artist
        ? `${attrs.media_title} - ${attrs.media_artist}`
        : attrs.media_title;
    }

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div class="media-player-container media-player-mini">
        ${mp.show_album_art !== false ? this.renderAlbumArt(mp, stateObj, 24) : ''}
        <div class="mp-mini-text" title="${nowPlaying}">${nowPlaying}</div>
        ${mp.show_controls !== false ? this.renderPlayPauseButton(mp, hass, stateObj) : ''}
      </div>
    `;
  }

  // ============================
  // COMPONENT RENDERERS
  // ============================

  private renderAlbumArt(mp: MediaPlayerModule, stateObj: any, size: number, isCard: boolean = false): TemplateResult {
    const attrs = stateObj.attributes;
    const entityPicture = attrs.entity_picture || attrs.entity_picture_local;
    const borderRadius = mp.album_art_border_radius || '8px';
    const state = stateObj.state;

    return html`
      <div
        class="mp-album-art ${isCard ? 'mp-album-art-card' : ''}"
        style="width: ${size}px; height: ${size}px; border-radius: ${borderRadius};"
      >
        ${entityPicture
          ? html`<img src="${entityPicture}" alt="Album Art" style="border-radius: ${borderRadius};" />`
          : html`<ha-icon icon="${mp.fallback_icon || 'mdi:music'}" style="--mdc-icon-size: ${Math.floor(size * 0.5)}px;"></ha-icon>`}
      </div>
    `;
  }

  private renderVisualizer(type: string): TemplateResult {
    switch (type) {
      case 'rings':
        return html`
          <div class="mp-visualizer mp-visualizer-rings">
            <div class="mp-viz-ring mp-ring-1"></div>
            <div class="mp-viz-ring mp-ring-2"></div>
            <div class="mp-viz-ring mp-ring-3"></div>
            <div class="mp-viz-ring mp-ring-4"></div>
          </div>
        `;
      
      case 'bars':
        return html`
          <div class="mp-visualizer mp-visualizer-bars">
            ${[...Array(20)].map((_, i) => html`<div class="mp-viz-bar" style="--bar-index: ${i};"></div>`)}
          </div>
        `;
      
      case 'wave':
        return html`
          <div class="mp-visualizer mp-visualizer-wave">
            <div class="mp-viz-wave-line mp-wave-1"></div>
            <div class="mp-viz-wave-line mp-wave-2"></div>
            <div class="mp-viz-wave-line mp-wave-3"></div>
          </div>
        `;
      
      case 'dots':
        return html`
          <div class="mp-visualizer mp-visualizer-dots">
            ${[...Array(16)].map((_, i) => html`<div class="mp-viz-dot" style="--dot-index: ${i};"></div>`)}
          </div>
        `;
      
      case 'spectrum':
        return html`
          <div class="mp-visualizer mp-visualizer-spectrum">
            ${[...Array(24)].map((_, i) => html`<div class="mp-viz-spectrum-bar" style="--spectrum-index: ${i};"></div>`)}
          </div>
        `;
      
      case 'pulse':
        return html`
          <div class="mp-visualizer mp-visualizer-pulse">
            <div class="mp-viz-pulse-core"></div>
            <div class="mp-viz-pulse-wave mp-pulse-1"></div>
            <div class="mp-viz-pulse-wave mp-pulse-2"></div>
            <div class="mp-viz-pulse-wave mp-pulse-3"></div>
          </div>
        `;
      
      case 'orbit':
        return html`
          <div class="mp-visualizer mp-visualizer-orbit">
            <div class="mp-viz-orbit-ring mp-orbit-1">
              <div class="mp-viz-orbit-dot"></div>
              <div class="mp-viz-orbit-dot mp-dot-2"></div>
            </div>
            <div class="mp-viz-orbit-ring mp-orbit-2">
              <div class="mp-viz-orbit-dot"></div>
              <div class="mp-viz-orbit-dot mp-dot-2"></div>
              <div class="mp-viz-orbit-dot mp-dot-3"></div>
            </div>
            <div class="mp-viz-orbit-ring mp-orbit-3">
              <div class="mp-viz-orbit-dot"></div>
              <div class="mp-viz-orbit-dot mp-dot-2"></div>
            </div>
          </div>
        `;
      
      case 'spiral':
        return html`
          <div class="mp-visualizer mp-visualizer-spiral">
            <div class="mp-viz-spiral-arm mp-spiral-1"></div>
            <div class="mp-viz-spiral-arm mp-spiral-2"></div>
            <div class="mp-viz-spiral-arm mp-spiral-3"></div>
            <div class="mp-viz-spiral-arm mp-spiral-4"></div>
          </div>
        `;
      
      case 'equalizer':
        return html`
          <div class="mp-visualizer mp-visualizer-equalizer">
            ${[...Array(24)].map((_, i) => html`<div class="mp-viz-eq-bar" style="--eq-index: ${i};"></div>`)}
          </div>
        `;
      
      case 'particles':
        return html`
          <div class="mp-visualizer mp-visualizer-particles">
            ${[...Array(40)].map((_, i) => html`<div class="mp-viz-particle" style="--particle-index: ${i}; --particle-total: 40;"></div>`)}
          </div>
        `;
      
      default:
        return html``;
    }
  }

  private renderPlayPauseButton(
    mp: MediaPlayerModule,
    hass: HomeAssistant,
    stateObj: any,
    large: boolean = false
  ): TemplateResult {
    const state = stateObj.state;
    const isPlaying = state === 'playing';
    const icon = isPlaying ? mp.pause_icon || 'mdi:pause' : mp.play_icon || 'mdi:play';

    // For large button, don't override the white color
    const colorStyle = !large && mp.button_active_color && isPlaying 
      ? `color: ${mp.button_active_color};` 
      : '';

    return html`
      <button
        class="mp-control-btn ${large ? 'mp-control-btn-large' : ''} ${isPlaying && !large ? 'mp-btn-active' : ''}"
        @click=${(e: Event) => this.handlePlayPause(e, hass, stateObj)}
        style="${colorStyle}"
        title="${isPlaying ? 'Pause' : 'Play'}"
      >
        <ha-icon icon="${icon}"></ha-icon>
      </button>
    `;
  }

  private renderShuffleButton(mp: MediaPlayerModule, hass: HomeAssistant, stateObj: any): TemplateResult {
    if (!this.supportsFeature(stateObj, SUPPORT_SHUFFLE_SET)) return html``;

    const isOn = stateObj.attributes.shuffle === true;

    return html`
      <button
        class="mp-control-btn ${isOn ? 'mp-btn-active' : ''}"
        @click=${(e: Event) => this.handleShuffle(e, hass, stateObj)}
        title="Shuffle ${isOn ? 'On' : 'Off'}"
        style="${mp.button_active_color && isOn ? `color: ${mp.button_active_color};` : ''}"
      >
        <ha-icon icon="${mp.shuffle_icon || 'mdi:shuffle'}"></ha-icon>
      </button>
    `;
  }

  private renderRepeatButton(mp: MediaPlayerModule, hass: HomeAssistant, stateObj: any): TemplateResult {
    if (!this.supportsFeature(stateObj, SUPPORT_REPEAT_SET)) return html``;

    const repeat = stateObj.attributes.repeat || 'off';
    const isActive = repeat !== 'off';
    let icon = mp.repeat_icon || 'mdi:repeat';
    if (repeat === 'one') {
      icon = mp.repeat_one_icon || 'mdi:repeat-once';
    }

    return html`
      <button
        class="mp-control-btn ${isActive ? 'mp-btn-active' : ''}"
        @click=${(e: Event) => this.handleRepeat(e, hass, stateObj)}
        title="Repeat: ${repeat}"
        style="${mp.button_active_color && isActive ? `color: ${mp.button_active_color};` : ''}"
      >
        <ha-icon icon="${icon}"></ha-icon>
      </button>
    `;
  }

  private renderProgressBar(
    mp: MediaPlayerModule,
    hass: HomeAssistant,
    stateObj: any,
    compact: boolean
  ): TemplateResult {
    const position = this.getCurrentPosition(stateObj);
    const duration = stateObj.attributes.media_duration || 0;
    const progress = duration > 0 ? (position / duration) * 100 : 0;

    const progressColor = mp.progress_color || 'var(--primary-color)';
    const bgColor = mp.progress_background || 'var(--divider-color)';

    return html`
      <div class="mp-progress-container ${compact ? 'mp-progress-compact' : ''}">
        ${!compact && mp.show_duration !== false
          ? html`<span class="mp-time">${this.formatTime(position)}</span>`
          : ''}
        <div
          class="mp-progress-bar"
          style="background: ${bgColor};"
          @click=${mp.enable_seek !== false ? (e: Event) => this.handleSeek(e, hass, stateObj, duration) : undefined}
        >
          <div class="mp-progress-fill" style="width: ${progress}%; background: ${progressColor};"></div>
        </div>
        ${!compact && mp.show_duration !== false
          ? html`<span class="mp-time">${this.formatTime(duration)}</span>`
          : ''}
      </div>
    `;
  }

  private renderVolumeControl(mp: MediaPlayerModule, hass: HomeAssistant, stateObj: any): TemplateResult {
    const volume = stateObj.attributes.volume_level ?? 0.5;
    const isMuted = stateObj.attributes.is_volume_muted;
    const volumePercent = Math.round(volume * 100);

    // Determine volume icon
    let volumeIcon = mp.volume_high_icon || 'mdi:volume-high';
    if (isMuted) {
      volumeIcon = mp.volume_muted_icon || 'mdi:volume-off';
    } else if (volume < 0.33) {
      volumeIcon = mp.volume_low_icon || 'mdi:volume-low';
    } else if (volume < 0.66) {
      volumeIcon = mp.volume_medium_icon || 'mdi:volume-medium';
    }

    return html`
      <div class="mp-volume-control">
        ${this.supportsFeature(stateObj, SUPPORT_VOLUME_MUTE)
          ? html`
              <button
                class="mp-control-btn mp-volume-btn ${isMuted ? 'mp-btn-muted' : ''}"
                @click=${(e: Event) => this.handleMuteToggle(e, hass, stateObj)}
                title="${isMuted ? 'Unmute' : 'Mute'}"
              >
                <ha-icon icon="${volumeIcon}"></ha-icon>
              </button>
            `
          : html`<ha-icon icon="${volumeIcon}" class="mp-volume-icon"></ha-icon>`}
        <input
          type="range"
          class="mp-volume-slider"
          min="0"
          max="100"
          .value=${volumePercent}
          @input=${(e: Event) => this.handleVolumeChange(e, hass, stateObj)}
          style="--progress: ${volumePercent}%; --progress-color: ${mp.progress_color || 'var(--primary-color)'}; --bg-color: ${mp.progress_background || 'var(--divider-color)'};"
        />
        <span class="mp-volume-value">${volumePercent}%</span>
      </div>
    `;
  }

  private renderSourceSelector(mp: MediaPlayerModule, hass: HomeAssistant, stateObj: any): TemplateResult {
    const sources = stateObj.attributes.source_list || [];
    const currentSource = stateObj.attributes.source || '';
    
    // Use Spotify icon if this is a Spotify entity
    const isSpotify = stateObj.entity_id?.includes('spotify') || 
                      stateObj.attributes.friendly_name?.toLowerCase().includes('spotify');
    const sourceIcon = isSpotify ? 'mdi:spotify' : 'mdi:speaker';

    return html`
      <div class="mp-source-selector">
        <ha-icon icon="${sourceIcon}" class="mp-source-icon ${isSpotify ? 'mp-spotify-icon' : ''}"></ha-icon>
        <select
          class="mp-source-select"
          .value=${currentSource}
          @change=${(e: Event) => this.handleSourceChange(e, hass, stateObj)}
        >
          ${sources.map((source: string) => html`<option value="${source}" ?selected=${source === currentSource}>${source}</option>`)}
        </select>
      </div>
    `;
  }

  private renderSoundModeSelector(mp: MediaPlayerModule, hass: HomeAssistant, stateObj: any): TemplateResult {
    const modes = stateObj.attributes.sound_mode_list || [];
    const currentMode = stateObj.attributes.sound_mode || '';

    return html`
      <div class="mp-source-selector">
        <ha-icon icon="mdi:music-note" class="mp-source-icon"></ha-icon>
        <select
          class="mp-source-select"
          .value=${currentMode}
          @change=${(e: Event) => this.handleSoundModeChange(e, hass, stateObj)}
        >
          ${modes.map((mode: string) => html`<option value="${mode}" ?selected=${mode === currentMode}>${mode}</option>`)}
        </select>
      </div>
    `;
  }

  private renderExpandedControls(mp: MediaPlayerModule, hass: HomeAssistant, stateObj: any): TemplateResult {
    return html`
      <div class="mp-expanded-controls">
        <!-- Full Progress -->
        ${mp.show_progress !== false && mp.show_duration !== false
          ? this.renderProgressBar(mp, hass, stateObj, false)
          : ''}

        <!-- Control Row -->
        <div class="mp-expanded-row">
          ${mp.show_shuffle ? this.renderShuffleButton(mp, hass, stateObj) : ''}
          ${this.supportsFeature(stateObj, SUPPORT_PREVIOUS_TRACK)
            ? html`
                <button class="mp-control-btn" @click=${(e: Event) => this.handlePrevious(e, hass, stateObj)}>
                  <ha-icon icon="${mp.previous_icon || 'mdi:skip-previous'}"></ha-icon>
                </button>
              `
            : ''}
          ${mp.show_stop_button && this.supportsFeature(stateObj, SUPPORT_STOP)
            ? html`
                <button class="mp-control-btn" @click=${(e: Event) => this.handleStop(e, hass, stateObj)}>
                  <ha-icon icon="${mp.stop_icon || 'mdi:stop'}"></ha-icon>
                </button>
              `
            : ''}
          ${this.supportsFeature(stateObj, SUPPORT_NEXT_TRACK)
            ? html`
                <button class="mp-control-btn" @click=${(e: Event) => this.handleNext(e, hass, stateObj)}>
                  <ha-icon icon="${mp.next_icon || 'mdi:skip-next'}"></ha-icon>
                </button>
              `
            : ''}
          ${mp.show_repeat ? this.renderRepeatButton(mp, hass, stateObj) : ''}
        </div>

        <!-- Volume -->
        ${mp.show_volume !== false && this.supportsFeature(stateObj, SUPPORT_VOLUME_SET)
          ? this.renderVolumeControl(mp, hass, stateObj)
          : ''}

        <!-- Source -->
        ${mp.show_source &&
        this.supportsFeature(stateObj, SUPPORT_SELECT_SOURCE) &&
        stateObj.attributes.source_list?.length
          ? this.renderSourceSelector(mp, hass, stateObj)
          : ''}
      </div>
    `;
  }

  // ============================
  // EVENT HANDLERS
  // ============================

  private async handlePlayPause(e: Event, hass: HomeAssistant, stateObj: any): Promise<void> {
    e.stopPropagation();
    const state = stateObj.state;
    const entityId = stateObj.entity_id;
    const attrs = stateObj.attributes;
    const isSpotify = entityId.includes('spotify');

    if (state === 'playing') {
      hass.callService('media_player', 'media_pause', {
        entity_id: entityId,
      });
    } else if (state === 'paused') {
      // Simply resume if paused
      hass.callService('media_player', 'media_play', {
        entity_id: entityId,
      });
    } else {
      // For Spotify when idle/off, need to ensure a source is selected
      if (isSpotify) {
        const currentSource = attrs.source;
        const sourceList = attrs.source_list || [];
        
        // If no source selected but sources are available, select the first one
        if (!currentSource && sourceList.length > 0) {
          await hass.callService('media_player', 'select_source', {
            entity_id: entityId,
            source: sourceList[0],
          });
          // Wait for source selection
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Try to play - this will resume last played content if available
        hass.callService('media_player', 'media_play', {
          entity_id: entityId,
        });
      } else {
        // Non-Spotify players - just call play
        hass.callService('media_player', 'media_play', {
          entity_id: entityId,
        });
      }
    }
  }

  private handleStop(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    hass.callService('media_player', 'media_stop', {
      entity_id: stateObj.entity_id,
    });
  }

  private handlePrevious(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    hass.callService('media_player', 'media_previous_track', {
      entity_id: stateObj.entity_id,
    });
  }

  private handleNext(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    hass.callService('media_player', 'media_next_track', {
      entity_id: stateObj.entity_id,
    });
  }

  private handleShuffle(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    const currentShuffle = stateObj.attributes.shuffle || false;
    hass.callService('media_player', 'shuffle_set', {
      entity_id: stateObj.entity_id,
      shuffle: !currentShuffle,
    });
  }

  private handleRepeat(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    const currentRepeat = stateObj.attributes.repeat || 'off';
    let nextRepeat = 'off';

    // Cycle through: off -> all -> one -> off
    switch (currentRepeat) {
      case 'off':
        nextRepeat = 'all';
        break;
      case 'all':
        nextRepeat = 'one';
        break;
      case 'one':
        nextRepeat = 'off';
        break;
    }

    hass.callService('media_player', 'repeat_set', {
      entity_id: stateObj.entity_id,
      repeat: nextRepeat,
    });
  }

  private handleMuteToggle(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    const isMuted = stateObj.attributes.is_volume_muted || false;
    hass.callService('media_player', 'volume_mute', {
      entity_id: stateObj.entity_id,
      is_volume_muted: !isMuted,
    });
  }

  private handleVolumeChange(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    const target = e.target as HTMLInputElement;
    const volume = parseInt(target.value, 10) / 100;

    hass.callService('media_player', 'volume_set', {
      entity_id: stateObj.entity_id,
      volume_level: volume,
    });
  }

  private handleSeek(e: Event, hass: HomeAssistant, stateObj: any, duration: number): void {
    e.stopPropagation();
    if (!duration || !this.supportsFeature(stateObj, SUPPORT_SEEK)) return;

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = (e as MouseEvent).clientX - rect.left;
    const progress = x / rect.width;
    const seekPosition = progress * duration;

    hass.callService('media_player', 'media_seek', {
      entity_id: stateObj.entity_id,
      seek_position: seekPosition,
    });
  }

  private handleSourceChange(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    const target = e.target as HTMLSelectElement;
    hass.callService('media_player', 'select_source', {
      entity_id: stateObj.entity_id,
      source: target.value,
    });
  }

  private handleSoundModeChange(e: Event, hass: HomeAssistant, stateObj: any): void {
    e.stopPropagation();
    const target = e.target as HTMLSelectElement;
    hass.callService('media_player', 'select_sound_mode', {
      entity_id: stateObj.entity_id,
      sound_mode: target.value,
    });
  }

  private toggleExpand(e: Event, moduleId: string): void {
    e.stopPropagation();
    if (this._expandedModules.has(moduleId)) {
      this._expandedModules.delete(moduleId);
    } else {
      this._expandedModules.add(moduleId);
    }
    this.triggerPreviewUpdate(true);
  }

  // ============================
  // HELPER METHODS
  // ============================

  private supportsFeature(stateObj: any, feature: number): boolean {
    const supportedFeatures = stateObj.attributes.supported_features || 0;
    return (supportedFeatures & feature) !== 0;
  }

  /**
   * Extract dominant color from album art and generate dynamic CSS
   * Uses a simple color extraction algorithm based on sampling the image
   */
  private getDynamicColorStyles(mp: MediaPlayerModule, stateObj: any): string {
    const attrs = stateObj.attributes;
    const entityPicture = attrs.entity_picture || attrs.entity_picture_local;
    const mediaContentId = attrs.media_content_id || '';
    
    // Check if we already extracted colors for this media
    const cacheKey = `${mp.id}_${mediaContentId}`;
    
    if (!entityPicture) {
      return '';
    }
    
    // Check if we have cached colors
    const cached = this._extractedColors.get(cacheKey);
    if (cached) {
      return `
        .media-player-container.mp-dynamic-colors {
          --mp-dynamic-primary: ${cached.primary};
          --mp-dynamic-accent: ${cached.accent};
        }
      `;
    }
    
    // Try to extract colors (this runs async but we use cached value on re-render)
    if (this._lastMediaContentId.get(mp.id) !== mediaContentId) {
      this._lastMediaContentId.set(mp.id, mediaContentId);
      this.extractColorsFromImage(entityPicture, cacheKey);
    }
    
    // Return default until colors are extracted
    return `
      .media-player-container.mp-dynamic-colors {
        --mp-dynamic-primary: var(--primary-color);
        --mp-dynamic-accent: var(--primary-color);
      }
    `;
  }

  /**
   * Extract colors from album art image using Canvas
   * Finds the most vibrant/saturated color for high contrast against background
   */
  private async extractColorsFromImage(imageUrl: string, cacheKey: string): Promise<void> {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Use a small canvas for performance
          const size = 50;
          canvas.width = size;
          canvas.height = size;
          
          ctx.drawImage(img as unknown as CanvasImageSource, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size);
          const data = imageData.data;
          
          // Sample colors and find most vibrant (highest saturation)
          const colorCounts: Map<string, { count: number; r: number; g: number; b: number; saturation: number }> = new Map();
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate saturation and brightness
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const brightness = (max + min) / 2;
            const saturation = max === 0 ? 0 : (max - min) / max;
            
            // Skip very dark, very light, or low saturation colors
            if (brightness < 40 || brightness > 220) continue;
            if (saturation < 0.2) continue;
            
            // Quantize for grouping
            const qr = Math.round(r / 32) * 32;
            const qg = Math.round(g / 32) * 32;
            const qb = Math.round(b / 32) * 32;
            
            const key = `${qr},${qg},${qb}`;
            const existing = colorCounts.get(key);
            if (existing) {
              existing.count++;
              // Keep the more saturated version
              if (saturation > existing.saturation) {
                existing.r = r;
                existing.g = g;
                existing.b = b;
                existing.saturation = saturation;
              }
            } else {
              colorCounts.set(key, { count: 1, r, g, b, saturation });
            }
          }
          
          // Find most vibrant color (balance between count and saturation)
          let vibrant = { r: 255, g: 255, b: 255, count: 0, saturation: 0 }; // Default white
          let maxScore = 0;
          
          for (const color of colorCounts.values()) {
            // Score combines frequency and saturation
            const score = color.count * (1 + color.saturation * 2);
            if (score > maxScore) {
              maxScore = score;
              vibrant = color;
            }
          }
          
          // Make the color more vibrant/lighter for visibility
          const boost = 1.3;
          const vibrantR = Math.min(255, Math.round(vibrant.r * boost));
          const vibrantG = Math.min(255, Math.round(vibrant.g * boost));
          const vibrantB = Math.min(255, Math.round(vibrant.b * boost));
          
          // If the extracted color is too dark, lighten it significantly
          const avgBrightness = (vibrantR + vibrantG + vibrantB) / 3;
          let finalR = vibrantR, finalG = vibrantG, finalB = vibrantB;
          
          if (avgBrightness < 120) {
            // Lighten dark colors
            finalR = Math.min(255, vibrantR + 80);
            finalG = Math.min(255, vibrantG + 80);
            finalB = Math.min(255, vibrantB + 80);
          }
          
          const primaryColor = `rgb(${finalR}, ${finalG}, ${finalB})`;
          const accentColor = `rgba(${finalR}, ${finalG}, ${finalB}, 0.6)`;
          
          this._extractedColors.set(cacheKey, {
            primary: primaryColor,
            accent: accentColor,
          });
          
          // Trigger re-render
          this.triggerPreviewUpdate();
        } catch (e) {
          // Canvas extraction failed, use defaults
        }
      };
      
      img.onerror = () => {
        // Image load failed, use defaults
      };
      
      img.src = imageUrl;
    } catch (e) {
      // Image extraction failed
    }
  }

  private getCurrentPosition(stateObj: any): number {
    const attrs = stateObj.attributes;
    if (!attrs.media_position || !attrs.media_position_updated_at) {
      return 0;
    }

    if (stateObj.state !== 'playing') {
      return attrs.media_position || 0;
    }

    // Calculate elapsed time since position was updated
    const updatedAt = new Date(attrs.media_position_updated_at).getTime();
    const now = Date.now();
    const elapsed = (now - updatedAt) / 1000;

    return Math.min(attrs.media_position + elapsed, attrs.media_duration || Infinity);
  }

  private formatTime(seconds: number): string {
    if (!seconds || seconds < 0) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ============================
  // VALIDATION
  // ============================

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const mp = module as MediaPlayerModule;
    const errors = [...baseValidation.errors];

    if (!mp.entity || mp.entity.trim() === '') {
      errors.push('Media player entity is required');
    }

    if (mp.layout && !['compact', 'card', 'mini'].includes(mp.layout)) {
      errors.push('Invalid layout mode');
    }

    if (mp.card_size && (mp.card_size < 80 || mp.card_size > 400)) {
      errors.push('Card size must be between 80 and 400 pixels');
    }

    return { valid: errors.length === 0, errors };
  }

  // ============================
  // STYLES
  // ============================

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}
      /* Media Player Module Styles */
      .media-player-container {
        position: relative;
        padding: 16px;
        border-radius: 12px;
        background: var(--card-background-color, var(--secondary-background-color));
        opacity: 0.9;
        transition: all 0.3s ease;
        overflow: visible;
      }


      .media-player-hidden {
        display: none;
      }

      /* Blurred Album Art Background */
      .mp-blurred-bg {
        position: absolute;
        background-size: cover;
        background-position: center;
        z-index: 0;
      }

      .mp-blurred-bg.mp-blur-expand {
        inset: -20px;
        transform: scale(1.2);
      }

      .mp-blurred-bg.mp-blur-contained {
        inset: 0;
        transform: scale(1.1);
        border-radius: 12px;
      }

      /* Keep everything inside the card */
      .media-player-container {
        overflow: hidden;
      }

      .mp-blurred-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.25);
      }

      /* Ensure content is above the blurred background */
      .media-player-container > *:not(.mp-blurred-bg):not(.mp-visualizer-container) {
        position: relative;
        z-index: 2;
      }

      /* Dynamic Colors - applies when dynamic_colors is enabled */
      .media-player-container.mp-dynamic-colors .mp-control-btn-large {
        background: var(--mp-dynamic-primary, var(--primary-color));
      }

      .media-player-container.mp-dynamic-colors .mp-progress-fill {
        background: var(--mp-dynamic-primary, var(--primary-color)) !important;
      }

      .media-player-container.mp-dynamic-colors .mp-volume-slider {
        --progress-color: var(--mp-dynamic-primary, var(--primary-color));
      }

      .media-player-container.mp-dynamic-colors .mp-volume-slider::-webkit-slider-thumb {
        background: var(--mp-dynamic-primary, var(--primary-color));
      }

      .media-player-container.mp-dynamic-colors .mp-volume-slider::-moz-range-thumb {
        background: var(--mp-dynamic-primary, var(--primary-color));
      }

      .media-player-container.mp-dynamic-colors .mp-btn-active {
        color: var(--mp-dynamic-primary, var(--primary-color)) !important;
      }

      .media-player-container.mp-dynamic-colors .mp-visualizer {
        --visualizer-color: var(--mp-dynamic-primary, var(--primary-color));
      }

      /* ============================
         ALBUM ART WRAPPER
         ============================ */
      .mp-art-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      /* ============================
         ANIMATED VISUALIZERS
         ============================ */
      .mp-visualizer {
        --visualizer-color: var(--mp-dynamic-primary, rgba(255, 255, 255, 0.8));
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 130%;
        height: 130%;
        z-index: 3;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* === RINGS VISUALIZER === */
      .mp-visualizer-rings .mp-viz-ring {
        position: absolute;
        border-radius: 50%;
        border: 3px solid var(--visualizer-color);
        opacity: 0;
        animation: mp-viz-ring-pulse 2s ease-out infinite;
      }

      .mp-ring-1 { width: 70%; height: 70%; animation-delay: 0s; }
      .mp-ring-2 { width: 85%; height: 85%; animation-delay: 0.4s; }
      .mp-ring-3 { width: 100%; height: 100%; animation-delay: 0.8s; }
      .mp-ring-4 { width: 115%; height: 115%; animation-delay: 1.2s; }

      @keyframes mp-viz-ring-pulse {
        0% { opacity: 0.9; transform: scale(0.85); }
        50% { opacity: 0.5; }
        100% { opacity: 0; transform: scale(1.1); }
      }

      /* === BARS VISUALIZER === */
      .mp-visualizer-bars {
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;
        gap: 4px;
      }

      .mp-visualizer-bars .mp-viz-bar {
        width: 8px;
        height: 80px;
        background: var(--visualizer-color);
        border-radius: 4px;
        animation: mp-viz-bar-bounce 0.5s ease-in-out infinite;
        animation-delay: calc(var(--bar-index) * 0.04s);
        opacity: 0.9;
      }

      @keyframes mp-viz-bar-bounce {
        0%, 100% { transform: scaleY(0.3); opacity: 0.6; }
        50% { transform: scaleY(1); opacity: 1; }
      }

      /* === WAVE VISUALIZER === */
      .mp-visualizer-wave {
        flex-direction: column;
        justify-content: center;
        gap: 15px;
      }

      .mp-viz-wave-line {
        width: 90%;
        height: 5px;
        background: var(--visualizer-color);
        border-radius: 3px;
        animation: mp-viz-wave-flow 1.5s ease-in-out infinite;
        opacity: 0.9;
      }

      .mp-wave-1 { animation-delay: 0s; }
      .mp-wave-2 { animation-delay: 0.2s; opacity: 0.7; }
      .mp-wave-3 { animation-delay: 0.4s; opacity: 0.5; }

      @keyframes mp-viz-wave-flow {
        0%, 100% { 
          transform: scaleX(0.4) translateX(-30%); 
          opacity: 0.4;
        }
        50% { 
          transform: scaleX(1) translateX(30%); 
          opacity: 1;
        }
      }

      /* === DOTS VISUALIZER === */
      .mp-visualizer-dots {
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        padding: 20px;
      }

      .mp-visualizer-dots .mp-viz-dot {
        width: 14px;
        height: 14px;
        background: var(--visualizer-color);
        border-radius: 50%;
        animation: mp-viz-dot-bounce 0.8s ease-in-out infinite;
        animation-delay: calc(var(--dot-index) * 0.07s);
        box-shadow: 0 0 12px var(--visualizer-color);
      }

      @keyframes mp-viz-dot-bounce {
        0%, 100% { 
          transform: scale(0.6);
          opacity: 0.5;
        }
        50% { 
          transform: scale(1.3);
          opacity: 1;
        }
      }

      /* === SPECTRUM VISUALIZER === */
      .mp-visualizer-spectrum .mp-viz-spectrum-bar {
        position: absolute;
        width: 5px;
        background: var(--visualizer-color);
        border-radius: 3px;
        transform-origin: center bottom;
        transform: rotate(calc(var(--spectrum-index) * 15deg)) translateY(-35%);
        animation: mp-viz-spectrum-grow 0.8s ease-in-out infinite;
        animation-delay: calc(var(--spectrum-index) * 0.04s);
        opacity: 0.8;
      }

      @keyframes mp-viz-spectrum-grow {
        0%, 100% { height: 25px; opacity: 0.5; }
        50% { height: 70px; opacity: 1; }
      }

      /* === PULSE VISUALIZER === */
      .mp-visualizer-pulse .mp-viz-pulse-core {
        position: absolute;
        width: 60%;
        height: 60%;
        background: radial-gradient(circle, var(--visualizer-color) 0%, transparent 70%);
        border-radius: 50%;
        animation: mp-viz-pulse-breathe 1.2s ease-in-out infinite;
        opacity: 0.6;
      }

      .mp-visualizer-pulse .mp-viz-pulse-wave {
        position: absolute;
        width: 70%;
        height: 70%;
        border: 4px solid var(--visualizer-color);
        border-radius: 50%;
        animation: mp-viz-pulse-expand 2s ease-out infinite;
      }

      .mp-pulse-1 { animation-delay: 0s; }
      .mp-pulse-2 { animation-delay: 0.6s; }
      .mp-pulse-3 { animation-delay: 1.2s; }

      @keyframes mp-viz-pulse-breathe {
        0%, 100% { transform: scale(0.85); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }

      @keyframes mp-viz-pulse-expand {
        0% { transform: scale(0.8); opacity: 0.8; }
        100% { transform: scale(1.5); opacity: 0; }
      }

      /* === ORBIT VISUALIZER === */
      .mp-visualizer-orbit .mp-viz-orbit-ring {
        position: absolute;
        border: 3px solid var(--visualizer-color);
        border-radius: 50%;
        opacity: 0.4;
        animation: mp-viz-orbit-spin linear infinite;
      }

      .mp-orbit-1 { width: 65%; height: 65%; animation-duration: 2s; border-style: dashed; }
      .mp-orbit-2 { width: 82%; height: 82%; animation-duration: 3s; animation-direction: reverse; }
      .mp-orbit-3 { width: 100%; height: 100%; animation-duration: 4s; border-style: dotted; }

      .mp-viz-orbit-dot {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        width: 14px;
        height: 14px;
        background: var(--visualizer-color);
        border-radius: 50%;
        opacity: 1;
        box-shadow: 0 0 12px var(--visualizer-color);
        animation: mp-viz-orbit-dot-pulse 1s ease-in-out infinite;
      }

      .mp-viz-orbit-dot.mp-dot-2 {
        top: 50%;
        left: 100%;
        animation-delay: 0.3s;
      }

      .mp-viz-orbit-dot.mp-dot-3 {
        top: 100%;
        left: 50%;
        animation-delay: 0.6s;
      }

      @keyframes mp-viz-orbit-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes mp-viz-orbit-dot-pulse {
        0%, 100% { transform: translateX(-50%) translateY(-50%) scale(0.8); opacity: 0.7; }
        50% { transform: translateX(-50%) translateY(-50%) scale(1.3); opacity: 1; }
      }

      /* === SPIRAL VISUALIZER === */
      .mp-visualizer-spiral .mp-viz-spiral-arm {
        position: absolute;
        border: 4px solid transparent;
        border-top-color: var(--visualizer-color);
        border-right-color: var(--visualizer-color);
        border-radius: 50%;
        opacity: 0.7;
      }

      .mp-spiral-1 { 
        width: 45%; 
        height: 45%; 
        animation: mp-viz-spiral-rotate 1s linear infinite;
      }
      .mp-spiral-2 { 
        width: 65%; 
        height: 65%; 
        animation: mp-viz-spiral-rotate 1.5s linear infinite reverse;
      }
      .mp-spiral-3 { 
        width: 85%; 
        height: 85%; 
        animation: mp-viz-spiral-rotate 2s linear infinite;
      }
      .mp-spiral-4 { 
        width: 105%; 
        height: 105%; 
        animation: mp-viz-spiral-rotate 2.5s linear infinite reverse;
        opacity: 0.4;
      }

      @keyframes mp-viz-spiral-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* === EQUALIZER VISUALIZER === */
      .mp-visualizer-equalizer {
        justify-content: center;
        align-items: flex-end;
        gap: 4px;
        padding-bottom: 10%;
      }

      .mp-visualizer-equalizer .mp-viz-eq-bar {
        width: 10px;
        background: linear-gradient(to top, var(--visualizer-color) 0%, transparent 100%);
        border-radius: 5px 5px 0 0;
        animation: mp-viz-eq-bounce 0.4s ease-in-out infinite;
        animation-delay: calc(var(--eq-index) * 0.03s);
        opacity: 0.85;
      }

      @keyframes mp-viz-eq-bounce {
        0%, 100% { height: 20px; }
        30% { height: calc(30px + var(--eq-index) * 3px); }
        50% { height: calc(80px + (var(--eq-index) - 12) * (var(--eq-index) - 12) * -0.8px); }
        70% { height: calc(40px + var(--eq-index) * 2px); }
      }

      /* === PARTICLES VISUALIZER === */
      .mp-visualizer-particles {
        overflow: hidden;
      }

      .mp-visualizer-particles .mp-viz-particle {
        position: absolute;
        width: 8px;
        height: 8px;
        background: var(--visualizer-color);
        border-radius: 50%;
        opacity: 0;
        box-shadow: 0 0 8px var(--visualizer-color);
        animation: mp-viz-particle-rise 3s ease-in-out infinite;
        animation-delay: calc(var(--particle-index) * 0.075s);
        left: calc((var(--particle-index) / var(--particle-total)) * 100%);
        bottom: 0;
      }

      @keyframes mp-viz-particle-rise {
        0% {
          transform: translateY(0) scale(0.5);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        50% {
          transform: translateY(-150px) scale(1);
          opacity: 0.8;
        }
        100% {
          transform: translateY(-300px) scale(0.3);
          opacity: 0;
        }
      }

      /* ============================
         COMPACT LAYOUT
         ============================ */
      .media-player-compact .mp-compact-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .media-player-compact .mp-track-info {
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .media-player-compact .mp-track-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-player-compact .mp-track-artist {
        font-size: 12px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-player-compact .mp-quick-controls {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* ============================
         CARD LAYOUT
         ============================ */
      .media-player-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
      }

      .media-player-card .mp-card-track-info {
        width: 100%;
        padding: 0 8px;
      }

      .media-player-card .mp-card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-player-card .mp-card-artist {
        font-size: 13px;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }

      .media-player-card .mp-card-album {
        font-size: 12px;
        color: var(--secondary-text-color);
        opacity: 0.7;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
        font-style: italic;
      }

      .media-player-card .mp-card-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      /* ============================
         MINI LAYOUT
         ============================ */
      .media-player-mini {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
      }

      .media-player-mini .mp-mini-text {
        flex: 1;
        font-size: 13px;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ============================
         ALBUM ART
         ============================ */
      .mp-album-art {
        position: relative;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color);
        overflow: hidden;
        z-index: 2;
      }

      .mp-album-art img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .mp-album-art ha-icon {
        color: var(--secondary-text-color);
      }

      .mp-album-art-card {
        max-width: 100%;
      }

      /* ============================
         CONTROL BUTTONS
         ============================ */
      .mp-control-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--primary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .mp-control-btn:hover {
        background: var(--secondary-background-color);
        color: var(--primary-color);
      }

      .mp-control-btn:active {
        transform: scale(0.95);
      }

      .mp-control-btn.mp-btn-active {
        color: var(--primary-color);
      }

      .mp-control-btn.mp-btn-muted {
        color: var(--disabled-text-color);
      }

      .mp-control-btn-large {
        width: 52px;
        height: 52px;
        background: var(--primary-color);
        color: white;
      }

      .mp-control-btn-large:hover {
        background: var(--primary-color);
        filter: brightness(1.1);
        color: white;
      }

      .mp-control-btn-large ha-icon {
        --mdc-icon-size: 28px;
        color: white;
        display: flex;
      }

      .mp-expand-btn {
        width: 32px;
        height: 32px;
      }

      /* ============================
         PROGRESS BAR
         ============================ */
      .mp-progress-container {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 4px 0;
      }

      .mp-progress-compact {
        padding: 0;
        margin-top: 8px;
      }

      .mp-progress-bar {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        cursor: pointer;
        overflow: hidden;
        transition: height 0.2s ease;
      }

      .mp-progress-bar:hover {
        height: 6px;
      }

      .mp-progress-compact .mp-progress-bar {
        height: 3px;
      }

      .mp-progress-compact .mp-progress-bar:hover {
        height: 4px;
      }

      .mp-progress-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.1s linear;
      }

      .mp-time {
        font-size: 11px;
        color: var(--secondary-text-color);
        min-width: 35px;
        text-align: center;
      }

      /* ============================
         VOLUME CONTROL
         ============================ */
      .mp-volume-control {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 4px 0;
      }

      .mp-volume-icon {
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
      }

      .mp-volume-btn {
        width: 32px;
        height: 32px;
      }

      .mp-volume-slider {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: linear-gradient(
          to right,
          var(--progress-color, var(--primary-color)) 0%,
          var(--progress-color, var(--primary-color)) var(--progress, 50%),
          var(--bg-color, var(--divider-color)) var(--progress, 50%),
          var(--bg-color, var(--divider-color)) 100%
        );
        border-radius: 2px;
        cursor: pointer;
      }

      .mp-volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        transition: transform 0.1s ease;
      }

      .mp-volume-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }

      .mp-volume-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      }

      .mp-volume-value {
        font-size: 11px;
        color: var(--secondary-text-color);
        min-width: 35px;
        text-align: right;
      }

      /* ============================
         SOURCE/SOUND MODE SELECTOR
         ============================ */
      .mp-source-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 4px 0;
      }

      .mp-source-icon {
        color: var(--secondary-text-color);
        --mdc-icon-size: 20px;
        flex-shrink: 0;
      }

      .mp-spotify-icon {
        color: #1DB954;
      }

      .mp-source-select {
        flex: 1;
        padding: 6px 10px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        cursor: pointer;
        outline: none;
      }

      .mp-source-select:focus {
        border-color: var(--primary-color);
      }

      /* ============================
         EXPANDED CONTROLS
         ============================ */
      .mp-expanded-controls {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
        animation: mp-expand-in 0.2s ease-out;
      }

      @keyframes mp-expand-in {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mp-expanded-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin: 8px 0;
      }
    `;
  }
}
