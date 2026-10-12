/**
 * `<uc-rain-radar>` — the live map behind the Rain Radar module.
 *
 * Owns one Leaflet map, a base map layer, one radar tile layer per frame
 * (created on demand, next frame preloaded so the loop doesn't flicker), the
 * marker layer and the play loop. The module class only renders this element
 * and passes `hass`, `module` and `lang`; everything time-based lives here so
 * it can stop cleanly when the element leaves the page.
 */

import { LitElement, html, css, nothing, unsafeCSS, PropertyValues, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import * as L from 'leaflet';
import leafletCss from 'leaflet/dist/leaflet.css?raw';
import type { HomeAssistant } from '../../ha/types';
import type { RainRadarModule } from '../../types';
import { localize } from '../../localize/localize';
import {
  DEFAULT_END_PAUSE,
  DEFAULT_FRAME_DELAY,
  DEFAULT_HEIGHT,
  DEFAULT_OPACITY,
  DEFAULT_ZOOM,
  FRAMES_TTL_MS,
  MAX_ZOOM,
  MIN_ZOOM,
  OPENWEATHER_ATTRIBUTION,
  RAINVIEWER_ATTRIBUTION,
  baseMapFor,
  clampNumber,
  keyedBaseMap,
  loadGoogleBaseMap,
  mapApiKey,
  mapProviderFor,
  entityLatLng,
  frameTileUrl,
  isDarkMode,
  latestObservedIndex,
  loadModuleFrames,
  maxNativeZoomFor,
  minutesFromNow,
  resolveCenter,
  resolveMapStyle,
  sourceKeyFor,
  type BaseMapStyle,
  type RadarFrame,
  type RadarFrameSet,
} from '../../services/uc-rain-radar-service';

/** Universal Blue (RainViewer scheme 2), light drizzle to extreme. Used for the legend only. */
const LEGEND_GRADIENT =
  'linear-gradient(90deg, #9be1ff 0%, #4aa8ff 18%, #1f62e0 36%, #0b2f9f 50%, #ffe500 62%, #ff9a00 74%, #ff3b1f 86%, #d1008f 100%)';

/** Home Assistant's page sends no Referer to other sites; send the origin so tile servers can attribute usage. */
const TILE_REFERRER_POLICY = 'strict-origin-when-cross-origin' as const;
const RETRY_MS = 60 * 1000;
/** Longest we wait for the next frame's tiles before moving on anyway. */
const MAX_PRELOAD_WAIT_MS = 3000;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, ch =>
    ch === '&'
      ? '&amp;'
      : ch === '<'
        ? '&lt;'
        : ch === '>'
          ? '&gt;'
          : ch === '"'
            ? '&quot;'
            : '&#39;'
  );
}

export class UcRainRadar extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) module?: RainRadarModule;
  @property({ attribute: false }) language = 'en';

  @state() private _frames: RadarFrame[] = [];
  @state() private _index = 0;
  @state() private _playing = true;
  @state() private _status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
  @state() private _moved = false;
  @state() private _fullscreen = false;
  /** Fullscreen drawn with CSS where the browser can't (iPhone, some app webviews). */
  @state() private _pseudoFs = false;

  private _map: L.Map | undefined;
  private _baseLayer: L.TileLayer | undefined;
  private _labelsLayer: L.TileLayer | undefined;
  private _baseKey = '';
  private _baseSeq = 0;
  private _viewKey = '';
  private _optionsKey = '';
  private _radarKey = '';
  private _sourceKey = '';
  private _markerKey = '';
  private _markerLayer: L.LayerGroup | undefined;
  private _host = '';
  private _provider: RadarFrameSet['provider'];
  private _layers = new Map<string, L.TileLayer>();
  private _shownPath = '';
  private _autoplayApplied: boolean | undefined;

  private _playTimer: number | undefined;
  private _refreshTimer: number | undefined;
  private _sizeTimer: number | undefined;
  private _sizeTries = 0;
  private _waitedMs = 0;
  private _resizeObserver: ResizeObserver | undefined;
  private _loadSeq = 0;

  static override styles = [
    unsafeCSS(leafletCss),
    css`
      :host {
        display: block;
        width: 100%;
        /* Map overlays (chips, timeline) sit on the map, not on a pane, so they use the card color. */
        --uc-rr-surface: var(--card-background-color, #fff);
      }
      .wrap {
        position: relative;
        isolation: isolate;
        z-index: 0;
        width: 100%;
        overflow: hidden;
        border-radius: inherit;
        background: var(--secondary-background-color, #e5e5e5);
      }
      .map {
        position: absolute;
        inset: 0;
      }
      .leaflet-container {
        font-family: var(--primary-font-family, inherit);
        background: var(--secondary-background-color, #e5e5e5);
      }
      .uc-rr-layer {
        transition: opacity 0.25s ease;
      }
      .leaflet-control-attribution {
        font-size: 9px;
        line-height: 1.4;
        background: rgba(255, 255, 255, 0.6) !important;
        color: #333;
      }
      .leaflet-control-attribution a {
        color: #333;
      }
      .has-controls .leaflet-bottom {
        bottom: 56px;
      }

      /* Overlays */
      .chip {
        position: absolute;
        z-index: 1100;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--uc-rr-surface) 82%, transparent);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
        pointer-events: none;
        max-width: calc(100% - 24px);
        box-sizing: border-box;
      }
      .chip ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
        flex: none;
      }
      .chip span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title {
        top: 10px;
        left: 10px;
      }
      .stamp {
        top: 10px;
        right: 10px;
        font-variant-numeric: tabular-nums;
      }
      .stamp.forecast ha-icon {
        color: var(--warning-color, #ff9800);
      }
      .status {
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-weight: 500;
      }
      .legend {
        left: 10px;
        flex-direction: column;
        align-items: stretch;
        gap: 3px;
        padding: 6px 10px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 500;
        min-width: 110px;
      }
      .legend .bar {
        height: 6px;
        border-radius: 3px;
        background: ${unsafeCSS(LEGEND_GRADIENT)};
      }
      .legend .labels {
        display: flex;
        justify-content: space-between;
        color: var(--secondary-text-color);
      }
      .wrap.fs {
        border-radius: 0;
      }
      .wrap.pseudo-fs {
        position: fixed;
        inset: 0;
        z-index: 9999;
        width: 100vw;
        height: 100vh !important;
        height: 100dvh !important;
      }
      .wrap.has-fs .stamp {
        right: 58px;
      }
      .wrap.has-fs .leaflet-top.leaflet-right {
        top: 50px;
      }
      .fullscreen {
        position: absolute;
        z-index: 1100;
        top: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--uc-rr-surface) 88%, transparent);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      }
      .recenter {
        position: absolute;
        z-index: 1100;
        left: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        background: color-mix(in srgb, var(--uc-rr-surface) 88%, transparent);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      }

      /* Timeline */
      .controls {
        position: absolute;
        z-index: 1100;
        left: 8px;
        right: 8px;
        bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px 4px 4px;
        border-radius: 999px;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--uc-rr-surface) 85%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        box-sizing: border-box;
      }
      .play {
        flex: none;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .play ha-icon {
        --mdc-icon-size: 24px;
      }
      .play:focus-visible,
      .fullscreen:focus-visible,
      .recenter:focus-visible {
        outline: 2px solid var(--primary-text-color);
        outline-offset: 2px;
      }
      .track {
        position: relative;
        flex: 1;
        min-width: 60px;
        height: 44px;
        display: flex;
        align-items: center;
      }
      .ticks {
        position: absolute;
        left: 8px;
        right: 8px;
        top: 50%;
        height: 6px;
        transform: translateY(-50%);
        display: flex;
        gap: 2px;
        pointer-events: none;
      }
      .tick {
        flex: 1;
        border-radius: 2px;
        background: color-mix(in srgb, var(--primary-text-color) 22%, transparent);
      }
      .tick.done {
        background: var(--primary-color);
      }
      .tick.forecast {
        background: repeating-linear-gradient(
          90deg,
          color-mix(in srgb, var(--warning-color, #ff9800) 55%, transparent) 0 3px,
          transparent 3px 5px
        );
      }
      .tick.forecast.done {
        background: var(--warning-color, #ff9800);
      }
      input[type='range'] {
        position: relative;
        width: 100%;
        height: 44px;
        margin: 0;
        background: transparent;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
      }
      input[type='range']::-webkit-slider-runnable-track {
        height: 6px;
        background: transparent;
      }
      input[type='range']::-moz-range-track {
        height: 6px;
        background: transparent;
      }
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        margin-top: -5px;
        border-radius: 50%;
        background: var(--uc-rr-surface);
        border: 3px solid var(--primary-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      input[type='range']::-moz-range-thumb {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--uc-rr-surface);
        border: 3px solid var(--primary-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      input[type='range']:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
        border-radius: 8px;
      }
      .time {
        flex: none;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
        min-width: 64px;
      }
      .time .clock {
        font-size: 14px;
        font-weight: 600;
      }
      .time .rel {
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .time .rel.forecast {
        color: var(--warning-color, #ff9800);
      }

      /* Markers (rendered by Leaflet inside this shadow root) */
      .uc-rr-home {
        position: relative;
      }
      .uc-rr-home .dot {
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 2px solid #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
        box-sizing: border-box;
      }
      .uc-rr-home .pulse {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: var(--primary-color);
        opacity: 0.35;
        animation: uc-rr-pulse 2.4s ease-out infinite;
      }
      @keyframes uc-rr-pulse {
        0% {
          transform: scale(0.4);
          opacity: 0.5;
        }
        100% {
          transform: scale(1.4);
          opacity: 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .uc-rr-home .pulse {
          animation: none;
        }
        .uc-rr-layer {
          transition: none;
        }
      }
      .uc-rr-marker {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .uc-rr-marker .pin {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        box-sizing: border-box;
      }
      .uc-rr-marker .pin img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .uc-rr-marker .pin ha-icon {
        --mdc-icon-size: 18px;
      }
      .uc-rr-marker .name {
        margin-top: 2px;
        padding: 1px 6px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        color: var(--primary-text-color);
        background: color-mix(in srgb, var(--uc-rr-surface) 85%, transparent);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
      }
    `,
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('fullscreenchange', this._onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this._onFullscreenChange);
    if (this._map) {
      this._observeSize();
      this._map.invalidateSize();
      this._scheduleRefresh(this._frames.length ? FRAMES_TTL_MS : 0);
      this._schedulePlay();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('fullscreenchange', this._onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this._onFullscreenChange);
    window.removeEventListener('keydown', this._onKeydown);
    if (this._pseudoFs) document.documentElement.style.removeProperty('overflow');
    this._fullscreen = false;
    this._pseudoFs = false;
    this._clearTimer('_playTimer');
    this._clearTimer('_refreshTimer');
    this._clearTimer('_sizeTimer');
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  protected override firstUpdated(): void {
    this._tryInit();
  }

  protected override updated(changed: PropertyValues): void {
    if (this._map && (changed.has('module') || changed.has('hass'))) this._sync();
    if (this._map && changed.has('_fullscreen')) {
      this._sync();
      this._map.invalidateSize();
      if (!this._fullscreen && this._moved) this._recenter(false);
    }
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────

  private get _wrap(): HTMLElement | null {
    return this.renderRoot?.querySelector('.wrap') as HTMLElement | null;
  }

  private _onFullscreenChange = (): void => {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    const active = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    if (!active && this._fullscreen && !this._pseudoFs) this._fullscreen = false;
  };

  private _onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this._pseudoFs) this._exitFullscreen();
  };

  private async _toggleFullscreen(e: Event): Promise<void> {
    e.stopPropagation();
    if (this._fullscreen) {
      this._exitFullscreen();
      return;
    }
    const el = this._wrap as
      (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }) | null;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else throw new Error('no fullscreen');
      this._pseudoFs = false;
    } catch {
      this._pseudoFs = true;
      document.documentElement.style.setProperty('overflow', 'hidden');
      window.addEventListener('keydown', this._onKeydown);
    }
    this._fullscreen = true;
  }

  private _exitFullscreen(): void {
    if (this._pseudoFs) {
      document.documentElement.style.removeProperty('overflow');
      window.removeEventListener('keydown', this._onKeydown);
      this._pseudoFs = false;
    } else {
      const doc = document as Document & { webkitExitFullscreen?: () => void };
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
      else doc.webkitExitFullscreen?.();
    }
    this._fullscreen = false;
  }

  private _clearTimer(key: '_playTimer' | '_refreshTimer' | '_sizeTimer'): void {
    const id = this[key];
    if (id !== undefined) window.clearTimeout(id);
    this[key] = undefined;
  }

  private get _container(): HTMLElement | null {
    return this.renderRoot?.querySelector('.map') as HTMLElement | null;
  }

  /** Leaflet needs a sized container; wait until layout gives us one. */
  private _tryInit(): void {
    if (this._map || !this.isConnected) return;
    const el = this._container;
    if (!el || !this.module) return;
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      if (typeof ResizeObserver !== 'undefined') {
        this._observeSize();
      } else if (this._sizeTries < 30) {
        this._sizeTries++;
        this._clearTimer('_sizeTimer');
        this._sizeTimer = window.setTimeout(() => this._tryInit(), 400);
      }
      return;
    }
    this._createMap(el);
  }

  private _observeSize(): void {
    if (this._resizeObserver || typeof ResizeObserver === 'undefined') return;
    const el = this._container;
    if (!el) return;
    this._resizeObserver = new ResizeObserver(() => {
      if (!this._map) this._tryInit();
      else this._map.invalidateSize();
    });
    this._resizeObserver.observe(el);
  }

  private _createMap(el: HTMLElement): void {
    const m = this.module;
    const center = m ? resolveCenter(m, this.hass) : null;
    if (!m || !center) return;
    const zoom = clampNumber(m.zoom, MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM);
    try {
      const map = L.map(el, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        zoomSnap: 1,
      }).setView([center.lat, center.lng], zoom);
      map.attributionControl.setPrefix(false);
      map.on('dragstart zoomstart', () => {
        if ((map as unknown as { _ucProgrammatic?: boolean })._ucProgrammatic) return;
        this._moved = true;
      });
      this._map = map;
      this._observeSize();
      this._sync();
    } catch {
      this._map = undefined;
    }
  }

  // ── Sync config → map ──────────────────────────────────────────────────────

  private _sync(): void {
    const map = this._map;
    const m = this.module;
    if (!map || !m) return;

    // Full screen is for exploring, so pan and zoom are always on there.
    const interactive = m.interactive === true || this._fullscreen;
    const zoomControls = m.show_zoom_controls === true || this._fullscreen;
    const optionsKey = `${interactive}|${zoomControls}|${this._fullscreen}`;
    if (optionsKey !== this._optionsKey) {
      this._optionsKey = optionsKey;
      if (this._fullscreen) map.scrollWheelZoom.enable();
      else map.scrollWheelZoom.disable();
      for (const handler of [map.dragging, map.touchZoom, map.doubleClickZoom]) {
        if (!handler) continue;
        if (interactive) handler.enable();
        else handler.disable();
      }
      if (map.zoomControl) map.removeControl(map.zoomControl);
      if (zoomControls) {
        map.zoomControl = L.control.zoom({ position: 'topright' });
        map.addControl(map.zoomControl);
      }
    }

    const center = resolveCenter(m, this.hass);
    const zoom = clampNumber(m.zoom, MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM);
    if (center) {
      const viewKey = `${center.lat.toFixed(4)},${center.lng.toFixed(4)},${zoom}`;
      if (viewKey !== this._viewKey) {
        const first = this._viewKey === '';
        this._viewKey = viewKey;
        if (!first || this._moved) this._recenter(false);
      }
    }

    const style = resolveMapStyle(m.map_style, isDarkMode(this.hass));
    const provider = mapProviderFor(m);
    const mapKey = provider === 'esri' ? '' : mapApiKey(m);
    const baseKey = `${provider}|${style}|${mapKey}`;
    if (baseKey !== this._baseKey) {
      this._baseKey = baseKey;
      void this._applyBase(style, provider, mapKey);
    }

    const radarKey = `${m.smooth !== false}|${m.snow_colors !== false}|${maxNativeZoomFor(m)}`;
    if (radarKey !== this._radarKey) {
      this._radarKey = radarKey;
      this._dropLayers(() => true);
      if (this._frames.length) this._showFrame(this._index);
    } else {
      this._applyOpacity();
    }

    const sourceKey = sourceKeyFor(m);
    if (sourceKey !== this._sourceKey) {
      this._sourceKey = sourceKey;
      this._loadFrames(true);
    }

    const autoplay = m.autoplay !== false;
    if (autoplay !== this._autoplayApplied) {
      this._autoplayApplied = autoplay;
      this._playing = autoplay;
      this._schedulePlay();
    }

    this._syncMarkers();
  }

  /** Pick the base map; a keyed provider that fails falls back to Esri. */
  private async _applyBase(
    style: ReturnType<typeof resolveMapStyle>,
    provider: ReturnType<typeof mapProviderFor>,
    key: string
  ): Promise<void> {
    const seq = ++this._baseSeq;
    let base: BaseMapStyle | null = null;
    if (provider === 'mapbox' || provider === 'maptiler') {
      base = keyedBaseMap(provider, style, key);
    } else if (provider === 'google') {
      try {
        base = await loadGoogleBaseMap(style, key, this.language);
      } catch {
        base = null;
      }
      if (seq !== this._baseSeq || !this._map) return;
    }
    if (base) this._setBaseLayer(base, true, style);
    else this._setBaseLayer(baseMapFor(style), false, style);
  }

  private _setBaseLayer(
    base: BaseMapStyle,
    keyed: boolean,
    style: ReturnType<typeof resolveMapStyle>
  ): void {
    const map = this._map;
    if (!map) return;
    if (this._baseLayer) map.removeLayer(this._baseLayer);
    if (this._labelsLayer) map.removeLayer(this._labelsLayer);
    this._labelsLayer = undefined;
    const layer = L.tileLayer(base.url, {
      attribution: base.attribution,
      maxZoom: base.maxZoom,
      zIndex: 1,
      keepBuffer: 2,
      referrerPolicy: TILE_REFERRER_POLICY,
    }).addTo(map);
    this._baseLayer = layer;
    if (keyed) {
      // A bad key or a provider that refuses the page: switch to Esri rather than show a blank map.
      let loaded = false;
      let errors = 0;
      layer.on('tileload', () => (loaded = true));
      layer.on('tileerror', () => {
        if (loaded || ++errors < 4 || this._baseLayer !== layer) return;
        this._setBaseLayer(baseMapFor(style), false, style);
      });
    } else if (base.labelsUrl) {
      this._labelsLayer = L.tileLayer(base.labelsUrl, {
        maxZoom: base.maxZoom,
        zIndex: 20,
        keepBuffer: 2,
        referrerPolicy: TILE_REFERRER_POLICY,
      }).addTo(map);
    }
  }

  private _recenter(fromButton: boolean): void {
    const map = this._map;
    const m = this.module;
    if (!map || !m) return;
    const center = resolveCenter(m, this.hass);
    if (!center) return;
    const zoom = clampNumber(m.zoom, MIN_ZOOM, MAX_ZOOM, DEFAULT_ZOOM);
    const flags = map as unknown as { _ucProgrammatic?: boolean };
    flags._ucProgrammatic = true;
    map.setView([center.lat, center.lng], zoom, { animate: fromButton });
    flags._ucProgrammatic = false;
    this._moved = false;
  }

  private _syncMarkers(): void {
    const map = this._map;
    const m = this.module;
    if (!map || !m) return;
    const hass = this.hass;
    const home = m.show_home_marker !== false ? resolveCenter({ center_mode: 'home' }, hass) : null;
    const showNames = m.show_marker_names !== false;
    const entries = (m.marker_entities || [])
      .map(entityId => {
        const pos = entityLatLng(hass, entityId);
        if (!pos || !hass) return null;
        const st = hass.states[entityId];
        const attrs = (st?.attributes || {}) as Record<string, unknown>;
        const name = String(attrs.friendly_name || entityId);
        const picture = typeof attrs.entity_picture === 'string' ? attrs.entity_picture : '';
        const icon =
          typeof attrs.icon === 'string'
            ? attrs.icon
            : entityId.startsWith('zone.')
              ? 'mdi:map-marker-radius'
              : 'mdi:account';
        const radius = entityId.startsWith('zone.') ? Number(attrs.radius) || 0 : 0;
        return { entityId, pos, name, picture, icon, radius };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    const key = JSON.stringify([home, showNames, entries]);
    if (key === this._markerKey) return;
    this._markerKey = key;

    if (this._markerLayer) map.removeLayer(this._markerLayer);
    const group = L.layerGroup();
    // SVG stroke attributes can't read CSS variables, so resolve the accent once.
    const accent =
      (typeof getComputedStyle === 'function'
        ? getComputedStyle(this).getPropertyValue('--primary-color').trim()
        : '') || '#03a9f4';
    if (home) {
      L.marker([home.lat, home.lng], {
        icon: L.divIcon({
          className: 'uc-rr-home',
          html: '<span class="pulse"></span><span class="dot"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 500,
      }).addTo(group);
    }
    for (const e of entries) {
      if (e.radius > 0) {
        L.circle([e.pos.lat, e.pos.lng], {
          radius: e.radius,
          color: accent,
          weight: 1.5,
          fillOpacity: 0.08,
          interactive: false,
        }).addTo(group);
      }
      const pin = e.picture
        ? `<img src="${escapeHtml(e.picture)}" alt="">`
        : `<ha-icon icon="${escapeHtml(e.icon)}"></ha-icon>`;
      const label = showNames ? `<span class="name">${escapeHtml(e.name)}</span>` : '';
      L.marker([e.pos.lat, e.pos.lng], {
        icon: L.divIcon({
          className: 'uc-rr-marker',
          html: `<span class="pin">${pin}</span>${label}`,
          iconSize: [30, showNames ? 50 : 30],
          iconAnchor: [15, 15],
        }),
        title: e.name,
        keyboard: false,
        zIndexOffset: 1000,
      })
        .on('click', () => this._moreInfo(e.entityId))
        .addTo(group);
    }
    group.addTo(map);
    this._markerLayer = group;
  }

  private _moreInfo(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId } })
    );
  }

  // ── Frames ─────────────────────────────────────────────────────────────────

  private async _loadFrames(sourceChanged: boolean): Promise<void> {
    const m = this.module;
    if (!m || !this._map) return;
    const seq = ++this._loadSeq;
    if (sourceChanged) {
      this._dropLayers(() => true);
      this._frames = [];
    }
    if (!this._frames.length) this._status = 'loading';
    try {
      const set = await loadModuleFrames(m);
      if (seq !== this._loadSeq || !this._map) return;
      const hostChanged = set.host !== this._host || set.provider !== this._provider;
      this._host = set.host;
      this._provider = set.provider;
      const frames = set.frames;
      const keep = new Set(frames.map(f => f.path));
      this._dropLayers(path => hostChanged || !keep.has(path));
      const wasAtLatest = this._index >= latestObservedIndex(this._frames);
      this._frames = frames;
      if (!this._shownPath || wasAtLatest || this._index >= frames.length) {
        this._index = latestObservedIndex(frames);
      }
      this._status = 'ready';
      this._showFrame(this._index);
      this._schedulePlay();
      this._scheduleRefresh(FRAMES_TTL_MS + 5000);
    } catch {
      if (seq !== this._loadSeq) return;
      if (!this._frames.length) this._status = 'error';
      this._scheduleRefresh(RETRY_MS);
    }
  }

  private _scheduleRefresh(delay: number): void {
    this._clearTimer('_refreshTimer');
    if (!this.isConnected || !this._map) return;
    this._refreshTimer = window.setTimeout(() => this._loadFrames(false), Math.max(0, delay));
  }

  private _dropLayers(match: (path: string) => boolean): void {
    for (const [path, layer] of this._layers) {
      if (!match(path)) continue;
      this._map?.removeLayer(layer);
      this._layers.delete(path);
      if (path === this._shownPath) this._shownPath = '';
    }
  }

  private _layerFor(frame: RadarFrame): L.TileLayer | undefined {
    const map = this._map;
    const m = this.module;
    if (!map || !m || !this._host) return undefined;
    let layer = this._layers.get(frame.path);
    if (!layer) {
      layer = L.tileLayer(
        frameTileUrl({ host: this._host, provider: this._provider }, frame, {
          smooth: m.smooth !== false,
          snow: m.snow_colors !== false,
        }),
        {
          opacity: 0,
          zIndex: 10,
          tileSize: 256,
          maxNativeZoom: maxNativeZoomFor(m),
          maxZoom: MAX_ZOOM,
          attribution: this._provider ? OPENWEATHER_ATTRIBUTION : RAINVIEWER_ATTRIBUTION,
          className: 'uc-rr-layer',
          referrerPolicy: TILE_REFERRER_POLICY,
          keepBuffer: 1,
        }
      ).addTo(map);
      this._layers.set(frame.path, layer);
    }
    return layer;
  }

  private _radarOpacity(): number {
    return clampNumber(this.module?.radar_opacity, 0, 100, DEFAULT_OPACITY) / 100;
  }

  private _applyOpacity(): void {
    const layer = this._shownPath ? this._layers.get(this._shownPath) : undefined;
    layer?.setOpacity(this._radarOpacity());
  }

  private _showFrame(index: number): void {
    const frame = this._frames[index];
    if (!frame) return;
    this._index = index;
    const layer = this._layerFor(frame);
    if (!layer) return;
    if (this._shownPath && this._shownPath !== frame.path) {
      this._layers.get(this._shownPath)?.setOpacity(0);
    }
    layer.setOpacity(this._radarOpacity());
    this._shownPath = frame.path;
    // Preload the next frame so the loop doesn't flash empty tiles.
    const next = this._frames[(index + 1) % this._frames.length];
    if (next && next !== frame) this._layerFor(next);
  }

  // ── Playback ───────────────────────────────────────────────────────────────

  private _schedulePlay(delayOverride?: number): void {
    this._clearTimer('_playTimer');
    if (!this._playing || this._frames.length < 2 || !this.isConnected) return;
    const m = this.module;
    const frameDelay = clampNumber(m?.frame_delay, 150, 3000, DEFAULT_FRAME_DELAY);
    const endPause = clampNumber(m?.end_pause, 0, 10000, DEFAULT_END_PAUSE);
    const atEnd = this._index >= this._frames.length - 1;
    const delay = delayOverride ?? (atEnd ? frameDelay + endPause : frameDelay);
    this._playTimer = window.setTimeout(() => this._tick(), delay);
  }

  private _tick(): void {
    if (!this._playing || !this._frames.length) return;
    // Don't burn tile requests while the dashboard is in a background tab.
    if (typeof document !== 'undefined' && document.hidden) {
      this._schedulePlay(1000);
      return;
    }
    const nextIndex = (this._index + 1) % this._frames.length;
    const next = this._frames[nextIndex];
    const nextLayer = next ? this._layerFor(next) : undefined;
    if (nextLayer?.isLoading() && this._waitedMs < MAX_PRELOAD_WAIT_MS) {
      this._waitedMs += 100;
      this._schedulePlay(100);
      return;
    }
    this._waitedMs = 0;
    this._showFrame(nextIndex);
    this._schedulePlay();
  }

  private _togglePlay(e: Event): void {
    e.stopPropagation();
    this._playing = !this._playing;
    if (this._playing && this._index >= this._frames.length - 1) this._showFrame(0);
    this._schedulePlay();
  }

  private _onScrub(e: Event): void {
    e.stopPropagation();
    const value = Number((e.target as HTMLInputElement).value);
    if (!Number.isFinite(value)) return;
    this._playing = false;
    this._clearTimer('_playTimer');
    this._showFrame(Math.round(value));
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  private _t(key: string, fallback: string): string {
    return localize(`editor.rain_radar.${key}`, this.language, fallback);
  }

  private _relativeLabel(frame: RadarFrame): string {
    const mins = minutesFromNow(frame.time, Date.now());
    if (Math.abs(mins) < 5 && !frame.forecast) return this._t('now', 'Now');
    if (mins < 0) return this._t('minutes_ago', '{n} min ago').replace('{n}', String(-mins));
    return this._t('in_minutes', 'In {n} min').replace('{n}', String(Math.max(0, mins)));
  }

  private _clockLabel(frame: RadarFrame): string {
    try {
      return new Intl.DateTimeFormat(this.language || undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(frame.time * 1000));
    } catch {
      return new Date(frame.time * 1000).toLocaleTimeString();
    }
  }

  protected override render(): TemplateResult {
    const m = this.module;
    const height = clampNumber(m?.height, 120, 1000, DEFAULT_HEIGHT);
    const showFs = m?.show_fullscreen !== false;
    const fsLabel = this._fullscreen
      ? this._t('exit_fullscreen', 'Exit full screen')
      : this._t('fullscreen', 'Full screen');
    const showControls = m?.show_controls !== false;
    const showStamp = m?.show_timestamp !== false;
    const frame = this._frames[this._index];
    const title = (m?.title || '').trim();
    const showTitle = m?.show_title !== false && !!title;
    const hasFrames = this._frames.length > 0;
    const legendBottom = showControls && hasFrames ? 64 : 10;
    const recenterTop = showTitle ? 52 : 10;

    return html`
      <div
        class="wrap ${showControls && hasFrames ? 'has-controls' : ''} ${showFs ? 'has-fs' : ''} ${
          this._fullscreen ? 'fs' : ''
        } ${this._pseudoFs ? 'pseudo-fs' : ''}"
        style="height:${this._fullscreen ? '100%' : `${height}px`}"
      >
        <div class="map"></div>
        ${
          showFs
            ? html`<button
                type="button"
                class="fullscreen"
                aria-label=${fsLabel}
                title=${fsLabel}
                @click=${(e: Event) => this._toggleFullscreen(e)}
              >
                <ha-icon
                  icon=${this._fullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'}
                ></ha-icon>
              </button>`
            : nothing
        }
        ${
          showTitle
            ? html`<div class="chip title">
                <ha-icon icon="mdi:weather-pouring"></ha-icon><span>${title}</span>
              </div>`
            : nothing
        }
        ${
          showStamp && frame && !showControls
            ? html`<div class="chip stamp ${frame.forecast ? 'forecast' : ''}">
                <ha-icon
                  icon=${frame.forecast ? 'mdi:crystal-ball' : 'mdi:clock-outline'}
                ></ha-icon>
                <span>${this._clockLabel(frame)} · ${this._relativeLabel(frame)}</span>
              </div>`
            : nothing
        }
        ${
          // The legend shows RainViewer's colors; OpenWeather uses its own palette.
          m?.show_legend !== false && hasFrames && !this._provider
            ? html`<div class="chip legend" style="bottom:${legendBottom}px" aria-hidden="true">
                <div class="bar"></div>
                <div class="labels">
                  <span>${this._t('legend_light', 'Light')}</span>
                  <span>${this._t('legend_heavy', 'Heavy')}</span>
                </div>
              </div>`
            : nothing
        }
        ${
          this._moved && m?.interactive === true
            ? html`<button
                type="button"
                class="recenter"
                style="top:${recenterTop}px"
                aria-label=${this._t('recenter', 'Back to center')}
                title=${this._t('recenter', 'Back to center')}
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._recenter(true);
                }}
              >
                <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
              </button>`
            : nothing
        }
        ${
          this._status === 'loading'
            ? html`<div class="chip status" role="status">
                <ha-icon icon="mdi:radar"></ha-icon
                ><span>${this._t('loading', 'Loading radar…')}</span>
              </div>`
            : this._status === 'error'
              ? html`<div class="chip status" role="status">
                  <ha-icon icon="mdi:cloud-alert"></ha-icon
                  ><span>${this._t('unavailable', 'Radar unavailable, retrying soon')}</span>
                </div>`
              : nothing
        }
        ${showControls && hasFrames && frame ? this._renderControls(frame) : nothing}
      </div>
    `;
  }

  private _renderControls(frame: RadarFrame): TemplateResult {
    const last = this._frames.length - 1;
    const playLabel = this._playing ? this._t('pause', 'Pause') : this._t('play', 'Play');
    return html`
      <div class="controls" @click=${(e: Event) => e.stopPropagation()}>
        <button
          type="button"
          class="play"
          aria-label=${playLabel}
          title=${playLabel}
          @click=${(e: Event) => this._togglePlay(e)}
        >
          <ha-icon icon=${this._playing ? 'mdi:pause' : 'mdi:play'}></ha-icon>
        </button>
        <div class="track">
          <div class="ticks">
            ${this._frames.map(
              (f, i) =>
                html`<span
                  class="tick ${f.forecast ? 'forecast' : ''} ${i <= this._index ? 'done' : ''}"
                ></span>`
            )}
          </div>
          <input
            type="range"
            min="0"
            max=${last}
            step="1"
            .value=${String(this._index)}
            aria-label=${this._t('timeline', 'Radar time')}
            aria-valuetext=${`${this._clockLabel(frame)}, ${this._relativeLabel(frame)}`}
            @input=${(e: Event) => this._onScrub(e)}
          />
        </div>
        ${
          this.module?.show_timestamp !== false
            ? html`<div class="time">
                <span class="clock">${this._clockLabel(frame)}</span>
                <span class="rel ${frame.forecast ? 'forecast' : ''}"
                  >${this._relativeLabel(frame)}</span
                >
              </div>`
            : nothing
        }
      </div>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('uc-rain-radar')) {
  customElements.define('uc-rain-radar', UcRainRadar);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-rain-radar': UcRainRadar;
  }
}
