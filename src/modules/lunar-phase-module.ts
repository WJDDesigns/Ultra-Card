import { TemplateResult, html, svg, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  UltraCardConfig,
  LunarPhaseModule as LunarPhaseModuleConfig,
  LunarPhaseDataItem,
} from '../types';
import { ucCloudAuthService } from '../services/uc-cloud-auth-service';
import {
  MoonSnapshot,
  getMoonSnapshot,
  getMoonIllumination,
  getMoonPosition,
  getPhaseId,
  compassIndex,
  COMPASS_POINTS,
  LUNAR_CYCLE_DAYS,
  MoonPhaseId,
} from '../utils/uc-moon-calc';

// ─── Internal UI state (per module instance, not persisted) ──────────────────

type LunarView = 'phase' | 'calendar' | 'horizon';

interface LunarUiState {
  view: LunarView;
  /** Selected day at local midnight (ms). null = live "today/now". */
  selectedDate: number | null;
  page: number;
  calMonth: number;
  calYear: number;
  /** Compact layouts: expanded into full data list after a tap */
  expanded: boolean;
}

const ALL_DATA_ITEMS: LunarPhaseDataItem[] = [
  'moon_age',
  'illumination',
  'azimuth',
  'altitude',
  'distance',
  'position',
  'moonrise',
  'moonset',
  'moon_highest',
  'next_full_moon',
  'next_new_moon',
  'next_phase',
];

const FONT_SIZE_MAP: Record<string, string> = {
  small: '12px',
  medium: '14px',
  large: '16px',
  'x-large': '20px',
  'xx-large': '24px',
};

// ─── Moon SVG geometry ────────────────────────────────────────────────────────

/**
 * SVG path of the illuminated portion of the moon disc (centered at 0,0, radius r).
 * Returns 'FULL' near full moon and null near new moon.
 */
function litPath(phase: number, r: number): string | 'FULL' | null {
  const p = ((phase % 1) + 1) % 1;
  const eps = 0.017; // ~half a day either side
  if (p < eps || p > 1 - eps) return null;
  if (Math.abs(p - 0.5) < eps) return 'FULL';

  const cosTerm = Math.cos(2 * Math.PI * p);
  const rx = Math.abs(r * cosTerm).toFixed(2);
  const waxing = p < 0.5;

  if (waxing) {
    // Lit limb on the right; terminator bulges right for crescent, left for gibbous
    const termSweep = cosTerm > 0 ? 0 : 1;
    return `M 0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${rx} ${r} 0 0 ${termSweep} 0 ${-r} Z`;
  }
  // Waning: lit limb on the left
  const termSweep = cosTerm > 0 ? 1 : 0;
  return `M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} A ${rx} ${r} 0 0 ${termSweep} 0 ${-r} Z`;
}

/** Lunar maria / crater spots (x, y, radius) on a radius-98 disc */
const MOON_CRATERS: Array<[number, number, number]> = [
  [-38, -42, 26], // Mare Imbrium
  [4, -40, 17], // Mare Serenitatis
  [28, -18, 19], // Mare Tranquillitatis
  [60, -26, 11], // Mare Crisium
  [44, 6, 13], // Mare Fecunditatis
  [27, 24, 10], // Mare Nectaris
  [-56, -6, 28], // Oceanus Procellarum
  [-44, 30, 12], // Mare Humorum
  [-18, 30, 14], // Mare Nubium
  [-30, -8, 7], // Copernicus
  [-10, 62, 6], // Tycho
];

function cratersSvg(fill: string, opacity: number): string {
  return MOON_CRATERS.map(
    ([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" fill-opacity="${opacity}"/>`
  ).join('');
}

/**
 * Full realistic animated moon SVG. Rendered with unsafeHTML so defs/masks work
 * reliably with unique ids per module instance.
 */
function moonSvg(
  phase: number,
  sizePx: number,
  southern: boolean,
  uid: string,
  accent: string
): string {
  const r = 98;
  const lit = litPath(phase, r);
  const flip = southern ? ' transform="scale(-1,-1)"' : '';

  let litLayer = '';
  if (lit === 'FULL') {
    litLayer = `
      <g${flip}>
        <circle r="${r}" fill="url(#uc-lunar-surface-${uid})"/>
        ${cratersSvg('#9d9a90', 0.38)}
      </g>`;
  } else if (lit) {
    litLayer = `
      <g${flip} mask="url(#uc-lunar-lit-${uid})">
        <circle r="${r}" fill="url(#uc-lunar-surface-${uid})"/>
        ${cratersSvg('#9d9a90', 0.38)}
      </g>`;
  }

  return `
  <svg viewBox="-110 -110 220 220" width="${sizePx}" height="${sizePx}" role="img" aria-label="moon" class="uc-lunar-moon-svg">
    <defs>
      <radialGradient id="uc-lunar-surface-${uid}" cx="38%" cy="34%" r="78%">
        <stop offset="0%" stop-color="#fbf9f2"/>
        <stop offset="55%" stop-color="#e4e1d6"/>
        <stop offset="100%" stop-color="#b9b6aa"/>
      </radialGradient>
      <radialGradient id="uc-lunar-glow-${uid}" cx="50%" cy="50%" r="50%">
        <stop offset="55%" stop-color="${accent}" stop-opacity="0.30"/>
        <stop offset="78%" stop-color="${accent}" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <filter id="uc-lunar-soft-${uid}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5"/>
      </filter>
      <mask id="uc-lunar-lit-${uid}">
        <rect x="-110" y="-110" width="220" height="220" fill="black"/>
        ${lit && lit !== 'FULL' ? `<path d="${lit}" fill="white" filter="url(#uc-lunar-soft-${uid})"/>` : ''}
      </mask>
    </defs>
    <circle r="108" fill="url(#uc-lunar-glow-${uid})" class="uc-lunar-moon-halo"/>
    <g${flip}>
      <circle r="${r}" fill="#23262e"/>
      ${cratersSvg('#1b1e25', 0.55)}
      <circle r="${r}" fill="none" stroke="#3a3e49" stroke-width="1"/>
    </g>
    ${litLayer}
  </svg>`;
}

/** Tiny flat moon glyph used in the calendar grid */
function miniMoonSvg(phase: number, sizePx: number, southern: boolean): string {
  const r = 9;
  const lit = litPath(phase, r);
  const flip = southern ? ' transform="scale(-1,-1)"' : '';
  let litEl = '';
  if (lit === 'FULL') litEl = `<circle r="${r}" fill="#e8e5da"/>`;
  else if (lit) litEl = `<path d="${lit}" fill="#e8e5da"/>`;
  return `
  <svg viewBox="-10 -10 20 20" width="${sizePx}" height="${sizePx}" aria-hidden="true">
    <g${flip}>
      <circle r="${r}" fill="rgba(255,255,255,0.13)"/>
      ${litEl}
    </g>
  </svg>`;
}

// ─── Module ───────────────────────────────────────────────────────────────────

export class UltraLunarPhaseModule extends BaseUltraModule {
  override handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'lunar_phase',
    title: 'Lunar Phase',
    description:
      'Animated lunar phase tracker with live moon data, month calendar, and horizon graph',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:moon-waxing-crescent',
    category: 'content',
    tags: ['moon', 'lunar', 'phase', 'astronomy', 'calendar', 'animated', 'pro', 'premium'],
  };

  private _uiState = new Map<string, LunarUiState>();
  private _snapshotCache = new Map<string, MoonSnapshot>();
  private _swipeStartX: number | null = null;
  private _tickTimer: ReturnType<typeof setInterval> | null = null;

  // ── createDefault ───────────────────────────────────────────────────────────

  createDefault(id?: string, _hass?: HomeAssistant): LunarPhaseModuleConfig {
    return {
      id: id || this.generateId('lunar_phase'),
      type: 'lunar_phase',
      location_source: 'default',
      location_entity: '',
      latitude: undefined,
      longitude: undefined,
      southern_hemisphere: false,
      default_view: 'phase',
      show_view_switcher: true,
      layout: 'full',
      moon_position: 'left',
      moon_size: 130,
      items_per_page: 5,
      hidden_items: [],
      show_compact_labels: true,
      show_date_nav: true,
      number_decimals: 1,
      use_miles: false,
      time_12hr: false,
      graph_mode: 'today',
      graph_show_time: true,
      graph_show_current: true,
      graph_show_highest: true,
      graph_y_ticks: false,
      graph_x_ticks: true,
      background_style: 'night_sky',
      custom_background: '',
      show_starfield: true,
      header_font_size: 'x-large',
      header_text_transform: 'capitalize',
      header_color: '',
      label_font_size: 'auto',
      label_text_transform: 'none',
      label_color: '',
      accent_color: '',
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  // ── validate ────────────────────────────────────────────────────────────────

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as LunarPhaseModuleConfig;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (m.location_source === 'custom') {
      if (typeof m.latitude !== 'number' || typeof m.longitude !== 'number') {
        errors.push('Custom location requires latitude and longitude');
      }
    }
    if (m.location_source === 'entity' && !m.location_entity) {
      errors.push('Select a location entity');
    }
    return { valid: errors.length === 0, errors };
  }

  // ── General tab ─────────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as LunarPhaseModuleConfig;
    const lang = hass?.locale?.language || 'en';

    const integrationUser = ucCloudAuthService.checkIntegrationAuth(hass);
    const isPro =
      integrationUser?.subscription?.tier === 'pro' &&
      integrationUser?.subscription?.status === 'active';

    if (!isPro) {
      return this._renderProLockUI(lang);
    }

    const fontSizeOptions = [
      { value: 'auto', label: localize('editor.lunar_phase.font_auto', lang, 'Auto') },
      { value: 'small', label: localize('editor.lunar_phase.font_small', lang, 'Small') },
      { value: 'medium', label: localize('editor.lunar_phase.font_medium', lang, 'Medium') },
      { value: 'large', label: localize('editor.lunar_phase.font_large', lang, 'Large') },
      { value: 'x-large', label: localize('editor.lunar_phase.font_x_large', lang, 'X-Large') },
      { value: 'xx-large', label: localize('editor.lunar_phase.font_xx_large', lang, 'XX-Large') },
    ];
    const transformOptions = [
      { value: 'none', label: localize('editor.lunar_phase.transform_none', lang, 'None') },
      { value: 'capitalize', label: localize('editor.lunar_phase.transform_capitalize', lang, 'Capitalize') },
      { value: 'uppercase', label: localize('editor.lunar_phase.transform_uppercase', lang, 'Uppercase') },
      { value: 'lowercase', label: localize('editor.lunar_phase.transform_lowercase', lang, 'Lowercase') },
    ];
    const itemOptions = ALL_DATA_ITEMS.map(key => ({
      value: key,
      label: this._itemLabel(key, lang),
    }));

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getStyles()}
      </style>
      <div class="module-general-settings">

        <!-- ── LOCATION ──────────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.lunar_phase.location_section', lang, 'Location'),
          localize(
            'editor.lunar_phase.location_section_desc',
            lang,
            'Latitude and longitude used for moon position, rise and set times.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.lunar_phase.location_source', lang, 'Location source'),
          localize(
            'editor.lunar_phase.location_source_desc',
            lang,
            'Use your Home Assistant location, an entity, or manual coordinates.'
          ),
          m.location_source || 'default',
          [
            { value: 'default', label: localize('editor.lunar_phase.location_default', lang, 'System'), icon: 'mdi:home-map-marker' },
            { value: 'entity', label: localize('editor.lunar_phase.location_entity_opt', lang, 'Entity'), icon: 'mdi:map-marker-account' },
            { value: 'custom', label: localize('editor.lunar_phase.location_custom', lang, 'Custom'), icon: 'mdi:map-marker-radius' },
          ],
          (next: string) => {
            updateModule({ location_source: next as 'default' | 'entity' | 'custom' });
            this.triggerPreviewUpdate();
          }
        )}
        ${m.location_source === 'entity'
          ? this.renderConditionalFieldsGroup(
              localize('editor.lunar_phase.location_entity_group', lang, 'Location Entity'),
              html`
                ${this.renderEntityPickerWithVariables(
                  hass,
                  config,
                  'location_entity',
                  m.location_entity || '',
                  (value: string) => {
                    updateModule({ location_entity: value });
                    this.triggerPreviewUpdate();
                  },
                  undefined,
                  localize('editor.lunar_phase.location_entity', lang, 'Entity with latitude/longitude attributes')
                )}
              `
            )
          : nothing}
        ${m.location_source === 'custom'
          ? this.renderConditionalFieldsGroup(
              localize('editor.lunar_phase.location_custom_group', lang, 'Custom Coordinates'),
              html`
                ${this.renderFieldSection(
                  localize('editor.lunar_phase.latitude', lang, 'Latitude'),
                  localize('editor.lunar_phase.latitude_desc', lang, 'Decimal degrees, -90 to 90'),
                  hass,
                  { latitude: m.latitude ?? '' },
                  [this.numberField('latitude', -90, 90, 0.0001)],
                  (e: CustomEvent) => {
                    updateModule({ latitude: e.detail.value?.latitude });
                    this.triggerPreviewUpdate();
                  }
                )}
                ${this.renderFieldSection(
                  localize('editor.lunar_phase.longitude', lang, 'Longitude'),
                  localize('editor.lunar_phase.longitude_desc', lang, 'Decimal degrees, -180 to 180'),
                  hass,
                  { longitude: m.longitude ?? '' },
                  [this.numberField('longitude', -180, 180, 0.0001)],
                  (e: CustomEvent) => {
                    updateModule({ longitude: e.detail.value?.longitude });
                    this.triggerPreviewUpdate();
                  }
                )}
              `
            )
          : nothing}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.southern_hemisphere', lang, 'Southern hemisphere'),
          localize(
            'editor.lunar_phase.southern_hemisphere_desc',
            lang,
            'Mirror the moon image the way it appears south of the equator.'
          ),
          hass,
          { southern_hemisphere: m.southern_hemisphere === true },
          [this.booleanField('southern_hemisphere')],
          (e: CustomEvent) => {
            updateModule({ southern_hemisphere: e.detail.value?.southern_hemisphere ?? false });
            this.triggerPreviewUpdate();
          }
        )}

        <!-- ── VIEWS & LAYOUT ────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.lunar_phase.layout_section', lang, 'Views & Layout'),
          localize(
            'editor.lunar_phase.layout_section_desc',
            lang,
            'Choose the default view, layout style, and moon graphic options.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.lunar_phase.default_view', lang, 'Default view'),
          localize('editor.lunar_phase.default_view_desc', lang, 'View shown when the card loads.'),
          m.default_view || 'phase',
          [
            { value: 'phase', label: localize('editor.lunar_phase.view_phase', lang, 'Phase'), icon: 'mdi:moon-waxing-crescent' },
            { value: 'calendar', label: localize('editor.lunar_phase.view_calendar', lang, 'Calendar'), icon: 'mdi:calendar-month' },
            { value: 'horizon', label: localize('editor.lunar_phase.view_horizon', lang, 'Horizon'), icon: 'mdi:chart-bell-curve-cumulative' },
          ],
          (next: string) => {
            updateModule({ default_view: next as 'phase' | 'calendar' | 'horizon' });
            this._uiState.delete(m.id);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.lunar_phase.layout', lang, 'Layout style'),
          localize(
            'editor.lunar_phase.layout_desc',
            lang,
            'Full shows everything; compact styles fit small dashboard slots and expand on tap.'
          ),
          m.layout || 'full',
          [
            { value: 'full', label: localize('editor.lunar_phase.layout_full', lang, 'Full'), icon: 'mdi:view-dashboard' },
            { value: 'compact', label: localize('editor.lunar_phase.layout_compact', lang, 'Compact'), icon: 'mdi:view-compact' },
            { value: 'minimal', label: localize('editor.lunar_phase.layout_minimal', lang, 'Minimal'), icon: 'mdi:minus-circle-outline' },
            { value: 'moon_only', label: localize('editor.lunar_phase.layout_moon_only', lang, 'Moon only'), icon: 'mdi:moon-full' },
          ],
          (next: string) => {
            updateModule({ layout: next as 'full' | 'compact' | 'minimal' | 'moon_only' });
            this._uiState.delete(m.id);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSegmentedField(
          localize('editor.lunar_phase.moon_position', lang, 'Moon position'),
          localize('editor.lunar_phase.moon_position_desc', lang, 'Side of the card the moon graphic sits on (full layout).'),
          m.moon_position || 'left',
          [
            { value: 'left', label: localize('editor.lunar_phase.position_left', lang, 'Left'), icon: 'mdi:format-horizontal-align-left' },
            { value: 'right', label: localize('editor.lunar_phase.position_right', lang, 'Right'), icon: 'mdi:format-horizontal-align-right' },
          ],
          (next: string) => {
            updateModule({ moon_position: next as 'left' | 'right' });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderSliderField(
          localize('editor.lunar_phase.moon_size', lang, 'Moon size'),
          localize('editor.lunar_phase.moon_size_desc', lang, 'Diameter of the moon graphic.'),
          m.moon_size ?? 130,
          130,
          60,
          260,
          2,
          (v: number) => {
            updateModule({ moon_size: v });
            this.triggerPreviewUpdate();
          },
          'px'
        )}
        ${this.renderSliderField(
          localize('editor.lunar_phase.items_per_page', lang, 'Data items per page'),
          localize('editor.lunar_phase.items_per_page_desc', lang, 'Rows shown before the list paginates. Swipe or use the dots to switch pages.'),
          m.items_per_page ?? 5,
          5,
          3,
          12,
          1,
          (v: number) => {
            updateModule({ items_per_page: v });
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.show_view_switcher', lang, 'Show view switcher'),
          localize('editor.lunar_phase.show_view_switcher_desc', lang, 'Header buttons to switch between phase, calendar, and horizon views.'),
          hass,
          { show_view_switcher: m.show_view_switcher !== false },
          [this.booleanField('show_view_switcher')],
          (e: CustomEvent) => {
            updateModule({ show_view_switcher: e.detail.value?.show_view_switcher ?? true });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.show_date_nav', lang, 'Show date navigation'),
          localize('editor.lunar_phase.show_date_nav_desc', lang, 'Footer with previous / next day arrows and a back-to-today button.'),
          hass,
          { show_date_nav: m.show_date_nav !== false },
          [this.booleanField('show_date_nav')],
          (e: CustomEvent) => {
            updateModule({ show_date_nav: e.detail.value?.show_date_nav ?? true });
            this.triggerPreviewUpdate();
          }
        )}

        <!-- ── DATA ITEMS ────────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.lunar_phase.data_section', lang, 'Data Items'),
          localize(
            'editor.lunar_phase.data_section_desc',
            lang,
            'Hide individual data rows and control number and time formatting.'
          ),
          []
        )}
        ${this.renderChipListField(
          localize('editor.lunar_phase.hidden_items', lang, 'Hidden items'),
          localize('editor.lunar_phase.hidden_items_desc', lang, 'Data rows that should not be displayed.'),
          hass,
          (m.hidden_items as string[]) || [],
          (next: string[]) => {
            updateModule({ hidden_items: next as LunarPhaseDataItem[] });
            this.triggerPreviewUpdate();
          },
          {
            mode: 'select',
            variant: 'exclude',
            selectOptions: itemOptions,
            selectAddLabel: localize('editor.lunar_phase.hide_item_add', lang, 'Hide an item'),
          }
        )}
        ${this.renderSliderField(
          localize('editor.lunar_phase.number_decimals', lang, 'Decimal places'),
          localize('editor.lunar_phase.number_decimals_desc', lang, 'Precision for numeric values like illumination and azimuth.'),
          m.number_decimals ?? 1,
          1,
          0,
          3,
          1,
          (v: number) => {
            updateModule({ number_decimals: v });
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.use_miles', lang, 'Distance in miles'),
          localize('editor.lunar_phase.use_miles_desc', lang, 'Show the moon distance in miles instead of kilometers.'),
          hass,
          { use_miles: m.use_miles === true },
          [this.booleanField('use_miles')],
          (e: CustomEvent) => {
            updateModule({ use_miles: e.detail.value?.use_miles ?? false });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.time_12hr', lang, '12-hour time'),
          localize('editor.lunar_phase.time_12hr_desc', lang, 'Use AM/PM times instead of 24-hour format.'),
          hass,
          { time_12hr: m.time_12hr === true },
          [this.booleanField('time_12hr')],
          (e: CustomEvent) => {
            updateModule({ time_12hr: e.detail.value?.time_12hr ?? false });
            this.triggerPreviewUpdate();
          }
        )}

        <!-- ── HORIZON GRAPH ─────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.lunar_phase.graph_section', lang, 'Horizon Graph'),
          localize(
            'editor.lunar_phase.graph_section_desc',
            lang,
            'Configure the 24-hour moon altitude chart.'
          ),
          [
            {
              title: localize('editor.lunar_phase.graph_show_time', lang, 'Show rise/set times'),
              description: localize('editor.lunar_phase.graph_show_time_desc', lang, 'Time labels at the moonrise and moonset markers.'),
              hass,
              data: { graph_show_time: m.graph_show_time !== false },
              schema: [this.booleanField('graph_show_time')],
              onChange: (e: CustomEvent) => {
                updateModule({ graph_show_time: e.detail.value?.graph_show_time ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.lunar_phase.graph_show_current', lang, 'Show current position'),
              description: localize('editor.lunar_phase.graph_show_current_desc', lang, 'Pulsing marker at the moon\u2019s current altitude.'),
              hass,
              data: { graph_show_current: m.graph_show_current !== false },
              schema: [this.booleanField('graph_show_current')],
              onChange: (e: CustomEvent) => {
                updateModule({ graph_show_current: e.detail.value?.graph_show_current ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.lunar_phase.graph_show_highest', lang, 'Show highest point'),
              description: localize('editor.lunar_phase.graph_show_highest_desc', lang, 'Marker at the moon\u2019s transit (highest altitude).'),
              hass,
              data: { graph_show_highest: m.graph_show_highest !== false },
              schema: [this.booleanField('graph_show_highest')],
              onChange: (e: CustomEvent) => {
                updateModule({ graph_show_highest: e.detail.value?.graph_show_highest ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.lunar_phase.graph_x_ticks', lang, 'Show time axis'),
              description: localize('editor.lunar_phase.graph_x_ticks_desc', lang, 'Hour labels along the bottom of the chart.'),
              hass,
              data: { graph_x_ticks: m.graph_x_ticks !== false },
              schema: [this.booleanField('graph_x_ticks')],
              onChange: (e: CustomEvent) => {
                updateModule({ graph_x_ticks: e.detail.value?.graph_x_ticks ?? true });
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.lunar_phase.graph_y_ticks', lang, 'Show altitude axis'),
              description: localize('editor.lunar_phase.graph_y_ticks_desc', lang, 'Degree labels along the left of the chart.'),
              hass,
              data: { graph_y_ticks: m.graph_y_ticks === true },
              schema: [this.booleanField('graph_y_ticks')],
              onChange: (e: CustomEvent) => {
                updateModule({ graph_y_ticks: e.detail.value?.graph_y_ticks ?? false });
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSegmentedField(
          localize('editor.lunar_phase.graph_mode', lang, 'Graph window'),
          localize('editor.lunar_phase.graph_mode_desc', lang, 'Today shows midnight to midnight; dynamic shows a rolling 24 hours around now.'),
          m.graph_mode || 'today',
          [
            { value: 'today', label: localize('editor.lunar_phase.graph_today', lang, 'Today'), icon: 'mdi:calendar-today' },
            { value: 'dynamic', label: localize('editor.lunar_phase.graph_dynamic', lang, 'Dynamic'), icon: 'mdi:update' },
          ],
          (next: string) => {
            updateModule({ graph_mode: next as 'today' | 'dynamic' });
            this.triggerPreviewUpdate();
          }
        )}

        <!-- ── APPEARANCE ────────────────────────────────────────────── -->
        ${this.renderSettingsSection(
          localize('editor.lunar_phase.appearance_section', lang, 'Appearance'),
          localize(
            'editor.lunar_phase.appearance_section_desc',
            lang,
            'Background, starfield, fonts, and colors.'
          ),
          []
        )}
        ${this.renderSegmentedField(
          localize('editor.lunar_phase.background_style', lang, 'Background'),
          localize('editor.lunar_phase.background_style_desc', lang, 'Backdrop behind the moon and data.'),
          m.background_style || 'night_sky',
          [
            { value: 'night_sky', label: localize('editor.lunar_phase.bg_night_sky', lang, 'Night sky'), icon: 'mdi:weather-night' },
            { value: 'theme', label: localize('editor.lunar_phase.bg_theme', lang, 'Theme'), icon: 'mdi:palette' },
            { value: 'custom', label: localize('editor.lunar_phase.bg_custom', lang, 'Image'), icon: 'mdi:image' },
            { value: 'transparent', label: localize('editor.lunar_phase.bg_transparent', lang, 'None'), icon: 'mdi:circle-off-outline' },
          ],
          (next: string) => {
            updateModule({
              background_style: next as 'night_sky' | 'theme' | 'custom' | 'transparent',
            });
            this.triggerPreviewUpdate();
          }
        )}
        ${m.background_style === 'custom'
          ? this.renderConditionalFieldsGroup(
              localize('editor.lunar_phase.custom_bg_group', lang, 'Custom Background'),
              html`
                ${this.renderFileField(
                  localize('editor.lunar_phase.custom_background', lang, 'Background image'),
                  localize('editor.lunar_phase.custom_background_desc', lang, 'Upload an image or paste a URL.'),
                  hass,
                  m.custom_background || '',
                  (path: string) => {
                    updateModule({ custom_background: path });
                    this.triggerPreviewUpdate();
                  }
                )}
              `
            )
          : nothing}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.show_starfield', lang, 'Animated starfield'),
          localize('editor.lunar_phase.show_starfield_desc', lang, 'Twinkling stars layered over the background.'),
          hass,
          { show_starfield: m.show_starfield !== false },
          [this.booleanField('show_starfield')],
          (e: CustomEvent) => {
            updateModule({ show_starfield: e.detail.value?.show_starfield ?? true });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.show_compact_labels', lang, 'Compact stat labels'),
          localize('editor.lunar_phase.show_compact_labels_desc', lang, 'Show text labels under the compact layout stats.'),
          hass,
          { show_compact_labels: m.show_compact_labels !== false },
          [this.booleanField('show_compact_labels')],
          (e: CustomEvent) => {
            updateModule({ show_compact_labels: e.detail.value?.show_compact_labels ?? true });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.header_font_size', lang, 'Header font size'),
          localize('editor.lunar_phase.header_font_size_desc', lang, 'Size of the phase name header.'),
          hass,
          { header_font_size: m.header_font_size || 'x-large' },
          [this.selectField('header_font_size', fontSizeOptions)],
          (e: CustomEvent) => {
            updateModule({ header_font_size: e.detail.value?.header_font_size || 'x-large' });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.header_text_transform', lang, 'Header text style'),
          localize('editor.lunar_phase.header_text_transform_desc', lang, 'Text transform applied to the header.'),
          hass,
          { header_text_transform: m.header_text_transform || 'capitalize' },
          [this.selectField('header_text_transform', transformOptions)],
          (e: CustomEvent) => {
            updateModule({
              header_text_transform: e.detail.value?.header_text_transform || 'capitalize',
            });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.lunar_phase.header_color', lang, 'Header color'),
          localize('editor.lunar_phase.header_color_desc', lang, 'Leave empty for the automatic color.'),
          hass,
          m.header_color || '',
          '',
          (next: string) => {
            updateModule({ header_color: next });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.label_font_size', lang, 'Label font size'),
          localize('editor.lunar_phase.label_font_size_desc', lang, 'Size of data labels and values.'),
          hass,
          { label_font_size: m.label_font_size || 'auto' },
          [this.selectField('label_font_size', fontSizeOptions)],
          (e: CustomEvent) => {
            updateModule({ label_font_size: e.detail.value?.label_font_size || 'auto' });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderFieldSection(
          localize('editor.lunar_phase.label_text_transform', lang, 'Label text style'),
          localize('editor.lunar_phase.label_text_transform_desc', lang, 'Text transform applied to data labels.'),
          hass,
          { label_text_transform: m.label_text_transform || 'none' },
          [this.selectField('label_text_transform', transformOptions)],
          (e: CustomEvent) => {
            updateModule({
              label_text_transform: e.detail.value?.label_text_transform || 'none',
            });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.lunar_phase.label_color', lang, 'Label color'),
          localize('editor.lunar_phase.label_color_desc', lang, 'Leave empty for the automatic color.'),
          hass,
          m.label_color || '',
          '',
          (next: string) => {
            updateModule({ label_color: next });
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.lunar_phase.accent_color', lang, 'Accent color'),
          localize('editor.lunar_phase.accent_color_desc', lang, 'Markers, selected days, glow, and pagination. Leave empty for a moonlight silver.'),
          hass,
          m.accent_color || '',
          '',
          (next: string) => {
            updateModule({ accent_color: next });
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  // ── Preview ─────────────────────────────────────────────────────────────────

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as LunarPhaseModuleConfig;
    const lang = hass?.locale?.language || 'en';

    this._ensureTick();

    const loc = this._resolveLocation(m, hass, config);
    if (!loc) {
      return html`
        <style>${this.getStyles()}</style>
        ${this.renderGradientErrorState(
          localize('editor.lunar_phase.config_needed', lang, 'Set a location'),
          localize(
            'editor.lunar_phase.config_needed_desc',
            lang,
            'Choose a location source in the General tab'
          ),
          'mdi:moon-waxing-crescent'
        )}
      `;
    }

    const state = this._getState(m);
    const now = new Date();
    const displayDate = state.selectedDate !== null ? new Date(state.selectedDate + 12 * 3600000) : now;
    const snap = this._getSnapshot(displayDate, loc.lat, loc.lng);
    const isToday = state.selectedDate === null;

    const accent = m.accent_color?.trim() || '#cdd6f4';
    const southern = m.southern_hemisphere === true;
    const uid = (m.id || 'lp').replace(/[^a-zA-Z0-9_-]/g, '');

    // Wrapper styling (background + typography CSS variables)
    const bgStyle = m.background_style || 'night_sky';
    const isDarkBg = bgStyle === 'night_sky' || bgStyle === 'custom';
    const vars: Record<string, string> = {
      '--uc-lunar-accent': accent,
      '--uc-lunar-text': m.header_color?.trim()
        ? m.header_color
        : isDarkBg
          ? '#eceff7'
          : 'var(--primary-text-color)',
      '--uc-lunar-dim': m.label_color?.trim()
        ? m.label_color
        : isDarkBg
          ? 'rgba(236,239,247,0.62)'
          : 'var(--secondary-text-color)',
      '--uc-lunar-line': isDarkBg
        ? 'rgba(236,239,247,0.14)'
        : 'color-mix(in srgb, var(--divider-color) 60%, transparent)',
      '--uc-lunar-chip': isDarkBg
        ? 'rgba(236,239,247,0.08)'
        : 'color-mix(in srgb, var(--divider-color) 12%, transparent)',
      '--uc-lunar-header-size': this._fontSize(m.header_font_size, '20px'),
      '--uc-lunar-header-transform': m.header_text_transform || 'capitalize',
      '--uc-lunar-label-size': this._fontSize(m.label_font_size, '13px'),
      '--uc-lunar-label-transform': m.label_text_transform || 'none',
    };

    let bgCss = '';
    if (bgStyle === 'night_sky') {
      bgCss =
        'background: linear-gradient(165deg, #070b1d 0%, #101633 45%, #1b2447 78%, #232f59 100%);';
    } else if (bgStyle === 'theme') {
      bgCss = 'background: var(--card-background-color, var(--ha-card-background));';
    } else if (bgStyle === 'custom' && m.custom_background) {
      bgCss = `background-image: linear-gradient(rgba(7,10,25,0.45), rgba(7,10,25,0.65)), url("${m.custom_background}"); background-size: cover; background-position: center;`;
    }

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const varStr = this.buildStyleString(vars);

    const gestures = this.createGestureHandlers(
      m.id,
      {
        tap_action: m.tap_action,
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        module: m,
      },
      hass,
      config,
      ['.uc-lunar-btn', '.uc-lunar-day', '.uc-lunar-dot', '.uc-lunar-datanav', '.uc-lunar-pages']
    );

    const layout = m.layout || 'full';
    let body: TemplateResult;
    if (layout !== 'full' && !state.expanded) {
      body = this._renderCompact(m, hass, lang, snap, state, southern, uid, accent);
    } else {
      body = this._renderFull(m, hass, lang, snap, state, now, isToday, loc, southern, uid, accent);
    }

    return html`
      <style>${this.getStyles()}</style>
      <div
        class="uc-lunar-wrapper ${hoverClass}"
        style="${bgCss} ${varStr}; ${designStyles}"
        @pointerdown=${gestures.onPointerDown}
        @pointerup=${gestures.onPointerUp}
        @pointerleave=${gestures.onPointerLeave}
        @pointercancel=${gestures.onPointerCancel}
      >
        ${isDarkBg && m.show_starfield !== false
          ? html`<div class="uc-lunar-stars" aria-hidden="true"></div>
              <div class="uc-lunar-stars uc-lunar-stars--alt" aria-hidden="true"></div>`
          : nothing}
        ${this.wrapWithAnimation(body, module, hass)}
      </div>
    `;
  }

  // ── Full layout (phase / calendar / horizon views) ─────────────────────────

  private _renderFull(
    m: LunarPhaseModuleConfig,
    hass: HomeAssistant,
    lang: string,
    snap: MoonSnapshot,
    state: LunarUiState,
    now: Date,
    isToday: boolean,
    loc: { lat: number; lng: number },
    southern: boolean,
    uid: string,
    accent: string
  ): TemplateResult {
    const phaseName = this._phaseName(snap.phaseId, lang);
    const layoutCompactExpanded = (m.layout || 'full') !== 'full' && state.expanded;

    const viewButtons: Array<{ view: LunarView; icon: string; label: string }> = [
      { view: 'phase', icon: 'mdi:moon-waxing-crescent', label: localize('editor.lunar_phase.view_phase', lang, 'Phase') },
      { view: 'calendar', icon: 'mdi:calendar-month', label: localize('editor.lunar_phase.view_calendar', lang, 'Calendar') },
      { view: 'horizon', icon: 'mdi:chart-bell-curve-cumulative', label: localize('editor.lunar_phase.view_horizon', lang, 'Horizon') },
    ];

    const dateLabel = isToday
      ? localize('editor.lunar_phase.today', lang, 'Today')
      : this._fmtDate(snap.date, lang);

    return html`
      <div class="uc-lunar uc-lunar--full">
        <!-- Header -->
        <div class="uc-lunar-header">
          <div class="uc-lunar-header-text">
            <div class="uc-lunar-title">${phaseName}</div>
            <div class="uc-lunar-subtitle">${dateLabel}</div>
          </div>
          <div class="uc-lunar-header-actions">
            ${layoutCompactExpanded
              ? html`
                  <button
                    class="uc-lunar-btn"
                    title=${localize('editor.lunar_phase.collapse', lang, 'Collapse')}
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      state.expanded = false;
                      this.triggerPreviewUpdate(true);
                    }}
                  >
                    <ha-icon icon="mdi:arrow-collapse"></ha-icon>
                  </button>
                `
              : nothing}
            ${m.show_view_switcher !== false
              ? viewButtons.map(
                  b => html`
                    <button
                      class="uc-lunar-btn ${state.view === b.view ? 'uc-lunar-btn--active' : ''}"
                      title=${b.label}
                      aria-label=${b.label}
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        state.view = b.view;
                        if (b.view !== 'calendar') {
                          // keep selection, but reset calendar nav to selected/current month
                          const d = state.selectedDate !== null ? new Date(state.selectedDate) : new Date();
                          state.calMonth = d.getMonth();
                          state.calYear = d.getFullYear();
                        }
                        this.triggerPreviewUpdate(true);
                      }}
                    >
                      <ha-icon icon=${b.icon}></ha-icon>
                    </button>
                  `
                )
              : nothing}
          </div>
        </div>

        <!-- Active view -->
        ${state.view === 'calendar'
          ? this._renderCalendar(m, lang, state, southern, now)
          : state.view === 'horizon'
            ? this._renderHorizon(m, lang, snap, now, isToday, loc, accent)
            : this._renderPhaseView(m, hass, lang, snap, state, southern, uid, accent)}

        <!-- Date navigation footer -->
        ${m.show_date_nav !== false && state.view !== 'calendar'
          ? html`
              <div class="uc-lunar-datanav">
                <button
                  class="uc-lunar-btn"
                  title=${localize('editor.lunar_phase.prev_day', lang, 'Previous day')}
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._stepDay(state, -1);
                  }}
                >
                  <ha-icon icon="mdi:chevron-left"></ha-icon>
                </button>
                <div class="uc-lunar-datanav-label">
                  ${this._fmtDate(snap.date, lang)}
                  ${!isToday
                    ? html`
                        <button
                          class="uc-lunar-btn uc-lunar-btn--pill"
                          @click=${(e: Event) => {
                            e.stopPropagation();
                            state.selectedDate = null;
                            this.triggerPreviewUpdate(true);
                          }}
                        >
                          <ha-icon icon="mdi:calendar-today"></ha-icon>
                          ${localize('editor.lunar_phase.back_to_today', lang, 'Today')}
                        </button>
                      `
                    : nothing}
                </div>
                <button
                  class="uc-lunar-btn"
                  title=${localize('editor.lunar_phase.next_day', lang, 'Next day')}
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._stepDay(state, 1);
                  }}
                >
                  <ha-icon icon="mdi:chevron-right"></ha-icon>
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  // ── Phase view (moon + paginated data list) ─────────────────────────────────

  private _renderPhaseView(
    m: LunarPhaseModuleConfig,
    hass: HomeAssistant,
    lang: string,
    snap: MoonSnapshot,
    state: LunarUiState,
    southern: boolean,
    uid: string,
    accent: string
  ): TemplateResult {
    const items = this._buildDataItems(m, lang, snap);
    const perPage = Math.max(3, Math.min(12, m.items_per_page ?? 5));
    const pages: Array<typeof items> = [];
    for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));
    if (state.page >= pages.length) state.page = Math.max(0, pages.length - 1);

    const moonSize = Math.max(60, Math.min(260, m.moon_size ?? 130));
    const moonFirst = (m.moon_position || 'left') === 'left';

    const moon = html`
      <div
        class="uc-lunar-moon-wrap"
        style="width:${moonSize}px; height:${moonSize}px;"
        @pointermove=${(e: PointerEvent) => {
          const el = e.currentTarget as HTMLElement;
          const rect = el.getBoundingClientRect();
          el.style.setProperty('--uc-lunar-px', `${((e.clientX - rect.left) / rect.width) * 100}%`);
          el.style.setProperty('--uc-lunar-py', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        }}
      >
        ${unsafeHTML(moonSvg(snap.phase, moonSize, southern, uid, accent))}
      </div>
    `;

    const dataList = html`
      <div
        class="uc-lunar-data"
        @pointerdown=${(e: PointerEvent) => {
          this._swipeStartX = e.clientX;
        }}
        @pointerup=${(e: PointerEvent) => {
          if (this._swipeStartX === null || pages.length < 2) return;
          const dx = e.clientX - this._swipeStartX;
          this._swipeStartX = null;
          if (Math.abs(dx) > 40) {
            state.page = Math.min(
              pages.length - 1,
              Math.max(0, state.page + (dx < 0 ? 1 : -1))
            );
            this.triggerPreviewUpdate(true);
          }
        }}
      >
        <div class="uc-lunar-pages" style="transform: translateX(-${state.page * 100}%);">
          ${pages.map(
            page => html`
              <div class="uc-lunar-page">
                ${page.map(
                  item => html`
                    <div class="uc-lunar-row">
                      <span class="uc-lunar-row-label">
                        <ha-icon icon=${item.icon}></ha-icon>
                        ${item.label}
                      </span>
                      <span class="uc-lunar-row-value">
                        ${item.value}
                        ${item.secondary
                          ? html`<span class="uc-lunar-row-secondary">${item.secondary}</span>`
                          : nothing}
                      </span>
                    </div>
                  `
                )}
              </div>
            `
          )}
        </div>
        ${pages.length > 1
          ? html`
              <div class="uc-lunar-dots">
                ${pages.map(
                  (_p, i) => html`
                    <button
                      class="uc-lunar-dot ${i === state.page ? 'uc-lunar-dot--active' : ''}"
                      aria-label="Page ${i + 1}"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        state.page = i;
                        this.triggerPreviewUpdate(true);
                      }}
                    ></button>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;

    return html`
      <div class="uc-lunar-phaseview">
        ${moonFirst ? html`${moon}${dataList}` : html`${dataList}${moon}`}
      </div>
    `;
  }

  // ── Calendar view ───────────────────────────────────────────────────────────

  private _renderCalendar(
    m: LunarPhaseModuleConfig,
    lang: string,
    state: LunarUiState,
    southern: boolean,
    now: Date
  ): TemplateResult {
    const year = state.calYear;
    const month = state.calMonth;
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-start grid offset
    const offset = (first.getDay() + 6) % 7;

    const weekdayLabels: string[] = [];
    // 2024-01-01 is a Monday
    for (let i = 0; i < 7; i++) {
      weekdayLabels.push(
        new Date(2024, 0, 1 + i).toLocaleDateString(lang, { weekday: 'short' })
      );
    }

    const monthLabel = first.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
    const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

    const cells: TemplateResult[] = [];
    for (let i = 0; i < offset; i++) {
      cells.push(html`<div class="uc-lunar-day uc-lunar-day--empty"></div>`);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d, 12, 0, 0);
      const dayMidnight = new Date(year, month, d).valueOf();
      const phase = getMoonIllumination(dayDate).phase;
      const isTodayCell = dayMidnight === todayKey;
      const isSelected = state.selectedDate === dayMidnight;
      cells.push(html`
        <button
          class="uc-lunar-day ${isTodayCell ? 'uc-lunar-day--today' : ''} ${isSelected
            ? 'uc-lunar-day--selected'
            : ''}"
          title="${this._phaseName(getPhaseId(phase), lang)}"
          @click=${(e: Event) => {
            e.stopPropagation();
            state.selectedDate = dayMidnight === todayKey ? null : dayMidnight;
            state.view = 'phase';
            state.page = 0;
            this.triggerPreviewUpdate(true);
          }}
        >
          <span class="uc-lunar-day-num">${d}</span>
          ${unsafeHTML(miniMoonSvg(phase, 18, southern))}
        </button>
      `);
    }

    return html`
      <div class="uc-lunar-calendar">
        <div class="uc-lunar-cal-nav">
          <button
            class="uc-lunar-btn"
            title=${localize('editor.lunar_phase.prev_month', lang, 'Previous month')}
            @click=${(e: Event) => {
              e.stopPropagation();
              const prev = new Date(year, month - 1, 1);
              state.calMonth = prev.getMonth();
              state.calYear = prev.getFullYear();
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <div class="uc-lunar-cal-title">
            ${monthLabel}
            ${!isCurrentMonth
              ? html`
                  <button
                    class="uc-lunar-btn uc-lunar-btn--pill"
                    @click=${(e: Event) => {
                      e.stopPropagation();
                      state.calMonth = now.getMonth();
                      state.calYear = now.getFullYear();
                      this.triggerPreviewUpdate(true);
                    }}
                  >
                    <ha-icon icon="mdi:calendar-today"></ha-icon>
                    ${localize('editor.lunar_phase.back_to_today', lang, 'Today')}
                  </button>
                `
              : nothing}
          </div>
          <button
            class="uc-lunar-btn"
            title=${localize('editor.lunar_phase.next_month', lang, 'Next month')}
            @click=${(e: Event) => {
              e.stopPropagation();
              const next = new Date(year, month + 1, 1);
              state.calMonth = next.getMonth();
              state.calYear = next.getFullYear();
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:chevron-right"></ha-icon>
          </button>
        </div>
        <div class="uc-lunar-cal-grid">
          ${weekdayLabels.map(w => html`<div class="uc-lunar-weekday">${w}</div>`)}
          ${cells}
        </div>
      </div>
    `;
  }

  // ── Horizon view ────────────────────────────────────────────────────────────

  private _renderHorizon(
    m: LunarPhaseModuleConfig,
    lang: string,
    snap: MoonSnapshot,
    now: Date,
    isToday: boolean,
    loc: { lat: number; lng: number },
    accent: string
  ): TemplateResult {
    const W = 480;
    const H = 190;
    const padL = m.graph_y_ticks ? 34 : 10;
    const padR = 10;
    const padT = 18;
    const padB = m.graph_x_ticks !== false ? 26 : 10;

    // Window
    const dynamic = (m.graph_mode || 'today') === 'dynamic' && isToday;
    let start: Date;
    if (dynamic) {
      start = new Date(now.valueOf() - 6 * 3600000);
    } else {
      start = new Date(snap.date);
      start.setHours(0, 0, 0, 0);
    }
    const windowMs = 24 * 3600000;
    const stepMs = 15 * 60000;

    // Sample altitude
    const pts: Array<{ t: number; alt: number }> = [];
    let minAlt = 0;
    let maxAlt = 0;
    for (let t = 0; t <= windowMs; t += stepMs) {
      const when = new Date(start.valueOf() + t);
      const alt = getMoonPosition(when, loc.lat, loc.lng).altitudeDegrees;
      pts.push({ t, alt });
      if (alt < minAlt) minAlt = alt;
      if (alt > maxAlt) maxAlt = alt;
    }
    const yMax = Math.max(30, Math.ceil((maxAlt + 8) / 10) * 10);
    const yMin = Math.min(-30, Math.floor((minAlt - 8) / 10) * 10);

    const x = (t: number) => padL + (t / windowMs) * (W - padL - padR);
    const y = (alt: number) =>
      padT + (1 - (alt - yMin) / (yMax - yMin)) * (H - padT - padB);
    const yHorizon = y(0);

    const linePath = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t).toFixed(1)} ${y(p.alt).toFixed(1)}`)
      .join(' ');
    const areaPath = `${linePath} L ${x(windowMs).toFixed(1)} ${H - padB} L ${padL} ${H - padB} Z`;

    // Markers: rise/set within the window
    const markers: Array<{ t: number; kind: 'rise' | 'set'; time: Date }> = [];
    for (const dayOffset of [-1, 0, 1]) {
      const dayDate = new Date(start.valueOf() + dayOffset * 24 * 3600000 + 12 * 3600000);
      const times = this._timesFor(dayDate, loc.lat, loc.lng);
      for (const kind of ['rise', 'set'] as const) {
        const tm = times[kind];
        if (!tm) continue;
        const t = tm.valueOf() - start.valueOf();
        if (t >= 0 && t <= windowMs) markers.push({ t, kind, time: tm });
      }
    }

    // Highest point in window
    let peak = pts[0];
    for (const p of pts) if (p.alt > peak.alt) peak = p;

    // Current marker
    const nowT = now.valueOf() - start.valueOf();
    const showCurrent =
      m.graph_show_current !== false && nowT >= 0 && nowT <= windowMs && isToday;
    const nowAlt = showCurrent
      ? getMoonPosition(now, loc.lat, loc.lng).altitudeDegrees
      : 0;

    // x tick labels: every 6 hours
    const xTicks: Array<{ t: number; label: string }> = [];
    if (m.graph_x_ticks !== false) {
      for (let hr = 0; hr <= 24; hr += 6) {
        const when = new Date(start.valueOf() + hr * 3600000);
        xTicks.push({
          t: hr * 3600000,
          label: this._fmtTime(when, lang, m.time_12hr === true, true),
        });
      }
    }
    const yTicks: number[] = [];
    if (m.graph_y_ticks) {
      for (let a = Math.ceil(yMin / 30) * 30; a <= yMax; a += 30) yTicks.push(a);
    }

    const riseLabel = localize('editor.lunar_phase.items.moonrise', lang, 'Moonrise');
    const setLabel = localize('editor.lunar_phase.items.moonset', lang, 'Moonset');

    return html`
      <div class="uc-lunar-horizon">
        <svg viewBox="0 0 ${W} ${H}" class="uc-lunar-horizon-svg" preserveAspectRatio="none" role="img"
          aria-label=${localize('editor.lunar_phase.view_horizon', lang, 'Horizon')}>
          <defs>
            <linearGradient id="uc-lunar-area-${(m.id || 'lp').replace(/[^a-zA-Z0-9_-]/g, '')}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="${accent}" stop-opacity="0.02"/>
            </linearGradient>
            <clipPath id="uc-lunar-above-${(m.id || 'lp').replace(/[^a-zA-Z0-9_-]/g, '')}">
              <rect x="0" y="0" width="${W}" height="${yHorizon.toFixed(1)}"/>
            </clipPath>
          </defs>

          ${yTicks.map(
            a => svg`
              <line x1=${padL} x2=${W - padR} y1=${y(a).toFixed(1)} y2=${y(a).toFixed(1)}
                class="uc-lunar-gridline"></line>
              <text x=${padL - 6} y=${(y(a) + 3).toFixed(1)} class="uc-lunar-tick" text-anchor="end">${a}°</text>
            `
          )}

          <!-- Filled glow above the horizon -->
          <path d="${areaPath}"
            fill="url(#uc-lunar-area-${(m.id || 'lp').replace(/[^a-zA-Z0-9_-]/g, '')})"
            clip-path="url(#uc-lunar-above-${(m.id || 'lp').replace(/[^a-zA-Z0-9_-]/g, '')})"></path>

          <!-- Horizon line -->
          <line x1=${padL} x2=${W - padR} y1=${yHorizon.toFixed(1)} y2=${yHorizon.toFixed(1)}
            class="uc-lunar-horizonline"></line>

          <!-- Altitude curve -->
          <path d="${linePath}" class="uc-lunar-curve" style="stroke:${accent}"></path>

          <!-- Rise / set markers -->
          ${markers.map(
            mk => svg`
              <g>
                <circle cx=${x(mk.t).toFixed(1)} cy=${yHorizon.toFixed(1)} r="4"
                  class="uc-lunar-marker" style="fill:${accent}"></circle>
                ${m.graph_show_time !== false
                  ? svg`
                      <text x=${x(mk.t).toFixed(1)} y=${(yHorizon + (mk.kind === 'rise' ? -10 : 14)).toFixed(1)}
                        class="uc-lunar-marker-label" text-anchor="middle">
                        ${mk.kind === 'rise' ? '↑' : '↓'} ${this._fmtTime(mk.time, lang, m.time_12hr === true, true)}
                      </text>
                    `
                  : nothing}
                <title>${mk.kind === 'rise' ? riseLabel : setLabel}</title>
              </g>
            `
          )}

          <!-- Highest point -->
          ${m.graph_show_highest !== false && peak.alt > 0
            ? svg`
                <g>
                  <path d="M ${x(peak.t).toFixed(1)} ${(y(peak.alt) - 5).toFixed(1)} l 4 5 l -4 5 l -4 -5 Z"
                    class="uc-lunar-marker" style="fill:${accent}"></path>
                  <text x=${x(peak.t).toFixed(1)} y=${(y(peak.alt) - 9).toFixed(1)}
                    class="uc-lunar-marker-label" text-anchor="middle">
                    ${Math.round(peak.alt)}°
                  </text>
                </g>
              `
            : nothing}

          ${showCurrent
            ? svg`
                <circle cx=${x(nowT).toFixed(1)} cy=${y(nowAlt).toFixed(1)} r="5"
                  class="uc-lunar-current" style="fill:${accent}"></circle>
                <circle cx=${x(nowT).toFixed(1)} cy=${y(nowAlt).toFixed(1)} r="5"
                  class="uc-lunar-current-pulse" style="stroke:${accent}"></circle>
              `
            : nothing}

          ${xTicks.map(
            tk => svg`
              <text x=${x(tk.t).toFixed(1)} y=${H - 8} class="uc-lunar-tick" text-anchor="middle">
                ${tk.label}
              </text>
            `
          )}
        </svg>
      </div>
    `;
  }

  // ── Compact layouts ─────────────────────────────────────────────────────────

  private _renderCompact(
    m: LunarPhaseModuleConfig,
    hass: HomeAssistant,
    lang: string,
    snap: MoonSnapshot,
    state: LunarUiState,
    southern: boolean,
    uid: string,
    accent: string
  ): TemplateResult {
    const layout = m.layout || 'compact';
    const phaseName = this._phaseName(snap.phaseId, lang);
    const decimals = m.number_decimals ?? 1;
    const expand = (e: Event) => {
      e.stopPropagation();
      state.expanded = true;
      this.triggerPreviewUpdate(true);
    };

    const moonSize =
      layout === 'moon_only' ? Math.max(60, Math.min(260, m.moon_size ?? 130)) : 76;
    const moon = html`
      <div class="uc-lunar-moon-wrap" style="width:${moonSize}px; height:${moonSize}px;">
        ${unsafeHTML(moonSvg(snap.phase, moonSize, southern, uid, accent))}
      </div>
    `;

    if (layout === 'moon_only') {
      return html`
        <div class="uc-lunar uc-lunar--moononly" role="button" tabindex="0"
          title=${phaseName}
          @click=${expand}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') expand(e);
          }}>
          ${moon}
        </div>
      `;
    }

    if (layout === 'minimal') {
      return html`
        <div class="uc-lunar uc-lunar--minimal" role="button" tabindex="0"
          @click=${expand}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') expand(e);
          }}>
          <div class="uc-lunar-min-side">
            <ha-icon icon="mdi:weather-moonset-up"></ha-icon>
            <span class="uc-lunar-min-time">${snap.times.rise ? this._fmtTime(snap.times.rise, lang, m.time_12hr === true) : '—'}</span>
            ${m.show_compact_labels !== false
              ? html`<span class="uc-lunar-min-label">${localize('editor.lunar_phase.items.moonrise', lang, 'Moonrise')}</span>`
              : nothing}
          </div>
          <div class="uc-lunar-min-center">
            ${moon}
            <span class="uc-lunar-min-phase">${phaseName}</span>
          </div>
          <div class="uc-lunar-min-side">
            <ha-icon icon="mdi:weather-moonset"></ha-icon>
            <span class="uc-lunar-min-time">${snap.times.set ? this._fmtTime(snap.times.set, lang, m.time_12hr === true) : '—'}</span>
            ${m.show_compact_labels !== false
              ? html`<span class="uc-lunar-min-label">${localize('editor.lunar_phase.items.moonset', lang, 'Moonset')}</span>`
              : nothing}
          </div>
        </div>
      `;
    }

    // 'compact' (default compact style)
    return html`
      <div class="uc-lunar uc-lunar--compact" role="button" tabindex="0"
        @click=${expand}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') expand(e);
        }}>
        ${moon}
        <div class="uc-lunar-compact-body">
          <div class="uc-lunar-title">${phaseName}</div>
          <div class="uc-lunar-compact-illum">
            ${this._fmtNum(snap.fraction * 100, decimals)}%
            <span class="uc-lunar-row-secondary">${localize('editor.lunar_phase.items.illumination', lang, 'Illumination')}</span>
          </div>
          <div class="uc-lunar-compact-stats">
            <div class="uc-lunar-compact-stat">
              <ha-icon icon="mdi:progress-clock"></ha-icon>
              <span>${this._fmtNum(snap.ageDays, decimals)}</span>
              ${m.show_compact_labels !== false
                ? html`<span class="uc-lunar-min-label">${localize('editor.lunar_phase.age_short', lang, 'Age')}</span>`
                : nothing}
            </div>
            <div class="uc-lunar-compact-stat">
              <ha-icon icon="mdi:weather-moonset-up"></ha-icon>
              <span>${snap.times.rise ? this._fmtTime(snap.times.rise, lang, m.time_12hr === true) : '—'}</span>
              ${m.show_compact_labels !== false
                ? html`<span class="uc-lunar-min-label">${localize('editor.lunar_phase.rise_short', lang, 'Rise')}</span>`
                : nothing}
            </div>
            <div class="uc-lunar-compact-stat">
              <ha-icon icon="mdi:weather-moonset"></ha-icon>
              <span>${snap.times.set ? this._fmtTime(snap.times.set, lang, m.time_12hr === true) : '—'}</span>
              ${m.show_compact_labels !== false
                ? html`<span class="uc-lunar-min-label">${localize('editor.lunar_phase.set_short', lang, 'Set')}</span>`
                : nothing}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Data item builder ───────────────────────────────────────────────────────

  private _buildDataItems(
    m: LunarPhaseModuleConfig,
    lang: string,
    snap: MoonSnapshot
  ): Array<{
    key: LunarPhaseDataItem;
    icon: string;
    label: string;
    value: string;
    secondary?: string | undefined;
  }> {
    const hidden = new Set<string>((m.hidden_items as string[]) || []);
    const decimals = m.number_decimals ?? 1;
    const use12 = m.time_12hr === true;
    const useMiles = m.use_miles === true;

    const out: Array<{
      key: LunarPhaseDataItem;
      icon: string;
      label: string;
      value: string;
      secondary?: string | undefined;
    }> = [];

    const push = (
      key: LunarPhaseDataItem,
      icon: string,
      value: string,
      secondary?: string
    ) => {
      if (hidden.has(key)) return;
      out.push({ key, icon, label: this._itemLabel(key, lang), value, secondary });
    };

    push(
      'moon_age',
      'mdi:progress-clock',
      `${this._fmtNum(snap.ageDays, decimals)} ${localize('editor.lunar_phase.days', lang, 'days')}`,
      `${this._fmtNum((snap.ageDays / LUNAR_CYCLE_DAYS) * 100, 0)}%`
    );
    push('illumination', 'mdi:brightness-percent', `${this._fmtNum(snap.fraction * 100, decimals)}%`);
    push(
      'azimuth',
      'mdi:compass-outline',
      `${this._fmtNum(snap.position.azimuthDegrees, decimals)}°`,
      COMPASS_POINTS[compassIndex(snap.position.azimuthDegrees)]
    );
    push('altitude', 'mdi:angle-acute', `${this._fmtNum(snap.position.altitudeDegrees, decimals)}°`);
    push(
      'distance',
      'mdi:map-marker-distance',
      useMiles
        ? `${this._fmtNum(snap.position.distanceKm * 0.621371, 0)} mi`
        : `${this._fmtNum(snap.position.distanceKm, 0)} km`
    );
    push(
      'position',
      'mdi:horizontal-rotate-clockwise',
      snap.position.altitudeDegrees > 0
        ? localize('editor.lunar_phase.over_horizon', lang, 'Over horizon')
        : localize('editor.lunar_phase.under_horizon', lang, 'Under horizon')
    );
    push(
      'moonrise',
      'mdi:weather-moonset-up',
      snap.times.rise ? this._fmtTime(snap.times.rise, lang, use12) : '—',
      snap.times.rise ? this._fmtRelative(snap.times.rise, lang) : undefined
    );
    push(
      'moonset',
      'mdi:weather-moonset',
      snap.times.set ? this._fmtTime(snap.times.set, lang, use12) : '—',
      snap.times.set ? this._fmtRelative(snap.times.set, lang) : undefined
    );
    push(
      'moon_highest',
      'mdi:format-vertical-align-top',
      snap.transit ? this._fmtTime(snap.transit.time, lang, use12) : '—',
      snap.transit ? `${this._fmtNum(snap.transit.altitudeDegrees, 0)}°` : undefined
    );
    push('next_full_moon', 'mdi:moon-full', this._fmtDate(snap.nextFullMoon, lang));
    push('next_new_moon', 'mdi:moon-new', this._fmtDate(snap.nextNewMoon, lang));
    push(
      'next_phase',
      'mdi:moon-waxing-gibbous',
      this._phaseName(snap.nextEvent.id, lang),
      this._fmtDate(snap.nextEvent.date, lang)
    );

    return out;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private _getState(m: LunarPhaseModuleConfig): LunarUiState {
    let st = this._uiState.get(m.id);
    if (!st) {
      const now = new Date();
      const viewMap: Record<string, LunarView> = {
        phase: 'phase',
        calendar: 'calendar',
        horizon: 'horizon',
      };
      st = {
        view: viewMap[m.default_view || 'phase'] || 'phase',
        selectedDate: null,
        page: 0,
        calMonth: now.getMonth(),
        calYear: now.getFullYear(),
        expanded: false,
      };
      this._uiState.set(m.id, st);
    }
    return st;
  }

  private _stepDay(state: LunarUiState, dir: 1 | -1): void {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();
    const base = state.selectedDate !== null ? state.selectedDate : todayMidnight;
    const next = base + dir * 24 * 3600000;
    state.selectedDate = next === todayMidnight ? null : next;
    state.page = 0;
    this.triggerPreviewUpdate(true);
  }

  private _resolveLocation(
    m: LunarPhaseModuleConfig,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): { lat: number; lng: number } | null {
    const source = m.location_source || 'default';
    if (source === 'custom') {
      if (typeof m.latitude === 'number' && typeof m.longitude === 'number') {
        return { lat: m.latitude, lng: m.longitude };
      }
      return null;
    }
    if (source === 'entity') {
      const entityId = this.resolveEntity(m.location_entity, config) || m.location_entity;
      const st = entityId ? hass?.states?.[entityId] : undefined;
      const lat = parseFloat(st?.attributes?.latitude);
      const lng = parseFloat(st?.attributes?.longitude);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      return null;
    }
    const lat = (hass as any)?.config?.latitude;
    const lng = (hass as any)?.config?.longitude;
    if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
    return null;
  }

  private _getSnapshot(date: Date, lat: number, lng: number): MoonSnapshot {
    // Cache per minute + location
    const key = `${Math.floor(date.valueOf() / 60000)}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
    const cached = this._snapshotCache.get(key);
    if (cached) return cached;
    if (this._snapshotCache.size > 60) this._snapshotCache.clear();
    const snap = getMoonSnapshot(date, lat, lng);
    this._snapshotCache.set(key, snap);
    return snap;
  }

  private _timesFor(date: Date, lat: number, lng: number) {
    return this._getSnapshot(date, lat, lng).times;
  }

  /** Re-render once a minute so the live position, markers, and relative times stay fresh */
  private _ensureTick(): void {
    if (this._tickTimer) return;
    this._tickTimer = setInterval(() => this.triggerPreviewUpdate(), 60000);
  }

  private _fontSize(value: string | undefined, autoPx: string): string {
    if (!value || value === 'auto') return autoPx;
    return FONT_SIZE_MAP[value] || value;
  }

  private _fmtNum(value: number, decimals: number): string {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.max(0, Math.min(3, decimals)),
    });
  }

  private _fmtTime(date: Date, lang: string, use12: boolean, short: boolean = false): string {
    try {
      return date.toLocaleTimeString(lang, {
        hour: short && !use12 ? '2-digit' : 'numeric',
        minute: short ? undefined : '2-digit',
        hour12: use12,
      });
    } catch {
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: use12 });
    }
  }

  private _fmtDate(date: Date, lang: string): string {
    try {
      return date.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return date.toLocaleDateString();
    }
  }

  private _fmtRelative(date: Date, lang: string): string {
    const diffMin = Math.round((date.valueOf() - Date.now()) / 60000);
    try {
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'always', style: 'short' });
      if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
      if (Math.abs(diffMin) < 60 * 36) return rtf.format(Math.round(diffMin / 60), 'hour');
      return rtf.format(Math.round(diffMin / (60 * 24)), 'day');
    } catch {
      const hrs = Math.round(diffMin / 60);
      return hrs >= 0 ? `in ${hrs} h` : `${-hrs} h ago`;
    }
  }

  private _phaseName(id: MoonPhaseId, lang: string): string {
    const fallback: Record<MoonPhaseId, string> = {
      new_moon: 'New Moon',
      waxing_crescent: 'Waxing Crescent',
      first_quarter: 'First Quarter',
      waxing_gibbous: 'Waxing Gibbous',
      full_moon: 'Full Moon',
      waning_gibbous: 'Waning Gibbous',
      last_quarter: 'Last Quarter',
      waning_crescent: 'Waning Crescent',
    };
    return localize(`editor.lunar_phase.phases.${id}`, lang, fallback[id]);
  }

  private _itemLabel(key: LunarPhaseDataItem, lang: string): string {
    const fallback: Record<LunarPhaseDataItem, string> = {
      moon_age: 'Moon age',
      illumination: 'Illumination',
      azimuth: 'Azimuth',
      altitude: 'Altitude',
      distance: 'Distance',
      position: 'Position',
      moonrise: 'Moonrise',
      moonset: 'Moonset',
      moon_highest: 'Moon highest',
      next_full_moon: 'Next full moon',
      next_new_moon: 'Next new moon',
      next_phase: 'Next phase',
    };
    return localize(`editor.lunar_phase.items.${key}`, lang, fallback[key]);
  }

  private _renderProLockUI(lang: string): TemplateResult {
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
            'editor.lunar_phase.pro_description',
            lang,
            'Lunar Phase is a Pro feature with an animated moon, live lunar data, a month calendar, and a horizon graph.'
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

  // ── CSS ─────────────────────────────────────────────────────────────────────

  getStyles(): string {
    return `
      ${BaseUltraModule.getSliderStyles()}

      /* Editor conditional groups */
      .conditional-fields-group {
        margin-top: 16px;
        margin-bottom: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 8px 8px 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: uc-lunar-slide-in 0.3s ease-out;
      }
      .conditional-fields-group:hover { background: rgba(var(--rgb-primary-color), 0.12); }
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
      .conditional-fields-content { padding: 16px; }
      @keyframes uc-lunar-slide-in {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
      }

      /* ═══ Wrapper ════════════════════════════════════════════════════ */
      .uc-lunar-wrapper {
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
        border-radius: 20px;
        color: var(--uc-lunar-text);
        isolation: isolate;
      }
      .uc-lunar {
        position: relative;
        z-index: 2;
        box-sizing: border-box;
      }

      /* ═══ Starfield ══════════════════════════════════════════════════ */
      .uc-lunar-stars {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        background-image:
          radial-gradient(1.2px 1.2px at 22px 34px, rgba(255,255,255,0.95), transparent 55%),
          radial-gradient(1px 1px at 84px 12px, rgba(255,255,255,0.7), transparent 55%),
          radial-gradient(1.4px 1.4px at 132px 76px, rgba(255,255,255,0.85), transparent 55%),
          radial-gradient(0.9px 0.9px at 48px 102px, rgba(255,255,255,0.6), transparent 55%),
          radial-gradient(1.1px 1.1px at 161px 28px, rgba(255,255,255,0.75), transparent 55%),
          radial-gradient(0.8px 0.8px at 105px 130px, rgba(255,255,255,0.55), transparent 55%);
        background-size: 190px 160px;
        animation: uc-lunar-twinkle 5s ease-in-out infinite;
      }
      .uc-lunar-stars--alt {
        background-image:
          radial-gradient(1px 1px at 64px 54px, rgba(255,255,255,0.8), transparent 55%),
          radial-gradient(1.3px 1.3px at 14px 118px, rgba(255,255,255,0.9), transparent 55%),
          radial-gradient(0.9px 0.9px at 118px 22px, rgba(255,255,255,0.6), transparent 55%),
          radial-gradient(1.1px 1.1px at 150px 104px, rgba(255,255,255,0.7), transparent 55%);
        background-size: 230px 200px;
        animation: uc-lunar-twinkle 7s ease-in-out infinite reverse;
      }
      @keyframes uc-lunar-twinkle {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 0.35; }
      }

      /* ═══ Full layout ════════════════════════════════════════════════ */
      .uc-lunar--full {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
      }
      .uc-lunar-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }
      .uc-lunar-title {
        font-size: var(--uc-lunar-header-size);
        text-transform: var(--uc-lunar-header-transform);
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0.01em;
      }
      .uc-lunar-subtitle {
        font-size: 0.75rem;
        color: var(--uc-lunar-dim);
        margin-top: 2px;
      }
      .uc-lunar-header-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Buttons */
      .uc-lunar-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 32px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--uc-lunar-line);
        border-radius: 9px;
        background: var(--uc-lunar-chip);
        color: var(--uc-lunar-dim);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .uc-lunar-btn ha-icon { --mdc-icon-size: 17px; }
      .uc-lunar-btn:hover {
        color: var(--uc-lunar-text);
        border-color: var(--uc-lunar-accent);
        transform: translateY(-1px);
      }
      .uc-lunar-btn:focus-visible {
        outline: 2px solid var(--uc-lunar-accent);
        outline-offset: 2px;
      }
      .uc-lunar-btn--active {
        color: var(--uc-lunar-text);
        border-color: var(--uc-lunar-accent);
        background: color-mix(in srgb, var(--uc-lunar-accent) 18%, transparent);
        box-shadow: 0 0 10px color-mix(in srgb, var(--uc-lunar-accent) 35%, transparent);
      }
      .uc-lunar-btn--pill {
        width: auto;
        height: 24px;
        padding: 0 10px;
        font-size: 0.7rem;
        font-weight: 600;
        border-radius: 12px;
      }
      .uc-lunar-btn--pill ha-icon { --mdc-icon-size: 13px; }

      /* ═══ Phase view ═════════════════════════════════════════════════ */
      .uc-lunar-phaseview {
        display: flex;
        align-items: center;
        gap: 18px;
        animation: uc-lunar-fade 0.35s ease;
      }
      @keyframes uc-lunar-fade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Moon graphic */
      .uc-lunar-moon-wrap {
        position: relative;
        flex-shrink: 0;
        cursor: default;
        --uc-lunar-px: 50%;
        --uc-lunar-py: 50%;
      }
      .uc-lunar-moon-wrap::after {
        content: '';
        position: absolute;
        inset: 6%;
        border-radius: 50%;
        background: radial-gradient(circle at var(--uc-lunar-px) var(--uc-lunar-py),
          rgba(255,255,255,0.16) 0%, transparent 42%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }
      .uc-lunar-moon-wrap:hover::after { opacity: 1; }
      .uc-lunar-moon-svg {
        display: block;
        width: 100%;
        height: 100%;
        animation: uc-lunar-drift 14s ease-in-out infinite;
        transition: filter 0.3s ease;
      }
      .uc-lunar-moon-wrap:hover .uc-lunar-moon-svg { filter: brightness(1.12); }
      .uc-lunar-moon-halo { animation: uc-lunar-halo 6s ease-in-out infinite; transform-origin: center; }
      @keyframes uc-lunar-drift {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes uc-lunar-halo {
        0%, 100% { opacity: 0.75; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.045); }
      }

      /* Data list */
      .uc-lunar-data {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        touch-action: pan-y;
        backdrop-filter: blur(3px);
      }
      .uc-lunar-pages {
        display: flex;
        transition: transform 0.35s cubic-bezier(0.33, 1, 0.68, 1);
      }
      .uc-lunar-page {
        flex: 0 0 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .uc-lunar-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 2px;
        border-bottom: 1px solid var(--uc-lunar-line);
        font-size: var(--uc-lunar-label-size);
        text-transform: var(--uc-lunar-label-transform);
      }
      .uc-lunar-page .uc-lunar-row:last-child { border-bottom: none; }
      .uc-lunar-row-label {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--uc-lunar-dim);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lunar-row-label ha-icon { --mdc-icon-size: 15px; opacity: 0.8; flex-shrink: 0; }
      .uc-lunar-row-value {
        font-weight: 600;
        color: var(--uc-lunar-text);
        white-space: nowrap;
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
      }
      .uc-lunar-row-secondary {
        font-weight: 400;
        font-size: 0.85em;
        color: var(--uc-lunar-dim);
      }

      /* Pagination dots */
      .uc-lunar-dots {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding-top: 8px;
      }
      .uc-lunar-dot {
        width: 7px;
        height: 7px;
        padding: 0;
        border: none;
        border-radius: 4px;
        background: var(--uc-lunar-line);
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .uc-lunar-dot--active {
        width: 16px;
        background: var(--uc-lunar-accent);
      }
      .uc-lunar-dot:focus-visible {
        outline: 2px solid var(--uc-lunar-accent);
        outline-offset: 2px;
      }

      /* Date nav footer */
      .uc-lunar-datanav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border-top: 1px solid var(--uc-lunar-line);
        padding-top: 10px;
      }
      .uc-lunar-datanav-label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--uc-lunar-dim);
      }

      /* ═══ Calendar view ══════════════════════════════════════════════ */
      .uc-lunar-calendar { animation: uc-lunar-fade 0.35s ease; }
      .uc-lunar-cal-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
      }
      .uc-lunar-cal-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--uc-lunar-text);
      }
      .uc-lunar-cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 3px;
      }
      .uc-lunar-weekday {
        text-align: center;
        font-size: 0.6rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--uc-lunar-dim);
        padding-bottom: 3px;
      }
      .uc-lunar-day {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        aspect-ratio: 1 / 1;
        border: 1px solid transparent;
        border-radius: 8px;
        background: var(--uc-lunar-chip);
        color: var(--uc-lunar-dim);
        cursor: pointer;
        padding: 2px;
        transition: all 0.2s ease;
      }
      .uc-lunar-day--empty {
        background: transparent;
        cursor: default;
        pointer-events: none;
      }
      .uc-lunar-day:hover {
        border-color: var(--uc-lunar-accent);
        color: var(--uc-lunar-text);
        transform: scale(1.05);
      }
      .uc-lunar-day:focus-visible {
        outline: 2px solid var(--uc-lunar-accent);
        outline-offset: 1px;
      }
      .uc-lunar-day--today {
        border-color: var(--uc-lunar-accent);
        box-shadow: 0 0 8px color-mix(in srgb, var(--uc-lunar-accent) 40%, transparent);
      }
      .uc-lunar-day--selected {
        background: color-mix(in srgb, var(--uc-lunar-accent) 22%, transparent);
        color: var(--uc-lunar-text);
      }
      .uc-lunar-day-num {
        font-size: 0.62rem;
        font-weight: 600;
        line-height: 1;
      }

      /* ═══ Horizon view ═══════════════════════════════════════════════ */
      .uc-lunar-horizon { animation: uc-lunar-fade 0.35s ease; }
      .uc-lunar-horizon-svg {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 480 / 190;
      }
      .uc-lunar-gridline {
        stroke: var(--uc-lunar-line);
        stroke-width: 1;
      }
      .uc-lunar-horizonline {
        stroke: var(--uc-lunar-dim);
        stroke-width: 1;
        stroke-dasharray: 5 4;
        opacity: 0.7;
      }
      .uc-lunar-curve {
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .uc-lunar-marker { opacity: 0.95; }
      .uc-lunar-marker-label {
        font-size: 10px;
        font-weight: 600;
        fill: var(--uc-lunar-dim);
      }
      .uc-lunar-tick {
        font-size: 9px;
        fill: var(--uc-lunar-dim);
        opacity: 0.8;
      }
      .uc-lunar-current { opacity: 1; }
      .uc-lunar-current-pulse {
        fill: none;
        stroke-width: 2;
        animation: uc-lunar-pulse 2.4s ease-out infinite;
        transform-origin: center;
        transform-box: fill-box;
      }
      @keyframes uc-lunar-pulse {
        0% { opacity: 0.8; transform: scale(1); }
        100% { opacity: 0; transform: scale(2.6); }
      }

      /* ═══ Compact layouts ════════════════════════════════════════════ */
      .uc-lunar--compact {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        cursor: pointer;
        animation: uc-lunar-fade 0.35s ease;
      }
      .uc-lunar--compact:focus-visible,
      .uc-lunar--minimal:focus-visible,
      .uc-lunar--moononly:focus-visible {
        outline: 2px solid var(--uc-lunar-accent);
        outline-offset: -2px;
        border-radius: 16px;
      }
      .uc-lunar-compact-body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .uc-lunar-compact-illum {
        font-size: 0.95rem;
        font-weight: 700;
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
      }
      .uc-lunar-compact-stats {
        display: flex;
        gap: 6px;
        margin-top: 2px;
      }
      .uc-lunar-compact-stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 6px 4px;
        border-radius: 9px;
        background: var(--uc-lunar-chip);
        font-size: 0.74rem;
        font-weight: 600;
        white-space: nowrap;
        transition: transform 0.2s ease;
      }
      .uc-lunar-compact-stat:hover { transform: scale(1.06); }
      .uc-lunar-compact-stat ha-icon { --mdc-icon-size: 15px; color: var(--uc-lunar-dim); }

      .uc-lunar--minimal {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 12px 16px;
        cursor: pointer;
        animation: uc-lunar-fade 0.35s ease;
      }
      .uc-lunar-min-side {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        flex: 1;
        transition: transform 0.2s ease;
      }
      .uc-lunar-min-side:hover { transform: scale(1.07); }
      .uc-lunar-min-side ha-icon { --mdc-icon-size: 17px; color: var(--uc-lunar-dim); }
      .uc-lunar-min-time { font-size: 0.82rem; font-weight: 700; }
      .uc-lunar-min-label {
        font-size: 0.6rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--uc-lunar-dim);
      }
      .uc-lunar-min-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex: 1.2;
      }
      .uc-lunar-min-phase {
        font-size: 0.74rem;
        font-weight: 700;
        text-transform: var(--uc-lunar-header-transform);
        text-align: center;
      }

      .uc-lunar--moononly {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        cursor: pointer;
        animation: uc-lunar-fade 0.35s ease;
      }

      /* ═══ Responsive ═════════════════════════════════════════════════ */
      @media (max-width: 460px) {
        .uc-lunar-phaseview { flex-direction: column; gap: 10px; }
        .uc-lunar-data { width: 100%; }
      }

      /* ═══ Reduced motion ═════════════════════════════════════════════ */
      @media (prefers-reduced-motion: reduce) {
        .uc-lunar-moon-svg,
        .uc-lunar-moon-halo,
        .uc-lunar-stars,
        .uc-lunar-stars--alt,
        .uc-lunar-current-pulse {
          animation: none !important;
        }
        .uc-lunar-pages { transition: none; }
      }
    `;
  }
}
