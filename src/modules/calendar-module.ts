import { TemplateResult, html, css, nothing } from 'lit';
import { localize } from '../localize/localize';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  CalendarModule,
  CalendarEntityConfig,
  CalendarViewType,
  CalendarEventRule,
  ProcessedCalendarEvent,
  UltraCardConfig,
} from '../types';
import { UltraLinkComponent } from '../components/ultra-link';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

// Import calendar views
import {
  renderCompactListView,
  renderMonthView,
  renderWeekView,
  renderDayView,
  renderTableView,
  renderGridView,
  CalendarViewContext,
  CalendarDayWeather,
  ScrollState,
} from './calendar-module-views';
import { CalendarService } from '../services/calendar-service';
import { getWeatherForecast, forecastDayKey } from '../utils/uc-weather-forecast';

/** Views with a date to navigate (month / week / day). */
const NAV_VIEWS: CalendarViewType[] = ['month', 'week', 'day'];
const DEFAULT_SWITCHER_VIEWS: CalendarViewType[] = ['month', 'week', 'day'];
/** Event Display settings a view can set for itself. */
const EVENT_DISPLAY_KEYS = [
  'show_event_time',
  'show_end_time',
  'show_event_location',
  'show_event_description',
  'show_event_icon',
] as const;
type EventDisplayKey = (typeof EVENT_DISPLAY_KEYS)[number];
/** Which Event Display settings each view uses (so its section only lists those). */
const VIEW_EVENT_DISPLAY_KEYS: Record<CalendarViewType, EventDisplayKey[]> = {
  month: ['show_event_time', 'show_end_time', 'show_event_location', 'show_event_description'],
  week: [],
  day: ['show_event_time', 'show_end_time', 'show_event_location', 'show_event_description'],
  compact_list: ['show_event_time', 'show_end_time', 'show_event_location', 'show_event_description', 'show_event_icon'],
  table: ['show_end_time', 'show_event_description'],
  grid: ['show_event_time', 'show_end_time', 'show_event_location', 'show_event_description'],
};
/** Views mix colours with rgba(); turn rgb() picks into hex so that keeps working. */
function toHexColor(color: string): string {
  const c = color.trim();
  const m = c.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (!m) return c;
  return '#' + [m[1], m[2], m[3]].map(n => Math.min(255, Number(n)).toString(16).padStart(2, '0')).join('');
}

/** calendar entity supported_features bit for creating events. */
const CALENDAR_CREATE_EVENT = 1;

const WEATHER_ICONS: Record<string, string> = {
  'clear-night': 'mdi:weather-night',
  cloudy: 'mdi:weather-cloudy',
  exceptional: 'mdi:alert-circle-outline',
  fog: 'mdi:weather-fog',
  hail: 'mdi:weather-hail',
  lightning: 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  partlycloudy: 'mdi:weather-partly-cloudy',
  pouring: 'mdi:weather-pouring',
  rainy: 'mdi:weather-rainy',
  snowy: 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  sunny: 'mdi:weather-sunny',
  windy: 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
};

interface CalendarAddForm {
  calendar: string;
  summary: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  description: string;
  saving: boolean;
  error: string;
}

/** Events fetched for one set of calendars and dates. */
interface CalendarFetchEntry {
  events: ProcessedCalendarEvent[];
  loading: boolean;
  error: string | null;
  lastFetch: number;
}

interface CalendarModuleState {
  expanded: boolean;
  /** View picked with the view switcher (null = module's view_type). */
  view: CalendarViewType | null;
  /** module.view_type when `view` was picked; a new default resets the pick. */
  baseView: CalendarViewType | null;
  anchor: Date | null;
  selectedDateKey: string | undefined;
  hidden: Set<string>;
  form: CalendarAddForm | null;
  restored: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');
const toDateInput = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const toTimeInput = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/**
 * Calendar Module - Pro Feature
 *
 * A comprehensive calendar display module for Home Assistant calendar entities.
 * Features include:
 * - Multiple calendar views (Day, Week, Month, Table, Compact List, Grid)
 * - Multi-calendar support with custom colors
 * - Event filtering and date range configuration
 * - Extensive styling options (colors, fonts, spacing, separators)
 * - Expand/collapse functionality
 * - Auto-refresh with configurable interval
 * - Full Ultra Card integration (actions, logic, design)
 */
export class UltraCalendarModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'calendar',
    title: 'Calendar',
    description: 'Display calendar events with multiple view options',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:calendar-month',
    category: 'data',
    tags: ['calendar', 'events', 'schedule', 'agenda', 'planner', 'pro'],
  };

  private _calendarService: CalendarService | null = null;
  // One shared module instance renders every Calendar module on the dashboard,
  // so fetched events and UI state are kept per module id. A single shared slot
  // made each Calendar show whichever calendar was fetched first.
  private _states: Map<string, CalendarModuleState> = new Map();
  /**
   * Fetched events keyed by module + calendars + dates. Keyed by what was asked for (not
   * only the module id) so the dashboard card behind the editor and the editor preview,
   * which share a module id but can have different calendars, never overwrite each other.
   */
  private _fetches: Map<string, CalendarFetchEntry> = new Map();
  /** Last entry with results per module + surface, shown while the next range loads. */
  private _shown: Map<string, CalendarFetchEntry> = new Map();
  private _ruleCache: WeakMap<ProcessedCalendarEvent[], { key: string; result: ProcessedCalendarEvent[] }> =
    new WeakMap();
  private _hass: HomeAssistant | null = null;
  private _refreshInterval: ReturnType<typeof setInterval> | null = null;
  private _clockTimer: ReturnType<typeof setInterval> | null = null;
  private _clockLastUse = 0;
  
  // Scroll navigation state for hidden overflow mode
  private _scrollContainer: HTMLElement | null = null;
  private _scrollState: ScrollState = { canScrollUp: false, canScrollDown: false };
  private _scrollAmount: number = 100; // Pixels to scroll per button click
  private _scrollContainerId: string = `cal-scroll-${Math.random().toString(36).substring(2, 9)}`;

  createDefault(id?: string, hass?: HomeAssistant): CardModule {
    // Create a default calendar entity
    const defaultCalendar: CalendarEntityConfig = {
      id: this.generateId('cal_entity'),
      entity: '',
      name: '',
      color: '#03a9f4',
      visible: true,
    };

    return {
      id: id || this.generateId('calendar'),
      type: 'calendar',

      // Calendar entities
      calendars: [defaultCalendar],

      // View configuration
      view_type: 'compact_list' as CalendarViewType,
      days_to_show: 7,

      // Title configuration
      title: '',
      show_title: false,
      title_font_size: '20px',
      title_color: 'var(--primary-text-color)',
      show_title_separator: false,
      title_separator_color: 'var(--divider-color)',
      title_separator_width: '1px',

      // Compact list view options
      compact_events_to_show: 5,
      compact_show_all_day_events: true,
      compact_hide_empty_days: false,
      compact_show_nav_buttons: true, // Show scroll buttons when overflow is hidden

      // Month view options
      show_week_numbers: 'none',
      first_day_of_week: 'sunday',
      month_show_event_count: true,
      month_event_display: 'titles',
      month_show_day_details: true,
      show_navigation: true,

      // Week/Day view options
      week_start_hour: 0,
      week_end_hour: 24,
      week_time_interval: 60,
      day_start_hour: 0,
      day_end_hour: 24,
      day_time_interval: 60,

      // Table view options
      table_show_date_column: true,
      table_show_time_column: true,
      table_show_calendar_column: true,
      table_show_location_column: true,
      table_show_duration_column: false,

      // Grid view options
      grid_columns: 2,
      grid_card_height: 'auto',

      // Event display options
      show_event_time: true,
      show_end_time: true,
      show_event_location: true,
      show_event_description: false,
      show_event_icon: true,
      time_24h: false,
      remove_location_country: false,
      max_event_title_length: 0,
      show_past_events: false,

      // Date column styling
      date_vertical_alignment: 'top',
      weekday_font_size: '12px',
      weekday_color: 'var(--secondary-text-color)',
      day_font_size: '24px',
      day_color: 'var(--primary-text-color)',
      show_month: false,
      month_font_size: '12px',
      month_color: 'var(--secondary-text-color)',

      // Event styling
      event_font_size: '14px',
      event_color: 'var(--primary-text-color)',
      time_font_size: '12px',
      time_color: 'var(--secondary-text-color)',
      time_icon_size: '14px',
      location_font_size: '12px',
      location_color: 'var(--secondary-text-color)',
      location_icon_size: '14px',
      description_font_size: '12px',
      description_color: 'var(--secondary-text-color)',

      // Background and accent styling
      event_background_opacity: 0,
      vertical_line_width: '3px',
      accent_color: 'var(--primary-color)',

      // Layout and spacing
      row_spacing: '8px',
      event_spacing: '4px',
      additional_card_spacing: '0px',

      // Separators
      show_day_separator: false,
      day_separator_width: '1px',
      day_separator_color: 'var(--divider-color)',
      show_week_separator: false,
      week_separator_width: '1px',
      week_separator_color: 'var(--divider-color)',
      month_separator_width: '1px',
      month_separator_color: 'var(--divider-color)',

      // Expand/collapse functionality
      tap_action_expand: false,

      // Refresh interval (in minutes)
      refresh_interval: 15,

      // Event filtering
      filter_keywords: [],
      filter_mode: 'exclude',

      // Actions
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      event_tap_action: { action: 'more-info' },

      // Hover configuration
      enable_hover_effect: false,
      hover_background_color: '',
    } as CalendarModule;
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const calendarModule = module as CalendarModule;
    const errors = [...baseValidation.errors];

    // Check for at least one calendar entity
    if (!calendarModule.calendars || calendarModule.calendars.length === 0) {
      errors.push('At least one calendar entity must be configured');
    } else {
      // Check that at least one calendar has an entity selected
      const hasValidEntity = calendarModule.calendars.some(
        cal => cal.entity && cal.entity.trim() !== ''
      );
      if (!hasValidEntity) {
        errors.push('At least one calendar must have an entity selected');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as CalendarModule, hass, updates => updateModule(updates));
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as CalendarModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const calendarModule = module as CalendarModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this.getEditorStyles()}
      </style>

      <!-- Calendar Selection Section -->
      ${this.renderCalendarSelectionSection(calendarModule, hass, updateModule, lang)}

      <!-- View Configuration Section -->
      ${this.renderViewConfigSection(calendarModule, hass, updateModule, lang)}

      <!-- Event Display Options Section (all views) -->
      ${this.renderEventDisplaySection(calendarModule, hass, updateModule, lang)}

      <!-- One section per view the card offers -->
      ${this.renderPerViewSections(calendarModule, hass, updateModule, lang)}

      <!-- Event Rules Section -->
      ${this.renderEventRulesSection(calendarModule, hass, updateModule, lang)}

      <!-- Styling Section -->
      ${this.renderStylingSection(calendarModule, hass, updateModule, lang)}

      <!-- Advanced Options Section -->
      ${this.renderAdvancedSection(calendarModule, hass, updateModule, lang)}
    `;
  }

  private renderCalendarSelectionSection(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const calendars = module.calendars || [];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.calendar.calendars_section', lang, 'Calendar Entities')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.calendar.calendars_desc',
            lang,
            'Add calendar entities to display. Each calendar can have a custom color.'
          )}
        </div>

        <div class="calendar-list">
          ${calendars.map(
            (cal, index) => html`
              <div class="calendar-item">
                <div class="calendar-item-header">
                  <div class="calendar-color-preview" style="background: ${cal.color || '#03a9f4'}">
                  </div>
                  <span class="calendar-item-title">
                    ${cal.name || cal.entity || `Calendar ${index + 1}`}
                  </span>
                  <div class="calendar-item-actions">
                    <ha-icon-button
                      @click=${() => this.toggleCalendarVisibility(index, module, updateModule)}
                      title="${cal.visible !== false ? 'Hide' : 'Show'}"
                    >
                      <ha-icon
                        icon="${cal.visible !== false ? 'mdi:eye' : 'mdi:eye-off'}"
                      ></ha-icon>
                    </ha-icon-button>
                    ${calendars.length > 1
                      ? html`
                          <ha-icon-button
                            @click=${() => this.removeCalendar(index, module, updateModule)}
                            title="Remove"
                          >
                            <ha-icon icon="mdi:delete"></ha-icon>
                          </ha-icon-button>
                        `
                      : ''}
                  </div>
                </div>

                <div class="calendar-item-content">
                  <!-- Entity Picker -->
                  <div class="field-row">
                    ${this.renderEntityPickerWithVariables(
                      hass, undefined as any, 'entity', cal.entity || '',
                      (value: string) => this.updateCalendarEntity(index, 'entity', value, module, updateModule),
                      ['calendar'],
                      'Entity'
                    )}
                    <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
                      Select a Home Assistant calendar entity to show events from.
                    </div>
                  </div>

                  <!-- Custom Name -->
                  <div class="field-row">
                    <div class="field-title">Display Name (optional)</div>
                    <ha-form
                      .hass=${hass}
                      .data=${{ name: cal.name || '' }}
                      .schema=${[
                        {
                          name: 'name',
                          selector: { text: {} },
                        },
                      ]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        this.updateCalendarEntity(index, 'name', e.detail.value.name, module, updateModule)}
                    ></ha-form>
                  </div>

                  <!-- Color Picker -->
                  <div class="field-row">
                    <div class="field-title">Calendar Color</div>
                    <ultra-color-picker
                      .value=${cal.color || '#03a9f4'}
                      .defaultValue=${'#03a9f4'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        this.updateCalendarEntity(index, 'color', e.detail.value, module, updateModule)}
                    ></ultra-color-picker>
                  </div>

                  ${module.show_calendar_filter && module.calendar_filter_group === 'person'
                    ? html`
                        <div class="field-row">
                          ${this.renderEntityPickerWithVariables(
                            hass, undefined as any, 'person', cal.person || '',
                            (value: string) => this.updateCalendarEntity(index, 'person', value, module, updateModule),
                            ['person'],
                            localize('editor.calendar.calendar_person', lang, 'Person')
                          )}
                          <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
                            ${localize('editor.calendar.calendar_person_desc', lang, 'Whose calendar this is. The header filter groups calendars by person; calendars without a person show under Shared.')}
                          </div>
                        </div>
                      `
                    : ''}
                </div>
              </div>
            `
          )}
        </div>

        <button class="add-calendar-btn" @click=${() => this.addCalendar(module, updateModule)}>
          <ha-icon icon="mdi:plus"></ha-icon>
          ${localize('editor.calendar.add_calendar', lang, 'Add Calendar')}
        </button>
      </div>
    `;
  }

  private renderViewConfigSection(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const VIEW_OPTS: Array<{ value: CalendarViewType; label: string }> = [
      { value: 'month', label: localize('editor.calendar.view_month', lang, 'Month') },
      { value: 'week', label: localize('editor.calendar.view_week', lang, 'Week') },
      { value: 'day', label: localize('editor.calendar.view_day', lang, 'Day') },
      { value: 'compact_list', label: localize('editor.calendar.view_list', lang, 'List') },
      { value: 'table', label: localize('editor.calendar.view_table', lang, 'Table') },
      { value: 'grid', label: localize('editor.calendar.view_grid', lang, 'Grid') },
    ];
    const viewOptions = [
      { value: 'compact_list', label: 'Compact List' },
      { value: 'month', label: 'Month' },
      { value: 'week', label: 'Week' },
      { value: 'day', label: 'Day' },
      { value: 'table', label: 'Table' },
      { value: 'grid', label: 'Grid' },
    ];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.calendar.view_config', lang, 'View Configuration')}
        </div>
        <div class="section-description">
          ${localize('editor.calendar.view_config_desc', lang, 'Configure the calendar view layout and date range.')}
        </div>

        <!-- View Type -->
        ${this.renderFieldSection(
          'View Type',
          'Select how events are displayed',
          hass,
          { view_type: module.view_type || 'compact_list' },
          [this.selectField('view_type', viewOptions)],
          (e: CustomEvent) => {
            updateModule({ view_type: e.detail.value.view_type });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        <!-- Days to Show (month / week / day show the dates you page to) -->
        ${this._offeredViews(module).every(v => NAV_VIEWS.includes(v)) ? '' : this.renderSliderField(
          localize('editor.calendar.days_to_show', lang, 'Days to Show'),
          localize('editor.calendar.days_to_show_desc', lang, 'Number of days the List, Table and Grid views show events for.'),
          module.days_to_show || 7,
          7,
          1,
          365,
          1,
          (value: number) => updateModule({ days_to_show: value }),
          ''
        )}

        <!-- Header controls -->
        ${this.renderFieldSection(
          localize('editor.calendar.show_navigation', lang, 'Previous / next buttons'),
          localize('editor.calendar.show_navigation_desc', lang, 'Arrows in the header to page through months, weeks or days (month, week and day views).'),
          hass,
          { show_navigation: module.show_navigation !== false },
          [this.booleanField('show_navigation')],
          (e: CustomEvent) => {
            updateModule({ show_navigation: e.detail.value.show_navigation });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.show_view_switcher', lang, 'View switcher'),
          localize('editor.calendar.show_view_switcher_desc', lang, 'Buttons in the header to switch between views.'),
          hass,
          { show_view_switcher: !!module.show_view_switcher },
          [this.booleanField('show_view_switcher')],
          (e: CustomEvent) => {
            updateModule({ show_view_switcher: e.detail.value.show_view_switcher });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${module.show_view_switcher
          ? this.renderFieldSection(
              localize('editor.calendar.available_views', lang, 'Views to offer'),
              localize('editor.calendar.available_views_desc', lang, 'Which views the switcher shows, e.g. only Week and Day. The card opens on View Type when it is in this list.'),
              hass,
              { available_views: this._switcherViews(module) },
              [
                {
                  name: 'available_views',
                  selector: { select: { multiple: true, mode: 'list', options: VIEW_OPTS } },
                },
              ],
              (e: CustomEvent) => {
                const order = VIEW_OPTS.map(o => o.value);
                const picked = ((e.detail.value.available_views || []) as CalendarViewType[])
                  .filter(v => order.includes(v))
                  .sort((a, b) => order.indexOf(a) - order.indexOf(b));
                updateModule({ available_views: picked.length ? picked : undefined });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )
          : ''}

        ${this.renderFieldSection(
          localize('editor.calendar.show_add_event', lang, 'Add event button'),
          localize('editor.calendar.show_add_event_desc', lang, 'A + button in the header to create an event. Only calendars that accept new events (e.g. Local Calendar, Google, CalDAV) are offered.'),
          hass,
          { show_add_event: !!module.show_add_event },
          [this.booleanField('show_add_event')],
          (e: CustomEvent) => {
            updateModule({ show_add_event: e.detail.value.show_add_event });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.show_calendar_filter', lang, 'Calendar filter'),
          localize('editor.calendar.show_calendar_filter_desc', lang, 'Chips in the header to show or hide calendars. The choice is remembered on each device.'),
          hass,
          { show_calendar_filter: !!module.show_calendar_filter },
          [this.booleanField('show_calendar_filter')],
          (e: CustomEvent) => {
            updateModule({ show_calendar_filter: e.detail.value.show_calendar_filter });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${module.show_calendar_filter
          ? this.renderFieldSection(
              localize('editor.calendar.calendar_filter_group', lang, 'Filter by'),
              localize('editor.calendar.calendar_filter_group_desc', lang, 'One chip per calendar, or one per person (set the person on each calendar above).'),
              hass,
              { calendar_filter_group: module.calendar_filter_group || 'calendar' },
              [
                this.selectField('calendar_filter_group', [
                  { value: 'calendar', label: localize('editor.calendar.filter_by_calendar', lang, 'Calendar') },
                  { value: 'person', label: localize('editor.calendar.filter_by_person', lang, 'Person') },
                ]),
              ],
              (e: CustomEvent) => {
                updateModule({ calendar_filter_group: e.detail.value.calendar_filter_group });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )
          : ''}

        <!-- Weather -->
        <div class="field-row" style="margin-bottom: 16px;">
          ${this.renderEntityPickerWithVariables(
            hass, undefined as any, 'weather_entity', module.weather_entity || '',
            (value: string) => {
              updateModule({ weather_entity: value || undefined });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            ['weather'],
            localize('editor.calendar.weather_entity', lang, 'Weather forecast (optional)')
          )}
          <div class="field-description" style="font-size: 13px !important; font-weight: 400 !important; margin-top: 4px; color: var(--secondary-text-color);">
            ${localize('editor.calendar.weather_entity_desc', lang, 'Shows the daily forecast on upcoming days.')}
          </div>
        </div>

        ${module.weather_entity
          ? this.renderFieldSection(
              localize('editor.calendar.weather_show_temperature', lang, 'Show temperature'),
              localize('editor.calendar.weather_show_temperature_desc', lang, 'Show the high (and low) temperature next to the weather icon.'),
              hass,
              { weather_show_temperature: module.weather_show_temperature !== false },
              [this.booleanField('weather_show_temperature')],
              (e: CustomEvent) => {
                updateModule({ weather_show_temperature: e.detail.value.weather_show_temperature });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )
          : ''}

        ${this.renderFieldSection(
          localize('editor.calendar.header_info', lang, 'Time and weather in header'),
          localize('editor.calendar.header_info_desc', lang, 'Show the current time and / or the current weather in the top right corner. Weather uses the forecast entity above.'),
          hass,
          { header_info: module.header_info || 'none' },
          [
            this.selectField('header_info', [
              { value: 'none', label: localize('editor.calendar.header_info_none', lang, 'Off') },
              { value: 'time', label: localize('editor.calendar.header_info_time', lang, 'Time') },
              { value: 'weather', label: localize('editor.calendar.header_info_weather', lang, 'Weather') },
              { value: 'time_weather', label: localize('editor.calendar.header_info_time_weather', lang, 'Time and weather') },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ header_info: e.detail.value.header_info });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        <!-- Title Configuration -->
        ${this.renderFieldSection(
          'Show Title',
          'Display a title above the calendar',
          hass,
          { show_title: module.show_title || false },
          [this.booleanField('show_title')],
          (e: CustomEvent) => updateModule({ show_title: e.detail.value.show_title })
        )}

        ${module.show_title
          ? html`
              <div>
                
                  ${this.renderFieldSection(
                    'Title Text',
                    'Custom title for the calendar',
                    hass,
                    { title: module.title || '' },
                    [this.textField('title')],
                    (e: CustomEvent) => updateModule({ title: e.detail.value.title })
                  )}

                  ${this.renderFieldSection(
                    'Show Title Separator',
                    'Display a line below the title',
                    hass,
                    { show_title_separator: module.show_title_separator || false },
                    [this.booleanField('show_title_separator')],
                    (e: CustomEvent) => updateModule({ show_title_separator: e.detail.value.show_title_separator })
                  )}

                  ${module.show_title_separator
                    ? html`
                        <div class="color-row" style="margin-top: 16px;">
                          <div class="color-field">
                            <div class="field-title">Separator Color</div>
                            <ultra-color-picker
                              .value=${module.title_separator_color || 'var(--divider-color)'}
                              .defaultValue=${'var(--divider-color)'}
                              .hass=${hass}
                              @value-changed=${(e: CustomEvent) =>
                                updateModule({ title_separator_color: e.detail.value })}
                            ></ultra-color-picker>
                          </div>
                        </div>
                      `
                    : ''}
                
              </div>
            `
          : ''}

      </div>
    `;
  }

  /** View type plus the views the switcher offers, in switcher order. */
  private _offeredViews(module: CalendarModule): CalendarViewType[] {
    const order: CalendarViewType[] = ['month', 'week', 'day', 'compact_list', 'table', 'grid'];
    const set = new Set<CalendarViewType>([module.view_type || 'compact_list']);
    if (module.show_view_switcher) this._switcherViews(module).forEach(v => set.add(v));
    return order.filter(v => set.has(v));
  }

  private _viewLabel(view: CalendarViewType, lang: string): string {
    const labels: Record<CalendarViewType, string> = {
      month: localize('editor.calendar.section_month', lang, 'Month view'),
      week: localize('editor.calendar.section_week', lang, 'Week view'),
      day: localize('editor.calendar.section_day', lang, 'Day view'),
      compact_list: localize('editor.calendar.section_list', lang, 'List view'),
      table: localize('editor.calendar.section_table', lang, 'Table view'),
      grid: localize('editor.calendar.section_grid', lang, 'Grid view'),
    };
    return labels[view];
  }

  /** One settings section per offered view: its own options plus its Event Display settings. */
  private renderPerViewSections(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    return html`${this._offeredViews(module).map(
      view => html`
        <div class="settings-section per-view-section">
          <div class="section-title">${this._viewLabel(view, lang)}</div>
          <div class="section-description">
            ${localize('editor.calendar.section_view_desc', lang, 'Settings that only change this view.')}
          </div>
          ${this.renderViewSpecificOptions(view, module, hass, updateModule, lang)}
          ${this.renderViewEventDisplay(view, module, hass, updateModule, lang)}
        </div>
      `
    )}`;
  }

  private renderViewSpecificOptions(
    viewType: CalendarViewType,
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    switch (viewType) {
      case 'compact_list':
        return this.renderCompactListOptions(module, hass, updateModule, lang);
      case 'month':
        return this.renderMonthViewOptions(module, hass, updateModule, lang);
      case 'week':
        return this.renderWeekViewOptions(module, hass, updateModule, lang);
      case 'day':
        return this.renderDayViewOptions(module, hass, updateModule, lang);
      case 'table':
        return this.renderTableViewOptions(module, hass, updateModule, lang);
      case 'grid':
        return this.renderGridViewOptions(module, hass, updateModule, lang);
      default:
        return html``;
    }
  }

  private _eventDisplayLabels(lang: string): Record<EventDisplayKey, { title: string; desc: string }> {
    return {
      show_event_time: {
        title: localize('editor.calendar.show_event_time', lang, 'Show Event Time'),
        desc: localize('editor.calendar.show_event_time_desc', lang, 'Display the start time of events'),
      },
      show_end_time: {
        title: localize('editor.calendar.show_end_time', lang, 'Show End Time'),
        desc: localize('editor.calendar.show_end_time_desc', lang, 'Display the end time of events'),
      },
      show_event_location: {
        title: localize('editor.calendar.show_location', lang, 'Show Location'),
        desc: localize('editor.calendar.show_location_desc', lang, 'Display event location'),
      },
      show_event_description: {
        title: localize('editor.calendar.show_description', lang, 'Show Description'),
        desc: localize('editor.calendar.show_description_desc', lang, 'Display event description'),
      },
      show_event_icon: {
        title: localize('editor.calendar.show_event_icon', lang, 'Show Event Icon'),
        desc: localize('editor.calendar.show_event_icon_desc', lang, 'Display a clock icon next to event times'),
      },
    };
  }

  /** Default when a key is unset (matches how the views read it). */
  private _eventDisplayDefault(key: EventDisplayKey): boolean {
    return key !== 'show_event_description';
  }

  /** Event Display settings this view uses: greyed out while they are set for every view. */
  private renderViewEventDisplay(
    view: CalendarViewType,
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult | typeof nothing {
    const keys = VIEW_EVENT_DISPLAY_KEYS[view];
    if (!keys.length) return nothing;
    const perView = !!module.event_display_per_view;
    const own = module.view_event_display?.[view] || {};
    const labels = this._eventDisplayLabels(lang);
    const valueOf = (key: EventDisplayKey): boolean => {
      const v = perView && own[key] !== undefined ? own[key] : module[key];
      return v === undefined ? this._eventDisplayDefault(key) : !!v;
    };
    return html`
      <div class="view-options-group per-view-event-display ${perView ? '' : 'locked'}">
        <div class="view-options-title">
          ${localize('editor.calendar.event_display', lang, 'Event Display')}
        </div>
        ${perView
          ? nothing
          : html`<div class="per-view-locked-note">
              <ha-icon icon="mdi:lock-outline"></ha-icon>
              <span>
                ${localize(
                  'editor.calendar.per_view_locked',
                  lang,
                  'Set for all views in Event Display above. Turn on "Different settings per view" there to change them here.'
                )}
              </span>
            </div>`}
        ${keys.map(key =>
          this.renderFieldSection(
            labels[key].title,
            labels[key].desc,
            hass,
            { [key]: valueOf(key) },
            [this.booleanField(key)],
            (e: CustomEvent) => {
              if (!perView) return;
              const next = {
                ...(module.view_event_display || {}),
                [view]: { ...own, [key]: !!e.detail.value[key] },
              };
              updateModule({ view_event_display: next });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )
        )}
      </div>
    `;
  }

  private renderCompactListOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const overflowOptions = [
      { value: 'scroll', label: 'Scrollable' },
      { value: 'hidden', label: 'Clip (hidden)' },
    ];

    return html`
      <div class="view-options-group">
        <div class="view-options-title">Compact List Options</div>

        ${this.renderFieldSection(
          'Auto-fit to Height',
          'Show as many events as fit within a specified height instead of limiting by count',
          hass,
          { compact_auto_fit_height: module.compact_auto_fit_height || false },
          [this.booleanField('compact_auto_fit_height')],
          (e: CustomEvent) => {
            updateModule({ compact_auto_fit_height: e.detail.value.compact_auto_fit_height });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${module.compact_auto_fit_height
          ? html`
              <div>
                
                  ${this.renderFieldSection(
                    'Container Height',
                    'Height of the events container (e.g., 300px, 50vh, 100%)',
                    hass,
                    { compact_height: module.compact_height || '300px' },
                    [this.textField('compact_height')],
                    (e: CustomEvent) => {
                      updateModule({ compact_height: e.detail.value.compact_height });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  )}

                  ${this.renderFieldSection(
                    'Overflow Behavior',
                    'How to handle events that exceed the container height',
                    hass,
                    { compact_overflow: module.compact_overflow || 'scroll' },
                    [this.selectField('compact_overflow', overflowOptions)],
                    (e: CustomEvent) => {
                      updateModule({ compact_overflow: e.detail.value.compact_overflow });
                      setTimeout(() => this.triggerPreviewUpdate(), 50);
                    }
                  )}

                  ${module.compact_overflow === 'hidden'
                    ? this.renderFieldSection(
                        'Show Navigation Buttons',
                        'Display up/down buttons to scroll through clipped events',
                        hass,
                        { compact_show_nav_buttons: module.compact_show_nav_buttons !== false },
                        [this.booleanField('compact_show_nav_buttons')],
                        (e: CustomEvent) => {
                          updateModule({ compact_show_nav_buttons: e.detail.value.compact_show_nav_buttons });
                          setTimeout(() => this.triggerPreviewUpdate(), 50);
                        }
                      )
                    : ''}
                
              </div>
            `
          : this.renderSliderField(
              'Events to Show',
              'Maximum number of events to display (0 for unlimited)',
              module.compact_events_to_show ?? 5,
              5,
              0,
              100,
              1,
              (value: number) => updateModule({ compact_events_to_show: value }),
              ''
            )}

        ${this.renderFieldSection(
          'Show All-Day Events',
          'Include all-day events in the list',
          hass,
          { compact_show_all_day_events: module.compact_show_all_day_events !== false },
          [this.booleanField('compact_show_all_day_events')],
          (e: CustomEvent) =>
            updateModule({ compact_show_all_day_events: e.detail.value.compact_show_all_day_events })
        )}

        ${this.renderFieldSection(
          'Hide Empty Days',
          'Do not show days without events',
          hass,
          { compact_hide_empty_days: module.compact_hide_empty_days || false },
          [this.booleanField('compact_hide_empty_days')],
          (e: CustomEvent) =>
            updateModule({ compact_hide_empty_days: e.detail.value.compact_hide_empty_days })
        )}

        ${this.renderFieldSection(
          'Enable Expand/Collapse',
          'Allow tapping to expand or collapse event details',
          hass,
          { tap_action_expand: module.tap_action_expand || false },
          [this.booleanField('tap_action_expand')],
          (e: CustomEvent) => updateModule({ tap_action_expand: e.detail.value.tap_action_expand })
        )}
      </div>
    `;
  }

  private renderMonthViewOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const weekNumberOptions = [
      { value: 'none', label: 'None' },
      { value: 'iso', label: 'ISO (Monday start)' },
      { value: 'us', label: 'US (Sunday start)' },
    ];

    const firstDayOptions = [
      { value: 'sunday', label: 'Sunday' },
      { value: 'monday', label: 'Monday' },
      { value: 'saturday', label: 'Saturday' },
    ];

    return html`
      <div class="view-options-group">
        <div class="view-options-title">Month View Options</div>

        ${this.renderFieldSection(
          'Show Week Numbers',
          'Display week numbers on the left side',
          hass,
          { show_week_numbers: module.show_week_numbers || 'none' },
          [this.selectField('show_week_numbers', weekNumberOptions)],
          (e: CustomEvent) => {
            updateModule({ show_week_numbers: e.detail.value.show_week_numbers });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          'First Day of Week',
          'Which day starts the week',
          hass,
          { first_day_of_week: module.first_day_of_week || 'sunday' },
          [this.selectField('first_day_of_week', firstDayOptions)],
          (e: CustomEvent) => {
            updateModule({ first_day_of_week: e.detail.value.first_day_of_week });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.month_event_display', lang, 'Events in days'),
          localize('editor.calendar.month_event_display_desc', lang, 'Show colored dots, or event names with their start time.'),
          hass,
          { month_event_display: module.month_event_display || 'dots' },
          [
            this.selectField('month_event_display', [
              { value: 'dots', label: localize('editor.calendar.month_event_display_dots', lang, 'Dots') },
              { value: 'titles', label: localize('editor.calendar.month_event_display_titles', lang, 'Event names') },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ month_event_display: e.detail.value.month_event_display });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.month_show_day_details', lang, 'Tap a day to see its events'),
          localize('editor.calendar.month_show_day_details_desc', lang, 'Lists the day\'s events under the month with name, time (or all day) and location. Off: tapping a day runs the event tap action.'),
          hass,
          { month_show_day_details: module.month_show_day_details !== false },
          [this.booleanField('month_show_day_details')],
          (e: CustomEvent) => {
            updateModule({ month_show_day_details: e.detail.value.month_show_day_details });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${module.month_event_display === 'titles'
          ? this.renderFieldSection(
              localize('editor.calendar.month_title_fit', lang, 'Long event names'),
              localize('editor.calendar.month_title_fit_desc', lang, 'Cut off long names with "…", or wrap them onto more lines so the whole name shows.'),
              hass,
              { month_title_fit: module.month_title_fit || 'truncate' },
              [
                this.selectField('month_title_fit', [
                  { value: 'truncate', label: localize('editor.calendar.month_title_fit_truncate', lang, 'Cut off') },
                  { value: 'wrap', label: localize('editor.calendar.month_title_fit_wrap', lang, 'Wrap') },
                ]),
              ],
              (e: CustomEvent) => {
                updateModule({ month_title_fit: e.detail.value.month_title_fit });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
            )
          : ''}

        ${this.renderFieldSection(
          localize('editor.calendar.month_show_event_count', lang, 'Show Event Count'),
          module.month_event_display === 'titles'
            ? localize('editor.calendar.month_show_event_count_titles_desc', lang, 'A small number next to the date shows how many events the day has.')
            : localize('editor.calendar.month_show_event_count_dots_desc', lang, 'Show up to three coloured dots per day, plus "+N" for more.'),
          hass,
          { month_show_event_count: module.month_show_event_count !== false },
          [this.booleanField('month_show_event_count')],
          (e: CustomEvent) => {
            updateModule({ month_show_event_count: e.detail.value.month_show_event_count });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}
      </div>
    `;
  }

  private renderWeekViewOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const intervalOptions = [
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
      { value: '60', label: '1 hour' },
    ];

    return html`
      <div class="view-options-group">
        <div class="view-options-title">Week View Options</div>

        ${this.renderSliderField(
          'Start Hour',
          'First hour to display (0-23)',
          module.week_start_hour ?? 0,
          0,
          0,
          23,
          1,
          (value: number) => updateModule({ week_start_hour: value }),
          'h'
        )}

        ${this.renderSliderField(
          'End Hour',
          'Last hour to display (1-24)',
          module.week_end_hour ?? 24,
          24,
          1,
          24,
          1,
          (value: number) => updateModule({ week_end_hour: value }),
          'h'
        )}

        ${this.renderFieldSection(
          'Time Interval',
          'Time slot interval in minutes',
          hass,
          { week_time_interval: String(module.week_time_interval ?? 60) },
          [this.selectField('week_time_interval', intervalOptions)],
          (e: CustomEvent) => {
            updateModule({ week_time_interval: parseInt(e.detail.value.week_time_interval, 10) });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}
      </div>
    `;
  }

  private renderDayViewOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const intervalOptions = [
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
      { value: '60', label: '1 hour' },
    ];

    return html`
      <div class="view-options-group">
        <div class="view-options-title">Day View Options</div>

        ${this.renderSliderField(
          'Start Hour',
          'First hour to display (0-23)',
          module.day_start_hour ?? 0,
          0,
          0,
          23,
          1,
          (value: number) => updateModule({ day_start_hour: value }),
          'h'
        )}

        ${this.renderSliderField(
          'End Hour',
          'Last hour to display (1-24)',
          module.day_end_hour ?? 24,
          24,
          1,
          24,
          1,
          (value: number) => updateModule({ day_end_hour: value }),
          'h'
        )}

        ${this.renderFieldSection(
          'Time Interval',
          'Time slot interval in minutes',
          hass,
          { day_time_interval: String(module.day_time_interval ?? 60) },
          [this.selectField('day_time_interval', intervalOptions)],
          (e: CustomEvent) => {
            updateModule({ day_time_interval: parseInt(e.detail.value.day_time_interval, 10) });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}
      </div>
    `;
  }

  private renderTableViewOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="view-options-group">
        <div class="view-options-title">Table View Options</div>

        ${this.renderFieldSection(
          'Show Date Column',
          'Display the date column',
          hass,
          { table_show_date_column: module.table_show_date_column !== false },
          [this.booleanField('table_show_date_column')],
          (e: CustomEvent) =>
            updateModule({ table_show_date_column: e.detail.value.table_show_date_column })
        )}

        ${this.renderFieldSection(
          'Show Time Column',
          'Display the time column',
          hass,
          { table_show_time_column: module.table_show_time_column !== false },
          [this.booleanField('table_show_time_column')],
          (e: CustomEvent) =>
            updateModule({ table_show_time_column: e.detail.value.table_show_time_column })
        )}

        ${this.renderFieldSection(
          'Show Calendar Column',
          'Display the calendar indicator column',
          hass,
          { table_show_calendar_column: module.table_show_calendar_column !== false },
          [this.booleanField('table_show_calendar_column')],
          (e: CustomEvent) =>
            updateModule({ table_show_calendar_column: e.detail.value.table_show_calendar_column })
        )}

        ${this.renderFieldSection(
          'Show Location Column',
          'Display the location column',
          hass,
          { table_show_location_column: module.table_show_location_column !== false },
          [this.booleanField('table_show_location_column')],
          (e: CustomEvent) =>
            updateModule({ table_show_location_column: e.detail.value.table_show_location_column })
        )}

        ${this.renderFieldSection(
          'Show Duration Column',
          'Display the duration column',
          hass,
          { table_show_duration_column: module.table_show_duration_column || false },
          [this.booleanField('table_show_duration_column')],
          (e: CustomEvent) =>
            updateModule({ table_show_duration_column: e.detail.value.table_show_duration_column })
        )}
      </div>
    `;
  }

  private renderGridViewOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="view-options-group">
        <div class="view-options-title">Grid View Options</div>

        ${this.renderSliderField(
          'Columns',
          'Number of columns in the grid',
          module.grid_columns ?? 2,
          2,
          1,
          6,
          1,
          (value: number) => updateModule({ grid_columns: value }),
          ''
        )}

        ${this.renderFieldSection(
          'Card Height',
          'Height of each event card (e.g., auto, 100px, 150px)',
          hass,
          { grid_card_height: module.grid_card_height || 'auto' },
          [this.textField('grid_card_height')],
          (e: CustomEvent) => {
            updateModule({ grid_card_height: e.detail.value.grid_card_height });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}
      </div>
    `;
  }

  private renderEventDisplaySection(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.calendar.event_display', lang, 'Event Display')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.calendar.event_display_desc',
            lang,
            'Configure what information is shown for each event.'
          )}
        </div>

        ${this.renderFieldSection(
          localize('editor.calendar.event_display_per_view', lang, 'Different settings per view'),
          module.event_display_per_view
            ? localize('editor.calendar.event_display_per_view_on', lang, 'Each view section below has its own time, location and description settings. The settings here are the starting values.')
            : localize('editor.calendar.event_display_per_view_off', lang, 'Off: the settings here apply to every view. On: set them separately in each view section below.'),
          hass,
          { event_display_per_view: !!module.event_display_per_view },
          [this.booleanField('event_display_per_view')],
          (e: CustomEvent) => {
            const on = !!e.detail.value.event_display_per_view;
            const updates: Partial<CalendarModule> = { event_display_per_view: on };
            if (on) {
              // Start each view from the current shared values.
              const seeded: NonNullable<CalendarModule['view_event_display']> = { ...(module.view_event_display || {}) };
              for (const view of this._offeredViews(module)) {
                const own = { ...(seeded[view] || {}) };
                for (const key of VIEW_EVENT_DISPLAY_KEYS[view]) {
                  if (own[key] === undefined) {
                    own[key] = module[key] === undefined ? this._eventDisplayDefault(key) : !!module[key];
                  }
                }
                seeded[view] = own;
              }
              updates.view_event_display = seeded;
            }
            updateModule(updates);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.show_event_time', lang, 'Show Event Time'),
          localize('editor.calendar.show_event_time_desc', lang, 'Display the start time of events'),
          hass,
          { show_event_time: module.show_event_time !== false },
          [this.booleanField('show_event_time')],
          (e: CustomEvent) => updateModule({ show_event_time: e.detail.value.show_event_time })
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.show_end_time', lang, 'Show End Time'),
          localize('editor.calendar.show_end_time_desc', lang, 'Display the end time of events'),
          hass,
          { show_end_time: module.show_end_time !== false },
          [this.booleanField('show_end_time')],
          (e: CustomEvent) => updateModule({ show_end_time: e.detail.value.show_end_time })
        )}

        ${this.renderFieldSection(
          '24-Hour Time Format',
          'Use 24-hour time format instead of AM/PM',
          hass,
          { time_24h: module.time_24h || false },
          [this.booleanField('time_24h')],
          (e: CustomEvent) => updateModule({ time_24h: e.detail.value.time_24h })
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.show_location', lang, 'Show Location'),
          localize('editor.calendar.show_location_desc', lang, 'Display event location'),
          hass,
          { show_event_location: module.show_event_location !== false },
          [this.booleanField('show_event_location')],
          (e: CustomEvent) =>
            updateModule({ show_event_location: e.detail.value.show_event_location })
        )}

        ${module.show_event_location !== false
          ? this.renderFieldSection(
              'Remove Country from Location',
              'Strip country name from displayed locations',
              hass,
              { remove_location_country: module.remove_location_country || false },
              [this.booleanField('remove_location_country')],
              (e: CustomEvent) =>
                updateModule({ remove_location_country: e.detail.value.remove_location_country })
            )
          : ''}

        ${module.show_event_location !== false
          ? this.renderSegmentedField(
              localize('editor.calendar.location_link', lang, 'Open location in'),
              localize(
                'editor.calendar.location_link_desc',
                lang,
                'Make the location tappable so it opens in a maps app.'
              ),
              module.location_link || 'none',
              [
                { value: 'none', label: localize('editor.calendar.location_link_none', lang, 'Off') },
                { value: 'google', label: 'Google Maps' },
                { value: 'apple', label: 'Apple Maps' },
                { value: 'osm', label: 'OpenStreetMap' },
                { value: 'waze', label: 'Waze' },
              ],
              (next: string) =>
                updateModule({
                  location_link: next as NonNullable<CalendarModule['location_link']>,
                })
            )
          : ''}

        ${this.renderFieldSection(
          localize('editor.calendar.show_description', lang, 'Show Description'),
          localize('editor.calendar.show_description_desc', lang, 'Display event description'),
          hass,
          { show_event_description: module.show_event_description || false },
          [this.booleanField('show_event_description')],
          (e: CustomEvent) =>
            updateModule({ show_event_description: e.detail.value.show_event_description })
        )}

        ${this.renderFieldSection(
          localize('editor.calendar.show_event_icon', lang, 'Show Event Icon'),
          localize('editor.calendar.show_event_icon_desc', lang, 'Display a clock icon next to event times'),
          hass,
          { show_event_icon: module.show_event_icon !== false },
          [this.booleanField('show_event_icon')],
          (e: CustomEvent) => updateModule({ show_event_icon: e.detail.value.show_event_icon })
        )}

        ${this.renderFieldSection(
          'Show Past Events',
          'Include events that have already ended today',
          hass,
          { show_past_events: module.show_past_events || false },
          [this.booleanField('show_past_events')],
          (e: CustomEvent) => updateModule({ show_past_events: e.detail.value.show_past_events })
        )}
      </div>
    `;
  }

  private renderStylingSection(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const alignmentOptions = [
      { value: 'top', label: 'Top' },
      { value: 'middle', label: 'Middle' },
      { value: 'bottom', label: 'Bottom' },
    ];

    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.calendar.styling', lang, 'Styling')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.calendar.styling_desc',
            lang,
            'Customize colors, fonts, and spacing for the calendar display.'
          )}
        </div>

        <!-- Title Styling -->
        ${module.show_title
          ? html`
              <div class="styling-subsection">
                <div class="subsection-title">Title Styling</div>

                <div class="color-row">
                  <div class="color-field">
                    <div class="field-title">Title Color</div>
                    <ultra-color-picker
                      .value=${module.title_color || 'var(--primary-text-color)'}
                      .defaultValue=${'var(--primary-text-color)'}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) =>
                        updateModule({ title_color: e.detail.value })}
                    ></ultra-color-picker>
                  </div>
                </div>

                ${this.renderFieldSection(
                  'Title Font Size',
                  'Size of the title text',
                  hass,
                  { title_font_size: module.title_font_size || '20px' },
                  [this.textField('title_font_size')],
                  (e: CustomEvent) => updateModule({ title_font_size: e.detail.value.title_font_size })
                )}
              </div>
            `
          : ''}

        <!-- Date Column Styling -->
        <div class="styling-subsection">
          <div class="subsection-title">Date Column</div>

          ${this.renderFieldSection(
            'Date Alignment',
            'Vertical alignment of date column',
            hass,
            { date_vertical_alignment: module.date_vertical_alignment || 'top' },
            [this.selectField('date_vertical_alignment', alignmentOptions)],
            (e: CustomEvent) => {
              updateModule({ date_vertical_alignment: e.detail.value.date_vertical_alignment });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          <div class="color-row">
            <div class="color-field">
              <div class="field-title">Weekday Color</div>
              <ultra-color-picker
                .value=${module.weekday_color || 'var(--secondary-text-color)'}
                .defaultValue=${'var(--secondary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => updateModule({ weekday_color: e.detail.value })}
              ></ultra-color-picker>
            </div>
            <div class="color-field">
              <div class="field-title">Day Number Color</div>
              <ultra-color-picker
                .value=${module.day_color || 'var(--primary-text-color)'}
                .defaultValue=${'var(--primary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => updateModule({ day_color: e.detail.value })}
              ></ultra-color-picker>
            </div>
          </div>

          ${this.renderFieldSection(
            'Show Month',
            'Display month name with date',
            hass,
            { show_month: module.show_month || false },
            [this.booleanField('show_month')],
            (e: CustomEvent) => updateModule({ show_month: e.detail.value.show_month })
          )}

          ${module.show_month
            ? html`
                <div>
                  
                    <div class="color-row">
                      <div class="color-field">
                        <div class="field-title">Month Color</div>
                        <ultra-color-picker
                          .value=${module.month_color || 'var(--secondary-text-color)'}
                          .defaultValue=${'var(--secondary-text-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) =>
                            updateModule({ month_color: e.detail.value })}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  
                </div>
              `
            : ''}
        </div>

        <!-- Event Styling -->
        <div class="styling-subsection">
          <div class="subsection-title">Event Styling</div>

          <div class="color-row">
            <div class="color-field">
              <div class="field-title">Event Text Color</div>
              <ultra-color-picker
                .value=${module.event_color || 'var(--primary-text-color)'}
                .defaultValue=${'var(--primary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => updateModule({ event_color: e.detail.value })}
              ></ultra-color-picker>
            </div>
            <div class="color-field">
              <div class="field-title">Time Text Color</div>
              <ultra-color-picker
                .value=${module.time_color || 'var(--secondary-text-color)'}
                .defaultValue=${'var(--secondary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) => updateModule({ time_color: e.detail.value })}
              ></ultra-color-picker>
            </div>
          </div>

          <div class="color-row">
            <div class="color-field">
              <div class="field-title">Location Text Color</div>
              <ultra-color-picker
                .value=${module.location_color || 'var(--secondary-text-color)'}
                .defaultValue=${'var(--secondary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ location_color: e.detail.value })}
              ></ultra-color-picker>
            </div>
            <div class="color-field">
              <div class="field-title">Description Text Color</div>
              <ultra-color-picker
                .value=${module.description_color || 'var(--secondary-text-color)'}
                .defaultValue=${'var(--secondary-text-color)'}
                .hass=${hass}
                @value-changed=${(e: CustomEvent) =>
                  updateModule({ description_color: e.detail.value })}
              ></ultra-color-picker>
            </div>
          </div>

          ${this.renderSliderField(
            'Event Background Opacity',
            'Background opacity for event items (0-100)',
            module.event_background_opacity ?? 0,
            0,
            0,
            100,
            1,
            (value: number) => updateModule({ event_background_opacity: value }),
            '%'
          )}

          ${this.renderFieldSection(
            'Accent Line Width',
            'Width of the calendar color accent line (e.g., 3px)',
            hass,
            { vertical_line_width: module.vertical_line_width || '3px' },
            [this.textField('vertical_line_width')],
            (e: CustomEvent) => {
              updateModule({ vertical_line_width: e.detail.value.vertical_line_width });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Spacing -->
        <div class="styling-subsection">
          <div class="subsection-title">Spacing</div>

          ${this.renderFieldSection(
            'Row Spacing',
            'Space between day rows (e.g., 8px)',
            hass,
            { row_spacing: module.row_spacing || '8px' },
            [this.textField('row_spacing')],
            (e: CustomEvent) => {
              updateModule({ row_spacing: e.detail.value.row_spacing });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${this.renderFieldSection(
            'Event Spacing',
            'Space between events (e.g., 4px)',
            hass,
            { event_spacing: module.event_spacing || '4px' },
            [this.textField('event_spacing')],
            (e: CustomEvent) => {
              updateModule({ event_spacing: e.detail.value.event_spacing });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}
        </div>

        <!-- Separators -->
        <div class="styling-subsection">
          <div class="subsection-title">Separators</div>

          <!-- Day Separator -->
          ${this.renderFieldSection(
            'Show Day Separators',
            'Display lines between day rows',
            hass,
            { show_day_separator: module.show_day_separator || false },
            [this.booleanField('show_day_separator')],
            (e: CustomEvent) => {
              updateModule({ show_day_separator: e.detail.value.show_day_separator });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${module.show_day_separator
            ? html`
                <div>
                  
                    <div class="separator-row">
                      <div class="separator-field">
                        <div class="field-title">Day Separator Color</div>
                        <ultra-color-picker
                          .value=${module.day_separator_color || 'var(--divider-color)'}
                          .defaultValue=${'var(--divider-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) => {
                            updateModule({ day_separator_color: e.detail.value });
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  
                </div>
              `
            : ''}

          <!-- Week Separator -->
          ${this.renderFieldSection(
            'Show Week Separators',
            'Display lines between week boundaries',
            hass,
            { show_week_separator: module.show_week_separator || false },
            [this.booleanField('show_week_separator')],
            (e: CustomEvent) => {
              updateModule({ show_week_separator: e.detail.value.show_week_separator });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
          )}

          ${module.show_week_separator
            ? html`
                <div>
                  
                    <div class="separator-row">
                      <div class="separator-field">
                        <div class="field-title">Week Separator Color</div>
                        <ultra-color-picker
                          .value=${module.week_separator_color || 'var(--divider-color)'}
                          .defaultValue=${'var(--divider-color)'}
                          .hass=${hass}
                          @value-changed=${(e: CustomEvent) => {
                            updateModule({ week_separator_color: e.detail.value });
                            setTimeout(() => this.triggerPreviewUpdate(), 50);
                          }}
                        ></ultra-color-picker>
                      </div>
                    </div>
                  
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private renderAdvancedSection(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">
          ${localize('editor.calendar.advanced', lang, 'Advanced Options')}
        </div>
        <div class="section-description">
          ${localize(
            'editor.calendar.advanced_desc',
            lang,
            'Configure refresh interval and event filtering.'
          )}
        </div>

        ${this.renderSliderField(
          'Refresh Interval (minutes)',
          'How often to refresh calendar events (0 to disable)',
          module.refresh_interval ?? 15,
          15,
          0,
          1440,
          1,
          (value: number) => updateModule({ refresh_interval: value }),
          'min'
        )}

        ${this.renderSliderField(
          'Max Event Title Length',
          'Truncate event titles to this length (0 for no limit)',
          module.max_event_title_length ?? 0,
          0,
          0,
          500,
          1,
          (value: number) => updateModule({ max_event_title_length: value }),
          ''
        )}
      </div>
    `;
  }

  // Calendar management helpers
  /** Rules that rename, re-icon or re-colour events by name. */
  private renderEventRulesSection(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const rules = module.event_rules || [];
    const t = (key: string, fallback: string) => localize(`editor.calendar.${key}`, lang, fallback);
    const setRule = (index: number, patch: Partial<CalendarEventRule>) => {
      const next = [...rules];
      next[index] = { ...next[index], ...patch };
      updateModule({ event_rules: next });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };
    return html`
      <div class="settings-section">
        <div class="section-title">${t('event_rules', 'Event Rules')}</div>
        <div class="section-description">
          ${t(
            'event_rules_desc',
            'Give events a new name, an icon or their own colour when their name matches, e.g. waste collection days from a city calendar. The first matching rule wins.'
          )}
        </div>
        <div class="calendar-list">
          ${rules.map(
            (rule, index) => html`
              <div class="calendar-item">
                <div class="calendar-item-header">
                  <div class="calendar-color-preview" style="background: ${rule.color || 'transparent'}; border: 1px solid var(--divider-color);"></div>
                  ${rule.icon ? html`<ha-icon icon=${rule.icon} style="--mdc-icon-size: 18px;"></ha-icon>` : nothing}
                  <span class="calendar-item-title">
                    ${rule.match
                      ? `${rule.match}${rule.rename ? ` → ${rule.rename}` : ''}`
                      : `${t('event_rule', 'Rule')} ${index + 1}`}
                  </span>
                  <div class="calendar-item-actions">
                    <ha-icon-button
                      @click=${() => {
                        const next = [...rules];
                        next.splice(index, 1);
                        updateModule({ event_rules: next.length ? next : undefined });
                        setTimeout(() => this.triggerPreviewUpdate(), 50);
                      }}
                      title=${t('remove', 'Remove')}
                    >
                      <ha-icon icon="mdi:delete"></ha-icon>
                    </ha-icon-button>
                  </div>
                </div>
                <div class="calendar-item-content">
                  ${this.renderFieldSection(
                    t('event_rule_match', 'Event name contains'),
                    t('event_rule_match_desc', 'Text to look for in the event name. Upper and lower case do not matter.'),
                    hass,
                    { match: rule.match || '' },
                    [this.textField('match')],
                    (e: CustomEvent) => setRule(index, { match: e.detail.value.match || '' })
                  )}
                  ${this.renderFieldSection(
                    t('event_rule_mode', 'Match'),
                    '',
                    hass,
                    { match_mode: rule.match_mode || 'contains' },
                    [
                      this.selectField('match_mode', [
                        { value: 'contains', label: t('event_rule_mode_contains', 'Name contains the text') },
                        { value: 'exact', label: t('event_rule_mode_exact', 'Name is exactly the text') },
                      ]),
                    ],
                    (e: CustomEvent) => setRule(index, { match_mode: e.detail.value.match_mode })
                  )}
                  ${this.renderFieldSection(
                    t('event_rule_rename', 'Show as'),
                    t('event_rule_rename_desc', 'New name for matching events. Leave empty to keep the name.'),
                    hass,
                    { rename: rule.rename || '' },
                    [this.textField('rename')],
                    (e: CustomEvent) => setRule(index, { rename: e.detail.value.rename || undefined })
                  )}
                  ${this.renderFieldSection(
                    t('event_rule_icon', 'Icon'),
                    t('event_rule_icon_desc', 'Shown before the event name.'),
                    hass,
                    { icon: rule.icon || '' },
                    [{ name: 'icon', selector: { icon: {} } }],
                    (e: CustomEvent) => setRule(index, { icon: e.detail.value.icon || undefined })
                  )}
                  <div class="field-row">
                    <div class="field-title">${t('event_rule_color', 'Colour')}</div>
                    <ultra-color-picker
                      .value=${rule.color || ''}
                      .defaultValue=${''}
                      .hass=${hass}
                      @value-changed=${(e: CustomEvent) => setRule(index, { color: e.detail.value || undefined })}
                    ></ultra-color-picker>
                  </div>
                </div>
              </div>
            `
          )}
        </div>
        <button
          class="add-calendar-btn"
          @click=${() => {
            updateModule({
              event_rules: [...rules, { id: this.generateId('cal_rule'), match: '' }],
            });
          }}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${t('add_event_rule', 'Add rule')}
        </button>
      </div>
    `;
  }

  private addCalendar(
    module: CalendarModule,
    updateModule: (updates: Partial<CalendarModule>) => void
  ): void {
    const newCalendar: CalendarEntityConfig = {
      id: this.generateId('cal_entity'),
      entity: '',
      name: '',
      color: this.getNextCalendarColor(module.calendars?.length || 0),
      visible: true,
    };

    const calendars = [...(module.calendars || []), newCalendar];
    updateModule({ calendars });
  }

  private removeCalendar(
    index: number,
    module: CalendarModule,
    updateModule: (updates: Partial<CalendarModule>) => void
  ): void {
    const calendars = [...(module.calendars || [])];
    calendars.splice(index, 1);
    updateModule({ calendars });
  }

  private updateCalendarEntity(
    index: number,
    field: keyof CalendarEntityConfig,
    value: any,
    module: CalendarModule,
    updateModule: (updates: Partial<CalendarModule>) => void
  ): void {
    const calendars = [...(module.calendars || [])];
    if (calendars[index]) {
      calendars[index] = { ...calendars[index], [field]: value };
      updateModule({ calendars });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    }
  }

  private toggleCalendarVisibility(
    index: number,
    module: CalendarModule,
    updateModule: (updates: Partial<CalendarModule>) => void
  ): void {
    const calendars = [...(module.calendars || [])];
    if (calendars[index]) {
      calendars[index] = { ...calendars[index], visible: !(calendars[index].visible !== false) };
      updateModule({ calendars });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    }
  }

  private getNextCalendarColor(index: number): string {
    const colors = [
      '#03a9f4', // Blue
      '#ff6c92', // Pink
      '#43a047', // Green
      '#ff9800', // Orange
      '#9c27b0', // Purple
      '#00bcd4', // Cyan
      '#f44336', // Red
      '#8bc34a', // Light Green
    ];
    return colors[index % colors.length];
  }

  private getEditorStyles(): string {
    return `
      .settings-section {
        background: var(--secondary-background-color);
        border-radius: var(--uc-r-8, 8px);
        padding: 16px;
        margin-bottom: 24px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
        color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color));
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .section-description {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-bottom: 16px;
        opacity: 0.8;
        line-height: 1.4;
      }

      .calendar-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .calendar-item {
        background: var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background)));
        border-radius: var(--uc-r-8, 8px);
        overflow: hidden;
        border: 1px solid var(--divider-color);
      }

      .calendar-item-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        border-bottom: 1px solid var(--divider-color);
      }

      .calendar-color-preview {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .calendar-item-title {
        flex: 1;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .calendar-item-actions {
        display: flex;
        gap: 4px;
      }

      .calendar-item-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .field-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .add-calendar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: var(--uc-r-8, 8px);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .add-calendar-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .view-options-group {
        margin-top: 24px;
        padding: 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border-radius: var(--uc-r-8, 8px);
        border-left: 4px solid var(--primary-color);
      }

      .view-options-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* The view section header already names the view. */
      .per-view-section > .view-options-group:not(.per-view-event-display) > .view-options-title {
        display: none;
      }

      .per-view-event-display.locked .field-section,
      .per-view-event-display.locked .field-row {
        opacity: 0.45;
        pointer-events: none;
      }

      .per-view-locked-note {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 12px;
      }

      .per-view-locked-note ha-icon {
        --mdc-icon-size: 18px;
        flex: 0 0 auto;
        color: var(--primary-color);
      }

      .styling-subsection {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .styling-subsection:first-of-type {
        margin-top: 0;
        padding-top: 0;
        border-top: none;
      }

      .subsection-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 16px;
      }

      .color-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .color-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .separator-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      .separator-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .conditional-fields-group {
        margin-top: 16px;
        border-left: 4px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.08);
        border-radius: 0 var(--uc-r-8, 8px) var(--uc-r-8, 8px) 0;
        overflow: hidden;
        transition: all 0.2s ease;
        animation: slideInFromLeft 0.3s ease-out;
      }

      .conditional-fields-content {
        padding: 16px;
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

      @media (max-width: 600px) {
        .color-row,
        .separator-row {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const calendarModule = module as CalendarModule;
    const lang = calendarModule.language || hass?.locale?.language || 'en';
    this._hass = hass;

    // Check for valid calendars
    const validCalendars = this._resolvedCalendars(calendarModule, config);
    const st = this._stateFor(calendarModule.id);
    this._restoreUiState(calendarModule.id, st);

    if (validCalendars.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.calendar.error_no_calendars', lang, 'Configure Calendars'),
        localize('editor.calendar.error_no_calendars_desc', lang, 'Select at least one calendar entity in the General tab')
      );
    }

    // Initialize calendar service if needed
    if (!this._calendarService) {
      this._calendarService = new CalendarService();
    }

    const view = this._activeView(calendarModule, st);
    const anchor = st.anchor || new Date();
    const range = this._viewRange(calendarModule, view, anchor);

    // Fetch events for the range this view shows
    const fetched = this.fetchEventsIfNeeded(calendarModule, hass, validCalendars, range, view);
    // While a new range loads, keep showing what this surface showed last (no spinner flash).
    const surfaceKey = `${calendarModule.id}|${previewContext || 'card'}`;
    const prevShown = this._shown.get(surfaceKey);
    const entry =
      fetched.lastFetch === 0 && prevShown && prevShown.lastFetch > 0 ? prevShown : fetched;
    if (fetched.lastFetch > 0) this._shown.set(surfaceKey, fetched);

    // Check if we need scroll navigation (hidden overflow mode with nav buttons enabled)
    const needsScrollNav = calendarModule.compact_auto_fit_height && 
      calendarModule.compact_overflow === 'hidden' && 
      calendarModule.compact_show_nav_buttons !== false;

    // Schedule container lookup after render (for scroll nav)
    if (needsScrollNav) {
      setTimeout(() => this.findAndSetupScrollContainer(), 50);
    }

    // Calendars hidden with the header filter
    const hiddenIds = this._hiddenCalendarIds(calendarModule, validCalendars, st);
    const ruledEvents = this._applyEventRules(calendarModule, entry.events);
    const visibleEvents = hiddenIds.size
      ? ruledEvents.filter(e => !hiddenIds.has(e.calendarId))
      : ruledEvents;

    // Create view context
    const context: CalendarViewContext = {
      module: { ...this._effectiveModule(calendarModule, view), view_type: view },
      hass,
      events: visibleEvents,
      loading: entry.loading,
      error: entry.error,
      expanded: st.expanded,
      onEventClick: (event: ProcessedCalendarEvent) =>
        this.handleEventClick(event, calendarModule, hass, validCalendars),
      onExpandToggle: () => this.handleExpandToggle(calendarModule.id),
      formatTime: (date: Date) => this.formatTime(date, calendarModule),
      formatDate: (date: Date) => this.formatDate(date, calendarModule, hass),
      anchorDate: anchor,
      weather: this._weatherByDay(calendarModule, hass),
      selectedDateKey: st.selectedDateKey,
      onDaySelect: (date: Date) => {
        const key = CalendarService.getDateKey(date);
        st.selectedDateKey = st.selectedDateKey === key ? undefined : key;
        this.triggerPreviewUpdate(true);
      },
      onDayOpen: this._switcherViews(calendarModule).includes('day') && calendarModule.show_view_switcher
        ? (date: Date) => {
            st.view = 'day';
            st.baseView = calendarModule.view_type || 'compact_list';
            st.anchor = new Date(date);
            this._saveUiState(calendarModule.id, st);
            this.triggerPreviewUpdate(true);
          }
        : undefined,
      // Scroll navigation props (only when needed)
      ...(needsScrollNav ? {
        scrollState: this._scrollState,
        onScrollUp: () => this.handleScrollUp(),
        onScrollDown: () => this.handleScrollDown(),
        scrollContainerId: this._scrollContainerId,
      } : {}),
    };

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    return this.wrapWithAnimation(html`
      <style>
        ${this.getPreviewStyles(calendarModule)}
      </style>
      <div class="uc-calendar-container ${hoverClass}" style="${designStyles}">
        ${calendarModule.show_title && calendarModule.title
          ? html`
              <div
                class="uc-calendar-title ${calendarModule.show_title_separator ? 'with-separator' : ''}"
                style="
                  font-size: ${calendarModule.title_font_size || '20px'};
                  color: ${calendarModule.title_color || 'var(--primary-text-color)'};
                  ${calendarModule.show_title_separator
                    ? `border-bottom: ${calendarModule.title_separator_width || '1px'} solid ${calendarModule.title_separator_color || 'var(--divider-color)'};`
                    : ''}
                "
              >
                ${calendarModule.title}
              </div>
            `
          : ''}
        ${this._renderToolbar(calendarModule, hass, validCalendars, st, view, anchor, range, lang)}
        ${this._renderFilterChips(calendarModule, hass, validCalendars, st, lang)}
        ${st.form
          ? this._renderAddForm(calendarModule, hass, validCalendars, st, lang)
          : this.renderCalendarView(context, entry.lastFetch === 0)}
      </div>
    `, module, hass);
  }

  // ==========================================
  // VIEW / NAVIGATION STATE
  // ==========================================

  /** Views the header switcher offers. */
  private _switcherViews(module: CalendarModule): CalendarViewType[] {
    const list = (module.available_views || []).filter(Boolean);
    return list.length ? list : DEFAULT_SWITCHER_VIEWS;
  }

  /** View currently shown: the switcher pick, else the module's default view. */
  private _activeView(module: CalendarModule, st: CalendarModuleState): CalendarViewType {
    const base = module.view_type || 'compact_list';
    if (st.baseView !== null && st.baseView !== base) {
      // Default view changed in the editor: show it.
      st.view = null;
      st.baseView = null;
    }
    if (!module.show_view_switcher) return base;
    const allowed = this._switcherViews(module);
    if (st.view && allowed.includes(st.view)) return st.view;
    return allowed.includes(base) ? base : allowed[0];
  }

  /** Date range to fetch for a view. */
  private _viewRange(
    module: CalendarModule,
    view: CalendarViewType,
    anchor: Date
  ): { start: Date; end: Date } {
    const firstDay = module.first_day_of_week || 'sunday';
    if (view === 'month') {
      const days = CalendarService.getMonthDays(anchor.getFullYear(), anchor.getMonth(), firstDay);
      const start = new Date(days[0].date);
      const end = new Date(days[days.length - 1].date);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    if (view === 'week') {
      const days = CalendarService.getWeekDays(anchor, firstDay);
      const end = new Date(days[6]);
      end.setDate(end.getDate() + 1);
      return { start: days[0], end };
    }
    if (view === 'day') {
      const start = new Date(anchor);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    const start = new Date();
    if (!module.show_past_events) {
      start.setHours(0, 0, 0, 0);
    }
    const end = new Date(start);
    end.setDate(end.getDate() + (module.days_to_show || 7));
    return { start, end };
  }

  private _step(module: CalendarModule, st: CalendarModuleState, view: CalendarViewType, dir: number): void {
    const d = new Date(st.anchor || new Date());
    if (view === 'month') {
      d.setDate(1);
      d.setMonth(d.getMonth() + dir);
    } else if (view === 'week') {
      d.setDate(d.getDate() + 7 * dir);
    } else {
      d.setDate(d.getDate() + dir);
    }
    st.anchor = d;
    st.selectedDateKey = undefined;
    this.triggerPreviewUpdate(true);
  }

  private _viewTitle(view: CalendarViewType, anchor: Date, range: { start: Date; end: Date }, lang: string): string {
    if (view === 'month') {
      return anchor.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const last = new Date(range.end);
      last.setDate(last.getDate() - 1);
      const from = range.start.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
      const to = last.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' });
      return `${from} – ${to}`;
    }
    return anchor.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
  }

  private _uiStorageKey(moduleId: string): string {
    return `uc-calendar-ui-${moduleId}`;
  }

  /** Restore the picked view and hidden calendars saved in this browser. */
  private _restoreUiState(moduleId: string, st: CalendarModuleState): void {
    if (st.restored) return;
    st.restored = true;
    try {
      const raw = window.localStorage?.getItem(this._uiStorageKey(moduleId));
      if (!raw) return;
      const saved = JSON.parse(raw) as { view?: CalendarViewType; base?: CalendarViewType; hidden?: string[] };
      if (saved.view && saved.base) {
        st.view = saved.view;
        st.baseView = saved.base;
      }
      if (Array.isArray(saved.hidden)) st.hidden = new Set(saved.hidden);
    } catch {
      // Storage blocked: keep defaults.
    }
  }

  private _saveUiState(moduleId: string, st: CalendarModuleState): void {
    try {
      window.localStorage?.setItem(
        this._uiStorageKey(moduleId),
        JSON.stringify({ view: st.view, base: st.baseView, hidden: [...st.hidden] })
      );
    } catch {
      // Storage blocked: the choice lasts until reload.
    }
  }

  // ==========================================
  // WEATHER
  // ==========================================

  private _weatherByDay(module: CalendarModule, hass: HomeAssistant): Map<string, CalendarDayWeather> | undefined {
    const raw = (module.weather_entity || '').trim();
    if (!raw || !hass) return undefined;
    const entityId = this.resolveEntity(raw) || raw;
    if (!hass.states?.[entityId]) return undefined;
    const slots = getWeatherForecast(hass, entityId, 'daily', () => this.triggerPreviewUpdate(true));
    const map = new Map<string, CalendarDayWeather>();
    for (const slot of slots) {
      const key = forecastDayKey(slot.datetime);
      if (!key || map.has(key)) continue;
      const condition = String(slot.condition || '');
      map.set(key, {
        condition:
          (hass.localize && hass.localize(`component.weather.entity_component._.state.${condition}`)) ||
          condition,
        icon: WEATHER_ICONS[condition] || 'mdi:weather-cloudy',
        high: typeof slot.temperature === 'number' ? slot.temperature : undefined,
        low: typeof slot.templow === 'number' ? slot.templow : undefined,
      });
    }
    return map.size ? map : undefined;
  }

  // ==========================================
  // HEADER: NAVIGATION, VIEW SWITCHER, ADD, FILTER
  // ==========================================

  /** Current time and / or weather for the header's right corner. */
  private _renderHeaderInfo(module: CalendarModule, hass: HomeAssistant): TemplateResult | typeof nothing {
    const mode = module.header_info || 'none';
    if (mode === 'none') return nothing;
    const showTime = mode === 'time' || mode === 'time_weather';
    const showWeather = mode === 'weather' || mode === 'time_weather';
    let weather: TemplateResult | typeof nothing = nothing;
    if (showWeather) {
      const raw = (module.weather_entity || '').trim();
      const entityId = raw ? this.resolveEntity(raw) || raw : '';
      const stateObj = entityId ? hass?.states?.[entityId] : undefined;
      if (stateObj) {
        const condition = String(stateObj.state || '');
        const temp = stateObj.attributes?.temperature;
        const unit = String(stateObj.attributes?.temperature_unit || '°');
        const label =
          (hass.localize && hass.localize(`component.weather.entity_component._.state.${condition}`)) || condition;
        weather = html`<span class="uc-calendar-header-weather" title=${label}>
          <ha-icon icon=${WEATHER_ICONS[condition] || 'mdi:weather-cloudy'}></ha-icon>
          ${typeof temp === 'number' ? html`<span>${Math.round(temp)}${unit.startsWith('°') ? '°' : ` ${unit}`}</span>` : nothing}
        </span>`;
      }
    }
    if (showTime) this._ensureClockTick();
    if (!showTime && weather === nothing) return nothing;
    return html`<div class="uc-calendar-header-info">
      ${showTime ? html`<span class="uc-calendar-header-time">${this.formatTime(new Date(), module)}</span>` : nothing}
      ${weather}
    </div>`;
  }

  /** Repaint once a minute while a header clock is on screen. */
  private _ensureClockTick(): void {
    this._clockLastUse = Date.now();
    if (this._clockTimer) return;
    this._clockTimer = setInterval(() => {
      if (Date.now() - this._clockLastUse > 120000) {
        if (this._clockTimer) clearInterval(this._clockTimer);
        this._clockTimer = null;
        return;
      }
      this.triggerPreviewUpdate(false, true);
    }, 30000);
  }

  private _writableCalendars(hass: HomeAssistant, calendars: CalendarEntityConfig[]): CalendarEntityConfig[] {
    return calendars.filter(cal => {
      const features = Number(hass?.states?.[cal.entity]?.attributes?.supported_features || 0);
      return (features & CALENDAR_CREATE_EVENT) !== 0;
    });
  }

  private _renderToolbar(
    module: CalendarModule,
    hass: HomeAssistant,
    calendars: CalendarEntityConfig[],
    st: CalendarModuleState,
    view: CalendarViewType,
    anchor: Date,
    range: { start: Date; end: Date },
    lang: string
  ): TemplateResult | typeof nothing {
    const isNavView = NAV_VIEWS.includes(view);
    const showNav = isNavView && module.show_navigation !== false;
    const switcher = module.show_view_switcher ? this._switcherViews(module) : [];
    const canAdd = !!module.show_add_event && this._writableCalendars(hass, calendars).length > 0;
    const headerInfo = this._renderHeaderInfo(module, hass);
    if (!isNavView && switcher.length < 2 && !canAdd && headerInfo === nothing) return nothing;

    const now = new Date();
    const showsToday = now >= range.start && now < range.end;
    const viewLabels: Record<CalendarViewType, { label: string; icon: string }> = {
      month: { label: localize('editor.calendar.view_month', lang, 'Month'), icon: 'mdi:calendar-month' },
      week: { label: localize('editor.calendar.view_week', lang, 'Week'), icon: 'mdi:calendar-week' },
      day: { label: localize('editor.calendar.view_day', lang, 'Day'), icon: 'mdi:calendar-today' },
      compact_list: { label: localize('editor.calendar.view_list', lang, 'List'), icon: 'mdi:format-list-bulleted' },
      table: { label: localize('editor.calendar.view_table', lang, 'Table'), icon: 'mdi:table' },
      grid: { label: localize('editor.calendar.view_grid', lang, 'Grid'), icon: 'mdi:view-grid' },
    };
    const stop = (e: Event) => e.stopPropagation();

    return html`
      <div class="uc-calendar-toolbar-wrap" @pointerdown=${stop}>
      <div class="uc-calendar-toolbar">
        <div class="uc-calendar-toolbar-side uc-calendar-toolbar-start">
          ${switcher.length > 1
            ? html`
                <div class="uc-calendar-switcher" role="tablist">
                  ${switcher.map(
                    v => html`
                      <button
                        class="uc-calendar-switch-btn ${v === view ? 'active' : ''}"
                        role="tab"
                        aria-selected=${v === view ? 'true' : 'false'}
                        title=${viewLabels[v].label}
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          st.view = v;
                          st.baseView = module.view_type || 'compact_list';
                          st.selectedDateKey = undefined;
                          this._saveUiState(module.id, st);
                          this.triggerPreviewUpdate(true);
                        }}
                      >
                        ${viewLabels[v].label}
                      </button>
                    `
                  )}
                </div>
              `
            : nothing}
        </div>
        ${isNavView
          ? html`
              <div class="uc-calendar-toolbar-center">
                ${showNav
                  ? html`<button
                      class="uc-calendar-icon-btn"
                      title=${localize('editor.calendar.previous', lang, 'Previous')}
                      aria-label=${localize('editor.calendar.previous', lang, 'Previous')}
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._step(module, st, view, -1);
                      }}
                    >
                      <ha-icon icon="mdi:chevron-left"></ha-icon>
                    </button>`
                  : nothing}
                <span class="uc-calendar-month-name uc-calendar-toolbar-title">
                  ${this._viewTitle(view, anchor, range, lang)}
                </span>
                ${showNav
                  ? html`<button
                      class="uc-calendar-icon-btn"
                      title=${localize('editor.calendar.next', lang, 'Next')}
                      aria-label=${localize('editor.calendar.next', lang, 'Next')}
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        this._step(module, st, view, 1);
                      }}
                    >
                      <ha-icon icon="mdi:chevron-right"></ha-icon>
                    </button>`
                  : nothing}
              </div>
            `
          : html`<div class="uc-calendar-toolbar-center"></div>`}
        <div class="uc-calendar-toolbar-side uc-calendar-toolbar-end">
          ${headerInfo}
          ${showNav && !showsToday
            ? html`<button
                class="uc-calendar-pill-btn"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  st.anchor = null;
                  st.selectedDateKey = undefined;
                  this.triggerPreviewUpdate(true);
                }}
              >
                ${localize('editor.calendar.today', lang, 'Today')}
              </button>`
            : nothing}
          ${canAdd
            ? html`<button
                class="uc-calendar-icon-btn uc-calendar-add-btn"
                title=${localize('editor.calendar.add_event', lang, 'Add event')}
                aria-label=${localize('editor.calendar.add_event', lang, 'Add event')}
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._openAddForm(module, hass, calendars, st);
                }}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </button>`
            : nothing}
        </div>
      </div>
      </div>
    `;
  }

  /** Filter groups: one per calendar, or one per person. */
  private _filterGroups(
    module: CalendarModule,
    hass: HomeAssistant,
    calendars: CalendarEntityConfig[],
    lang: string
  ): Array<{ key: string; label: string; color: string; picture?: string | undefined; calendarIds: string[] }> {
    if (module.calendar_filter_group === 'person') {
      const groups = new Map<string, { key: string; label: string; color: string; picture?: string | undefined; calendarIds: string[] }>();
      for (const cal of calendars) {
        const personRaw = (cal.person || '').trim();
        const person = personRaw ? this.resolveEntity(personRaw) || personRaw : '';
        const key = person ? `person:${person}` : 'person:__none';
        let g = groups.get(key);
        if (!g) {
          const st = person ? hass?.states?.[person] : undefined;
          const label = person
            ? String(st?.attributes?.friendly_name || person.replace(/^person\./, '').replace(/_/g, ' '))
            : localize('editor.calendar.filter_shared', lang, 'Shared');
          g = {
            key,
            label,
            color: cal.color || '#03a9f4',
            picture: (st?.attributes?.entity_picture as string | undefined) || undefined,
            calendarIds: [],
          };
          groups.set(key, g);
        }
        g.calendarIds.push(cal.id);
      }
      // Put "Shared" (no person) last.
      return [...groups.values()].sort((a, b) =>
        a.key === 'person:__none' ? 1 : b.key === 'person:__none' ? -1 : 0
      );
    }
    return calendars.map(cal => ({
      key: `cal:${cal.id}`,
      label:
        cal.name ||
        String(hass?.states?.[cal.entity]?.attributes?.friendly_name || '') ||
        cal.entity.replace(/^calendar\./, '').replace(/_/g, ' '),
      color: cal.color || '#03a9f4',
      calendarIds: [cal.id],
    }));
  }

  private _hiddenCalendarIds(
    module: CalendarModule,
    calendars: CalendarEntityConfig[],
    st: CalendarModuleState
  ): Set<string> {
    const hidden = new Set<string>();
    if (!module.show_calendar_filter || st.hidden.size === 0) return hidden;
    for (const g of this._filterGroups(module, this._hass as HomeAssistant, calendars, 'en')) {
      if (st.hidden.has(g.key)) g.calendarIds.forEach(id => hidden.add(id));
    }
    return hidden;
  }

  private _renderFilterChips(
    module: CalendarModule,
    hass: HomeAssistant,
    calendars: CalendarEntityConfig[],
    st: CalendarModuleState,
    lang: string
  ): TemplateResult | typeof nothing {
    if (!module.show_calendar_filter || st.form) return nothing;
    const groups = this._filterGroups(module, hass, calendars, lang);
    if (groups.length < 2) return nothing;
    return html`
      <div class="uc-calendar-filter" @pointerdown=${(e: Event) => e.stopPropagation()}>
        ${groups.map(g => {
          const off = st.hidden.has(g.key);
          return html`
            <button
              class="uc-calendar-chip ${off ? 'off' : ''}"
              style="--uc-cal-chip: ${g.color};"
              aria-pressed=${off ? 'false' : 'true'}
              @click=${(e: Event) => {
                e.stopPropagation();
                if (off) st.hidden.delete(g.key);
                else st.hidden.add(g.key);
                this._saveUiState(module.id, st);
                this.triggerPreviewUpdate(true);
              }}
            >
              ${g.picture
                ? html`<img class="uc-calendar-chip-avatar" src=${g.picture} alt="" />`
                : html`<span class="uc-calendar-chip-dot"></span>`}
              <span>${g.label}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  // ==========================================
  // ADD EVENT
  // ==========================================

  private _openAddForm(
    module: CalendarModule,
    hass: HomeAssistant,
    calendars: CalendarEntityConfig[],
    st: CalendarModuleState
  ): void {
    const writable = this._writableCalendars(hass, calendars);
    // Start on the picked day (or the day shown), at the next full hour.
    const base = st.selectedDateKey
      ? new Date(`${st.selectedDateKey}T00:00:00`)
      : new Date(st.anchor || new Date());
    const now = new Date();
    const start = new Date(base);
    if (CalendarService.isSameDay(base, now)) {
      start.setHours(now.getHours() + 1, 0, 0, 0);
    } else {
      start.setHours(9, 0, 0, 0);
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    st.form = {
      calendar: writable[0]?.entity || '',
      summary: '',
      allDay: false,
      startDate: toDateInput(start),
      startTime: toTimeInput(start),
      endDate: toDateInput(end),
      endTime: toTimeInput(end),
      location: '',
      description: '',
      saving: false,
      error: '',
    };
    this.triggerPreviewUpdate(true);
  }

  private async _saveEvent(module: CalendarModule, hass: HomeAssistant, st: CalendarModuleState, lang: string): Promise<void> {
    const f = st.form;
    if (!f || f.saving) return;
    f.error = '';
    if (!f.summary.trim()) {
      f.error = localize('editor.calendar.error_title_required', lang, 'Enter a title.');
      this.triggerPreviewUpdate(true);
      return;
    }
    if (!f.calendar) {
      f.error = localize('editor.calendar.error_no_writable', lang, 'None of these calendars can take new events.');
      this.triggerPreviewUpdate(true);
      return;
    }
    const data: Record<string, unknown> = { summary: f.summary.trim() };
    if (f.allDay) {
      const startDay = new Date(`${f.startDate}T00:00:00`);
      const lastDay = new Date(`${(f.endDate || f.startDate)}T00:00:00`);
      if (Number.isNaN(startDay.getTime()) || Number.isNaN(lastDay.getTime()) || lastDay < startDay) {
        f.error = localize('editor.calendar.error_end_before_start', lang, 'The end must be after the start.');
        this.triggerPreviewUpdate(true);
        return;
      }
      // HA's end date is exclusive; the form shows the last day.
      const endExclusive = new Date(lastDay);
      endExclusive.setDate(endExclusive.getDate() + 1);
      data.start_date = toDateInput(startDay);
      data.end_date = toDateInput(endExclusive);
    } else {
      const start = new Date(`${f.startDate}T${f.startTime || '00:00'}:00`);
      const end = new Date(`${f.endDate || f.startDate}T${f.endTime || '00:00'}:00`);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
        f.error = localize('editor.calendar.error_end_before_start', lang, 'The end must be after the start.');
        this.triggerPreviewUpdate(true);
        return;
      }
      data.start_date_time = `${toDateInput(start)} ${toTimeInput(start)}:00`;
      data.end_date_time = `${toDateInput(end)} ${toTimeInput(end)}:00`;
    }
    if (f.location.trim()) data.location = f.location.trim();
    if (f.description.trim()) data.description = f.description.trim();

    f.saving = true;
    this.triggerPreviewUpdate(true);
    try {
      await hass.callService('calendar', 'create_event', data, { entity_id: f.calendar });
      st.form = null;
      // Refetch so the new event shows.
      this._calendarService?.clearCache();
      this._fetches.clear();
    } catch (err) {
      f.saving = false;
      f.error = String((err as { message?: string })?.message || err || 'Error');
    }
    this.triggerPreviewUpdate(true);
  }

  private _renderAddForm(
    module: CalendarModule,
    hass: HomeAssistant,
    calendars: CalendarEntityConfig[],
    st: CalendarModuleState,
    lang: string
  ): TemplateResult {
    const f = st.form;
    if (!f) return html``;
    const writable = this._writableCalendars(hass, calendars);
    const t = (key: string, fallback: string) => localize(`editor.calendar.${key}`, lang, fallback);
    const stop = (e: Event) => e.stopPropagation();
    const set = (field: keyof CalendarAddForm) => (e: Event) => {
      (f as unknown as Record<string, unknown>)[field] = (e.target as HTMLInputElement).value;
    };
    const calName = (cal: CalendarEntityConfig) =>
      cal.name || String(hass?.states?.[cal.entity]?.attributes?.friendly_name || cal.entity);

    return html`
      <form
        class="uc-calendar-form"
        data-uc-role="pane"
        @click=${stop}
        @pointerdown=${stop}
        @keydown=${stop}
        @submit=${(e: Event) => {
          e.preventDefault();
          this._saveEvent(module, hass, st, lang);
        }}
      >
        <div class="uc-calendar-form-title">${t('add_event', 'Add event')}</div>
        ${writable.length > 1
          ? html`<label class="uc-calendar-form-field">
              <span>${t('form_calendar', 'Calendar')}</span>
              <select
                .value=${f.calendar}
                @change=${(e: Event) => {
                  f.calendar = (e.target as HTMLSelectElement).value;
                }}
              >
                ${writable.map(
                  cal => html`<option value=${cal.entity} ?selected=${cal.entity === f.calendar}>${calName(cal)}</option>`
                )}
              </select>
            </label>`
          : nothing}
        <label class="uc-calendar-form-field">
          <span>${t('form_title', 'Title')}</span>
          <input type="text" .value=${f.summary} @input=${set('summary')} required />
        </label>
        <label class="uc-calendar-form-check">
          <input
            type="checkbox"
            .checked=${f.allDay}
            @change=${(e: Event) => {
              f.allDay = (e.target as HTMLInputElement).checked;
              this.triggerPreviewUpdate(true);
            }}
          />
          <span>${t('all_day', 'All day')}</span>
        </label>
        <div class="uc-calendar-form-row">
          <label class="uc-calendar-form-field">
            <span>${t('form_start', 'Start')}</span>
            <input type="date" .value=${f.startDate} @input=${set('startDate')} @change=${(e: Event) => {
              const prev = f.startDate;
              set('startDate')(e);
              // Keep the end on or after the start.
              if (!f.endDate || f.endDate < f.startDate || f.endDate === prev) {
                f.endDate = f.startDate;
                this.triggerPreviewUpdate(true);
              }
            }} />
          </label>
          ${f.allDay
            ? nothing
            : html`<label class="uc-calendar-form-field">
                <span>&nbsp;</span>
                <input type="time" .value=${f.startTime} @input=${set('startTime')} />
              </label>`}
        </div>
        <div class="uc-calendar-form-row">
          <label class="uc-calendar-form-field">
            <span>${t('form_end', 'End')}</span>
            <input type="date" .value=${f.endDate} @input=${set('endDate')} />
          </label>
          ${f.allDay
            ? nothing
            : html`<label class="uc-calendar-form-field">
                <span>&nbsp;</span>
                <input type="time" .value=${f.endTime} @input=${set('endTime')} />
              </label>`}
        </div>
        <label class="uc-calendar-form-field">
          <span>${t('form_location', 'Location')}</span>
          <input type="text" .value=${f.location} @input=${set('location')} />
        </label>
        <label class="uc-calendar-form-field">
          <span>${t('form_description', 'Description')}</span>
          <textarea rows="2" .value=${f.description} @input=${set('description')}></textarea>
        </label>
        ${f.error ? html`<div class="uc-calendar-form-error">${f.error}</div>` : nothing}
        <div class="uc-calendar-form-actions">
          <button
            type="button"
            class="uc-calendar-pill-btn"
            @click=${(e: Event) => {
              e.stopPropagation();
              st.form = null;
              this.triggerPreviewUpdate(true);
            }}
          >
            ${t('cancel', 'Cancel')}
          </button>
          <button type="submit" class="uc-calendar-pill-btn primary" ?disabled=${f.saving}>
            ${f.saving ? t('saving', 'Saving…') : t('save', 'Save')}
          </button>
        </div>
      </form>
    `;
  }

  private _stateFor(moduleId: string) {
    let st = this._states.get(moduleId);
    if (!st) {
      st = {
        expanded: false,
        view: null,
        baseView: null,
        anchor: null,
        selectedDateKey: undefined,
        hidden: new Set(),
        form: null,
        restored: false,
      };
      this._states.set(moduleId, st);
    }
    return st;
  }

  /** Module with this view's own Event Display settings applied (when set per view). */
  private _effectiveModule(module: CalendarModule, view: CalendarViewType): CalendarModule {
    if (!module.event_display_per_view) return module;
    const own = module.view_event_display?.[view];
    if (!own) return module;
    const merged: CalendarModule = { ...module };
    for (const key of EVENT_DISPLAY_KEYS) {
      if (own[key] !== undefined) merged[key] = own[key];
    }
    return merged;
  }

  /** Rename / re-icon / re-colour events that match an event rule (first match wins). */
  private _applyEventRules(
    module: CalendarModule,
    events: ProcessedCalendarEvent[]
  ): ProcessedCalendarEvent[] {
    const rules = (module.event_rules || []).filter(r => (r.match || '').trim());
    if (!rules.length || !events.length) return events;
    const key = JSON.stringify(rules);
    const cached = this._ruleCache.get(events);
    if (cached && cached.key === key) return cached.result;
    const result = events.map(event => {
      const name = (event.summary || '').trim().toLowerCase();
      const rule = rules.find(r => {
        const needle = r.match.trim().toLowerCase();
        return r.match_mode === 'exact' ? name === needle : name.includes(needle);
      });
      if (!rule) return event;
      return {
        ...event,
        summary: rule.rename?.trim() ? rule.rename.trim() : event.summary,
        calendarColor: rule.color ? toHexColor(rule.color) : event.calendarColor,
        icon: rule.icon || event.icon,
      };
    });
    this._ruleCache.set(events, { key, result });
    return result;
  }

  /** Calendars with an entity set and visible, with variables resolved to entity ids. */
  private _resolvedCalendars(module: CalendarModule, config?: UltraCardConfig) {
    return (module.calendars || [])
      .map(cal => {
        const raw = (cal.entity || '').trim();
        const entity = raw ? this.resolveEntity(raw, config) || raw : '';
        return { ...cal, entity };
      })
      .filter(cal => cal.entity !== '' && cal.visible !== false);
  }

  private renderCalendarView(context: CalendarViewContext, firstLoad = true): TemplateResult {
    // Spinner only before the first result; while paging months the old grid stays up.
    if (context.loading && firstLoad) {
      return this.renderLoadingState();
    }

    if (context.error) {
      return this.renderErrorState(context.error);
    }

    const viewType = context.module.view_type || 'compact_list';

    switch (viewType) {
      case 'compact_list':
        return renderCompactListView(context);
      case 'month':
        return renderMonthView(context);
      case 'week':
        return renderWeekView(context);
      case 'day':
        return renderDayView(context);
      case 'table':
        return renderTableView(context);
      case 'grid':
        return renderGridView(context);
      default:
        return renderCompactListView(context);
    }
  }

  private renderLoadingState(): TemplateResult {
    return html`
      <div class="uc-calendar-loading">
        <div class="uc-calendar-spinner"></div>
        <span>Loading events...</span>
      </div>
    `;
  }

  private renderErrorState(error: string): TemplateResult {
    return html`
      <div class="uc-calendar-error">
        <ha-icon icon="mdi:alert-circle"></ha-icon>
        <span>${error}</span>
      </div>
    `;
  }

  /**
   * Returns the fetch entry for the calendars and dates this view shows, starting a
   * fetch when it is missing or older than the refresh interval.
   */
  private fetchEventsIfNeeded(
    module: CalendarModule,
    hass: HomeAssistant,
    validCalendars: CalendarEntityConfig[],
    range: { start: Date; end: Date },
    view: CalendarViewType
  ): CalendarFetchEntry {
    const now = Date.now();
    const refreshMs = (module.refresh_interval || 15) * 60 * 1000;
    const isNavView = NAV_VIEWS.includes(view);
    // Month / week / day fetch the dates they show (paging moves the range);
    // list views keep "today + Days to Show".
    const signature = JSON.stringify([
      module.id,
      validCalendars.map(c => [c.id, c.entity, c.color || '', c.name || '']),
      isNavView ? [CalendarService.getDateKey(range.start), CalendarService.getDateKey(range.end)] : module.days_to_show || 7,
      !!module.show_past_events,
      isNavView,
    ]);

    let entry = this._fetches.get(signature);
    if (!entry) {
      entry = { events: [], loading: false, error: null, lastFetch: 0 };
      this._fetches.set(signature, entry);
      // Keep the cache small: drop the oldest entries.
      while (this._fetches.size > 40) {
        const oldest = this._fetches.keys().next().value;
        if (oldest === undefined) break;
        this._fetches.delete(oldest);
      }
    }
    if (entry.loading) return entry;
    if (entry.lastFetch > 0 && now - entry.lastFetch < refreshMs) return entry;
    if (validCalendars.length === 0) {
      entry.events = [];
      entry.lastFetch = now;
      return entry;
    }

    entry.loading = true;
    entry.error = null;
    const target = entry;
    this._calendarService!.fetchEvents(hass, validCalendars, range.start, range.end)
      .then(events => {
        // Month / week / day show every event in their dates; list views hide past ones.
        target.events = module.show_past_events || isNavView
          ? events
          : events.filter(event => event.end > new Date());
        target.error = null;
      })
      .catch(error => {
        console.error('Calendar module: Failed to fetch events', error);
        target.error = 'Failed to load calendar events';
      })
      .finally(() => {
        target.loading = false;
        target.lastFetch = Date.now();
        this.triggerPreviewUpdate();
      });
    return entry;
  }

  private handleEventClick(
    event: ProcessedCalendarEvent,
    module: CalendarModule,
    hass: HomeAssistant,
    validCalendars: CalendarEntityConfig[] = []
  ): void {
    if (!event) return;
    if (module.tap_action_expand) {
      // Toggle expand state
      const st = this._stateFor(module.id);
      st.expanded = !st.expanded;
      this.triggerPreviewUpdate();
      return;
    }

    // Execute event tap action
    const action = module.event_tap_action || { action: 'more-info' };
    if (action.action === 'more-info') {
      // Find the calendar entity for this event
      const calendar = validCalendars.find(cal => cal.id === event.calendarId);
      if (calendar?.entity) {
        UltraLinkComponent.handleAction(
          { ...action, entity: calendar.entity },
          hass,
          undefined,
          undefined,
          calendar.entity
        );
      }
    } else {
      UltraLinkComponent.handleAction(action, hass);
    }
  }

  private handleExpandToggle(moduleId: string): void {
    const st = this._stateFor(moduleId);
    st.expanded = !st.expanded;
    this.triggerPreviewUpdate();
  }

  // Scroll navigation handlers for hidden overflow mode
  private findAndSetupScrollContainer(): void {
    // Find the scroll container by its unique ID
    const container = document.querySelector(
      `[data-calendar-scroll-container="${this._scrollContainerId}"]`
    ) as HTMLElement | null;
    if (container && container !== this._scrollContainer) {
      this._scrollContainer = container;
      // Set up scroll listener to update button visibility
      container.addEventListener('scroll', () => this.updateScrollState());
      // Check initial scroll state
      this.updateScrollState();
    }
  }

  private updateScrollState(): void {
    if (!this._scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = this._scrollContainer;
    const canScrollUp = scrollTop > 0;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1; // -1 for rounding

    // Only trigger update if state actually changed
    if (canScrollUp !== this._scrollState.canScrollUp || 
        canScrollDown !== this._scrollState.canScrollDown) {
      this._scrollState = { canScrollUp, canScrollDown };
      this.triggerPreviewUpdate();
    }
  }

  private handleScrollUp(): void {
    if (!this._scrollContainer) return;
    this._scrollContainer.scrollBy({
      top: -this._scrollAmount,
      behavior: 'smooth'
    });
    // Update state after scroll animation
    setTimeout(() => this.updateScrollState(), 200);
  }

  private handleScrollDown(): void {
    if (!this._scrollContainer) return;
    this._scrollContainer.scrollBy({
      top: this._scrollAmount,
      behavior: 'smooth'
    });
    // Update state after scroll animation
    setTimeout(() => this.updateScrollState(), 200);
  }

  private formatTime(date: Date, module: CalendarModule): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !module.time_24h,
    };
    return date.toLocaleTimeString(module.language || undefined, options);
  }

  private formatDate(date: Date, module: CalendarModule, hass: HomeAssistant): string {
    const lang = module.language || hass?.locale?.language || 'en';
    const weekday = date.toLocaleDateString(lang, { weekday: 'short' });
    const day = date.getDate();

    if (module.show_month) {
      const month = date.toLocaleDateString(lang, { month: 'short' });
      return `${weekday} ${month} ${day}`;
    }

    return `${weekday} ${day}`;
  }

  private getPreviewStyles(module: CalendarModule): string {
    return `
      .uc-calendar-container {
        width: 100%;
        font-family: var(--ha-card-header-font-family, inherit);
        padding-top: 4px;
      }

      .uc-calendar-title {
        font-weight: 600;
        margin-bottom: 16px;
        padding-bottom: 0;
      }

      .uc-calendar-title.with-separator {
        padding-bottom: 12px;
        margin-bottom: 16px;
      }

      .uc-calendar-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 32px;
        color: var(--secondary-text-color);
      }

      .uc-calendar-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--divider-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: uc-cal-spin 1s linear infinite;
      }

      @keyframes uc-cal-spin {
        to { transform: rotate(360deg); }
      }

      .uc-calendar-error {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
        border-radius: var(--uc-r-8, 8px);
        color: var(--error-color);
      }

      .uc-calendar-error ha-icon {
        --mdc-icon-size: 24px;
      }

      /* Compact List View Styles */
      .uc-calendar-compact {
        display: flex;
        flex-direction: column;
        gap: ${module.row_spacing || '8px'};
        border: none;
      }

      /* Auto-fit to height mode */
      .uc-calendar-compact.auto-fit-height {
        /* Scrollbar styling */
        scrollbar-width: thin;
        scrollbar-color: var(--primary-color) transparent;
        /* Ensure flex children don't shrink - they should maintain natural height */
        flex-wrap: nowrap;
      }

      /* Day rows must not shrink when in auto-fit mode */
      .uc-calendar-compact.auto-fit-height > .uc-calendar-day-row {
        flex-shrink: 0;
      }

      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar {
        width: 6px;
      }

      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-track {
        background: transparent;
        border-radius: var(--uc-r-3, 3px);
      }

      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: var(--uc-r-3, 3px);
      }

      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-thumb:hover {
        background: var(--primary-color-dark, var(--primary-color));
      }

      .uc-calendar-compact > * {
        border-top: none;
      }

      .uc-calendar-day-row {
        display: flex;
        gap: 16px;
        padding-bottom: ${module.row_spacing || '8px'};
        border: none !important;
        border-top: none !important;
        border-bottom: none !important;
      }

      .uc-calendar-day-row:not(:last-child) {
        border-bottom: ${module.show_day_separator ? `${module.day_separator_width || '1px'} solid ${module.day_separator_color || 'var(--divider-color)'} !important` : 'none !important'};
      }

      .uc-calendar-day-row:first-child {
        border-top: none !important;
        padding-top: 0;
      }

      .uc-calendar-date-col {
        flex: 0 0 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: ${module.date_vertical_alignment === 'middle'
          ? 'center'
          : module.date_vertical_alignment === 'bottom'
            ? 'flex-end'
            : 'flex-start'};
      }

      .uc-calendar-weekday {
        font-size: ${module.weekday_font_size || '12px'};
        color: ${module.weekday_color || 'var(--secondary-text-color)'};
        text-transform: uppercase;
        font-weight: 500;
      }

      .uc-calendar-day-num {
        font-size: ${module.day_font_size || '24px'};
        color: ${module.day_color || 'var(--primary-text-color)'};
        font-weight: 600;
        line-height: 1.2;
      }

      .uc-calendar-month {
        font-size: ${module.month_font_size || '12px'};
        color: ${module.month_color || 'var(--secondary-text-color)'};
        text-transform: uppercase;
      }

      .uc-calendar-events-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: ${module.event_spacing || '4px'};
        min-width: 0;
      }

      .uc-calendar-event {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 8px;
        border-radius: var(--uc-r-6, 6px);
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .uc-calendar-event:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .uc-calendar-event-accent {
        width: ${module.vertical_line_width || '3px'};
        min-height: 100%;
        border-radius: var(--uc-r-2, 2px);
        flex-shrink: 0;
        align-self: stretch;
      }

      .uc-calendar-event-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .uc-calendar-event-title {
        font-size: ${module.event_font_size || '14px'};
        color: ${module.event_color || 'var(--primary-text-color)'};
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .uc-calendar-event-time {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: ${module.time_font_size || '12px'};
        color: ${module.time_color || 'var(--secondary-text-color)'};
      }

      .uc-calendar-event-time ha-icon {
        --mdc-icon-size: ${module.time_icon_size || '14px'};
      }

      .uc-calendar-event-location {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: ${module.location_font_size || '12px'};
        color: ${module.location_color || 'var(--secondary-text-color)'};
      }

      .uc-calendar-location-link {
        color: inherit;
        text-decoration: underline;
        text-decoration-style: dotted;
        text-underline-offset: 2px;
      }

      .uc-calendar-event-location ha-icon {
        --mdc-icon-size: ${module.location_icon_size || '14px'};
      }

      .uc-calendar-event-description {
        font-size: ${module.description_font_size || '12px'};
        color: ${module.description_color || 'var(--secondary-text-color)'};
        white-space: pre-wrap;
        word-break: break-word;
      }

      .uc-calendar-no-events {
        padding: 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .uc-calendar-expand-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 16px;
        margin-top: 8px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: var(--uc-r-8, 8px);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: opacity 0.2s ease;
      }

      .uc-calendar-expand-btn:hover {
        opacity: 0.9;
      }

      /* Scroll Navigation Wrapper and Buttons */
      .uc-calendar-compact-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
      }

      .uc-calendar-compact-wrapper.with-nav-buttons {
        /* Ensure buttons don't overlap content */
      }

      .uc-calendar-nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 8px;
        background: linear-gradient(
          to bottom,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.15),
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.05)
        );
        border: none;
        border-radius: var(--uc-r-8, 8px);
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--primary-color);
        margin: 4px 0;
      }

      .uc-calendar-nav-up {
        background: linear-gradient(
          to bottom,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.05),
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.15)
        );
        margin-bottom: 8px;
      }

      .uc-calendar-nav-down {
        margin-top: 8px;
      }

      .uc-calendar-nav-btn:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);
        transform: scale(1.01);
      }

      .uc-calendar-nav-btn:active {
        transform: scale(0.98);
      }

      .uc-calendar-nav-btn ha-icon {
        --mdc-icon-size: 24px;
        transition: transform 0.2s ease;
      }

      .uc-calendar-nav-btn:hover ha-icon {
        transform: translateY(-2px);
      }

      .uc-calendar-nav-down:hover ha-icon {
        transform: translateY(2px);
      }

      /* Month View Styles */
      .uc-calendar-month-view {
        width: 100%;
      }

      .uc-calendar-month-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        margin-bottom: 8px;
      }

      .uc-calendar-weekday-header {
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        padding: 8px 4px;
      }

      .uc-calendar-month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
      }

      /* Painted calendar surfaces announce data-uc-role="pane" in calendar-module-views.ts */
      .uc-calendar-day-cell[data-uc-role="pane"],
      .uc-calendar-day-cell {
        min-height: 60px;
        padding: 4px;
        background: var(--uc-pane-bg, var(--card-background-color));
        border-radius: var(--uc-r-4, 4px);
        border: var(--uc-pane-border, 1px solid var(--divider-color));
        box-shadow: var(--uc-pane-shadow, none);
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .uc-calendar-day-cell:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .uc-calendar-day-cell.today {
        border-color: var(--primary-color);
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .uc-calendar-day-cell.other-month {
        opacity: 0.5;
      }

      .uc-calendar-day-cell-num {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .uc-calendar-day-cell-events {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
      }

      .uc-calendar-day-cell-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      /* Table View Styles */
      .uc-calendar-table {
        width: 100%;
        border-collapse: collapse;
      }

      .uc-calendar-table th {
        text-align: left;
        padding: 12px 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        border-bottom: 2px solid var(--divider-color);
        text-transform: uppercase;
      }

      .uc-calendar-table td {
        padding: 12px 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        border-bottom: 1px solid var(--divider-color);
        vertical-align: top;
      }

      .uc-calendar-table tr:hover td {
        background: rgba(var(--rgb-primary-color), 0.05);
      }

      .uc-calendar-table-color {
        width: 4px;
        padding: 0 !important;
      }

      .uc-calendar-table-color-bar {
        width: 4px;
        height: 100%;
        border-radius: var(--uc-r-2, 2px);
      }

      /* Grid View Styles */
      .uc-calendar-grid {
        display: grid;
        grid-template-columns: repeat(${module.grid_columns || 2}, 1fr);
        gap: 12px;
      }

      .uc-calendar-grid-card {
        background: var(--uc-pane-bg, var(--card-background-color));
        border-radius: var(--uc-r-8, 8px);
        border: var(--uc-pane-border, 1px solid var(--divider-color));
        box-shadow: var(--uc-pane-shadow, none);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .uc-calendar-grid-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .uc-calendar-grid-card-header {
        padding: 12px;
        border-bottom: 1px solid var(--divider-color);
      }

      .uc-calendar-grid-card-body {
        padding: 12px;
      }

      .uc-calendar-grid-card-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      .uc-calendar-grid-card-time {
        font-size: 12px;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Empty State */
      .uc-calendar-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 32px;
        color: var(--secondary-text-color);
        text-align: center;
      }

      .uc-calendar-empty ha-icon {
        --mdc-icon-size: 48px;
        opacity: 0.5;
      }

      .uc-calendar-no-events-day {
        padding: 8px;
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 13px;
      }

      /* Month View Additional Styles */
      .uc-calendar-month-view-header {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 16px;
      }

      .uc-calendar-month-name {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
        text-transform: capitalize;
      }

      .uc-calendar-month-header.with-week-numbers {
        grid-template-columns: 40px repeat(7, 1fr);
      }

      .uc-calendar-month-grid.with-week-numbers {
        grid-template-columns: 40px repeat(7, 1fr);
      }

      .uc-calendar-week-number {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .uc-calendar-week-num-header {
        width: 40px;
      }

      .uc-calendar-day-cell-more {
        font-size: 10px;
        color: var(--secondary-text-color);
        margin-left: 2px;
      }

      /* Week View Styles */
      .uc-calendar-week-view {
        display: flex;
        flex-direction: column;
        overflow-x: auto;
      }

      .uc-calendar-week-header {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 8px;
        position: sticky;
        top: 0;
        background: var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background)));
        border: var(--uc-pane-border, none);
        box-shadow: var(--uc-pane-shadow, none);
        z-index: 1;
      }

      .uc-calendar-week-time-col {
        width: 60px;
        text-align: right;
        padding-right: 8px;
      }

      .uc-calendar-week-day-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 4px;
        border-radius: var(--uc-r-8, 8px);
      }

      .uc-calendar-week-day-header.today {
        background: rgba(var(--rgb-primary-color), 0.15);
      }

      .uc-calendar-week-day-name {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .uc-calendar-week-day-num {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .uc-calendar-week-allday-row {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 2px solid var(--divider-color);
      }

      .uc-calendar-week-allday-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-height: 24px;
      }

      .uc-calendar-week-allday-event {
        padding: 2px 6px;
        border-radius: var(--uc-r-4, 4px);
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      .uc-calendar-week-grid {
        display: flex;
        flex-direction: column;
      }

      .uc-calendar-week-row {
        display: grid;
        grid-template-columns: 60px repeat(7, 1fr);
        gap: 4px;
        min-height: 40px;
      }

      .uc-calendar-week-cell {
        border-top: 1px solid var(--divider-color);
        padding: 2px;
        position: relative;
      }

      .uc-calendar-week-event {
        padding: 2px 6px;
        border-radius: var(--uc-r-4, 4px);
        font-size: 11px;
        border-left: 3px solid;
        margin-bottom: 2px;
        cursor: pointer;
        overflow: hidden;
      }

      .uc-calendar-week-event-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Day View Styles */
      .uc-calendar-day-view {
        display: flex;
        flex-direction: column;
      }

      .uc-calendar-day-header {
        padding: 12px 0;
        margin-bottom: 16px;
        border-bottom: 2px solid var(--primary-color);
      }

      .uc-calendar-day-view-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .uc-calendar-day-allday {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: rgba(var(--rgb-primary-color), 0.05);
        border-radius: var(--uc-r-8, 8px);
        margin-bottom: 16px;
      }

      .uc-calendar-day-allday-label {
        flex: 0 0 60px;
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .uc-calendar-day-allday-events {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .uc-calendar-day-allday-event {
        padding: 6px 12px;
        border-radius: var(--uc-r-6, 6px);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }

      .uc-calendar-day-grid {
        display: flex;
        flex-direction: column;
      }

      .uc-calendar-day-row {
        display: flex;
        min-height: 48px;
        border-top: 1px solid var(--divider-color);
      }

      .uc-calendar-day-time-col {
        flex: 0 0 60px;
        padding-right: 12px;
        text-align: right;
      }

      .uc-calendar-day-events-col {
        flex: 1;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .uc-calendar-day-event {
        padding: 8px 12px;
        border-radius: var(--uc-r-6, 6px);
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .uc-calendar-day-event:hover {
        transform: translateX(4px);
      }

      .uc-calendar-day-event-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .uc-calendar-day-event-time {
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .uc-calendar-day-event-location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .uc-calendar-day-event-location ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Table View Additional Styles */
      .uc-calendar-table-container {
        overflow-x: auto;
      }

      .uc-calendar-table-event-title {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .uc-calendar-table-event-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .uc-calendar-table tr {
        cursor: pointer;
      }

      /* Grid View Additional Styles */
      .uc-calendar-grid-card-date {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .uc-calendar-grid-card-location {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .uc-calendar-grid-card-location ha-icon {
        --mdc-icon-size: 14px;
      }

      .uc-calendar-grid-card-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 8px;
        line-height: 1.4;
      }

      .uc-calendar-grid-card-calendar {
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        border-top: 1px solid var(--divider-color);
      }

      .uc-calendar-grid-card-time ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Header toolbar: view switcher | ‹ title › | today + add */
      .uc-calendar-toolbar-wrap {
        container: uc-calendar / inline-size;
        width: 100%;
      }

      .uc-calendar-toolbar {
        display: grid;
        grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .uc-calendar-toolbar-side {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }

      .uc-calendar-toolbar-end {
        justify-content: flex-end;
      }

      .uc-calendar-toolbar-center {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        min-width: 0;
      }

      .uc-calendar-toolbar-title {
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 4px;
      }

      .uc-calendar-icon-btn,
      .uc-calendar-pill-btn,
      .uc-calendar-switch-btn,
      .uc-calendar-chip {
        font: inherit;
        color: var(--primary-text-color);
        background: none;
        border: none;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .uc-calendar-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        flex: 0 0 32px;
        border-radius: 50%;
        transition: background 0.15s ease;
      }

      .uc-calendar-icon-btn ha-icon {
        --mdc-icon-size: 22px;
      }

      .uc-calendar-icon-btn:hover,
      .uc-calendar-pill-btn:hover {
        background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.08);
      }

      .uc-calendar-add-btn {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .uc-calendar-add-btn:hover {
        background: var(--primary-color);
        filter: brightness(1.1);
      }

      .uc-calendar-pill-btn {
        padding: 5px 12px;
        border-radius: 16px;
        border: 1px solid var(--divider-color);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }

      .uc-calendar-pill-btn.primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      .uc-calendar-pill-btn[disabled] {
        opacity: 0.6;
        cursor: default;
      }

      .uc-calendar-switcher {
        display: inline-flex;
        padding: 2px;
        border-radius: 16px;
        background: rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.06);
        border: 1px solid var(--divider-color);
        flex: 0 0 auto;
      }

      .uc-calendar-switch-btn {
        padding: 4px 10px;
        border-radius: 14px;
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .uc-calendar-switch-btn.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }

      /* Calendar / person filter chips */
      .uc-calendar-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: -4px 0 12px;
      }

      .uc-calendar-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px 3px 6px;
        border-radius: 14px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid var(--uc-cal-chip);
        background: color-mix(in srgb, var(--uc-cal-chip) 18%, transparent);
        text-transform: capitalize;
      }

      .uc-calendar-chip.off {
        background: none;
        border-color: var(--divider-color);
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .uc-calendar-chip-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--uc-cal-chip);
      }

      .uc-calendar-chip.off .uc-calendar-chip-dot {
        background: none;
        border: 2px solid var(--uc-cal-chip);
        box-sizing: border-box;
      }

      .uc-calendar-chip-avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        object-fit: cover;
      }

      .uc-calendar-chip.off .uc-calendar-chip-avatar {
        filter: grayscale(1);
      }

      /* Weather on days */
      .uc-calendar-weather {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        color: var(--secondary-text-color);
        font-size: 11px;
        line-height: 1;
        white-space: nowrap;
      }

      .uc-calendar-weather ha-icon {
        --mdc-icon-size: 16px;
      }

      .uc-calendar-weather--inline {
        font-size: 13px;
        gap: 4px;
      }

      .uc-calendar-weather--inline ha-icon {
        --mdc-icon-size: 20px;
      }

      .uc-calendar-weather--header {
        justify-content: center;
        margin-top: 2px;
      }

      .uc-calendar-date-col .uc-calendar-weather {
        margin-top: 4px;
      }

      .uc-calendar-day-weather-row {
        display: flex;
        justify-content: center;
        margin-bottom: 8px;
      }

      /* Month cells: number + weather, event names */
      .uc-calendar-day-cell {
        min-width: 0;
        overflow: hidden;
      }

      .uc-calendar-day-cell-top {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0 2px;
      }

      .uc-calendar-day-cell-top .uc-calendar-weather {
        margin-left: auto;
      }

      .uc-calendar-day-cell-numwrap {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .uc-calendar-day-cell-top .uc-calendar-weather ha-icon {
        --mdc-icon-size: 14px;
      }

      .uc-calendar-day-cell.selected {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }

      .uc-calendar-day-cell-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .uc-calendar-day-cell-title {
        display: flex;
        gap: 3px;
        align-items: baseline;
        min-width: 0;
        font-size: 11px;
        line-height: 1.3;
        padding: 1px 4px;
        border-radius: 3px;
        border-left: 2px solid var(--uc-cal-ev);
        background: color-mix(in srgb, var(--uc-cal-ev) 16%, transparent);
        color: var(--primary-text-color);
      }

      .uc-calendar-day-cell-title.all-day {
        background: var(--uc-cal-ev);
        color: #fff;
        border-left-color: transparent;
      }

      .uc-calendar-day-cell-time {
        flex: 0 0 auto;
        opacity: 0.75;
        font-variant-numeric: tabular-nums;
      }

      .uc-calendar-day-cell-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .uc-calendar-day-cell.wrap-titles .uc-calendar-day-cell-title {
        flex-wrap: wrap;
        align-items: flex-start;
      }

      .uc-calendar-day-cell.wrap-titles .uc-calendar-day-cell-name {
        white-space: normal;
        overflow: visible;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .uc-calendar-day-cell-count {
        flex: 0 0 auto;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        box-sizing: border-box;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        line-height: 16px;
        text-align: center;
        color: var(--text-primary-color, #fff);
        background: var(--primary-color);
        margin-left: 3px;
      }

      .uc-calendar-ev-icon {
        --mdc-icon-size: 1.1em;
        flex: 0 0 auto;
        margin-right: 3px;
        vertical-align: -0.15em;
      }

      .uc-calendar-day-event-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .uc-calendar-header-info {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
      }

      .uc-calendar-header-time {
        font-variant-numeric: tabular-nums;
      }

      .uc-calendar-header-weather {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        color: var(--secondary-text-color);
      }

      .uc-calendar-header-weather ha-icon {
        --mdc-icon-size: 18px;
      }

      .uc-calendar-form-field option,
      .uc-calendar-form-field optgroup {
        background-color: var(--card-background-color, var(--ha-card-background, #1c1c1c));
        color: var(--primary-text-color);
      }

      .uc-calendar-week-day-header.clickable {
        cursor: pointer;
      }

      /* Selected day's events */
      .uc-calendar-details {
        margin-top: 12px;
        padding: 12px;
        border-radius: var(--uc-r-8, 8px);
        background: var(--uc-pane-bg, var(--card-background-color));
        border: var(--uc-pane-border, 1px solid var(--divider-color));
      }

      .uc-calendar-details-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-weight: 600;
        font-size: 15px;
        color: var(--primary-text-color);
        margin-bottom: 8px;
      }

      .uc-calendar-details-empty {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .uc-calendar-details-event {
        display: flex;
        gap: 10px;
        padding: 8px 0;
        cursor: pointer;
      }

      .uc-calendar-details-event + .uc-calendar-details-event {
        border-top: 1px solid var(--divider-color);
      }

      .uc-calendar-details-accent {
        width: 4px;
        border-radius: 2px;
        flex: 0 0 4px;
      }

      .uc-calendar-details-body {
        min-width: 0;
        flex: 1;
      }

      .uc-calendar-details-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 2px;
        overflow-wrap: anywhere;
      }

      .uc-calendar-details-meta {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 2px;
        overflow-wrap: anywhere;
      }

      .uc-calendar-details-meta ha-icon {
        --mdc-icon-size: 14px;
        flex: 0 0 14px;
      }

      .uc-calendar-details-desc {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        white-space: pre-line;
      }

      .uc-calendar-details-cal {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 4px;
        text-transform: capitalize;
      }

      .uc-calendar-details-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      /* Add event form */
      .uc-calendar-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: var(--uc-r-8, 8px);
        background: var(--uc-pane-bg, var(--card-background-color));
        border: var(--uc-pane-border, 1px solid var(--divider-color));
      }

      .uc-calendar-form-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .uc-calendar-form-row {
        display: flex;
        gap: 8px;
      }

      .uc-calendar-form-row > * {
        flex: 1 1 0;
        min-width: 0;
      }

      .uc-calendar-form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .uc-calendar-form-field input,
      .uc-calendar-form-field select,
      .uc-calendar-form-field textarea {
        font: inherit;
        font-size: 14px;
        color: var(--primary-text-color);
        background: var(--input-fill-color, rgba(var(--rgb-primary-text-color, 255, 255, 255), 0.05));
        border: 1px solid var(--divider-color);
        border-radius: 6px;
        padding: 8px 10px;
        width: 100%;
        box-sizing: border-box;
        color-scheme: light dark;
      }

      .uc-calendar-form-field input:focus,
      .uc-calendar-form-field select:focus,
      .uc-calendar-form-field textarea:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .uc-calendar-form-check {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
        cursor: pointer;
      }

      .uc-calendar-form-check input {
        width: 18px;
        height: 18px;
        accent-color: var(--primary-color);
      }

      .uc-calendar-form-error {
        font-size: 13px;
        color: var(--error-color, #db4437);
      }

      .uc-calendar-form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      /* Narrow cards: switcher drops below the title row */
      @container uc-calendar (max-width: 440px) {
        .uc-calendar-toolbar {
          grid-template-columns: 1fr auto;
        }

        .uc-calendar-toolbar-start {
          grid-column: 1 / -1;
          grid-row: 2;
          justify-content: center;
        }

        .uc-calendar-toolbar-start:empty {
          display: none;
        }

        .uc-calendar-toolbar-center {
          justify-content: flex-start;
        }

      }

      /* Responsive adjustments */
      @media (max-width: 600px) {
        .uc-calendar-week-header,
        .uc-calendar-week-allday-row,
        .uc-calendar-week-row {
          grid-template-columns: 50px repeat(7, 1fr);
        }

        .uc-calendar-week-time-col,
        .uc-calendar-day-time-col {
          width: 50px;
          flex: 0 0 50px;
        }

        .uc-calendar-day-cell {
          min-height: 48px;
        }

        .uc-calendar-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
  }

  getStyles(): string {
    return `${BaseUltraModule.getSliderStyles()}${this.getPreviewStyles({} as CalendarModule)}`;
  }
}

