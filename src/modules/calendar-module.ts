import { TemplateResult, html, css } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  CalendarModule,
  CalendarEntityConfig,
  CalendarViewType,
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
  ScrollState,
} from './calendar-module-views';
import { CalendarService } from '../services/calendar-service';

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
  private _events: ProcessedCalendarEvent[] = [];
  private _loading: boolean = false;
  private _error: string | null = null;
  private _lastFetch: number = 0;
  private _expandedState: boolean = false;
  private _hass: HomeAssistant | null = null;
  private _refreshInterval: ReturnType<typeof setInterval> | null = null;
  
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

  validate(module: CardModule): { valid: boolean; errors: string[] } {
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

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as CalendarModule, hass, updates => updateModule(updates));
  }

  renderOtherTab(
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
      <style>
        ${this.injectUcFormStyles()}
        ${this.getEditorStyles()}
      </style>

      <!-- Calendar Selection Section -->
      ${this.renderCalendarSelectionSection(calendarModule, hass, updateModule, lang)}

      <!-- View Configuration Section -->
      ${this.renderViewConfigSection(calendarModule, hass, updateModule, lang)}

      <!-- Event Display Options Section -->
      ${this.renderEventDisplaySection(calendarModule, hass, updateModule, lang)}

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
                    <div class="field-title">Entity</div>
                    <ha-form
                      .hass=${hass}
                      .data=${{ entity: cal.entity || '' }}
                      .schema=${[
                        {
                          name: 'entity',
                          selector: { entity: { domain: 'calendar' } },
                        },
                      ]}
                      .computeLabel=${() => ''}
                      @value-changed=${(e: CustomEvent) =>
                        this.updateCalendarEntity(index, 'entity', e.detail.value.entity, module, updateModule)}
                    ></ha-form>
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

        <!-- Days to Show -->
        ${this.renderFieldSection(
          'Days to Show',
          'Number of days to display events for',
          hass,
          { days_to_show: module.days_to_show || 7 },
          [this.numberField('days_to_show', 1, 365)],
          (e: CustomEvent) => {
            updateModule({ days_to_show: e.detail.value.days_to_show });
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
              <div class="conditional-fields-group">
                <div class="conditional-fields-content">
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
              </div>
            `
          : ''}

        <!-- View-specific options -->
        ${this.renderViewSpecificOptions(module, hass, updateModule, lang)}
      </div>
    `;
  }

  private renderViewSpecificOptions(
    module: CalendarModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CalendarModule>) => void,
    lang: string
  ): TemplateResult {
    const viewType = module.view_type || 'compact_list';

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
              <div class="conditional-fields-group">
                <div class="conditional-fields-content">
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
              </div>
            `
          : this.renderFieldSection(
              'Events to Show',
              'Maximum number of events to display (0 for unlimited)',
              hass,
              { compact_events_to_show: module.compact_events_to_show ?? 5 },
              [this.numberField('compact_events_to_show', 0, 100)],
              (e: CustomEvent) => {
                updateModule({ compact_events_to_show: e.detail.value.compact_events_to_show });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }
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
          'Show Event Count',
          'Display number of events on each day',
          hass,
          { month_show_event_count: module.month_show_event_count !== false },
          [this.booleanField('month_show_event_count')],
          (e: CustomEvent) =>
            updateModule({ month_show_event_count: e.detail.value.month_show_event_count })
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

        ${this.renderFieldSection(
          'Start Hour',
          'First hour to display (0-23)',
          hass,
          { week_start_hour: module.week_start_hour ?? 0 },
          [this.numberField('week_start_hour', 0, 23)],
          (e: CustomEvent) => {
            updateModule({ week_start_hour: e.detail.value.week_start_hour });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          'End Hour',
          'Last hour to display (1-24)',
          hass,
          { week_end_hour: module.week_end_hour ?? 24 },
          [this.numberField('week_end_hour', 1, 24)],
          (e: CustomEvent) => {
            updateModule({ week_end_hour: e.detail.value.week_end_hour });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
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

        ${this.renderFieldSection(
          'Start Hour',
          'First hour to display (0-23)',
          hass,
          { day_start_hour: module.day_start_hour ?? 0 },
          [this.numberField('day_start_hour', 0, 23)],
          (e: CustomEvent) => {
            updateModule({ day_start_hour: e.detail.value.day_start_hour });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        ${this.renderFieldSection(
          'End Hour',
          'Last hour to display (1-24)',
          hass,
          { day_end_hour: module.day_end_hour ?? 24 },
          [this.numberField('day_end_hour', 1, 24)],
          (e: CustomEvent) => {
            updateModule({ day_end_hour: e.detail.value.day_end_hour });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
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

        ${this.renderFieldSection(
          'Columns',
          'Number of columns in the grid',
          hass,
          { grid_columns: module.grid_columns ?? 2 },
          [this.numberField('grid_columns', 1, 6)],
          (e: CustomEvent) => {
            updateModule({ grid_columns: e.detail.value.grid_columns });
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
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
          'Show Event Time',
          'Display the start time of events',
          hass,
          { show_event_time: module.show_event_time !== false },
          [this.booleanField('show_event_time')],
          (e: CustomEvent) => updateModule({ show_event_time: e.detail.value.show_event_time })
        )}

        ${this.renderFieldSection(
          'Show End Time',
          'Display the end time of events',
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
          'Show Location',
          'Display event location',
          hass,
          { show_event_location: module.show_event_location !== false },
          [this.booleanField('show_event_location')],
          (e: CustomEvent) =>
            updateModule({ show_event_location: e.detail.value.show_event_location })
        )}

        ${module.show_event_location
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

        ${this.renderFieldSection(
          'Show Description',
          'Display event description',
          hass,
          { show_event_description: module.show_event_description || false },
          [this.booleanField('show_event_description')],
          (e: CustomEvent) =>
            updateModule({ show_event_description: e.detail.value.show_event_description })
        )}

        ${this.renderFieldSection(
          'Show Event Icon',
          'Display calendar icon next to events',
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
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
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

          ${this.renderFieldSection(
            'Event Background Opacity',
            'Background opacity for event items (0-100)',
            hass,
            { event_background_opacity: module.event_background_opacity ?? 0 },
            [this.numberField('event_background_opacity', 0, 100)],
            (e: CustomEvent) => {
              updateModule({ event_background_opacity: e.detail.value.event_background_opacity });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }
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
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
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
                <div class="conditional-fields-group">
                  <div class="conditional-fields-content">
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

        ${this.renderFieldSection(
          'Refresh Interval (minutes)',
          'How often to refresh calendar events (0 to disable)',
          hass,
          { refresh_interval: module.refresh_interval ?? 15 },
          [this.numberField('refresh_interval', 0, 1440)],
          (e: CustomEvent) => updateModule({ refresh_interval: e.detail.value.refresh_interval })
        )}

        ${this.renderFieldSection(
          'Max Event Title Length',
          'Truncate event titles to this length (0 for no limit)',
          hass,
          { max_event_title_length: module.max_event_title_length ?? 0 },
          [this.numberField('max_event_title_length', 0, 500)],
          (e: CustomEvent) =>
            updateModule({ max_event_title_length: e.detail.value.max_event_title_length })
        )}
      </div>
    `;
  }

  // Calendar management helpers
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
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary-color);
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
        background: var(--card-background-color, var(--ha-card-background));
        border-radius: 8px;
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
        border-radius: 8px;
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
        border-radius: 8px;
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
        border-radius: 0 8px 8px 0;
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
    this._hass = hass;

    // Check for valid calendars
    const validCalendars = (calendarModule.calendars || []).filter(
      cal => cal.entity && cal.entity.trim() !== '' && cal.visible !== false
    );

    if (validCalendars.length === 0) {
      return this.renderGradientErrorState(
        'Configure Calendars',
        'Select at least one calendar entity in the General tab'
      );
    }

    // Initialize calendar service if needed
    if (!this._calendarService) {
      this._calendarService = new CalendarService();
    }

    // Fetch events if needed
    this.fetchEventsIfNeeded(calendarModule, hass);

    // Check if we need scroll navigation (hidden overflow mode with nav buttons enabled)
    const needsScrollNav = calendarModule.compact_auto_fit_height && 
      calendarModule.compact_overflow === 'hidden' && 
      calendarModule.compact_show_nav_buttons !== false;

    // Schedule container lookup after render (for scroll nav)
    if (needsScrollNav) {
      setTimeout(() => this.findAndSetupScrollContainer(), 50);
    }

    // Create view context
    const context: CalendarViewContext = {
      module: calendarModule,
      hass,
      events: this._events,
      loading: this._loading,
      error: this._error,
      expanded: this._expandedState,
      onEventClick: (event: ProcessedCalendarEvent) => this.handleEventClick(event, calendarModule, hass),
      onExpandToggle: () => this.handleExpandToggle(),
      formatTime: (date: Date) => this.formatTime(date, calendarModule),
      formatDate: (date: Date) => this.formatDate(date, calendarModule, hass),
      // Scroll navigation props (only when needed)
      ...(needsScrollNav ? {
        scrollState: this._scrollState,
        onScrollUp: () => this.handleScrollUp(),
        onScrollDown: () => this.handleScrollDown(),
        scrollContainerId: this._scrollContainerId,
      } : {}),
    };

    return html`
      <style>
        ${this.getPreviewStyles(calendarModule)}
      </style>
      <div class="uc-calendar-container">
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
        ${this.renderCalendarView(context)}
      </div>
    `;
  }

  private renderCalendarView(context: CalendarViewContext): TemplateResult {
    if (context.loading) {
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

  private async fetchEventsIfNeeded(module: CalendarModule, hass: HomeAssistant): Promise<void> {
    const now = Date.now();
    const refreshMs = (module.refresh_interval || 15) * 60 * 1000;

    // Check if we need to refresh
    if (this._events.length > 0 && now - this._lastFetch < refreshMs) {
      return;
    }

    if (this._loading) {
      return;
    }

    this._loading = true;
    this._error = null;

    try {
      const validCalendars = (module.calendars || []).filter(
        cal => cal.entity && cal.entity.trim() !== '' && cal.visible !== false
      );

      if (validCalendars.length === 0) {
        this._events = [];
        this._loading = false;
        return;
      }

      // Calculate date range
      const startDate = new Date();
      if (!module.show_past_events) {
        startDate.setHours(0, 0, 0, 0);
      }
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (module.days_to_show || 7));

      // Fetch events from calendar service
      const events = await this._calendarService!.fetchEvents(
        hass,
        validCalendars,
        startDate,
        endDate
      );

      // Filter past events if needed
      const filteredEvents = module.show_past_events
        ? events
        : events.filter(event => event.end > new Date());

      this._events = filteredEvents;
      this._lastFetch = now;
      this._loading = false;

      // Trigger preview update
      this.triggerPreviewUpdate();
    } catch (error) {
      console.error('Calendar module: Failed to fetch events', error);
      this._error = 'Failed to load calendar events';
      this._loading = false;
      this.triggerPreviewUpdate();
    }
  }

  private handleEventClick(
    event: ProcessedCalendarEvent,
    module: CalendarModule,
    hass: HomeAssistant
  ): void {
    if (module.tap_action_expand) {
      // Toggle expand state
      this._expandedState = !this._expandedState;
      this.triggerPreviewUpdate();
      return;
    }

    // Execute event tap action
    const action = module.event_tap_action || { action: 'more-info' };
    if (action.action === 'more-info') {
      // Find the calendar entity for this event
      const calendar = (module.calendars || []).find(cal => cal.id === event.calendarId);
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

  private handleExpandToggle(): void {
    this._expandedState = !this._expandedState;
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
        border-radius: 8px;
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
        border-radius: 3px;
      }

      .uc-calendar-compact.auto-fit-height::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 3px;
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
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .uc-calendar-event:hover {
        background: rgba(var(--rgb-primary-color), 0.1);
      }

      .uc-calendar-event-accent {
        width: ${module.vertical_line_width || '3px'};
        min-height: 100%;
        border-radius: 2px;
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
        border-radius: 8px;
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
        border-radius: 8px;
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

      .uc-calendar-day-cell {
        min-height: 60px;
        padding: 4px;
        background: var(--card-background-color);
        border-radius: 4px;
        border: 1px solid var(--divider-color);
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
        border-radius: 2px;
      }

      /* Grid View Styles */
      .uc-calendar-grid {
        display: grid;
        grid-template-columns: repeat(${module.grid_columns || 2}, 1fr);
        gap: 12px;
      }

      .uc-calendar-grid-card {
        background: var(--card-background-color);
        border-radius: 8px;
        border: 1px solid var(--divider-color);
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
        background: var(--card-background-color, var(--ha-card-background));
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
        border-radius: 8px;
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
        border-radius: 4px;
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
        border-radius: 4px;
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
        border-radius: 8px;
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
        border-radius: 6px;
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
        border-radius: 6px;
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
    return this.getPreviewStyles({} as CalendarModule);
  }
}

