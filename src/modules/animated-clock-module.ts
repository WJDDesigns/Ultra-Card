import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, AnimatedClockModule, UltraCardConfig } from '../types';
import '../components/ultra-color-picker';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { UltraLinkComponent } from '../components/ultra-link';
import { renderAnimatedClockModuleEditor } from './animated-clock-module-editor';
import { clockUpdateService } from '../services/clock-update-service';
import { getImageUrl } from '../utils/image-upload';

export class UltraAnimatedClockModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'animated_clock',
    title: 'Animated Clock (PRO)',
    description: 'Beautiful flip clock with smooth animations',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:clock-outline',
    category: 'content',
    tags: ['clock', 'time', 'pro', 'premium', 'animated', 'flip'],
  };

  createDefault(id?: string, hass?: HomeAssistant): AnimatedClockModule {
    return {
      id: id || this.generateId('animated_clock'),
      type: 'animated_clock',

      // Configuration
      time_format: '12',
      clock_style: 'flip',
      update_frequency: '1',

      // Analog clock options
      analog_show_seconds: true,
      analog_smooth_seconds: true,
      analog_show_hour_hand: true,
      analog_show_minute_hand: true,
      analog_show_hour_markers: true,
      analog_show_center_dot: true,
      analog_show_numbers: false,
      analog_show_hour_ticks: true,
      analog_show_minute_ticks: true,
      analog_face_background_type: 'color',
      analog_face_background_size: 'cover',
      analog_face_background_position: 'center',
      analog_face_background_repeat: 'no-repeat',

      // Element visibility toggles
      show_hours: true,
      show_minutes: true,
      show_seconds: true,
      show_ampm: true,
      show_separators: true,

      // Style-specific toggles
      show_labels: true,
      show_prefix: true,
      show_prompt: true,
      show_command: true,
      show_cursor: true,

      // Styling
      clock_size: 100,
      clock_color: 'var(--primary-text-color)',
      clock_background: 'var(--card-background-color)',

      // Flip Clock options
      flip_tile_color: 'rgba(0, 0, 0, 0.5)',
      flip_hours_color: 'var(--primary-text-color)',
      flip_minutes_color: 'var(--primary-text-color)',
      flip_separator_color: 'var(--primary-text-color)',
      flip_ampm_color: 'var(--primary-text-color)',

      // Digital LED Clock options
      digital_background_color: '#000',
      digital_hours_color: '#ff3333',
      digital_minutes_color: '#ff3333',
      digital_seconds_color: '#ff3333',
      digital_separator_color: '#ff3333',
      digital_ampm_color: '#33ff33',
      digital_glow_color: '#ff0000',

      // Binary Clock options
      binary_hours_empty_color: 'rgba(128, 128, 128, 0.2)',
      binary_hours_filled_color: 'var(--primary-text-color)',
      binary_minutes_empty_color: 'rgba(128, 128, 128, 0.2)',
      binary_minutes_filled_color: 'var(--primary-text-color)',
      binary_seconds_empty_color: 'rgba(128, 128, 128, 0.2)',
      binary_seconds_filled_color: 'var(--primary-text-color)',
      binary_separator_color: 'var(--primary-text-color)',
      binary_hours_label_color: 'var(--primary-text-color)',
      binary_minutes_label_color: 'var(--primary-text-color)',
      binary_seconds_label_color: 'var(--primary-text-color)',

      // Minimal Clock options
      minimal_hours_color: 'var(--primary-text-color)',
      minimal_minutes_color: 'var(--primary-text-color)',
      minimal_seconds_color: 'var(--primary-text-color)',
      minimal_separator_color: 'var(--primary-text-color)',
      minimal_ampm_color: 'var(--primary-text-color)',

      // Retro 7-Segment Clock options
      retro_background_color: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)',
      retro_hours_tile_color: 'rgba(0, 0, 0, 0.3)',
      retro_minutes_tile_color: 'rgba(0, 0, 0, 0.3)',
      retro_seconds_tile_color: 'rgba(0, 0, 0, 0.3)',
      retro_separator_tile_color: 'rgba(0, 0, 0, 0.3)',
      retro_hours_color: '#ffa500',
      retro_minutes_color: '#ffa500',
      retro_seconds_color: '#ffa500',
      retro_separator_color: '#ffa500',
      retro_ampm_color: '#00ff00',

      // Text Clock options
      text_orientation: 'horizontal',
      text_word_gap: 8,
      text_prefix_color: 'var(--primary-text-color)',
      text_prefix_size: 38,
      text_hours_color: 'var(--primary-text-color)',
      text_hours_size: 48,
      text_minutes_color: 'var(--primary-text-color)',
      text_minutes_size: 48,
      text_ampm_color: 'var(--primary-text-color)',
      text_ampm_size: 24,

      // Neon Clock options
      neon_padding: 24,
      neon_hours_color: '#00ffff',
      neon_minutes_color: '#00ffff',
      neon_seconds_color: '#00ffff',
      neon_separator_color: '#ff00ff',
      neon_ampm_color: '#00ff00',

      // Material Design options
      material_vertical_gap: 8,
      material_background_color: 'var(--card-background-color)',
      material_hours_color: 'var(--primary-text-color)',
      material_minutes_color: 'var(--primary-text-color)',
      material_seconds_color: 'var(--primary-text-color)',
      material_separator_color: 'var(--primary-text-color)',
      material_ampm_color: 'var(--primary-text-color)',

      // Terminal Clock options
      terminal_background_color: '#1e1e1e',
      terminal_line1_color: '#4ec9b0',
      terminal_line2_color: '#ce9178',
      terminal_cursor_color: '#4ec9b0',
      terminal_hours_color: '#d4d4d4',
      terminal_minutes_color: '#d4d4d4',
      terminal_seconds_color: '#d4d4d4',
      terminal_separator_color: '#d4d4d4',
      terminal_ampm_color: '#d4d4d4',
      terminal_vertical_spacing: 8,
      terminal_line1_size: 17,
      terminal_line2_size: 17,
      terminal_output_size: 38,

      // Standard Ultra Card properties
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
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
    return renderAnimatedClockModuleEditor(this, module, hass, config, updateModule);
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const clockModule = module as AnimatedClockModule;
    const moduleWithDesign = clockModule as any;
    const designProperties = moduleWithDesign.design || {};

    // Register this clock with the update service
    const updateFrequency = parseInt(clockModule.update_frequency || '1');
    clockUpdateService.registerClock(clockModule.id, updateFrequency);

    const now = new Date();

    // Get time components
    const hours24 = now.getHours();
    const hours12 = hours24 % 12 || 12;
    const hours = clockModule.time_format === '24' ? hours24 : hours12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';

    const clockStyle = clockModule.clock_style || 'flip';
    let clockContent: TemplateResult;

    switch (clockStyle) {
      case 'flip':
        clockContent = this._renderFlipClock(hours, minutes, ampm, clockModule);
        break;
      case 'digital':
        clockContent = this._renderDigitalClock(hours, minutes, seconds, ampm, clockModule);
        break;
      case 'analog':
        clockContent = this._renderAnalogClock(
          hours,
          minutes,
          seconds,
          milliseconds,
          hass,
          clockModule
        );
        break;
      case 'binary':
        clockContent = this._renderBinaryClock(hours24, minutes, seconds, clockModule);
        break;
      case 'minimal':
        clockContent = this._renderMinimalClock(hours, minutes, seconds, ampm, clockModule);
        break;
      case 'retro':
        clockContent = this._renderRetroClock(hours, minutes, seconds, ampm, clockModule);
        break;
      case 'word':
        clockContent = this._renderTextClock(hours, minutes, ampm, clockModule);
        break;
      case 'neon':
        clockContent = this._renderNeonClock(hours, minutes, seconds, ampm, clockModule);
        break;
      case 'material':
        clockContent = this._renderMaterialClock(hours, minutes, seconds, ampm, clockModule);
        break;
      case 'terminal':
        clockContent = this._renderTerminalClock(hours, minutes, seconds, ampm, clockModule);
        break;
      default:
        clockContent = this._renderFlipClock(hours, minutes, ampm, clockModule);
    }

    // Action handlers for tap, hold, and double-tap
    let holdTimeout: any = null;
    let clickTimeout: any = null;
    let isHolding = false;
    let clickCount = 0;
    let lastClickTime = 0;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      isHolding = false;
      holdTimeout = setTimeout(() => {
        isHolding = true;
        if (!clockModule.hold_action || clockModule.hold_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            (clockModule.hold_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config
          );
        }
      }, 500); // 500ms hold threshold
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      // Clear hold timer
      if (holdTimeout) {
        clearTimeout(holdTimeout);
        holdTimeout = null;
      }

      // If this was a hold gesture, don't process as click
      if (isHolding) {
        isHolding = false;
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTime;

      // Double click detection (within 300ms)
      if (timeSinceLastClick < 300 && clickCount === 1) {
        // This is a double click
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;
        }
        clickCount = 0;

        if (!clockModule.double_tap_action || clockModule.double_tap_action.action !== 'nothing') {
          UltraLinkComponent.handleAction(
            (clockModule.double_tap_action as any) || ({ action: 'default' } as any),
            hass,
            e.target as HTMLElement,
            config
          );
        }
      } else {
        // This might be a single click, but wait to see if double click follows
        clickCount = 1;
        lastClickTime = now;

        clickTimeout = setTimeout(() => {
          // This is a single click
          clickCount = 0;

          // Execute tap action
          if (!clockModule.tap_action || clockModule.tap_action.action !== 'nothing') {
            UltraLinkComponent.handleAction(
              (clockModule.tap_action as any) || ({ action: 'default' } as any),
              hass,
              e.target as HTMLElement,
              config
            );
          }
        }, 300); // Wait 300ms to see if double click follows
      }
    };

    // Determine if actions are configured to show cursor pointer
    const hasActions =
      (clockModule.tap_action && clockModule.tap_action.action !== 'nothing') ||
      (clockModule.hold_action && clockModule.hold_action.action !== 'nothing') ||
      (clockModule.double_tap_action && clockModule.double_tap_action.action !== 'nothing');

    // Container styles for design system integration - properly handle global design properties
    const containerStyles = {
      padding:
        designProperties.padding_top ||
        designProperties.padding_bottom ||
        designProperties.padding_left ||
        designProperties.padding_right ||
        moduleWithDesign.padding_top ||
        moduleWithDesign.padding_bottom ||
        moduleWithDesign.padding_left ||
        moduleWithDesign.padding_right
          ? `${this.addPixelUnit(designProperties.padding_top || moduleWithDesign.padding_top) || '0px'} ${this.addPixelUnit(designProperties.padding_right || moduleWithDesign.padding_right) || '0px'} ${this.addPixelUnit(designProperties.padding_bottom || moduleWithDesign.padding_bottom) || '0px'} ${this.addPixelUnit(designProperties.padding_left || moduleWithDesign.padding_left) || '0px'}`
          : '16px',
      // Standard 8px top/bottom margin for proper web design spacing
      margin:
        designProperties.margin_top ||
        designProperties.margin_bottom ||
        designProperties.margin_left ||
        designProperties.margin_right ||
        moduleWithDesign.margin_top ||
        moduleWithDesign.margin_bottom ||
        moduleWithDesign.margin_left ||
        moduleWithDesign.margin_right
          ? `${designProperties.margin_top || moduleWithDesign.margin_top || '8px'} ${designProperties.margin_right || moduleWithDesign.margin_right || '0px'} ${designProperties.margin_bottom || moduleWithDesign.margin_bottom || '8px'} ${designProperties.margin_left || moduleWithDesign.margin_left || '0px'}`
          : '8px 0',
      background:
        designProperties.background_color || moduleWithDesign.background_color || 'transparent',
      backgroundImage: this.getBackgroundImageCSS(
        { ...moduleWithDesign, ...designProperties },
        hass
      ),
      backgroundSize:
        designProperties.background_size || moduleWithDesign.background_size || 'cover',
      backgroundPosition:
        designProperties.background_position || moduleWithDesign.background_position || 'center',
      backgroundRepeat:
        designProperties.background_repeat || moduleWithDesign.background_repeat || 'no-repeat',
      border:
        (designProperties.border_style || moduleWithDesign.border_style) &&
        (designProperties.border_style || moduleWithDesign.border_style) !== 'none'
          ? `${designProperties.border_width || moduleWithDesign.border_width || '1px'} ${designProperties.border_style || moduleWithDesign.border_style} ${designProperties.border_color || moduleWithDesign.border_color || 'var(--divider-color)'}`
          : 'none',
      borderRadius:
        this.addPixelUnit(designProperties.border_radius || moduleWithDesign.border_radius) || '0',
      position: designProperties.position || moduleWithDesign.position || 'static',
      top: designProperties.top || moduleWithDesign.top || 'auto',
      bottom: designProperties.bottom || moduleWithDesign.bottom || 'auto',
      left: designProperties.left || moduleWithDesign.left || 'auto',
      right: designProperties.right || moduleWithDesign.right || 'auto',
      zIndex: designProperties.z_index || moduleWithDesign.z_index || 'auto',
      // Sizing - apply to container for proper responsive behavior
      width: designProperties.width || moduleWithDesign.width || '100%',
      height: designProperties.height || moduleWithDesign.height || 'auto',
      maxWidth: designProperties.max_width || moduleWithDesign.max_width || '100%',
      maxHeight: designProperties.max_height || moduleWithDesign.max_height || 'none',
      minWidth: designProperties.min_width || moduleWithDesign.min_width || 'auto',
      minHeight: designProperties.min_height || moduleWithDesign.min_height || '50px',
      // Effects
      boxShadow: designProperties.box_shadow || moduleWithDesign.box_shadow || undefined,
      backdropFilter:
        designProperties.backdrop_filter || moduleWithDesign.backdrop_filter || undefined,
      clipPath: designProperties.clip_path || moduleWithDesign.clip_path || undefined,
      overflow: designProperties.overflow || moduleWithDesign.overflow || 'visible',
      // Flexbox for proper centering and responsive behavior
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      boxSizing: 'border-box',
      // Add cursor pointer when actions are configured
      cursor: hasActions ? 'pointer' : 'default',
    };

    return html`
      <style>
        ${this.getStyles()}
      </style>
      <div
        style=${this.objectToStyleString(containerStyles)}
        @pointerdown=${handlePointerDown}
        @pointerup=${handlePointerUp}
      >
        <div
          class="animated-clock-module-container"
          style="
            --clock-size: ${clockModule.clock_size || 50}px;
            --clock-size-value: ${clockModule.clock_size || 50};
            --clock-color: ${clockModule.clock_color || 'var(--primary-text-color)'};
            --clock-background: ${clockModule.clock_background || 'var(--card-background-color)'};
          "
        >
          ${clockContent}
        </div>
      </div>
    `;
  }

  // ========== CLOCK STYLE RENDERERS ==========

  private _renderFlipClock(
    hours: number,
    minutes: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;

    // Get colors
    const tileColor = clockModule.flip_tile_color || 'rgba(0, 0, 0, 0.5)';
    const hoursColor =
      clockModule.flip_hours_color || clockModule.clock_color || 'var(--primary-text-color)';
    const minutesColor =
      clockModule.flip_minutes_color || clockModule.clock_color || 'var(--primary-text-color)';
    const separatorColor =
      clockModule.flip_separator_color || clockModule.clock_color || 'var(--primary-text-color)';
    const ampmColor =
      clockModule.flip_ampm_color || clockModule.clock_color || 'var(--primary-text-color)';

    return html`
      <div class="flip-clock" style="--flip-tile-color: ${tileColor};">
        ${showHours
          ? html`
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${hoursColor};">
                  ${String(Math.floor(hours / 10))}
                </div>
              </div>
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${hoursColor};">
                  ${String(hours % 10)}
                </div>
              </div>
            `
          : ''}
        ${showSeparators && showHours && showMinutes
          ? html`<div class="flip-separator" style="color: ${separatorColor};">:</div>`
          : ''}
        ${showMinutes
          ? html`
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${minutesColor};">
                  ${String(Math.floor(minutes / 10))}
                </div>
              </div>
              <div class="flip-unit">
                <div class="flip-digit-display" style="color: ${minutesColor};">
                  ${String(minutes % 10)}
                </div>
              </div>
            `
          : ''}
        ${clockModule.time_format === '12' && showAmPm
          ? html`<div class="flip-ampm" style="color: ${ampmColor};">${ampm}</div>`
          : ''}
      </div>
    `;
  }

  private _renderDigitalClock(
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    // Get colors
    const backgroundColor = clockModule.digital_background_color || '#000';
    const hoursColor = clockModule.digital_hours_color || '#ff3333';
    const minutesColor = clockModule.digital_minutes_color || '#ff3333';
    const secondsColor = clockModule.digital_seconds_color || '#ff3333';
    const separatorColor = clockModule.digital_separator_color || '#ff3333';
    const ampmColor = clockModule.digital_ampm_color || '#33ff33';

    return html`
      <div class="digital-clock">
        <div class="digital-display" style="background: ${backgroundColor};">
          <span class="digital-time">
            ${showHours
              ? html`<span
                  style="color: ${hoursColor}; text-shadow: 0 0 10px ${hoursColor}, 0 0 20px ${hoursColor}, 0 0 30px ${hoursColor};"
                  >${hoursStr}</span
                >`
              : ''}
            ${showHours && showMinutes && showSeparators
              ? html`<span
                  style="color: ${separatorColor}; text-shadow: 0 0 10px ${separatorColor}, 0 0 20px ${separatorColor}, 0 0 30px ${separatorColor};"
                  >:</span
                >`
              : ''}
            ${showMinutes
              ? html`<span
                  style="color: ${minutesColor}; text-shadow: 0 0 10px ${minutesColor}, 0 0 20px ${minutesColor}, 0 0 30px ${minutesColor};"
                  >${minutesStr}</span
                >`
              : ''}
            ${showMinutes && showSeconds && showSeparators
              ? html`<span
                  style="color: ${separatorColor}; text-shadow: 0 0 10px ${separatorColor}, 0 0 20px ${separatorColor}, 0 0 30px ${separatorColor};"
                  >:</span
                >`
              : ''}
            ${showSeconds
              ? html`<span
                  style="color: ${secondsColor}; text-shadow: 0 0 10px ${secondsColor}, 0 0 20px ${secondsColor}, 0 0 30px ${secondsColor};"
                  >${secondsStr}</span
                >`
              : ''}
          </span>
          ${clockModule.time_format === '12' && showAmPm
            ? html`<span
                class="digital-ampm"
                style="color: ${ampmColor}; text-shadow: 0 0 8px ${ampmColor}, 0 0 16px ${ampmColor};"
                >${ampm}</span
              >`
            : ''}
        </div>
      </div>
    `;
  }

  private _renderAnalogClock(
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
    hass: HomeAssistant,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showSeconds = clockModule.analog_show_seconds !== false;
    const smoothSeconds = clockModule.analog_smooth_seconds !== false;
    const showHourHand = clockModule.analog_show_hour_hand !== false;
    const showMinuteHand = clockModule.analog_show_minute_hand !== false;
    const showHourMarkers = clockModule.analog_show_hour_markers !== false;
    const showCenterDot = clockModule.analog_show_center_dot !== false;
    const showNumbers = clockModule.analog_show_numbers === true;
    const showHourTicks = clockModule.analog_show_hour_ticks === true;
    const showMinuteTicks = clockModule.analog_show_minute_ticks === true;

    // Calculate time offsets for CSS animation-delay (HA native approach)
    // This positions the infinitely rotating hands at the correct time
    const hour12 = hours % 12;
    const secondsWithMs = seconds + milliseconds / 1000;

    const secondOffsetSec = smoothSeconds ? secondsWithMs : Math.floor(secondsWithMs);
    const minuteOffsetSec = minutes * 60 + secondsWithMs;
    const hourOffsetSec = hour12 * 3600 + minutes * 60 + secondsWithMs;

    // Get colors with fallbacks to analog-specific properties, then to global clock properties
    const hourHandColor =
      clockModule.analog_hour_hand_color || clockModule.clock_color || 'var(--primary-color)';
    const minuteHandColor =
      clockModule.analog_minute_hand_color || clockModule.clock_color || 'var(--primary-color)';
    const secondHandColor = clockModule.analog_second_hand_color || 'var(--error-color)';
    const hourMarkerColor =
      clockModule.analog_hour_marker_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const centerDotColor =
      clockModule.analog_center_dot_color || clockModule.clock_color || 'var(--error-color)';
    const numbersColor =
      clockModule.analog_numbers_color || clockModule.clock_color || 'var(--primary-text-color)';
    const hourTicksColor =
      clockModule.analog_hour_ticks_color || clockModule.clock_color || 'var(--primary-text-color)';
    const minuteTicksColor =
      clockModule.analog_minute_ticks_color ||
      clockModule.clock_color ||
      'var(--disabled-text-color)';
    const faceOutlineColor =
      clockModule.analog_face_outline_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const faceBackgroundColor =
      clockModule.analog_face_background_color ||
      clockModule.clock_background ||
      'var(--card-background-color)';

    // Get background image based on type
    let backgroundImageUrl = '';
    const backgroundType = clockModule.analog_face_background_type || 'color';

    if (backgroundType === 'entity' && clockModule.analog_face_background_image_entity && hass) {
      const entity = hass.states[clockModule.analog_face_background_image_entity];
      if (entity && entity.attributes.entity_picture) {
        backgroundImageUrl = entity.attributes.entity_picture;
      }
    } else if (backgroundType === 'upload' && clockModule.analog_face_background_image_upload) {
      // Convert uploaded path to full URL using getImageUrl utility
      backgroundImageUrl = getImageUrl(hass, clockModule.analog_face_background_image_upload);
    } else if (backgroundType === 'url' && clockModule.analog_face_background_image_url) {
      backgroundImageUrl = clockModule.analog_face_background_image_url;
    }

    const backgroundSize = clockModule.analog_face_background_size || 'cover';
    const backgroundPosition = clockModule.analog_face_background_position || 'center';
    const backgroundRepeat = clockModule.analog_face_background_repeat || 'no-repeat';

    return html`
      <div class="analog-clock">
        <div
          class="analog-clock-dial"
          style="
          --face-outline-color: ${faceOutlineColor};
          --face-background-color: ${backgroundType === 'color'
            ? faceBackgroundColor
            : 'transparent'};
          --marker-color: ${hourMarkerColor};
          ${backgroundImageUrl
            ? `
            background-image: url('${backgroundImageUrl}');
            background-size: ${backgroundSize};
            background-position: ${backgroundPosition};
            background-repeat: ${backgroundRepeat};
          `
            : ''}
        "
        >
          <!-- SVG for static elements (face, markers, numbers, ticks) -->
          <svg viewBox="0 0 200 200" class="analog-face-svg" xmlns="http://www.w3.org/2000/svg">
            <!-- Clock face circle (drawn first, appears in back) -->
            <circle cx="100" cy="100" r="93.5" class="clock-face-circle" />

            <!-- Hour markers -->
            ${showHourMarkers
              ? [...Array(12)].map((_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x1 = 100 + 85 * Math.cos(angle);
                  const y1 = 100 + 85 * Math.sin(angle);
                  const x2 = 100 + 75 * Math.cos(angle);
                  const y2 = 100 + 75 * Math.sin(angle);
                  return html`<line
                    x1="${x1}"
                    y1="${y1}"
                    x2="${x2}"
                    y2="${y2}"
                    class="hour-marker"
                  />`;
                })
              : ''}

            <!-- Clock numbers (1-12) - drawn last, appears on top -->
            ${showNumbers
              ? [...Array(12)].map((_, i) => {
                  const num = i === 0 ? 12 : i;
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 100 + 65 * Math.cos(angle);
                  const y = 100 + 65 * Math.sin(angle);
                  return html`<text
                    x="${x}"
                    y="${y}"
                    font-size="22"
                    font-weight="900"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-family="Arial, sans-serif"
                    class="clock-number"
                    fill="${numbersColor}"
                    stroke="${faceBackgroundColor}"
                    stroke-width="0.5"
                    paint-order="stroke fill"
                    >${num}</text
                  >`;
                })
              : ''}
          </svg>

          <!-- Clock hands using CSS animations (HA native approach) -->
          ${showHourHand
            ? html`<div
                class="clock-hand clock-hand-hour"
                style="
                  background: ${hourHandColor};
                  animation-delay: -${hourOffsetSec}s;
                "
              ></div>`
            : ''}
          ${showMinuteHand
            ? html`<div
                class="clock-hand clock-hand-minute"
                style="
                  background: ${minuteHandColor};
                  animation-delay: -${minuteOffsetSec}s;
                "
              ></div>`
            : ''}
          ${showSeconds
            ? html`<div
                class="clock-hand clock-hand-second ${smoothSeconds ? '' : 'step'}"
                style="
                  background: ${secondHandColor};
                  animation-delay: -${secondOffsetSec}s;
                "
              ></div>`
            : ''}

          <!-- Center dot -->
          ${showCenterDot
            ? html`<div class="clock-center-dot" style="background: ${centerDotColor};"></div>`
            : ''}

          <!-- Clock numbers as HTML elements (fallback) -->
          ${showNumbers
            ? [...Array(12)].map((_, i) => {
                const num = i === 0 ? 12 : i;
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const radius = 65; // Same as SVG version
                const xPercent = 50 + (radius / 2) * Math.cos(angle);
                const yPercent = 50 + (radius / 2) * Math.sin(angle);
                return html`<div
                  class="clock-number-html"
                  style="
                    left: ${xPercent}%;
                    top: ${yPercent}%;
                    color: ${numbersColor};
                  "
                >
                  ${num}
                </div>`;
              })
            : ''}

          <!-- Hour tick marks as HTML elements (12 major ticks) -->
          ${showHourTicks
            ? [...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180); // Every 30 degrees (360/12)
                const outerRadius = 46.5; // 93% of 50
                const innerRadius = 43; // 86% of 50

                const centerRadius = (outerRadius + innerRadius) / 2;
                const xPercent = 50 + centerRadius * Math.cos(angle);
                const yPercent = 50 + centerRadius * Math.sin(angle);
                const rotationDeg = i * 30;

                return html`<div
                  class="clock-hour-tick-html"
                  style="
                    left: ${xPercent}%;
                    top: ${yPercent}%;
                    transform: translate(-50%, -50%) rotate(${rotationDeg}deg);
                    background: ${hourTicksColor};
                  "
                ></div>`;
              })
            : ''}

          <!-- Minute tick marks as HTML elements (48 minor ticks) -->
          ${showMinuteTicks
            ? [...Array(60)].map((_, i) => {
                // Skip positions where hour ticks would be (0, 5, 10, 15, etc.)
                if (i % 5 === 0) return '';
                const angle = (i * 6 - 90) * (Math.PI / 180); // Every 6 degrees (360/60)
                const outerRadius = 46.5;
                const innerRadius = 44; // Shorter than hour ticks

                const centerRadius = (outerRadius + innerRadius) / 2;
                const xPercent = 50 + centerRadius * Math.cos(angle);
                const yPercent = 50 + centerRadius * Math.sin(angle);
                const rotationDeg = i * 6;

                return html`<div
                  class="clock-minute-tick-html"
                  style="
                    left: ${xPercent}%;
                    top: ${yPercent}%;
                    transform: translate(-50%, -50%) rotate(${rotationDeg}deg);
                    background: ${minuteTicksColor};
                  "
                ></div>`;
              })
            : ''}
        </div>
      </div>
    `;
  }

  private _renderBinaryClock(
    hours: number,
    minutes: number,
    seconds: number,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showLabels = clockModule.show_labels !== false;
    const showSeparators = clockModule.show_separators !== false;

    const toBinary = (num: number, digits: number = 4) => {
      return num.toString(2).padStart(digits, '0').split('');
    };

    const h1 = toBinary(Math.floor(hours / 10), 4);
    const h2 = toBinary(hours % 10, 4);
    const m1 = toBinary(Math.floor(minutes / 10), 4);
    const m2 = toBinary(minutes % 10, 4);
    const s1 = toBinary(Math.floor(seconds / 10), 4);
    const s2 = toBinary(seconds % 10, 4);

    const columns = [];
    const labels = [];
    const types = []; // 'hours', 'minutes', or 'seconds'

    if (showHours) {
      columns.push(h1, h2);
      labels.push('H', 'H');
      types.push('hours', 'hours');
    }
    if (showMinutes) {
      columns.push(m1, m2);
      labels.push('M', 'M');
      types.push('minutes', 'minutes');
    }
    if (showSeconds) {
      columns.push(s1, s2);
      labels.push('S', 'S');
      types.push('seconds', 'seconds');
    }

    // Get colors
    const hoursEmptyColor = clockModule.binary_hours_empty_color || 'rgba(128, 128, 128, 0.2)';
    const hoursFilledColor =
      clockModule.binary_hours_filled_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const minutesEmptyColor = clockModule.binary_minutes_empty_color || 'rgba(128, 128, 128, 0.2)';
    const minutesFilledColor =
      clockModule.binary_minutes_filled_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const secondsEmptyColor = clockModule.binary_seconds_empty_color || 'rgba(128, 128, 128, 0.2)';
    const secondsFilledColor =
      clockModule.binary_seconds_filled_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const separatorColor =
      clockModule.binary_separator_color || clockModule.clock_color || 'var(--primary-text-color)';
    const hoursLabelColor =
      clockModule.binary_hours_label_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const minutesLabelColor =
      clockModule.binary_minutes_label_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const secondsLabelColor =
      clockModule.binary_seconds_label_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';

    return html`
      <div class="binary-clock">
        ${columns.map((col, colIndex) => {
          const isHourMinuteBoundary = showHours && showMinutes && colIndex === 1;
          const isMinuteSecondBoundary =
            showMinutes && showSeconds && colIndex === (showHours ? 3 : 1);
          const showSeparator = showSeparators && (isHourMinuteBoundary || isMinuteSecondBoundary);

          const type = types[colIndex];
          const emptyColor =
            type === 'hours'
              ? hoursEmptyColor
              : type === 'minutes'
                ? minutesEmptyColor
                : secondsEmptyColor;
          const filledColor =
            type === 'hours'
              ? hoursFilledColor
              : type === 'minutes'
                ? minutesFilledColor
                : secondsFilledColor;
          const labelColor =
            type === 'hours'
              ? hoursLabelColor
              : type === 'minutes'
                ? minutesLabelColor
                : secondsLabelColor;

          return html`
            <div class="binary-column">
              ${showLabels
                ? html`<div class="binary-label" style="color: ${labelColor};">
                    ${labels[colIndex]}
                  </div>`
                : ''}
              ${col.map(
                bit => html`
                  <div
                    class="binary-dot ${bit === '1' ? 'active' : ''}"
                    style="${bit === '1'
                      ? `background: ${filledColor}; border-color: ${filledColor}; box-shadow: 0 0 10px ${filledColor};`
                      : `background: ${emptyColor}; border-color: rgba(128, 128, 128, 0.3);`}"
                  ></div>
                `
              )}
            </div>
            ${showSeparator
              ? html`<div class="binary-separator" style="color: ${separatorColor};">:</div>`
              : ''}
          `;
        })}
      </div>
    `;
  }

  private _renderMinimalClock(
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    // Get colors
    const hoursColor =
      clockModule.minimal_hours_color || clockModule.clock_color || 'var(--primary-text-color)';
    const minutesColor =
      clockModule.minimal_minutes_color || clockModule.clock_color || 'var(--primary-text-color)';
    const secondsColor =
      clockModule.minimal_seconds_color || clockModule.clock_color || 'var(--primary-text-color)';
    const separatorColor =
      clockModule.minimal_separator_color || clockModule.clock_color || 'var(--primary-text-color)';
    const ampmColor =
      clockModule.minimal_ampm_color || clockModule.clock_color || 'var(--primary-text-color)';

    return html`
      <div class="minimal-clock">
        <div class="minimal-time">
          ${showHours
            ? html`<span style="color: ${hoursColor};">${hoursStr}</span>`
            : ''}${showSeparators && showHours && showMinutes
            ? html`<span class="minimal-separator" style="color: ${separatorColor};">:</span>`
            : ''}${showMinutes
            ? html`<span style="color: ${minutesColor};">${minutesStr}</span>`
            : ''}${showSeparators && showMinutes && showSeconds
            ? html`<span class="minimal-separator" style="color: ${separatorColor};">:</span>`
            : ''}${showSeconds
            ? html`<span style="color: ${secondsColor};">${secondsStr}</span>`
            : ''}
        </div>
        ${clockModule.time_format === '12' && showAmPm
          ? html`<div class="minimal-ampm" style="color: ${ampmColor};">${ampm}</div>`
          : ''}
      </div>
    `;
  }

  private _renderRetroClock(
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    // Get colors
    const backgroundColor =
      clockModule.retro_background_color || 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)';
    const hoursTileColor = clockModule.retro_hours_tile_color || 'rgba(0, 0, 0, 0.3)';
    const minutesTileColor = clockModule.retro_minutes_tile_color || 'rgba(0, 0, 0, 0.3)';
    const secondsTileColor = clockModule.retro_seconds_tile_color || 'rgba(0, 0, 0, 0.3)';
    const separatorTileColor = clockModule.retro_separator_tile_color || 'rgba(0, 0, 0, 0.3)';
    const hoursColor = clockModule.retro_hours_color || '#ffa500';
    const minutesColor = clockModule.retro_minutes_color || '#ffa500';
    const secondsColor = clockModule.retro_seconds_color || '#ffa500';
    const separatorColor = clockModule.retro_separator_color || '#ffa500';
    const ampmColor = clockModule.retro_ampm_color || '#00ff00';

    const hoursGlow = `0 0 5px ${hoursColor}, 0 0 10px ${hoursColor.replace('500', '600')}`;
    const minutesGlow = `0 0 5px ${minutesColor}, 0 0 10px ${minutesColor.replace('500', '600')}`;
    const secondsGlow = `0 0 5px ${secondsColor}, 0 0 10px ${secondsColor.replace('500', '600')}`;
    const separatorGlow = `0 0 5px ${separatorColor}, 0 0 10px ${separatorColor.replace('500', '600')}`;

    return html`
      <div class="retro-clock">
        <div class="retro-display" style="background: ${backgroundColor};">
          ${showHours
            ? html`
                <span
                  class="retro-digit"
                  style="background: ${hoursTileColor}; color: ${hoursColor}; text-shadow: ${hoursGlow};"
                  >${hoursStr[0]}</span
                >
                <span
                  class="retro-digit"
                  style="background: ${hoursTileColor}; color: ${hoursColor}; text-shadow: ${hoursGlow};"
                  >${hoursStr[1]}</span
                >
              `
            : ''}
          ${showSeparators && showHours && showMinutes
            ? html`<span
                class="retro-colon"
                style="background: ${separatorTileColor}; color: ${separatorColor}; text-shadow: ${separatorGlow};"
                >:</span
              >`
            : ''}
          ${showMinutes
            ? html`
                <span
                  class="retro-digit"
                  style="background: ${minutesTileColor}; color: ${minutesColor}; text-shadow: ${minutesGlow};"
                  >${minutesStr[0]}</span
                >
                <span
                  class="retro-digit"
                  style="background: ${minutesTileColor}; color: ${minutesColor}; text-shadow: ${minutesGlow};"
                  >${minutesStr[1]}</span
                >
              `
            : ''}
          ${showSeparators && showMinutes && showSeconds
            ? html`<span
                class="retro-colon"
                style="background: ${separatorTileColor}; color: ${separatorColor}; text-shadow: ${separatorGlow};"
                >:</span
              >`
            : ''}
          ${showSeconds
            ? html`
                <span
                  class="retro-digit"
                  style="background: ${secondsTileColor}; color: ${secondsColor}; text-shadow: ${secondsGlow};"
                  >${secondsStr[0]}</span
                >
                <span
                  class="retro-digit"
                  style="background: ${secondsTileColor}; color: ${secondsColor}; text-shadow: ${secondsGlow};"
                  >${secondsStr[1]}</span
                >
              `
            : ''}
          ${clockModule.time_format === '12' && showAmPm
            ? html`<span
                class="retro-ampm"
                style="color: ${ampmColor}; text-shadow: 0 0 5px ${ampmColor.replace(
                  'ff00',
                  'cc00'
                )};"
                >${ampm}</span
              >`
            : ''}
        </div>
      </div>
    `;
  }

  private _renderTextClock(
    hours: number,
    minutes: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showPrefix = clockModule.show_prefix !== false;

    const orientation = clockModule.text_orientation || 'horizontal';
    const gap = clockModule.text_word_gap || 8;

    // Colors
    const prefixColor = clockModule.text_prefix_color || 'var(--primary-text-color)';
    const hoursColor = clockModule.text_hours_color || 'var(--primary-text-color)';
    const minutesColor = clockModule.text_minutes_color || 'var(--primary-text-color)';
    const ampmColor = clockModule.text_ampm_color || 'var(--primary-text-color)';

    // Sizes
    const prefixSize = clockModule.text_prefix_size || 38;
    const hoursSize = clockModule.text_hours_size || 48;
    const minutesSize = clockModule.text_minutes_size || 48;
    const ampmSize = clockModule.text_ampm_size || 24;

    const hourWords = [
      'twelve',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
    ];
    const hourWord = hourWords[hours % 12];

    const minuteWord =
      minutes === 0
        ? "o'clock"
        : minutes < 10
          ? `oh ${this._numberToWords(minutes)}`
          : this._numberToWords(minutes);

    const isVertical = orientation === 'vertical';

    return html`
      <div class="text-clock">
        <div
          class="text-display"
          style="
          flex-direction: ${isVertical ? 'column' : 'row'};
          gap: calc(${gap}px * var(--clock-scale));
        "
        >
          ${showPrefix
            ? html`<span
                class="text-word text-prefix"
                style="color: ${prefixColor}; font-size: calc(${prefixSize}px * var(--clock-scale));"
                >It is</span
              >`
            : ''}
          ${showHours
            ? html`<span
                class="text-word text-hours"
                style="color: ${hoursColor}; font-size: calc(${hoursSize}px * var(--clock-scale));"
                >${hourWord}</span
              >`
            : ''}
          ${showMinutes
            ? html`<span
                class="text-word text-minutes"
                style="color: ${minutesColor}; font-size: calc(${minutesSize}px * var(--clock-scale));"
                >${minuteWord}</span
              >`
            : ''}
          ${clockModule.time_format === '12' && showAmPm
            ? html`<span
                class="text-word text-ampm"
                style="color: ${ampmColor}; font-size: calc(${ampmSize}px * var(--clock-scale));"
                >${ampm}</span
              >`
            : ''}
        </div>
      </div>
    `;
  }

  private _renderNeonClock(
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;

    const padding = clockModule.neon_padding || 24;
    const hoursColor = clockModule.neon_hours_color || '#00ffff';
    const minutesColor = clockModule.neon_minutes_color || '#00ffff';
    const secondsColor = clockModule.neon_seconds_color || '#00ffff';
    const separatorColor = clockModule.neon_separator_color || '#ff00ff';
    const ampmColor = clockModule.neon_ampm_color || '#00ff00';

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return html`
      <div class="neon-clock" style="padding: calc(${padding}px * var(--clock-scale));">
        <div class="neon-display">
          ${showHours
            ? html`<span
                class="neon-digit"
                style="color: ${hoursColor}; text-shadow: 0 0 5px ${hoursColor}, 0 0 10px ${hoursColor}, 0 0 20px ${hoursColor}, 0 0 30px ${hoursColor}, 0 0 40px ${hoursColor};"
                >${hoursStr}</span
              >`
            : ''}
          ${showSeparators && showHours && showMinutes
            ? html`<span
                class="neon-separator"
                style="color: ${separatorColor}; text-shadow: 0 0 5px ${separatorColor}, 0 0 10px ${separatorColor}, 0 0 20px ${separatorColor}, 0 0 30px ${separatorColor};"
                >:</span
              >`
            : ''}
          ${showMinutes
            ? html`<span
                class="neon-digit"
                style="color: ${minutesColor}; text-shadow: 0 0 5px ${minutesColor}, 0 0 10px ${minutesColor}, 0 0 20px ${minutesColor}, 0 0 30px ${minutesColor}, 0 0 40px ${minutesColor};"
                >${minutesStr}</span
              >`
            : ''}
          ${showSeparators && showMinutes && showSeconds
            ? html`<span
                class="neon-separator"
                style="color: ${separatorColor}; text-shadow: 0 0 5px ${separatorColor}, 0 0 10px ${separatorColor}, 0 0 20px ${separatorColor}, 0 0 30px ${separatorColor};"
                >:</span
              >`
            : ''}
          ${showSeconds
            ? html`<span
                class="neon-digit"
                style="color: ${secondsColor}; text-shadow: 0 0 5px ${secondsColor}, 0 0 10px ${secondsColor}, 0 0 20px ${secondsColor}, 0 0 30px ${secondsColor}, 0 0 40px ${secondsColor};"
                >${secondsStr}</span
              >`
            : ''}
          ${clockModule.time_format === '12' && showAmPm
            ? html`<span
                class="neon-ampm"
                style="color: ${ampmColor}; text-shadow: 0 0 5px ${ampmColor}, 0 0 10px ${ampmColor}, 0 0 20px ${ampmColor};"
                >${ampm}</span
              >`
            : ''}
        </div>
      </div>
    `;
  }

  private _renderMaterialClock(
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;

    const verticalGap = clockModule.material_vertical_gap || 8;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    // Get colors
    const backgroundColor =
      clockModule.material_background_color ||
      clockModule.clock_background ||
      'var(--card-background-color)';
    const hoursColor =
      clockModule.material_hours_color || clockModule.clock_color || 'var(--primary-text-color)';
    const minutesColor =
      clockModule.material_minutes_color || clockModule.clock_color || 'var(--primary-text-color)';
    const secondsColor =
      clockModule.material_seconds_color || clockModule.clock_color || 'var(--primary-text-color)';
    const separatorColor =
      clockModule.material_separator_color ||
      clockModule.clock_color ||
      'var(--primary-text-color)';
    const ampmColor =
      clockModule.material_ampm_color || clockModule.clock_color || 'var(--primary-text-color)';

    return html`
      <div class="material-clock">
        <div
          class="material-card"
          style="gap: calc(${verticalGap}px * var(--clock-scale)); background: ${backgroundColor};"
        >
          <div class="material-time">
            ${showHours ? html`<span style="color: ${hoursColor};">${hoursStr}</span>` : ''}
            ${showHours && showMinutes && showSeparators
              ? html`<span style="color: ${separatorColor};">:</span>`
              : ''}
            ${showMinutes ? html`<span style="color: ${minutesColor};">${minutesStr}</span>` : ''}
          </div>
          ${showSeconds || (clockModule.time_format === '12' && showAmPm)
            ? html`
                <div class="material-seconds">
                  ${showSeconds
                    ? html`<span style="color: ${secondsColor};">${secondsStr}</span>`
                    : ''}
                  ${clockModule.time_format === '12' && showAmPm
                    ? html` <span style="color: ${ampmColor};">${ampm}</span>`
                    : ''}
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderTerminalClock(
    hours: number,
    minutes: number,
    seconds: number,
    ampm: string,
    clockModule: AnimatedClockModule
  ): TemplateResult {
    const showHours = clockModule.show_hours !== false;
    const showMinutes = clockModule.show_minutes !== false;
    const showSeconds = clockModule.show_seconds !== false;
    const showAmPm = clockModule.show_ampm !== false;
    const showSeparators = clockModule.show_separators !== false;
    const showPrompt = clockModule.show_prompt !== false;
    const showCommand = clockModule.show_command !== false;
    const showCursor = clockModule.show_cursor !== false;

    // Colors
    const backgroundColor = clockModule.terminal_background_color || '#1e1e1e';
    const line1Color = clockModule.terminal_line1_color || '#4ec9b0';
    const line2Color = clockModule.terminal_line2_color || '#ce9178';
    const cursorColor = clockModule.terminal_cursor_color || '#4ec9b0';
    const hoursColor = clockModule.terminal_hours_color || '#d4d4d4';
    const minutesColor = clockModule.terminal_minutes_color || '#d4d4d4';
    const secondsColor = clockModule.terminal_seconds_color || '#d4d4d4';
    const separatorColor = clockModule.terminal_separator_color || '#d4d4d4';
    const ampmColor = clockModule.terminal_ampm_color || '#d4d4d4';

    // Spacing and sizes
    const verticalSpacing = clockModule.terminal_vertical_spacing || 8;
    const line1Size = clockModule.terminal_line1_size || 17;
    const line2Size = clockModule.terminal_line2_size || 17;
    const outputSize = clockModule.terminal_output_size || 38;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');

    return html`
      <div class="terminal-clock" style="background: ${backgroundColor};">
        ${showPrompt
          ? html`<div
              class="terminal-prompt"
              style="font-size: calc(${line1Size}px * var(--clock-scale)); color: ${line1Color}; margin-bottom: calc(${verticalSpacing}px * var(--clock-scale));"
            >
              user@homeassistant:~$
            </div>`
          : ''}
        ${showCommand
          ? html`<div
              class="terminal-command"
              style="font-size: calc(${line2Size}px * var(--clock-scale)); color: ${line2Color}; margin-bottom: calc(${verticalSpacing *
              1.5}px * var(--clock-scale));"
            >
              date +"%T"
            </div>`
          : ''}
        <div class="terminal-output" style="font-size: calc(${outputSize}px * var(--clock-scale));">
          ${showHours ? html`<span style="color: ${hoursColor};">${hoursStr}</span>` : ''}
          ${showHours && showMinutes && showSeparators
            ? html`<span style="color: ${separatorColor};">:</span>`
            : ''}
          ${showMinutes ? html`<span style="color: ${minutesColor};">${minutesStr}</span>` : ''}
          ${showMinutes && showSeconds && showSeparators
            ? html`<span style="color: ${separatorColor};">:</span>`
            : ''}
          ${showSeconds ? html`<span style="color: ${secondsColor};">${secondsStr}</span>` : ''}
          ${clockModule.time_format === '12' && showAmPm
            ? html` <span style="color: ${ampmColor};">${ampm}</span>`
            : ''}
          ${showCursor
            ? html`<span
                class="terminal-cursor"
                style="background: ${cursorColor}; width: calc(${outputSize *
                0.21}px * var(--clock-scale)); height: calc(${outputSize}px * var(--clock-scale)); margin-left: calc(${outputSize *
                0.105}px * var(--clock-scale));"
              ></span>`
            : ''}
        </div>
      </div>
    `;
  }

  private _numberToWords(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = [
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 60) {
      const tensDigit = Math.floor(num / 10);
      const onesDigit = num % 10;
      return onesDigit === 0 ? tens[tensDigit] : `${tens[tensDigit]} ${ones[onesDigit]}`;
    }
    return String(num);
  }

  // Helper method to convert object to CSS style string
  private objectToStyleString(styles: Record<string, any>): string {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
  }

  // Helper method to add pixel unit if needed
  private addPixelUnit(value: string | undefined): string | undefined {
    if (!value) return undefined;
    if (
      typeof value === 'string' &&
      (value.includes('px') ||
        value.includes('%') ||
        value.includes('em') ||
        value.includes('rem') ||
        value.includes('vh') ||
        value.includes('vw'))
    ) {
      return value;
    }
    return `${value}px`;
  }

  // Helper method to get background image CSS
  private getBackgroundImageCSS(moduleWithDesign: any, hass?: HomeAssistant): string {
    const backgroundType = moduleWithDesign.background_type || 'color';

    if (backgroundType === 'entity' && moduleWithDesign.background_image_entity && hass) {
      const entity = hass.states[moduleWithDesign.background_image_entity];
      if (entity && entity.attributes.entity_picture) {
        return `url('${entity.attributes.entity_picture}')`;
      }
    } else if (backgroundType === 'upload' && moduleWithDesign.background_image_upload) {
      return `url('${moduleWithDesign.background_image_upload}')`;
    } else if (backgroundType === 'url' && moduleWithDesign.background_image_url) {
      return `url('${moduleWithDesign.background_image_url}')`;
    }

    return '';
  }

  getStyles(): string {
    return `
      .animated-clock-module-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
        width: 100%;
        min-height: 50px;
        box-sizing: border-box;
        overflow: visible;
        --clock-scale: calc(var(--clock-size-value) / 115);
      }

      /* Ensure all clock styles fit within container and are responsive */
      .flip-clock,
      .digital-clock,
      .analog-clock,
      .binary-clock,
      .minimal-clock,
      .retro-clock,
      .text-clock,
      .neon-clock,
      .material-clock,
      .terminal-clock {
        max-width: 100%;
        width: auto;
        transform-origin: center;
        box-sizing: border-box;
        overflow: visible;
      }

      /* ========== FLIP CLOCK ========== */
      .flip-clock {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: calc(6px * var(--clock-scale));
        max-width: 100%;
        width: 100%;
        flex-wrap: nowrap;
      }

      .flip-unit {
        position: relative;
        width: calc(56px * var(--clock-scale));
        height: calc(77px * var(--clock-scale));
        background: var(--flip-tile-color, rgba(0, 0, 0, 0.5));
        border-radius: calc(8px * var(--clock-scale));
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        overflow: hidden;
        flex-shrink: 1;
        min-width: 0;
      }

      .flip-digit-display {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: calc(48px * var(--clock-scale));
        font-weight: 700;
        color: var(--clock-color);
        line-height: 1;
        overflow: hidden;
        text-overflow: clip;
      }

      .flip-unit::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: rgba(0, 0, 0, 0.2);
        z-index: 1;
      }

      .flip-separator {
        font-size: calc(48px * var(--clock-scale));
        font-weight: 700;
        color: var(--clock-color);
        animation: blink 1s ease-in-out infinite;
        flex-shrink: 1;
        min-width: 0;
      }

      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0.3; }
      }

      .flip-ampm {
        font-size: calc(19px * var(--clock-scale));
        font-weight: 600;
        color: var(--clock-color);
        opacity: 0.9;
        align-self: flex-end;
        margin-bottom: calc(8px * var(--clock-scale));
        margin-left: calc(4px * var(--clock-scale));
        flex-shrink: 1;
        min-width: 0;
      }

      /* ========== DIGITAL CLOCK ========== */
      .digital-clock {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: calc(8px * var(--clock-scale));
        max-width: 100%;
      }

      .digital-display {
        display: flex;
        align-items: center;
        gap: calc(16px * var(--clock-scale));
        background: #000;
        padding: calc(24px * var(--clock-scale)) calc(32px * var(--clock-scale));
        border-radius: calc(12px * var(--clock-scale));
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(255, 0, 0, 0.3);
        max-width: 100%;
        box-sizing: border-box;
      }

      /* Editor preview-specific padding */
      .preview-content .digital-display {
        padding: calc(46px * var(--clock-scale)) calc(32px * var(--clock-scale));
      }

      .digital-time {
        font-family: 'Courier New', monospace;
        font-size: calc(64px * var(--clock-scale));
        font-weight: bold;
        color: #ff3333;
        text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000;
        letter-spacing: calc(6px * var(--clock-scale));
      }

      .digital-ampm {
        font-family: 'Courier New', monospace;
        font-size: calc(26px * var(--clock-scale));
        font-weight: bold;
        color: #33ff33;
        text-shadow: 0 0 8px #00ff00, 0 0 16px #00ff00;
      }

      /* ========== ANALOG CLOCK (HA Native Approach) ========== */
      .analog-clock {
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .analog-clock-dial {
        position: relative;
        width: calc(192px * var(--clock-scale));
        height: calc(192px * var(--clock-scale));
        box-sizing: border-box;
        overflow: hidden;
        border-radius: 50%;
        clip-path: circle(47.25% at 50% 50%);
      }

      .analog-face-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
      }

      .clock-face-circle {
        fill: var(--face-background-color);
        stroke: var(--face-outline-color);
        stroke-width: 2;
      }

      .hour-marker {
        stroke: var(--marker-color);
        stroke-width: 3;
        stroke-linecap: round;
        fill: none;
        opacity: 1;
      }

      .tick-mark {
        stroke-width: 2.5;
        stroke-linecap: round;
        fill: none;
        opacity: 1;
      }

      /* Clock numbers - SVG text (may not render in some browsers) */
      .clock-number {
        font-family: Arial, sans-serif !important;
        font-size: 22px !important;
        font-weight: 900 !important;
        text-anchor: middle !important;
        dominant-baseline: middle !important;
        pointer-events: none !important;
        user-select: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        paint-order: stroke fill !important;
      }

      /* Clock numbers - HTML fallback (guaranteed to render) */
      .clock-number-html {
        position: absolute;
        transform: translate(-50%, -50%);
        font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: calc(18px * var(--clock-scale));
        font-weight: 900;
        pointer-events: none;
        user-select: none;
        z-index: 8;
        text-shadow: 
          1px 1px 2px var(--face-background-color, rgba(0, 0, 0, 0.3)),
          -1px -1px 2px var(--face-background-color, rgba(0, 0, 0, 0.3));
      }

      /* Hour tick marks - HTML elements (guaranteed to render) */
      .clock-hour-tick-html {
        position: absolute;
        width: calc(3px * var(--clock-scale));
        height: calc(8px * var(--clock-scale));
        border-radius: 1.5px;
        pointer-events: none;
        z-index: 2;
        opacity: 1;
      }

      /* Minute tick marks - HTML elements (smaller than hour ticks) */
      .clock-minute-tick-html {
        position: absolute;
        width: calc(1.5px * var(--clock-scale));
        height: calc(5px * var(--clock-scale));
        border-radius: 1px;
        pointer-events: none;
        z-index: 2;
        opacity: 1;
      }

      /* Clock hands using CSS animations (HA native approach) */
      .clock-hand {
        position: absolute;
        left: 50%;
        bottom: 50%;
        transform-origin: 50% 100%;
        transform: translate(-50%, 0) rotate(0deg);
        border-radius: 2px;
        will-change: transform;
        animation-name: ha-clock-rotate;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
      }

      .clock-hand-hour {
        width: calc(4px * var(--clock-scale));
        height: calc(48px * var(--clock-scale)); /* 25% of 192px */
        z-index: 5;
        animation-duration: 43200s; /* 12 hours */
      }

      .clock-hand-minute {
        width: calc(3px * var(--clock-scale));
        height: calc(67px * var(--clock-scale)); /* 35% of 192px */
        opacity: 0.9;
        z-index: 6;
        animation-duration: 3600s; /* 60 minutes */
      }

      .clock-hand-second {
        width: calc(2px * var(--clock-scale));
        height: calc(81px * var(--clock-scale)); /* 42% of 192px */
        opacity: 0.8;
        z-index: 7;
        animation-duration: 60s; /* 60 seconds */
      }

      .clock-hand-second.step {
        animation-timing-function: steps(60, end);
      }

      .clock-center-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        width: calc(8px * var(--clock-scale));
        height: calc(8px * var(--clock-scale));
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }

      @keyframes ha-clock-rotate {
        from {
          transform: translate(-50%, 0) rotate(0deg);
        }
        to {
          transform: translate(-50%, 0) rotate(360deg);
        }
      }

      /* ========== BINARY CLOCK ========== */
      .binary-clock {
        display: flex;
        align-items: center;
        gap: calc(4px * var(--clock-scale));
        max-width: 100%;
        flex-wrap: nowrap;
        justify-content: center;
        overflow-x: auto;
      }

      .binary-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: calc(6px * var(--clock-scale));
      }

      .binary-label {
        font-size: calc(14px * var(--clock-scale));
        color: var(--clock-color);
        opacity: 0.7;
        font-weight: 600;
        margin-bottom: calc(4px * var(--clock-scale));
      }

      .binary-dot {
        width: calc(19px * var(--clock-scale));
        height: calc(19px * var(--clock-scale));
        border-radius: 50%;
        background: rgba(128, 128, 128, 0.2);
        border: 2px solid rgba(128, 128, 128, 0.3);
        transition: all 0.2s ease;
      }

      .binary-dot.active {
        background: var(--clock-color);
        border-color: var(--clock-color);
        box-shadow: 0 0 10px var(--clock-color);
      }

      .binary-separator {
        font-size: calc(38px * var(--clock-scale));
        color: var(--clock-color);
        margin: 0 calc(4px * var(--clock-scale));
        opacity: 0.5;
      }

      /* ========== MINIMAL CLOCK ========== */
      .minimal-clock {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: calc(8px * var(--clock-scale));
        max-width: 100%;
      }

      .minimal-time {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: calc(48px * var(--clock-scale));
        font-weight: 300;
        color: var(--clock-color);
        letter-spacing: calc(2px * var(--clock-scale));
      }

      .minimal-separator {
        opacity: 0.5;
        margin: 0 calc(4px * var(--clock-scale));
      }

      .minimal-ampm {
        font-size: calc(17px * var(--clock-scale));
        font-weight: 400;
        color: var(--clock-color);
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: calc(3px * var(--clock-scale));
      }

      /* ========== RETRO CLOCK ========== */
      .retro-clock {
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .retro-display {
        display: flex;
        align-items: center;
        gap: calc(4px * var(--clock-scale));
        background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
        padding: calc(16px * var(--clock-scale)) calc(20px * var(--clock-scale));
        border-radius: calc(4px * var(--clock-scale));
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        max-width: 100%;
        box-sizing: border-box;
        flex-wrap: nowrap;
        justify-content: center;
        overflow-x: auto;
      }

      .retro-digit, .retro-colon {
        font-family: 'Courier New', monospace;
        font-size: calc(48px * var(--clock-scale));
        font-weight: bold;
        color: #ffa500;
        text-shadow: 0 0 5px #ff8800, 0 0 10px #ff6600;
        background: rgba(0, 0, 0, 0.3);
        padding: calc(4px * var(--clock-scale)) calc(8px * var(--clock-scale));
        border-radius: calc(2px * var(--clock-scale));
      }

      .retro-colon {
        padding: calc(4px * var(--clock-scale)) calc(4px * var(--clock-scale));
      }

      .retro-ampm {
        font-family: 'Courier New', monospace;
        font-size: calc(19px * var(--clock-scale));
        font-weight: bold;
        color: #00ff00;
        text-shadow: 0 0 5px #00cc00;
        margin-left: calc(8px * var(--clock-scale));
      }

      /* ========== TEXT CLOCK ========== */
      .text-clock {
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .text-display {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        max-width: 100%;
      }

      .text-word {
        font-family: Georgia, serif;
        font-size: calc(48px * var(--clock-scale));
        font-weight: 600;
        line-height: 1.4;
        text-transform: capitalize;
      }

      .text-prefix {
        font-size: calc(38px * var(--clock-scale));
        font-weight: 400;
        opacity: 0.7;
        text-transform: lowercase;
      }

      .text-ampm {
        font-size: calc(24px * var(--clock-scale));
        opacity: 0.8;
        text-transform: uppercase;
      }

      /* ========== NEON CLOCK ========== */
      .neon-clock {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .neon-display {
        display: flex;
        align-items: center;
        gap: calc(8px * var(--clock-scale));
        width: 100%;
        max-width: 100%;
        flex-wrap: nowrap;
        justify-content: center;
        box-sizing: border-box;
      }

      .neon-digit {
        font-family: 'Arial Black', sans-serif;
        font-size: calc(48px * var(--clock-scale));
        font-weight: 900;
        animation: neon-flicker 3s ease-in-out infinite;
      }

      .neon-separator {
        font-family: 'Arial Black', sans-serif;
        font-size: calc(48px * var(--clock-scale));
        font-weight: 900;
      }

      .neon-ampm {
        font-family: 'Arial Black', sans-serif;
        font-size: calc(19px * var(--clock-scale));
        font-weight: 900;
      }

      @keyframes neon-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.95; }
        51% { opacity: 1; }
        52% { opacity: 0.98; }
      }

      /* ========== MATERIAL CLOCK ========== */
      .material-clock {
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .material-card {
        background: var(--clock-background);
        border-radius: calc(16px * var(--clock-scale));
        padding: calc(24px * var(--clock-scale)) calc(32px * var(--clock-scale));
        box-shadow: 
          0 4px 6px rgba(0, 0, 0, 0.1),
          0 1px 3px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: calc(8px * var(--clock-scale));
        max-width: 100%;
        box-sizing: border-box;
      }

      .material-time {
        font-family: 'Roboto', sans-serif;
        font-size: calc(48px * var(--clock-scale));
        font-weight: 300;
        color: var(--clock-color);
        letter-spacing: -1px;
      }

      .material-seconds {
        font-family: 'Roboto', sans-serif;
        font-size: calc(19px * var(--clock-scale));
        font-weight: 400;
        color: var(--clock-color);
        opacity: 0.7;
      }

      /* ========== TERMINAL CLOCK ========== */
      .terminal-clock {
        font-family: 'Courier New', Consolas, monospace;
        background: #1e1e1e;
        padding: calc(20px * var(--clock-scale));
        border-radius: calc(8px * var(--clock-scale));
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        max-width: 100%;
        box-sizing: border-box;
      }

      .terminal-prompt {
        font-weight: 400;
      }

      .terminal-command {
        font-weight: 400;
      }

      .terminal-output {
        font-weight: 600;
        font-size: calc(38px * var(--clock-scale));
      }

      .terminal-cursor {
        display: inline-block;
        animation: cursor-blink 1s step-end infinite;
      }

      @keyframes cursor-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }

      /* ========== RESPONSIVE SIZING ========== */
      /* Container-based uniform scaling instead of breakpoint layout changes */
      @media (max-width: 768px) {
        .animated-clock-module-container {
          --container-scale: min(1, calc(100vw / 600));
          transform: scale(var(--container-scale));
          transform-origin: center center;
        }
      }

    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    // Basic validation - clock module doesn't require any entities
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
