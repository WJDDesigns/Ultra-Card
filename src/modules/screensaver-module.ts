import { TemplateResult, html, nothing, render as litRender } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { ScreensaverModule as ScreensaverModuleConfig, CardModule, UltraCardConfig } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTime(date: Date, use24h: boolean): string {
  if (use24h) return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const h = date.getHours();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}:${pad(date.getMinutes())} ${am ? 'AM' : 'PM'}`;
}

function formatTimeWithSeconds(date: Date, use24h: boolean): string {
  if (use24h) return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  const h = date.getHours();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDate(date: Date, lang: string): string {
  return date.toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDateShort(date: Date, lang: string): string {
  return date.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' })
    .toUpperCase();
}

function weatherIcon(state: string | undefined): string {
  const map: Record<string, string> = {
    'sunny':           'mdi:weather-sunny',
    'clear-night':     'mdi:weather-night',
    'cloudy':          'mdi:weather-cloudy',
    'partlycloudy':    'mdi:weather-partly-cloudy',
    'fog':             'mdi:weather-fog',
    'hail':            'mdi:weather-hail',
    'lightning':       'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy',
    'pouring':         'mdi:weather-pouring',
    'rainy':           'mdi:weather-rainy',
    'snowy':           'mdi:weather-snowy',
    'snowy-rainy':     'mdi:weather-snowy-rainy',
    'windy':           'mdi:weather-windy',
    'windy-variant':   'mdi:weather-windy-variant',
    'exceptional':     'mdi:alert-circle-outline',
  };
  return state ? (map[state] ?? 'mdi:weather-partly-cloudy') : 'mdi:weather-partly-cloudy';
}

type OverlayStyle = NonNullable<ScreensaverModuleConfig['overlay_style']>;

const STYLE_LABELS: Record<OverlayStyle, string> = {
  classic:     'Classic',
  minimal:     'Minimal',
  neon:        'Neon',
  retro:       'Retro',
  frosted:     'Frosted Glass',
  photo_corner:'Photo Corner',
  sunrise:     'Sunrise',
  dark_luxe:   'Dark Luxe',
  split:       'Split',
  ambient:     'Ambient',
};

/**
 * Screensaver Pro Module
 *
 * Activates a full-screen overlay after a configurable idle timeout.
 * Shows a clock, optional weather, and an optional image slideshow.
 * Dismisses on tap / keyboard interaction.
 *
 * The overlay is rendered into a <div> appended directly to document.body
 * (a "portal"), completely outside the card's shadow DOM. This ensures
 * position:fixed truly covers 100vw×100vh regardless of CSS transforms on
 * any ancestor card or HA container element.
 */
export class UltraScreensaverModule extends BaseUltraModule {
  private _active = false;
  private _idleTimer: ReturnType<typeof setTimeout> | null = null;
  private _clockTimer: ReturnType<typeof setInterval> | null = null;
  private _slideshowTimer: ReturnType<typeof setInterval> | null = null;
  private _slideIndex = 0;
  private _now = new Date();
  private _initialized = false;
  private _currentModule: ScreensaverModuleConfig | null = null;
  private _currentHass: HomeAssistant | null = null;
  private _currentConfig: UltraCardConfig | undefined = undefined;
  /** Portal div appended to document.body while screensaver is active */
  private _portal: HTMLElement | null = null;
  /**
   * Timestamp of the last MANUAL tap-dismiss (ms).
   * Only set by the user tapping the overlay — not by entity-driven dismissal.
   */
  private _lastManualDismissAt = 0;
  /** Previous entity state — used to detect transitions, not poll on every render. */
  private _prevEntityState: string | null = null;

  override handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'screensaver',
    title: 'Screensaver',
    description: 'Kiosk screensaver that activates after idle with clock, weather, and image slideshow',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:television-play',
    category: 'media',
    tags: ['screensaver', 'kiosk', 'clock', 'slideshow', 'idle', 'pro', 'premium'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): ScreensaverModuleConfig {
    return {
      id: id || this.generateId('screensaver'),
      type: 'screensaver',
      idle_timeout: 60,
      show_clock: true,
      clock_24h: false,
      show_date: true,
      show_weather: true,
      weather_entity: '',
      image_urls: [],
      image_interval: 10,
      activation_entity: '',
      trigger_buffer: 5,
      overlay_style: 'classic',
      overlay_opacity: 90,
      overlay_color: '#000000',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    return { valid: errors.length === 0, errors };
  }

  // ── Idle timer lifecycle ──────────────────────────────────────────────────

  private _resetIdleTimer(timeoutSec: number): void {
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => this._activateFromIdle(), timeoutSec * 1000);
  }

  private _activateFromIdle(): void {
    if (this._active) return;
    const timeoutMs = Math.max(10000, (this._currentModule?.idle_timeout ?? 60) * 1000);
    if (this._lastManualDismissAt > 0 && Date.now() - this._lastManualDismissAt < timeoutMs) {
      const remaining = timeoutMs - (Date.now() - this._lastManualDismissAt);
      this._resetIdleTimer(remaining / 1000);
      return;
    }
    this._doActivate();
  }

  private _activateFromEntity(): void {
    if (this._active) return;
    const bufferMs = Math.max(0, (this._currentModule?.trigger_buffer ?? 5) * 1000);
    if (this._lastManualDismissAt > 0 && Date.now() - this._lastManualDismissAt < bufferMs) return;
    this._doActivate();
  }

  private _doActivate(): void {
    this._active = true;
    this._slideIndex = 0;
    this._createPortal();
    this._startClockTick();
    this._startSlideshow();
    this.triggerPreviewUpdate(true);
  }

  /** Manual tap-dismiss — sets the guard timestamp. */
  private _dismiss(): void {
    if (!this._active) return;
    this._active = false;
    this._lastManualDismissAt = Date.now();
    this._destroyPortal();
    this._stopSlideshow();
    const timeout = Math.max(10, this._currentModule?.idle_timeout ?? 60);
    this._resetIdleTimer(timeout);
    this.triggerPreviewUpdate(true);
  }

  /** Entity-driven dismiss — does NOT set the guard. */
  private _dismissFromEntity(): void {
    if (!this._active) return;
    this._active = false;
    this._destroyPortal();
    this._stopSlideshow();
    this.triggerPreviewUpdate(true);
  }

  private _startClockTick(): void {
    if (this._clockTimer) clearInterval(this._clockTimer);
    this._clockTimer = setInterval(() => {
      this._now = new Date();
      if (this._active) this._updatePortal();
    }, 1000);
  }

  private _startSlideshow(): void {
    if (this._slideshowTimer) clearInterval(this._slideshowTimer);
    const images = this._currentModule?.image_urls ?? [];
    if (images.length < 2) return;
    const interval = (this._currentModule?.image_interval ?? 10) * 1000;
    this._slideshowTimer = setInterval(() => {
      this._slideIndex = (this._slideIndex + 1) % images.length;
      if (this._active) this._updatePortal();
    }, interval);
  }

  private _stopSlideshow(): void {
    if (this._slideshowTimer) { clearInterval(this._slideshowTimer); this._slideshowTimer = null; }
  }

  private _initListeners(timeoutSec: number): void {
    if (this._initialized) return;
    this._initialized = true;
    const reset = () => {
      if (!this._active) this._resetIdleTimer(timeoutSec);
    };
    document.addEventListener('pointermove', reset, { passive: true });
    document.addEventListener('pointerdown', reset, { passive: true });
    document.addEventListener('keydown',     reset, { passive: true });
    document.addEventListener('touchstart',  reset, { passive: true });
    this._resetIdleTimer(timeoutSec);
    this._startClockTick();
  }

  // ── Portal management ─────────────────────────────────────────────────────

  private _createPortal(): void {
    if (this._portal) return;
    this._portal = document.createElement('div');
    this._portal.setAttribute('data-uc-screensaver', '');
    document.body.appendChild(this._portal);
    this._updatePortal();
  }

  private _updatePortal(): void {
    if (!this._portal || !this._currentModule || !this._currentHass) return;
    litRender(this._buildOverlay(this._currentModule, this._currentHass, this._currentConfig), this._portal);
  }

  private _destroyPortal(): void {
    if (!this._portal) return;
    litRender(nothing, this._portal);
    this._portal.remove();
    this._portal = null;
  }

  // ── Overlay builder ───────────────────────────────────────────────────────
  // IMPORTANT: Lit does NOT support spreading a TemplateResult as element
  // attributes (e.g. <div ${someHtmlResult}>). All @click / @keydown handlers
  // MUST be explicit attributes on the literal div tag — never via a spread.
  // This method uses a switch to compute style-specific content, then wraps
  // everything in ONE outer <div> that owns all event bindings.

  private _buildOverlay(
    m: ScreensaverModuleConfig,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined
  ): TemplateResult {
    const lang      = hass?.locale?.language || 'en';
    const use24h    = !!m.clock_24h;
    const now       = this._now;
    const timeStr   = formatTime(now, use24h);
    const dateStr   = formatDate(now, lang);
    const dateShort = formatDateShort(now, lang);

    const images  = m.image_urls ?? [];
    const bgImage = images.length > 0 ? images[this._slideIndex % images.length] : null;
    const imgCss  = bgImage
      ? `linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)),url('${bgImage}') center/cover no-repeat`
      : 'none';

    const weatherEntityId  = m.weather_entity
      ? (this.resolveEntity(m.weather_entity, config) || m.weather_entity) : null;
    const weatherState     = weatherEntityId ? hass?.states?.[weatherEntityId] : null;
    const weatherCondition = weatherState?.state;
    const weatherTemp      = weatherState?.attributes?.temperature;
    const weatherUnit      = (weatherState?.attributes?.temperature_unit as string | undefined)
      ?? ((hass?.config as any)?.unit_system?.temperature ?? '°C');
    const hasWeather       = m.show_weather !== false && !!weatherCondition;

    const overlayColor = m.overlay_color || '#000000';
    const style        = m.overlay_style || 'classic';

    // ── Shared fragments ────────────────────────────────────────────────────
    const bgLayer = bgImage
      ? html`<div class="uc-ss-bg-img" style="background:${imgCss};"></div>` : nothing;
    const hint = html`
      <div class="uc-ss-hint">
        ${localize('editor.screensaver.tap_to_dismiss', lang, 'Tap anywhere to dismiss')}
      </div>`;
    const dots = images.length > 1 ? html`
      <div class="uc-ss-dots" aria-hidden="true">
        ${images.map((_, i) => html`
          <span class="uc-ss-dot ${i === this._slideIndex ? 'uc-ss-dot--active' : ''}"></span>`)}
      </div>` : nothing;
    const wx = (color = 'rgba(255,255,255,0.9)', size = 28) => !hasWeather ? nothing : html`
      <div class="uc-ss-weather">
        <ha-icon icon="${weatherIcon(weatherCondition)}"
          style="--mdc-icon-size:${size}px; color:${color};"></ha-icon>
        ${weatherTemp !== undefined
          ? html`<span class="uc-ss-weather__temp" style="color:${color};">
              ${Math.round(Number(weatherTemp))}${weatherUnit}</span>` : nothing}
      </div>`;

    // ── Per-style: extra CSS class, inline background, inner body ──────────
    let cls  = '';
    let bg   = '';
    let body: TemplateResult;

    switch (style) {
      case 'minimal':
        cls  = 'uc-ss-minimal';
        bg   = bgImage ? `background:${imgCss}` : 'background-color:rgba(0,0,0,0.18)';
        body = html`${bgLayer}
          <div class="uc-ss-minimal-content">
            ${m.show_date  !== false ? html`<div class="uc-ss-minimal-date">${dateShort}</div>` : nothing}
            ${m.show_clock !== false ? html`<div class="uc-ss-minimal-clock">${timeStr}</div>` : nothing}
          </div>${hint}`;
        break;

      case 'neon':
        cls  = 'uc-ss-neon';
        bg   = '';
        body = html`<div class="uc-ss-content">
          ${m.show_clock !== false ? html`<div class="uc-ss-neon-clock">${timeStr}</div>` : nothing}
          ${m.show_date  !== false ? html`<div class="uc-ss-neon-date">${dateShort}</div>` : nothing}
          ${wx('#00d4ff', 24)}${hint}${dots}</div>`;
        break;

      case 'retro': {
        cls  = 'uc-ss-retro';
        bg   = '';
        const ampm = !use24h
          ? html`<span class="uc-ss-retro-ampm">${now.getHours() < 12 ? 'AM' : 'PM'}</span>` : nothing;
        body = html`<div class="uc-ss-scanlines"></div>
          <div class="uc-ss-content">
            <div class="uc-ss-retro-clock">
              <span>${use24h
                ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
                : `${now.getHours() % 12 || 12}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
              }</span>${ampm}</div>
            ${m.show_date !== false ? html`
              <div class="uc-ss-retro-date">
                ${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())}</div>` : nothing}
            ${hasWeather ? html`
              <div class="uc-ss-retro-weather">&gt;&nbsp;${weatherCondition?.toUpperCase()}
                ${weatherTemp !== undefined
                  ? html`&nbsp;/&nbsp;${Math.round(Number(weatherTemp))}${weatherUnit}` : nothing}
              </div>` : nothing}
            ${hint}${dots}</div>`;
        break;
      }

      case 'frosted':
        cls  = 'uc-ss-frosted';
        bg   = 'background-color:rgba(0,0,0,0.45)';
        body = html`${bgLayer}
          <div class="uc-ss-frosted-panel">
            ${m.show_clock !== false ? html`<div class="uc-ss-clock">${timeStr}</div>` : nothing}
            ${m.show_date  !== false ? html`<div class="uc-ss-date">${dateStr}</div>` : nothing}
            ${wx()}${dots}</div>${hint}`;
        break;

      case 'photo_corner':
        cls  = 'uc-ss-photo-corner';
        bg   = bgImage ? `background:${imgCss}` : 'background-color:rgba(0,0,0,0.12)';
        body = html`${bgLayer}
          ${hasWeather ? html`
            <div class="uc-ss-corner-weather">
              <ha-icon icon="${weatherIcon(weatherCondition)}"
                style="--mdc-icon-size:20px; color:rgba(255,255,255,0.85);"></ha-icon>
              ${weatherTemp !== undefined
                ? html`<span class="uc-ss-corner-temp">${Math.round(Number(weatherTemp))}${weatherUnit}</span>`
                : nothing}</div>` : nothing}
          <div class="uc-ss-corner-content">
            ${m.show_date  !== false ? html`<div class="uc-ss-corner-date">${dateShort}</div>` : nothing}
            ${m.show_clock !== false ? html`<div class="uc-ss-corner-clock">${timeStr}</div>` : nothing}
          </div>${hint}${dots}`;
        break;

      case 'sunrise':
        cls  = 'uc-ss-sunrise';
        bg   = '';
        body = html`<div class="uc-ss-content">
          ${m.show_clock !== false ? html`<div class="uc-ss-sunrise-clock">${timeStr}</div>` : nothing}
          ${m.show_date  !== false ? html`<div class="uc-ss-sunrise-date">${dateStr}</div>` : nothing}
          ${wx('rgba(255,255,255,0.92)', 28)}${hint}${dots}</div>`;
        break;

      case 'dark_luxe':
        cls  = 'uc-ss-dark-luxe';
        bg   = '';
        body = html`<div class="uc-ss-content">
          ${m.show_clock !== false ? html`<div class="uc-ss-luxe-clock">${timeStr}</div>` : nothing}
          <div class="uc-ss-luxe-rule"></div>
          ${m.show_date !== false ? html`<div class="uc-ss-luxe-date">${dateShort}</div>` : nothing}
          ${hasWeather ? html`
            <div class="uc-ss-luxe-weather">
              <ha-icon icon="${weatherIcon(weatherCondition)}"
                style="--mdc-icon-size:18px; color:#c9a84c;"></ha-icon>
              ${weatherTemp !== undefined
                ? html`<span style="color:#c9a84c;">${Math.round(Number(weatherTemp))}${weatherUnit}</span>`
                : nothing}</div>` : nothing}
          ${hint}${dots}</div>`;
        break;

      case 'split':
        cls  = 'uc-ss-split';
        bg   = bgImage ? `background:${imgCss}` : `background-color:${overlayColor}`;
        body = html`${bgLayer}
          <div class="uc-ss-split-left">
            ${m.show_clock !== false ? html`<div class="uc-ss-split-clock">${timeStr}</div>` : nothing}
          </div>
          <div class="uc-ss-split-divider"></div>
          <div class="uc-ss-split-right">
            ${m.show_date !== false ? html`<div class="uc-ss-split-date">${dateStr}</div>` : nothing}
            ${wx('rgba(255,255,255,0.85)', 22)}${hint}${dots}</div>`;
        break;

      case 'ambient':
        cls  = 'uc-ss-ambient';
        bg   = '';
        body = html`
          <div class="uc-ss-orb uc-ss-orb--1"></div>
          <div class="uc-ss-orb uc-ss-orb--2"></div>
          <div class="uc-ss-orb uc-ss-orb--3"></div>
          <div class="uc-ss-content">
            ${m.show_clock !== false ? html`<div class="uc-ss-ambient-clock">${timeStr}</div>` : nothing}
            ${m.show_date  !== false ? html`<div class="uc-ss-ambient-date">${dateStr}</div>` : nothing}
            ${wx('rgba(255,255,255,0.8)', 26)}${hint}${dots}</div>`;
        break;

      default: // classic
        cls  = 'uc-ss-classic';
        bg   = bgImage ? `background:${imgCss}` : `background-color:${overlayColor}`;
        body = html`${bgLayer}
          <div class="uc-ss-content">
            ${m.show_clock !== false ? html`<div class="uc-ss-clock">${timeStr}</div>` : nothing}
            ${m.show_date  !== false ? html`<div class="uc-ss-date">${dateStr}</div>` : nothing}
            ${wx()}${hint}${dots}</div>`;
        break;
    }

    // ── Single outer div — @click and @keydown bound explicitly ────────────
    return html`
      <style>${this._overlayStyles()}</style>
      <div
        class="uc-ss-overlay ${cls}"
        style="${bg}"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        aria-label="${localize('editor.screensaver.overlay_label', lang, 'Screensaver — tap to dismiss')}"
        @click=${() => this._dismiss()}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') this._dismiss();
        }}
      >${body}</div>`;
  }

  // ── Inline preview box (card slot) ───────────────────────────────────────

  /**
   * Renders a style-faithful preview box inside the card.
   * Each style's signature background + scaled clock/date/weather is shown
   * in a contained 180 px box so the user can see exactly what the screensaver
   * will look like without waiting for the idle timeout to fire.
   */
  private _buildPreviewBox(
    m: ScreensaverModuleConfig,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    lang: string
  ): TemplateResult {
    const style      = m.overlay_style || 'classic';
    const styleName  = STYLE_LABELS[style];
    const now        = this._now;
    const use24h     = !!m.clock_24h;
    const timeStr    = formatTime(now, use24h);
    const dateShort  = formatDateShort(now, lang);

    const images  = m.image_urls ?? [];
    const bgImage = images.length > 0 ? images[this._slideIndex % images.length] : null;

    const weatherEntityId  = m.weather_entity
      ? (this.resolveEntity(m.weather_entity, config) || m.weather_entity) : null;
    const weatherState     = weatherEntityId ? hass?.states?.[weatherEntityId] : null;
    const weatherCondition = weatherState?.state;
    const weatherTemp      = weatherState?.attributes?.temperature;
    const weatherUnit      = (weatherState?.attributes?.temperature_unit as string | undefined)
      ?? ((hass?.config as any)?.unit_system?.temperature ?? '°C');
    const hasWeather       = m.show_weather !== false && !!weatherCondition;

    const overlayColor = m.overlay_color || '#000000';
    const bgImgStyle   = bgImage
      ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url('${bgImage}') center/cover no-repeat`
      : 'none';

    const pvWeather = !hasWeather ? nothing : html`
      <div class="uc-ss-pv-weather">
        <ha-icon icon="${weatherIcon(weatherCondition)}" style="--mdc-icon-size:16px;"></ha-icon>
        ${weatherTemp !== undefined
          ? html`<span>${Math.round(Number(weatherTemp))}${weatherUnit}</span>`
          : nothing}
      </div>
    `;

    // Style-specific scene content ──────────────────────────────────────────

    // 1 ─ CLASSIC
    if (style === 'classic') {
      return html`
        <div class="uc-ss-pv-scene" style="background:${overlayColor}; ${bgImage ? `background:${bgImgStyle};` : ''}">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div class="uc-ss-pv-center">
            ${m.show_clock !== false ? html`<div class="uc-ss-pv-clock">${timeStr}</div>` : nothing}
            ${m.show_date  !== false ? html`<div class="uc-ss-pv-date">${dateShort}</div>` : nothing}
            ${pvWeather}
          </div>
        </div>
      `;
    }

    // 2 ─ MINIMAL
    if (style === 'minimal') {
      return html`
        <div class="uc-ss-pv-scene" style="background:${bgImage ? bgImgStyle : 'rgba(0,0,0,0.55)'};">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div class="uc-ss-pv-corner-bl">
            ${m.show_date  !== false ? html`<div class="uc-ss-pv-date" style="font-size:.55rem; letter-spacing:.1em;">${dateShort}</div>` : nothing}
            ${m.show_clock !== false ? html`<div class="uc-ss-pv-clock" style="font-size:2.8rem; font-weight:100; line-height:.9;">${timeStr}</div>` : nothing}
          </div>
        </div>
      `;
    }

    // 3 ─ NEON
    if (style === 'neon') {
      return html`
        <div class="uc-ss-pv-scene" style="background:#0a0a0a;">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div class="uc-ss-pv-center">
            ${m.show_clock !== false ? html`
              <div class="uc-ss-pv-clock" style="
                color:#00d4ff;
                text-shadow: 0 0 8px #00d4ff, 0 0 24px #00d4ff, 0 0 50px #0077ff;">
                ${timeStr}
              </div>
            ` : nothing}
            ${m.show_date !== false ? html`
              <div class="uc-ss-pv-date" style="color:#00aaff; opacity:.65; letter-spacing:.14em;">${dateShort}</div>
            ` : nothing}
          </div>
        </div>
      `;
    }

    // 4 ─ RETRO
    if (style === 'retro') {
      return html`
        <div class="uc-ss-pv-scene" style="background:#030c00; font-family:'Courier New',monospace; overflow:hidden;">
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px);pointer-events:none;z-index:1;"></div>
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div class="uc-ss-pv-center" style="position:relative;z-index:2;">
            ${m.show_clock !== false ? html`
              <div class="uc-ss-pv-clock" style="
                color:#39ff14;
                font-family:'Courier New',monospace;
                text-shadow:0 0 8px #39ff14,0 0 20px rgba(57,255,20,.4);">
                ${formatTimeWithSeconds(now, use24h)}
              </div>
            ` : nothing}
            ${m.show_date !== false ? html`
              <div class="uc-ss-pv-date" style="color:#39ff14;opacity:.6;font-family:'Courier New',monospace;letter-spacing:.1em;">
                ${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())}
              </div>
            ` : nothing}
          </div>
        </div>
      `;
    }

    // 5 ─ FROSTED
    if (style === 'frosted') {
      return html`
        <div class="uc-ss-pv-scene" style="background:${bgImage ? bgImgStyle : 'linear-gradient(135deg,#1a1a2e,#2d2d4e)'}; align-items:center; justify-content:center;">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div style="
            position:relative; z-index:1;
            padding:18px 28px;
            border-radius:16px;
            background:rgba(255,255,255,0.07);
            backdrop-filter:blur(20px) saturate(1.5);
            -webkit-backdrop-filter:blur(20px) saturate(1.5);
            border:1px solid rgba(255,255,255,0.13);
            box-shadow:0 4px 24px rgba(0,0,0,0.35);
            display:flex; flex-direction:column; align-items:center; gap:6px;">
            ${m.show_clock !== false ? html`<div class="uc-ss-pv-clock">${timeStr}</div>` : nothing}
            ${m.show_date  !== false ? html`<div class="uc-ss-pv-date">${dateShort}</div>` : nothing}
            ${pvWeather}
          </div>
        </div>
      `;
    }

    // 6 ─ PHOTO CORNER
    if (style === 'photo_corner') {
      return html`
        <div class="uc-ss-pv-scene" style="background:${bgImage ? bgImgStyle : 'linear-gradient(135deg,#111,#2a2a2a)'};">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          ${hasWeather ? html`
            <div style="position:absolute;top:10px;right:12px;z-index:2;display:flex;align-items:center;gap:4px;color:rgba(255,255,255,.8);font-size:.7rem;">
              <ha-icon icon="${weatherIcon(weatherCondition)}" style="--mdc-icon-size:14px;"></ha-icon>
              ${weatherTemp !== undefined ? html`${Math.round(Number(weatherTemp))}${weatherUnit}` : nothing}
            </div>
          ` : nothing}
          <div class="uc-ss-pv-corner-bl">
            ${m.show_date  !== false ? html`<div class="uc-ss-pv-date" style="font-size:.55rem; letter-spacing:.1em;">${dateShort}</div>` : nothing}
            ${m.show_clock !== false ? html`<div class="uc-ss-pv-clock" style="font-size:2.6rem; font-weight:200; line-height:.9;">${timeStr}</div>` : nothing}
          </div>
        </div>
      `;
    }

    // 7 ─ SUNRISE
    if (style === 'sunrise') {
      return html`
        <div class="uc-ss-pv-scene" style="background:linear-gradient(-45deg,#ff9a3c,#ff6b35,#ff3d5a,#9b1b30,#6a0572);">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div class="uc-ss-pv-center">
            ${m.show_clock !== false ? html`<div class="uc-ss-pv-clock" style="color:rgba(255,255,255,.97);">${timeStr}</div>` : nothing}
            ${m.show_date  !== false ? html`<div class="uc-ss-pv-date" style="color:rgba(255,255,255,.8);">${dateShort}</div>` : nothing}
            ${pvWeather}
          </div>
        </div>
      `;
    }

    // 8 ─ DARK LUXE
    if (style === 'dark_luxe') {
      return html`
        <div class="uc-ss-pv-scene" style="background:#0a0a08;">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div class="uc-ss-pv-center">
            ${m.show_clock !== false ? html`
              <div class="uc-ss-pv-clock" style="color:#c9a84c; text-shadow:0 0 30px rgba(201,168,76,.2);">${timeStr}</div>
            ` : nothing}
            <div style="width:36px;height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);margin:2px auto;"></div>
            ${m.show_date !== false ? html`
              <div class="uc-ss-pv-date" style="color:rgba(201,168,76,.6); letter-spacing:.18em;">${dateShort}</div>
            ` : nothing}
            ${hasWeather ? html`
              <div class="uc-ss-pv-weather" style="color:#c9a84c;">
                <ha-icon icon="${weatherIcon(weatherCondition)}" style="--mdc-icon-size:14px;"></ha-icon>
                ${weatherTemp !== undefined ? html`<span>${Math.round(Number(weatherTemp))}${weatherUnit}</span>` : nothing}
              </div>
            ` : nothing}
          </div>
        </div>
      `;
    }

    // 9 ─ SPLIT
    if (style === 'split') {
      return html`
        <div class="uc-ss-pv-scene" style="background:${overlayColor}; flex-direction:row; ${bgImage ? `background:${bgImgStyle};` : ''}">
          ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
          <div style="flex:1.3; display:flex; align-items:center; justify-content:center; padding:12px 8px 12px 16px;">
            ${m.show_clock !== false ? html`<div class="uc-ss-pv-clock" style="font-size:2.2rem; white-space:nowrap;">${timeStr}</div>` : nothing}
          </div>
          <div style="width:1px; align-self:stretch; background:linear-gradient(180deg,transparent,rgba(255,255,255,.18),transparent); margin:16px 0; flex-shrink:0;"></div>
          <div style="flex:1; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding:12px 16px 12px 10px; gap:6px;">
            ${m.show_date !== false ? html`<div class="uc-ss-pv-date" style="font-size:.65rem; text-align:left;">${dateShort}</div>` : nothing}
            ${pvWeather}
          </div>
        </div>
      `;
    }

    // 10 ─ AMBIENT
    return html`
      <div class="uc-ss-pv-scene" style="background:linear-gradient(-45deg,#0d0d1a,#1a0d2e,#0d1a2e,#2e0d1a); overflow:hidden;">
        <div style="position:absolute; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle,rgba(124,58,237,.5),transparent 70%); top:-20%; left:-10%; filter:blur(40px); pointer-events:none;"></div>
        <div style="position:absolute; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(14,165,233,.45),transparent 70%); bottom:-25%; right:-10%; filter:blur(50px); pointer-events:none;"></div>
        <div style="position:absolute; width:140px; height:140px; border-radius:50%; background:radial-gradient(circle,rgba(236,72,153,.45),transparent 70%); top:30%; left:55%; filter:blur(35px); pointer-events:none;"></div>
        ${this._pvBadge(styleName, this._active)} ${this._pvSecondaryBadge(m.idle_timeout ?? 60)}
        <div class="uc-ss-pv-center" style="position:relative; z-index:1;">
          ${m.show_clock !== false ? html`
            <div class="uc-ss-pv-clock" style="text-shadow:0 0 40px rgba(124,58,237,.4);">${timeStr}</div>
          ` : nothing}
          ${m.show_date !== false ? html`
            <div class="uc-ss-pv-date" style="color:rgba(255,255,255,.55);">${dateShort}</div>
          ` : nothing}
          ${pvWeather}
        </div>
      </div>
    `;
  }

  /** Style name badge — top-left of preview box */
  private _pvBadge(name: string, live: boolean): TemplateResult {
    return html`
      <div class="uc-ss-pv-badge ${live ? 'uc-ss-pv-badge--live' : ''}">
        ${live ? html`<span class="uc-ss-pv-live-dot"></span>` : nothing}
        ${live ? 'LIVE' : name}
      </div>
    `;
  }

  /** Idle-timeout secondary badge — top-right of preview box */
  private _pvSecondaryBadge(seconds: number): TemplateResult {
    return html`
      <div class="uc-ss-pv-timer-badge">
        <ha-icon icon="mdi:timer-outline" style="--mdc-icon-size:11px;"></ha-icon>
        ${seconds}s
      </div>
    `;
  }

  // ── Card-visibility helper ────────────────────────────────────────────────

  /**
   * Returns true when the screensaver is the only module in the entire card.
   * Used to decide whether to hide the card container itself on the dashboard.
   */
  private _isOnlyModule(config: UltraCardConfig | undefined): boolean {
    const rows = config?.layout?.rows;
    if (!rows?.length) return true;
    let total = 0;
    for (const row of rows) {
      for (const col of (row.columns ?? [])) {
        total += (col.modules?.length ?? 0);
        if (total > 1) return false; // short-circuit
      }
    }
    return total <= 1;
  }

  // ── renderPreview (card slot) ─────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _ctx?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m    = module as ScreensaverModuleConfig;
    const lang = hass?.locale?.language || 'en';

    this._currentModule = m;
    this._currentHass   = hass;
    this._currentConfig = config;

    // Entity transition detection
    const entityId    = m.activation_entity
      ? (this.resolveEntity(m.activation_entity, config) || m.activation_entity) : null;
    const entityState = entityId ? (hass?.states?.[entityId]?.state ?? null) : null;

    if (entityId) {
      const wasOn = this._prevEntityState === 'on';
      const isOn  = entityState === 'on';
      if (isOn && !wasOn && !this._active) this._activateFromEntity();
      else if (!isOn && wasOn && this._active) this._dismissFromEntity();
    }
    this._prevEntityState = entityState;

    this._initListeners(m.idle_timeout ?? 60);
    if (this._active) this._updatePortal();

    const hoverClass = this.getHoverEffectClass(module);
    const inEditor   = _ctx === 'ha-preview';

    // ── Live dashboard: invisible when inactive, dismiss bar when active ──────
    if (!inEditor) {
      if (!this._active) {
        if (this._isOnlyModule(config)) {
          // Only module in card: hide the ha-card container entirely via the
          // shadow-DOM :host selector so the card takes no space on the page.
          // The next re-render (on activation) removes this style automatically.
          return html`<style>:host { display:none !important; }</style>`;
        }
        // Other modules provide visible content — just contribute nothing.
        return html``;
      }
      // Screensaver is active (full-screen portal is showing): surface a
      // minimal dismiss control so the user can end it from the dashboard too.
      return html`
        <style>${this.getStyles()}</style>
        <div class="uc-ss-card-footer uc-ss-card-footer--standalone">
          <span class="uc-ss-card-footer__label">
            ${localize('editor.screensaver.active_label', lang, 'Screensaver active')}
          </span>
          <button type="button" class="uc-ss-card-footer__btn"
            @click=${(e: Event) => { e.stopPropagation(); this._dismiss(); }}>
            ${localize('editor.screensaver.dismiss', lang, 'Dismiss')}
          </button>
        </div>
      `;
    }

    // ── Editor (ha-preview): show the full style preview box ─────────────────
    return html`
      <style>${this.getStyles()}</style>
      <div class="uc-ss-card ${hoverClass}">
        ${this._buildPreviewBox(m, hass, config, lang)}
        ${this._active ? html`
          <div class="uc-ss-card-footer">
            <span class="uc-ss-card-footer__label">
              ${localize('editor.screensaver.active_label', lang, 'Screensaver active')}
            </span>
            <button type="button" class="uc-ss-card-footer__btn"
              @click=${(e: Event) => { e.stopPropagation(); this._dismiss(); }}>
              ${localize('editor.screensaver.dismiss', lang, 'Dismiss')}
            </button>
          </div>
        ` : nothing}
      </div>
    `;
  }

  // ── Editor ────────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m    = module as ScreensaverModuleConfig;
    const lang = hass?.locale?.language || 'en';

    const styleOptions = (Object.keys(STYLE_LABELS) as OverlayStyle[]).map(k => ({
      value: k,
      label: STYLE_LABELS[k],
    }));

    // Styles that have their own background and ignore overlay_color/opacity
    const styleUsesOverlay = !['neon','retro','sunrise','dark_luxe','ambient'].includes(m.overlay_style ?? 'classic');

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">

        <!-- ── STYLE ───────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.screensaver.style_section', lang, 'Style'),
          localize('editor.screensaver.style_desc', lang, 'Visual theme for the screensaver overlay.'),
          [
            {
              title: localize('editor.screensaver.overlay_style', lang, 'Style'),
              description: '',
              hass,
              data: { overlay_style: m.overlay_style || 'classic' },
              schema: [this.selectField('overlay_style', styleOptions)],
              onChange: (e: CustomEvent) => {
                updateModule({ overlay_style: e.detail.value?.overlay_style || 'classic' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        <!-- ── ACTIVATION ──────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.screensaver.timing_section', lang, 'Activation'),
          localize('editor.screensaver.timing_desc', lang, 'When the screensaver should appear.'),
          []
        )}
        ${this.renderSliderField(
          localize('editor.screensaver.idle_timeout', lang, 'Idle timeout'),
          localize('editor.screensaver.idle_timeout_desc', lang, 'Seconds of inactivity before activating'),
          m.idle_timeout ?? 60, 60, 30, 600, 5,
          (v: number) => updateModule({ idle_timeout: v } as Partial<CardModule>),
          's'
        )}

        <!-- ── ACTIVATION ENTITY ───────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.screensaver.entity_section', lang, 'Activation Entity (optional)'),
          localize('editor.screensaver.entity_desc', lang, 'A binary_sensor that forces the screensaver on when its state is "on".'),
          []
        )}
        <div style="margin-bottom:16px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'activation_entity', m.activation_entity || '',
            (value: string) => updateModule({ activation_entity: value }),
            ['binary_sensor'],
            localize('editor.screensaver.activation_entity', lang, 'Activation entity (optional)')
          )}
        </div>
        ${this.renderSliderField(
          localize('editor.screensaver.trigger_buffer', lang, 'Trigger buffer'),
          localize('editor.screensaver.trigger_buffer_desc', lang, 'Seconds to wait after a manual dismiss before the entity can re-trigger'),
          m.trigger_buffer ?? 5, 5, 0, 60, 1,
          (v: number) => updateModule({ trigger_buffer: v } as Partial<CardModule>),
          's'
        )}

        <!-- ── CLOCK ───────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.screensaver.clock_section', lang, 'Clock & Date'),
          '',
          [
            {
              title: localize('editor.screensaver.show_clock', lang, 'Show clock'),
              description: '',
              hass,
              data: { show_clock: m.show_clock !== false },
              schema: [this.booleanField('show_clock')],
              onChange: (e: CustomEvent) => updateModule({ show_clock: e.detail.value?.show_clock ?? true }),
            },
            {
              title: localize('editor.screensaver.clock_24h', lang, '24-hour format'),
              description: localize('editor.screensaver.clock_24h_desc', lang, 'Use 24h time instead of AM/PM'),
              hass,
              data: { clock_24h: !!m.clock_24h },
              schema: [this.booleanField('clock_24h')],
              onChange: (e: CustomEvent) => updateModule({ clock_24h: e.detail.value?.clock_24h ?? false }),
            },
            {
              title: localize('editor.screensaver.show_date', lang, 'Show date'),
              description: '',
              hass,
              data: { show_date: m.show_date !== false },
              schema: [this.booleanField('show_date')],
              onChange: (e: CustomEvent) => updateModule({ show_date: e.detail.value?.show_date ?? true }),
            },
          ]
        )}

        <!-- ── WEATHER ─────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.screensaver.weather_section', lang, 'Weather'),
          '',
          [
            {
              title: localize('editor.screensaver.show_weather', lang, 'Show weather'),
              description: '',
              hass,
              data: { show_weather: m.show_weather !== false },
              schema: [this.booleanField('show_weather')],
              onChange: (e: CustomEvent) => updateModule({ show_weather: e.detail.value?.show_weather ?? true }),
            },
          ]
        )}
        ${m.show_weather !== false ? html`
          <div style="margin-bottom:24px;">
            ${this.renderEntityPickerWithVariables(
              hass, config, 'weather_entity', m.weather_entity || '',
              (value: string) => updateModule({ weather_entity: value }),
              ['weather'],
              localize('editor.screensaver.weather_entity', lang, 'Weather entity')
            )}
          </div>
        ` : nothing}

        <!-- ── OVERLAY (only for styles that use it) ───────── -->
        ${styleUsesOverlay ? html`
          ${this.renderSettingsSection(
            localize('editor.screensaver.overlay_section', lang, 'Overlay'),
            localize('editor.screensaver.overlay_desc', lang, 'Background colour and opacity.'),
            [
              {
                title: localize('editor.screensaver.overlay_color', lang, 'Overlay color'),
                description: '',
                hass,
                data: { overlay_color: m.overlay_color || '#000000' },
                schema: [{ name: 'overlay_color', selector: { color_rgb: {} } }],
                onChange: (e: CustomEvent) => {
                  const v = e.detail.value?.overlay_color;
                  if (v) updateModule({ overlay_color: v });
                },
              },
            ]
          )}
          ${this.renderSliderField(
            localize('editor.screensaver.overlay_opacity', lang, 'Overlay opacity'),
            '',
            m.overlay_opacity ?? 90, 90, 0, 100, 5,
            (v: number) => updateModule({ overlay_opacity: v } as Partial<CardModule>),
            '%'
          )}
        ` : nothing}

        <!-- ── IMAGE SLIDESHOW ─────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.screensaver.images_section', lang, 'Image Slideshow (optional)'),
          localize('editor.screensaver.images_desc', lang, 'One URL per line to cycle as the screensaver background.'),
          []
        )}
        ${this.renderFieldSection(
          localize('editor.screensaver.image_urls', lang, 'Image URLs'),
          localize('editor.screensaver.image_urls_desc', lang, 'https:// or /local/ paths, one per line'),
          hass,
          { image_urls_text: (m.image_urls ?? []).join('\n') },
          [{ name: 'image_urls_text', selector: { text: { multiline: true } } }],
          (e: CustomEvent) => {
            const raw  = (e.detail.value?.image_urls_text as string) ?? '';
            const urls = raw.split('\n').map((s: string) => s.trim()).filter(Boolean);
            updateModule({ image_urls: urls } as Partial<CardModule>);
          }
        )}
        ${this.renderSliderField(
          localize('editor.screensaver.image_interval', lang, 'Image interval'),
          '',
          m.image_interval ?? 10, 10, 3, 120, 1,
          (v: number) => updateModule({ image_interval: v } as Partial<CardModule>),
          's'
        )}

      </div>
    `;
  }

  // ── CSS (card-scoped — preview box) ─────────────────────────────────────

  getStyles(): string {
    return `
      /* ── Card wrapper ──────────────────────────────────────────────── */
      .uc-ss-card {
        display: flex;
        flex-direction: column;
        gap: 0;
        border-radius: 14px;
        overflow: hidden;
        box-sizing: border-box;
        border: 1px solid color-mix(in srgb, var(--divider-color) 35%, transparent);
      }

      /* ── Preview scene box ─────────────────────────────────────────── */
      .uc-ss-pv-scene {
        position: relative;
        width: 100%;
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-sizing: border-box;
      }

      /* Center content column */
      .uc-ss-pv-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        z-index: 1;
        pointer-events: none;
        user-select: none;
      }

      /* Bottom-left content column (minimal, photo_corner) */
      .uc-ss-pv-corner-bl {
        position: absolute;
        bottom: 18px;
        left: 22px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 1;
        pointer-events: none;
        user-select: none;
      }

      /* Clock text */
      .uc-ss-pv-clock {
        font-size: 2.6rem;
        font-weight: 200;
        letter-spacing: -0.03em;
        color: rgba(255,255,255,0.95);
        line-height: 1;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 2px 20px rgba(0,0,0,0.5);
      }

      /* Date text */
      .uc-ss-pv-date {
        font-size: 0.65rem;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.6);
      }

      /* Weather row */
      .uc-ss-pv-weather {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 400;
        color: rgba(255,255,255,0.75);
        pointer-events: none;
      }

      /* Style name badge — top-left */
      .uc-ss-pv-badge {
        position: absolute;
        top: 10px;
        left: 12px;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 9px;
        border-radius: 999px;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.12);
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.75);
        pointer-events: none;
        user-select: none;
      }
      .uc-ss-pv-badge--live {
        background: rgba(220,38,38,0.6);
        border-color: rgba(255,100,100,0.35);
        color: #fff;
      }
      .uc-ss-pv-live-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ff4444;
        box-shadow: 0 0 6px #ff4444;
        animation: uc-ss-pv-blink 1.2s ease-in-out infinite;
        flex-shrink: 0;
      }
      @keyframes uc-ss-pv-blink { 0%,100%{opacity:1} 50%{opacity:.3} }

      /* Idle timer badge — top-right */
      .uc-ss-pv-timer-badge {
        position: absolute;
        top: 10px;
        right: 12px;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.1);
        font-size: 0.6rem;
        font-weight: 600;
        color: rgba(255,255,255,0.55);
        pointer-events: none;
        user-select: none;
      }

      /* ── Active footer bar ─────────────────────────────────────────── */
      .uc-ss-card-footer--standalone {
        border-radius: 12px;
        border-top: none;
      }
      .uc-ss-card-footer {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)));
        border-top: 1px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
      }
      .uc-ss-card-footer__label {
        flex: 1;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--primary-color);
        letter-spacing: 0.02em;
      }
      .uc-ss-card-footer__btn {
        font: inherit;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 999px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--primary-color) 45%, transparent);
        background: transparent;
        color: var(--primary-color);
        transition: background 0.12s;
      }
      .uc-ss-card-footer__btn:hover {
        background: color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
    `;
  }

  // ── CSS (portal-global — injected into document.body portal) ────────────

  private _overlayStyles(): string {
    return `
      /* ── Base overlay ──────────────────────────────────────────────── */
      .uc-ss-overlay {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9800;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        outline: none;
        overflow: hidden;
        font-family: system-ui, -apple-system, sans-serif;
        animation: uc-ss-fadein 0.5s ease forwards;
      }
      @keyframes uc-ss-fadein { from { opacity:0; } to { opacity:1; } }
      @media (prefers-reduced-motion: reduce) { .uc-ss-overlay { animation: none; } }

      .uc-ss-bg-img {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        pointer-events: none;
      }

      /* Shared content column */
      .uc-ss-content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
        padding: 32px;
        pointer-events: none;
        user-select: none;
      }

      /* Shared weather row */
      .uc-ss-weather {
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
      }
      .uc-ss-weather__temp {
        font-size: 1.4rem;
        font-weight: 300;
        letter-spacing: -0.02em;
      }

      /* Shared dismiss hint */
      .uc-ss-hint {
        margin-top: 16px;
        font-size: 0.72rem;
        font-weight: 500;
        color: rgba(255,255,255,0.35);
        letter-spacing: 0.07em;
        text-transform: uppercase;
        pointer-events: none;
        user-select: none;
        animation: uc-ss-hint-pulse 3s ease-in-out infinite;
      }
      @keyframes uc-ss-hint-pulse { 0%,100%{opacity:.35} 50%{opacity:.6} }
      @media (prefers-reduced-motion: reduce) { .uc-ss-hint { animation: none; } }

      /* Shared slideshow dots */
      .uc-ss-dots { display:flex; gap:6px; margin-top:8px; pointer-events:none; }
      .uc-ss-dot {
        width:6px; height:6px; border-radius:50%;
        background:rgba(255,255,255,0.3);
        transition: background .3s, transform .3s;
      }
      .uc-ss-dot--active { background:rgba(255,255,255,0.9); transform:scale(1.3); }

      /* Shared clock/date base */
      .uc-ss-clock {
        font-size: clamp(3rem, 12vw, 7rem);
        font-weight: 200;
        letter-spacing: -0.04em;
        color: rgba(255,255,255,0.95);
        line-height: 1;
        text-shadow: 0 2px 32px rgba(0,0,0,0.4);
        font-feature-settings: "tnum";
        font-variant-numeric: tabular-nums;
      }
      .uc-ss-date {
        font-size: clamp(0.875rem, 2.5vw, 1.375rem);
        font-weight: 400;
        color: rgba(255,255,255,0.7);
        letter-spacing: 0.04em;
        text-transform: uppercase;
        text-shadow: 0 1px 12px rgba(0,0,0,0.3);
      }

      /* ═══════════════════════════════════════════════════════════════
         1 ─ CLASSIC  (dark overlay, centered)
         ═══════════════════════════════════════════════════════════════ */
      /* uses base .uc-ss-clock / .uc-ss-date */

      /* ═══════════════════════════════════════════════════════════════
         2 ─ MINIMAL  (huge clock bottom-left)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-minimal {
        align-items: flex-end;
        justify-content: flex-start;
      }
      .uc-ss-minimal-content {
        position: relative;
        z-index: 1;
        padding: 40px 48px;
        pointer-events: none;
        user-select: none;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .uc-ss-minimal-date {
        font-size: clamp(0.7rem, 1.8vw, 1rem);
        font-weight: 500;
        color: rgba(255,255,255,0.55);
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .uc-ss-minimal-clock {
        font-size: clamp(4rem, 16vw, 10rem);
        font-weight: 100;
        letter-spacing: -0.05em;
        color: rgba(255,255,255,0.9);
        line-height: 0.9;
        text-shadow: 0 4px 40px rgba(0,0,0,0.3);
        font-variant-numeric: tabular-nums;
      }

      /* ═══════════════════════════════════════════════════════════════
         3 ─ NEON  (black bg, cyan glow)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-neon { background: #0a0a0a !important; }
      .uc-ss-neon-clock {
        font-size: clamp(3rem, 13vw, 8rem);
        font-weight: 300;
        letter-spacing: -0.02em;
        color: #00d4ff;
        line-height: 1;
        font-variant-numeric: tabular-nums;
        text-shadow:
          0 0 8px #00d4ff,
          0 0 25px #00d4ff,
          0 0 55px #00aaff,
          0 0 90px #0077ff;
        animation: uc-ss-neon-flicker 9s ease-in-out infinite;
      }
      @keyframes uc-ss-neon-flicker {
        0%,90%,100% { opacity:1; }
        91%          { opacity:.75; }
        93%          { opacity:1; }
        95%          { opacity:.8; }
        97%          { opacity:1; }
      }
      @media (prefers-reduced-motion: reduce) { .uc-ss-neon-clock { animation:none; } }
      .uc-ss-neon-date {
        font-size: clamp(0.75rem, 2vw, 1.2rem);
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #00aaff;
        opacity: 0.7;
        text-shadow: 0 0 12px #00aaff;
      }

      /* ═══════════════════════════════════════════════════════════════
         4 ─ RETRO  (green terminal, scanlines)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-retro {
        background: #030c00 !important;
        font-family: 'Courier New', Courier, monospace !important;
      }
      .uc-ss-scanlines {
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent 0px, transparent 2px,
          rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px
        );
        pointer-events: none;
        z-index: 2;
      }
      .uc-ss-retro .uc-ss-content { font-family: 'Courier New', Courier, monospace; }
      .uc-ss-retro-clock {
        font-size: clamp(2.5rem, 10vw, 6rem);
        font-weight: 400;
        letter-spacing: 0.06em;
        color: #39ff14;
        line-height: 1;
        text-shadow: 0 0 10px #39ff14, 0 0 25px rgba(57,255,20,0.4);
        font-variant-numeric: tabular-nums;
      }
      .uc-ss-retro-ampm {
        font-size: 0.4em;
        opacity: 0.8;
        margin-left: 8px;
        vertical-align: middle;
      }
      .uc-ss-retro-date {
        font-size: clamp(0.85rem, 2.2vw, 1.4rem);
        letter-spacing: 0.12em;
        color: #39ff14;
        opacity: 0.65;
        text-shadow: 0 0 8px rgba(57,255,20,0.5);
      }
      .uc-ss-retro-weather {
        font-size: clamp(0.75rem, 1.8vw, 1.1rem);
        letter-spacing: 0.1em;
        color: #39ff14;
        opacity: 0.55;
      }

      /* ═══════════════════════════════════════════════════════════════
         5 ─ FROSTED  (glass panel)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-frosted-panel {
        position: relative;
        z-index: 1;
        padding: 40px 52px;
        border-radius: 28px;
        background: rgba(255,255,255,0.07);
        backdrop-filter: blur(28px) saturate(1.6);
        -webkit-backdrop-filter: blur(28px) saturate(1.6);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: 0 8px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        pointer-events: none;
        user-select: none;
      }

      /* ═══════════════════════════════════════════════════════════════
         6 ─ PHOTO CORNER  (content bottom-left)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-photo-corner {
        align-items: flex-end;
        justify-content: flex-start;
      }
      .uc-ss-corner-content {
        position: relative;
        z-index: 1;
        padding: 32px 40px;
        pointer-events: none;
        user-select: none;
      }
      .uc-ss-corner-clock {
        font-size: clamp(3.5rem, 14vw, 9rem);
        font-weight: 200;
        letter-spacing: -0.04em;
        color: #fff;
        line-height: 1;
        text-shadow: 0 2px 24px rgba(0,0,0,0.6);
        font-variant-numeric: tabular-nums;
      }
      .uc-ss-corner-date {
        font-size: clamp(0.7rem, 1.8vw, 1rem);
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.7);
        margin-bottom: 6px;
        text-shadow: 0 1px 10px rgba(0,0,0,0.5);
      }
      .uc-ss-corner-weather {
        position: absolute;
        top: 28px;
        right: 32px;
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 6px;
        pointer-events: none;
      }
      .uc-ss-corner-temp {
        font-size: 1.1rem;
        font-weight: 300;
        color: rgba(255,255,255,0.85);
        text-shadow: 0 1px 10px rgba(0,0,0,0.5);
      }

      /* ═══════════════════════════════════════════════════════════════
         7 ─ SUNRISE  (warm animated gradient)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-sunrise {
        background: linear-gradient(-45deg, #ff9a3c, #ff6b35, #ff3d5a, #c0392b, #9b1b30, #6a0572);
        background-size: 400% 400%;
        animation: uc-ss-sunrise-shift 14s ease infinite, uc-ss-fadein 0.5s ease forwards;
      }
      @keyframes uc-ss-sunrise-shift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @media (prefers-reduced-motion: reduce) { .uc-ss-sunrise { animation: uc-ss-fadein 0.5s ease forwards; } }
      .uc-ss-sunrise-clock {
        font-size: clamp(3rem, 13vw, 8rem);
        font-weight: 300;
        letter-spacing: -0.03em;
        color: rgba(255,255,255,0.97);
        line-height: 1;
        text-shadow: 0 2px 30px rgba(0,0,0,0.25);
        font-variant-numeric: tabular-nums;
      }
      .uc-ss-sunrise-date {
        font-size: clamp(0.875rem, 2.4vw, 1.35rem);
        font-weight: 400;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.8);
      }

      /* ═══════════════════════════════════════════════════════════════
         8 ─ DARK LUXE  (near-black, gold)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-dark-luxe { background: #0a0a08 !important; }
      .uc-ss-luxe-clock {
        font-size: clamp(3.5rem, 14vw, 9rem);
        font-weight: 200;
        letter-spacing: -0.02em;
        color: #c9a84c;
        line-height: 1;
        text-shadow: 0 2px 40px rgba(201,168,76,0.25);
        font-variant-numeric: tabular-nums;
      }
      .uc-ss-luxe-rule {
        width: 48px;
        height: 1px;
        background: linear-gradient(90deg, transparent, #c9a84c, transparent);
        margin: 2px 0;
        border: none;
      }
      .uc-ss-luxe-date {
        font-size: clamp(0.7rem, 2vw, 1.1rem);
        font-weight: 500;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: rgba(201,168,76,0.65);
      }
      .uc-ss-luxe-weather {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.9rem;
        font-weight: 400;
        letter-spacing: 0.06em;
        margin-top: 4px;
        pointer-events: none;
      }

      /* ═══════════════════════════════════════════════════════════════
         9 ─ SPLIT  (left: clock, right: date + weather)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-split {
        flex-direction: row !important;
        align-items: stretch;
      }
      .uc-ss-split-left {
        flex: 1.4;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 32px 48px 48px;
        position: relative;
        z-index: 1;
        pointer-events: none;
        user-select: none;
      }
      .uc-ss-split-clock {
        font-size: clamp(2.5rem, 9vw, 6.5rem);
        font-weight: 200;
        letter-spacing: -0.04em;
        color: rgba(255,255,255,0.95);
        line-height: 1;
        text-shadow: 0 2px 32px rgba(0,0,0,0.4);
        font-variant-numeric: tabular-nums;
        word-break: keep-all;
        white-space: nowrap;
      }
      .uc-ss-split-divider {
        width: 1px;
        align-self: stretch;
        background: linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent);
        margin: 40px 0;
        flex-shrink: 0;
        pointer-events: none;
      }
      .uc-ss-split-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        padding: 48px 48px 48px 32px;
        gap: 14px;
        position: relative;
        z-index: 1;
        pointer-events: none;
        user-select: none;
      }
      .uc-ss-split-date {
        font-size: clamp(0.9rem, 2.4vw, 1.5rem);
        font-weight: 300;
        color: rgba(255,255,255,0.8);
        letter-spacing: 0.02em;
        line-height: 1.4;
      }
      /* override weather alignment for split */
      .uc-ss-split .uc-ss-weather { align-self: flex-start; }
      .uc-ss-split .uc-ss-hint    { align-self: flex-start; margin-top: 8px; }
      .uc-ss-split .uc-ss-dots    { align-self: flex-start; }

      /* ═══════════════════════════════════════════════════════════════
         10 ─ AMBIENT  (animated gradient + floating orbs)
         ═══════════════════════════════════════════════════════════════ */
      .uc-ss-ambient {
        background: linear-gradient(-45deg, #0d0d1a, #1a0d2e, #0d1a2e, #1a1a0d, #2e0d1a);
        background-size: 500% 500%;
        animation: uc-ss-ambient-shift 16s ease infinite, uc-ss-fadein 0.5s ease forwards;
      }
      @keyframes uc-ss-ambient-shift {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @media (prefers-reduced-motion: reduce) { .uc-ss-ambient { animation: uc-ss-fadein 0.5s ease forwards; } }
      .uc-ss-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(70px);
        opacity: 0;
        animation: uc-ss-orb-appear 1s ease forwards, uc-ss-orb-float linear infinite;
        pointer-events: none;
      }
      @keyframes uc-ss-orb-appear { from { opacity:0; } to { opacity:0.35; } }
      @keyframes uc-ss-orb-float {
        0%,100% { transform: translate(0,0) scale(1); }
        33%     { transform: translate(40px,-30px) scale(1.06); }
        66%     { transform: translate(-25px,20px) scale(0.94); }
      }
      .uc-ss-orb--1 {
        width: 380px; height: 380px;
        background: radial-gradient(circle, #7c3aed, transparent 70%);
        top: -8%; left: -6%;
        animation-duration: 1s, 22s;
      }
      .uc-ss-orb--2 {
        width: 480px; height: 480px;
        background: radial-gradient(circle, #0ea5e9, transparent 70%);
        bottom: -12%; right: -8%;
        animation-duration: 1s, 28s;
        animation-delay: 0.2s, 0s;
      }
      .uc-ss-orb--3 {
        width: 300px; height: 300px;
        background: radial-gradient(circle, #ec4899, transparent 70%);
        top: 35%; left: 55%;
        animation-duration: 1s, 19s;
        animation-delay: 0.4s, 5s;
      }
      .uc-ss-ambient-clock {
        font-size: clamp(3rem, 12vw, 7.5rem);
        font-weight: 200;
        letter-spacing: -0.04em;
        color: rgba(255,255,255,0.92);
        line-height: 1;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 0 60px rgba(124,58,237,0.4);
      }
      .uc-ss-ambient-date {
        font-size: clamp(0.875rem, 2.4vw, 1.35rem);
        font-weight: 300;
        color: rgba(255,255,255,0.6);
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
    `;
  }
}
