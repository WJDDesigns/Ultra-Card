/**
 * Free Rain Radar module — an animated precipitation radar loop over a map,
 * centered on the Home Assistant home location out of the box.
 *
 * Simple: drop it in and it works (home location, zoom 7, the last two hours
 * looping with a play / scrub timeline). Advanced: center on a person or
 * device tracker or fixed coordinates, map style (auto light / dark, streets,
 * satellite), radar opacity, forecast frames, speed, markers for people and
 * zones, pan / zoom, and a RainViewer-compatible source URL for self-hosters.
 *
 * Radar comes from RainViewer's free, keyless public API; the map itself is
 * rendered by `<uc-rain-radar>` (Leaflet, shared with the Map module chunk).
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import type {
  CardModule,
  RainRadarCenterMode,
  RainRadarMapStyle,
  RainRadarModule,
  UltraCardConfig,
} from '../types';
import { localize } from '../localize/localize';
import './rain-radar/uc-rain-radar-map';
import {
  DEFAULT_END_PAUSE,
  DEFAULT_FRAME_DELAY,
  DEFAULT_HEIGHT,
  DEFAULT_OPACITY,
  DEFAULT_TIME_SPAN,
  DEFAULT_ZOOM,
  LOCATION_ENTITY_DOMAINS,
  MAX_ZOOM,
  MIN_ZOOM,
  TIME_SPAN_OPTIONS,
  homeLatLng,
  resolveCenter,
} from '../services/uc-rain-radar-service';

type UpdateFn = (updates: Partial<CardModule>) => void;

export class UltraRainRadarModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'rain_radar',
    title: 'Rain Radar',
    description:
      'Animated rain radar over a map, centered on your home, with a play and scrub timeline',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:weather-pouring',
    category: 'data',
    tags: ['rain', 'radar', 'weather', 'precipitation', 'map', 'rainviewer', 'storm'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): RainRadarModule {
    return {
      id: id || this.generateId('rain_radar'),
      type: 'rain_radar',
      title: '',
      show_title: true,
      center_mode: 'home',
      center_entity: '',
      zoom: DEFAULT_ZOOM,
      height: DEFAULT_HEIGHT,
      map_style: 'auto',
      radar_opacity: DEFAULT_OPACITY,
      smooth: true,
      snow_colors: true,
      autoplay: true,
      frame_delay: DEFAULT_FRAME_DELAY,
      end_pause: DEFAULT_END_PAUSE,
      show_forecast: true,
      time_span: DEFAULT_TIME_SPAN,
      show_controls: true,
      show_timestamp: true,
      show_legend: true,
      show_home_marker: true,
      marker_entities: [],
      show_marker_names: true,
      interactive: false,
      show_zoom_controls: false,
      source_url: '',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /** Lenient: a missing location shows the empty state instead of blanking the card. */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as RainRadarModule;
    const ids = [...(m.marker_entities || [])];
    if (m.center_mode === 'entity' && m.center_entity) ids.push(m.center_entity);
    if (!ids.includes('zone.home')) ids.push('zone.home');
    return ids;
  }

  // ── General tab ──────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as RainRadarModule;
    const lang = hass?.locale?.language || 'en';
    const t = (key: string, fallback: string) =>
      localize(`editor.rain_radar.${key}`, lang, fallback);

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this._renderLocationSection(m, hass, updateModule, lang)}
        ${this._renderMapSection(m, hass, updateModule, lang)}
        ${this._renderDisplaySection(m, hass, updateModule, lang)}
        ${this._renderAnimationSection(m, hass, updateModule, lang)}
        ${this.renderConditionalFieldsGroup(
          t('advanced_section', 'Advanced'),
          this._renderAdvancedFields(m, hass, updateModule, lang)
        )}
      </div>
    `;
  }

  private _renderLocationSection(
    m: RainRadarModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const t = (key: string, fallback: string) =>
      localize(`editor.rain_radar.${key}`, lang, fallback);
    const mode: RainRadarCenterMode = m.center_mode || 'home';
    const home = homeLatLng(hass);

    return html`
      <div class="settings-section">
        <div class="section-title">${t('location_section', 'Location')}</div>
        ${this.renderSegmentedField(
          t('center_mode', 'Center on'),
          mode === 'home' && !home
            ? t(
                'center_home_missing',
                'Home Assistant has no home location set. Pick an entity or enter coordinates instead.'
              )
            : t('center_mode_desc', 'Where the radar map is centered.'),
          mode,
          [
            { value: 'home', label: t('center_home', 'Home'), icon: 'mdi:home' },
            { value: 'entity', label: t('center_entity', 'Entity'), icon: 'mdi:account' },
            {
              value: 'manual',
              label: t('center_manual', 'Coordinates'),
              icon: 'mdi:crosshairs-gps',
            },
          ],
          (next: string) => {
            updateModule({ center_mode: (next || 'home') as RainRadarCenterMode });
            this.triggerPreviewUpdate();
          }
        )}
        ${
          mode === 'entity'
            ? this.renderFieldSection(
                t('center_entity_field', 'Center entity'),
                t(
                  'center_entity_desc',
                  'A person, device tracker or zone. The map follows it as it moves.'
                ),
                hass,
                { center_entity: m.center_entity || '' },
                [this.entityField('center_entity', LOCATION_ENTITY_DOMAINS)],
                (e: CustomEvent) => {
                  updateModule({ center_entity: e.detail.value?.center_entity ?? '' });
                  this.triggerPreviewUpdate();
                }
              )
            : nothing
        }
        ${
          mode === 'manual'
            ? html`
                ${this.renderFieldSection(
                  t('latitude', 'Latitude'),
                  t('latitude_desc', 'Decimal degrees, -90 to 90.'),
                  hass,
                  { latitude: m.latitude ?? home?.lat ?? '' },
                  [this.numberField('latitude', -90, 90, 0.0001)],
                  (e: CustomEvent) => {
                    const v = Number(e.detail.value?.latitude);
                    updateModule({ latitude: Number.isFinite(v) ? v : undefined });
                    this.triggerPreviewUpdate();
                  }
                )}
                ${this.renderFieldSection(
                  t('longitude', 'Longitude'),
                  t('longitude_desc', 'Decimal degrees, -180 to 180.'),
                  hass,
                  { longitude: m.longitude ?? home?.lng ?? '' },
                  [this.numberField('longitude', -180, 180, 0.0001)],
                  (e: CustomEvent) => {
                    const v = Number(e.detail.value?.longitude);
                    updateModule({ longitude: Number.isFinite(v) ? v : undefined });
                    this.triggerPreviewUpdate();
                  }
                )}
              `
            : nothing
        }
        ${this.renderSliderField(
          t('zoom', 'Zoom'),
          t(
            'zoom_desc',
            'Lower shows a wider region. RainViewer radar is sharpest at 7 and below.'
          ),
          m.zoom ?? DEFAULT_ZOOM,
          DEFAULT_ZOOM,
          MIN_ZOOM,
          MAX_ZOOM,
          1,
          (v: number) => {
            updateModule({ zoom: v });
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderSliderField(
          t('height', 'Height'),
          t('height_desc', 'Height of the map.'),
          m.height ?? DEFAULT_HEIGHT,
          DEFAULT_HEIGHT,
          120,
          800,
          10,
          (v: number) => {
            updateModule({ height: v });
            this.triggerPreviewUpdate();
          },
          'px'
        )}
      </div>
    `;
  }

  private _renderMapSection(
    m: RainRadarModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const t = (key: string, fallback: string) =>
      localize(`editor.rain_radar.${key}`, lang, fallback);
    return html`
      <div class="settings-section">
        <div class="section-title">${t('map_section', 'Map and radar')}</div>
        ${this.renderSegmentedField(
          t('map_style', 'Map style'),
          t('map_style_desc', 'Auto switches between light and dark with Home Assistant.'),
          m.map_style || 'auto',
          [
            { value: 'auto', label: t('style_auto', 'Auto'), icon: 'mdi:theme-light-dark' },
            { value: 'light', label: t('style_light', 'Light'), icon: 'mdi:white-balance-sunny' },
            { value: 'dark', label: t('style_dark', 'Dark'), icon: 'mdi:weather-night' },
            { value: 'streets', label: t('style_streets', 'Streets'), icon: 'mdi:road-variant' },
            {
              value: 'satellite',
              label: t('style_satellite', 'Satellite'),
              icon: 'mdi:satellite-variant',
            },
          ],
          (next: string) => {
            updateModule({ map_style: (next || 'auto') as RainRadarMapStyle });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSliderField(
          t('radar_opacity', 'Radar opacity'),
          t('radar_opacity_desc', 'Lower lets more of the map show through the rain.'),
          m.radar_opacity ?? DEFAULT_OPACITY,
          DEFAULT_OPACITY,
          10,
          100,
          5,
          (v: number) => {
            updateModule({ radar_opacity: v });
            this.triggerPreviewUpdate();
          },
          '%'
        )}
        ${this._toggle(
          hass,
          updateModule,
          'show_forecast',
          m.show_forecast !== false,
          t('show_forecast', 'Include forecast'),
          t(
            'show_forecast_desc',
            'Add the next few forecast frames after "now" when the radar source offers them.'
          )
        )}
        ${this._toggle(
          hass,
          updateModule,
          'snow_colors',
          m.snow_colors !== false,
          t('snow_colors', 'Snow colors'),
          t('snow_colors_desc', 'Show snow in its own colors.')
        )}
        ${this._toggle(
          hass,
          updateModule,
          'smooth',
          m.smooth !== false,
          t('smooth', 'Smooth edges'),
          t('smooth_desc', 'Soften the blocky edges of radar cells.')
        )}
      </div>
    `;
  }

  private _toggle(
    hass: HomeAssistant,
    updateModule: UpdateFn,
    key: keyof RainRadarModule & string,
    value: boolean,
    title: string,
    description: string
  ): TemplateResult {
    return this.renderFieldSection(
      title,
      description,
      hass,
      { [key]: value },
      [this.booleanField(key)],
      (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? value } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      }
    );
  }

  private _renderDisplaySection(
    m: RainRadarModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const t = (key: string, fallback: string) =>
      localize(`editor.rain_radar.${key}`, lang, fallback);
    const bool = (
      key: keyof RainRadarModule & string,
      title: string,
      description: string,
      value: boolean
    ) => ({
      title,
      description,
      hass,
      data: { [key]: value },
      schema: [this.booleanField(key)],
      onChange: (e: CustomEvent) => {
        updateModule({ [key]: e.detail.value?.[key] ?? value } as Partial<CardModule>);
        this.triggerPreviewUpdate();
      },
    });

    return html`
      ${this.renderSettingsSection(t('display_section', 'Display'), '', [
        {
          title: t('title', 'Title'),
          description: t(
            'title_desc',
            'Shown on the map, for example "Rain near home". Leave blank for none.'
          ),
          hass,
          data: { title: m.title || '' },
          schema: [this.textField('title')],
          onChange: (e: CustomEvent) => {
            updateModule({ title: e.detail.value?.title ?? '' });
            this.triggerPreviewUpdate();
          },
        },
        bool(
          'show_title',
          t('show_title', 'Show title'),
          t('show_title_desc', 'Show the title on the map.'),
          m.show_title !== false
        ),
        bool(
          'show_controls',
          t('show_controls', 'Timeline'),
          t('show_controls_desc', 'Play / pause button and a scrubber for every radar frame.'),
          m.show_controls !== false
        ),
        bool(
          'show_timestamp',
          t('show_timestamp', 'Time of frame'),
          t('show_timestamp_desc', 'The time and how long ago the shown frame was captured.'),
          m.show_timestamp !== false
        ),
        bool(
          'show_legend',
          t('show_legend', 'Intensity legend'),
          t('show_legend_desc', 'A small light-to-heavy color scale.'),
          m.show_legend !== false
        ),
        bool(
          'show_home_marker',
          t('show_home_marker', 'Home marker'),
          t('show_home_marker_desc', 'A pulsing dot on your home location.'),
          m.show_home_marker !== false
        ),
      ])}
      <div class="settings-section">
        ${this.renderChipListField(
          t('marker_entities', 'Markers'),
          t(
            'marker_entities_desc',
            'People, device trackers or zones to show on the map. Tap a marker for details.'
          ),
          hass,
          m.marker_entities || [],
          (values: string[]) => {
            updateModule({ marker_entities: values });
            this.triggerPreviewUpdate();
          },
          { mode: 'entity', entityDomains: LOCATION_ENTITY_DOMAINS, variant: 'primary' }
        )}
        ${
          (m.marker_entities || []).length
            ? this.renderFieldSection(
                t('show_marker_names', 'Marker names'),
                t('show_marker_names_desc', 'Show a name label under each marker.'),
                hass,
                { show_marker_names: m.show_marker_names !== false },
                [this.booleanField('show_marker_names')],
                (e: CustomEvent) => {
                  updateModule({ show_marker_names: e.detail.value?.show_marker_names ?? true });
                  this.triggerPreviewUpdate();
                }
              )
            : nothing
        }
      </div>
    `;
  }

  private _renderAnimationSection(
    m: RainRadarModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const t = (key: string, fallback: string) =>
      localize(`editor.rain_radar.${key}`, lang, fallback);
    return html`
      <div class="settings-section">
        <div class="section-title">${t('animation_section', 'Animation')}</div>
        ${this.renderSegmentedField(
          t('time_span', 'Time span'),
          t('time_span_desc', 'How far back the loop goes. RainViewer keeps about two hours.'),
          String(m.time_span ?? DEFAULT_TIME_SPAN),
          TIME_SPAN_OPTIONS.map(minutes => ({
            value: String(minutes),
            label:
              minutes < 60
                ? t('span_minutes', '{n} min').replace('{n}', String(minutes))
                : t('span_hours', '{n} h').replace('{n}', (minutes / 60).toLocaleString(lang)),
          })),
          (next: string) => {
            const minutes = Number(next);
            updateModule({
              time_span: Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_TIME_SPAN,
            });
            this.triggerPreviewUpdate();
          },
          4
        )}
        ${this.renderFieldSection(
          t('autoplay', 'Play automatically'),
          t('autoplay_desc', 'Loop through the radar frames when the dashboard opens.'),
          hass,
          { autoplay: m.autoplay !== false },
          [this.booleanField('autoplay')],
          (e: CustomEvent) => {
            updateModule({ autoplay: e.detail.value?.autoplay ?? true });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSliderField(
          t('frame_delay', 'Frame speed'),
          t('frame_delay_desc', 'How long each frame is shown. Lower is faster.'),
          m.frame_delay ?? DEFAULT_FRAME_DELAY,
          DEFAULT_FRAME_DELAY,
          150,
          2000,
          50,
          (v: number) => {
            updateModule({ frame_delay: v });
            this.triggerPreviewUpdate();
          },
          ' ms'
        )}
        ${this.renderSliderField(
          t('end_pause', 'Pause on last frame'),
          t('end_pause_desc', 'Extra time to hold the newest frame before the loop starts again.'),
          m.end_pause ?? DEFAULT_END_PAUSE,
          DEFAULT_END_PAUSE,
          0,
          6000,
          250,
          (v: number) => {
            updateModule({ end_pause: v });
            this.triggerPreviewUpdate();
          },
          ' ms'
        )}
      </div>
    `;
  }

  private _renderAdvancedFields(
    m: RainRadarModule,
    hass: HomeAssistant,
    updateModule: UpdateFn,
    lang: string
  ): TemplateResult {
    const t = (key: string, fallback: string) =>
      localize(`editor.rain_radar.${key}`, lang, fallback);
    return html`
      ${this.renderFieldSection(
        t('interactive', 'Pan and zoom'),
        t(
          'interactive_desc',
          'Let people drag and pinch the map. Off keeps it fixed so swiping scrolls the dashboard.'
        ),
        hass,
        { interactive: m.interactive === true },
        [this.booleanField('interactive')],
        (e: CustomEvent) => {
          updateModule({ interactive: e.detail.value?.interactive ?? false });
          this.triggerPreviewUpdate();
        }
      )}
      ${this.renderFieldSection(
        t('show_zoom_controls', 'Zoom buttons'),
        t('show_zoom_controls_desc', 'Show + and − buttons on the map.'),
        hass,
        { show_zoom_controls: m.show_zoom_controls === true },
        [this.booleanField('show_zoom_controls')],
        (e: CustomEvent) => {
          updateModule({ show_zoom_controls: e.detail.value?.show_zoom_controls ?? false });
          this.triggerPreviewUpdate();
        }
      )}
      ${this.renderFieldSection(
        t('source_url', 'Radar source URL'),
        t(
          'source_url_desc',
          'Leave blank to use RainViewer (free, no key). Or a RainViewer-compatible weather-maps.json URL, such as a self-hosted mirror.'
        ),
        hass,
        { source_url: m.source_url || '' },
        [this.textField('source_url')],
        (e: CustomEvent) => {
          updateModule({ source_url: (e.detail.value?.source_url ?? '').trim() });
          this.triggerPreviewUpdate();
        }
      )}
    `;
  }

  // ── Preview ──────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as RainRadarModule;
    const lang = hass?.locale?.language || 'en';
    const center = resolveCenter(m, hass);

    if (!center) {
      const mode = m.center_mode || 'home';
      return this.renderGradientErrorState(
        localize('editor.rain_radar.empty_title', lang, 'Choose where to show the radar'),
        mode === 'entity' && m.center_entity
          ? localize(
              'editor.rain_radar.empty_entity_desc',
              lang,
              'This entity has no location yet. Pick another one or enter coordinates in the General tab.'
            )
          : localize(
              'editor.rain_radar.empty_desc',
              lang,
              'Set a home location in Home Assistant, or pick an entity or coordinates in the General tab.'
            ),
        'mdi:weather-pouring'
      );
    }

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <div class="uc-rain-radar ${hoverClass}" data-uc-role="pane" style="${designStyles}">
        ${this.wrapWithAnimation(
          html`<uc-rain-radar .hass=${hass} .module=${m} .language=${lang}></uc-rain-radar>`,
          module,
          hass
        )}
      </div>
    `;
  }

  getStyles(): string {
    return `
      .uc-rain-radar {
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        border-radius: var(--uc-r-12, 12px);
        background: var(--uc-pane-bg, var(--card-background-color));
      }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
