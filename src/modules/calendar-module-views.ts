import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { CalendarModule, ProcessedCalendarEvent } from '../types';
import { CalendarService } from '../services/calendar-service';

/**
 * Calendar View Context
 * Contains all data and handlers needed by view renderers
 */
export interface CalendarViewContext {
  module: CalendarModule;
  hass: HomeAssistant;
  events: ProcessedCalendarEvent[];
  loading: boolean;
  error: string | null;
  expanded: boolean;
  onEventClick: (event: ProcessedCalendarEvent) => void;
  onExpandToggle: () => void;
  formatTime: (date: Date) => string;
  formatDate: (date: Date) => string;
}

// ==========================================
// COMPACT LIST VIEW
// ==========================================

/**
 * Render compact list view - the most popular calendar view
 * Shows events grouped by day with a clean, minimal layout
 */
export function renderCompactListView(context: CalendarViewContext): TemplateResult {
  const { module, events, expanded, onEventClick, onExpandToggle, formatTime } = context;
  
  if (events.length === 0) {
    return renderEmptyState('No upcoming events');
  }

  // Group events by day
  const groupedEvents = CalendarService.groupByDay(events);
  const dayGroups = Array.from(groupedEvents.entries()).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Filter empty days if configured
  const filteredGroups = module.compact_hide_empty_days
    ? dayGroups.filter(([, dayEvents]) => dayEvents.length > 0)
    : dayGroups;

  // Limit events if not expanded
  const maxEvents = module.compact_events_to_show || 5;
  let totalEventsShown = 0;
  let hasMore = false;

  const daysToRender: Array<{ dateKey: string; events: ProcessedCalendarEvent[] }> = [];

  for (const [dateKey, dayEvents] of filteredGroups) {
    if (!expanded && totalEventsShown >= maxEvents) {
      hasMore = true;
      break;
    }

    // Filter all-day events if configured
    const filteredDayEvents = module.compact_show_all_day_events !== false
      ? dayEvents
      : dayEvents.filter(e => !e.isAllDay);

    // Limit events per day if not expanded
    const eventsToShow = expanded
      ? filteredDayEvents
      : filteredDayEvents.slice(0, maxEvents - totalEventsShown);

    if (eventsToShow.length > 0 || !module.compact_hide_empty_days) {
      daysToRender.push({ dateKey, events: eventsToShow });
      totalEventsShown += eventsToShow.length;
    }

    if (filteredDayEvents.length > eventsToShow.length) {
      hasMore = true;
    }
  }

  return html`
    <div class="uc-calendar-compact">
      ${daysToRender.map(({ dateKey, events: dayEvents }) => {
        const date = new Date(dateKey + 'T00:00:00');
        const isToday = CalendarService.isToday(date);

        return html`
          <div class="uc-calendar-day-row ${isToday ? 'today' : ''}">
            <div class="uc-calendar-date-col">
              <span class="uc-calendar-weekday">
                ${date.toLocaleDateString(module.language || undefined, { weekday: 'short' })}
              </span>
              <span class="uc-calendar-day-num">${date.getDate()}</span>
              ${module.show_month
                ? html`
                    <span class="uc-calendar-month">
                      ${date.toLocaleDateString(module.language || undefined, { month: 'short' })}
                    </span>
                  `
                : ''}
            </div>
            <div class="uc-calendar-events-col">
              ${dayEvents.length > 0
                ? dayEvents.map(event => renderCompactEvent(event, module, formatTime, onEventClick))
                : html`<div class="uc-calendar-no-events-day">No events</div>`}
            </div>
          </div>
        `;
      })}
      
      ${module.tap_action_expand && hasMore
        ? html`
            <button class="uc-calendar-expand-btn" @click=${onExpandToggle}>
              <ha-icon icon="${expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
              ${expanded ? 'Show less' : 'Show more'}
            </button>
          `
        : ''}
    </div>
  `;
}

function renderCompactEvent(
  event: ProcessedCalendarEvent,
  module: CalendarModule,
  formatTime: (date: Date) => string,
  onEventClick: (event: ProcessedCalendarEvent) => void
): TemplateResult {
  const bgOpacity = (module.event_background_opacity || 0) / 100;
  const bgColor = bgOpacity > 0
    ? `rgba(${hexToRgb(event.calendarColor)}, ${bgOpacity})`
    : 'transparent';

  return html`
    <div
      class="uc-calendar-event"
      style="background: ${bgColor};"
      @click=${() => onEventClick(event)}
    >
      <div
        class="uc-calendar-event-accent"
        style="background: ${event.calendarColor};"
      ></div>
      <div class="uc-calendar-event-content">
        <div class="uc-calendar-event-title">
          ${module.max_event_title_length && module.max_event_title_length > 0
            ? truncateText(event.summary, module.max_event_title_length)
            : event.summary}
        </div>
        
        ${module.show_event_time !== false
          ? html`
              <div class="uc-calendar-event-time">
                ${module.show_event_icon !== false
                  ? html`<ha-icon icon="mdi:clock-outline"></ha-icon>`
                  : ''}
                ${event.isAllDay
                  ? 'All day'
                  : module.show_end_time !== false
                    ? `${formatTime(event.start)} - ${formatTime(event.end)}`
                    : formatTime(event.start)}
              </div>
            `
          : ''}
        
        ${module.show_event_location && event.location
          ? html`
              <div class="uc-calendar-event-location">
                <ha-icon icon="mdi:map-marker"></ha-icon>
                ${module.remove_location_country
                  ? removeCountryFromLocation(event.location)
                  : event.location}
              </div>
            `
          : ''}
        
        ${module.show_event_description && event.description
          ? html`
              <div class="uc-calendar-event-description">
                ${event.description}
              </div>
            `
          : ''}
      </div>
    </div>
  `;
}

// ==========================================
// MONTH VIEW
// ==========================================

/**
 * Render month calendar grid view
 * Shows a traditional calendar grid with event indicators
 */
export function renderMonthView(context: CalendarViewContext): TemplateResult {
  const { module, events, hass } = context;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Get days for the month grid
  const days = CalendarService.getMonthDays(
    currentYear,
    currentMonth,
    module.first_day_of_week || 'sunday'
  );

  // Get weekday headers
  const weekdays = getWeekdayHeaders(module.first_day_of_week || 'sunday', module.language || hass?.locale?.language);

  return html`
    <div class="uc-calendar-month-view">
      <!-- Month Header -->
      <div class="uc-calendar-month-view-header">
        <span class="uc-calendar-month-name">
          ${now.toLocaleDateString(module.language || undefined, { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <!-- Weekday Headers -->
      <div class="uc-calendar-month-header">
        ${module.show_week_numbers !== 'none'
          ? html`<div class="uc-calendar-weekday-header uc-calendar-week-num-header"></div>`
          : ''}
        ${weekdays.map(
          day => html`<div class="uc-calendar-weekday-header">${day}</div>`
        )}
      </div>

      <!-- Calendar Grid -->
      <div class="uc-calendar-month-grid ${module.show_week_numbers !== 'none' ? 'with-week-numbers' : ''}">
        ${days.map((dayInfo, index) => {
          const dayEvents = CalendarService.getEventsForDate(events, dayInfo.date);
          const isToday = CalendarService.isToday(dayInfo.date);
          const showWeekNum = module.show_week_numbers !== 'none' && index % 7 === 0;
          
          return html`
            ${showWeekNum
              ? html`
                  <div class="uc-calendar-week-number">
                    ${CalendarService.getWeekNumber(
                      dayInfo.date,
                      module.show_week_numbers === 'iso' ? 'monday' : 'sunday'
                    )}
                  </div>
                `
              : ''}
            <div
              class="uc-calendar-day-cell ${isToday ? 'today' : ''} ${dayInfo.currentMonth ? '' : 'other-month'}"
              @click=${() => context.onEventClick(dayEvents[0])}
            >
              <div class="uc-calendar-day-cell-num">${dayInfo.date.getDate()}</div>
              ${dayEvents.length > 0
                ? html`
                    <div class="uc-calendar-day-cell-events">
                      ${module.month_show_event_count !== false
                        ? dayEvents.slice(0, 3).map(
                            event => html`
                              <div
                                class="uc-calendar-day-cell-dot"
                                style="background: ${event.calendarColor};"
                                title="${event.summary}"
                              ></div>
                            `
                          )
                        : ''}
                      ${dayEvents.length > 3
                        ? html`<span class="uc-calendar-day-cell-more">+${dayEvents.length - 3}</span>`
                        : ''}
                    </div>
                  `
                : ''}
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

// ==========================================
// WEEK VIEW
// ==========================================

/**
 * Render week view with time slots
 * Shows a 7-day view with hourly time grid
 */
export function renderWeekView(context: CalendarViewContext): TemplateResult {
  const { module, events, hass, formatTime } = context;
  
  const now = new Date();
  const weekDays = CalendarService.getWeekDays(now, module.first_day_of_week || 'sunday');
  
  const startHour = module.week_start_hour ?? 0;
  const endHour = module.week_end_hour ?? 24;
  const interval = module.week_time_interval || 60;
  
  // Generate time slots
  const timeSlots: Date[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const slot = new Date();
      slot.setHours(hour, min, 0, 0);
      timeSlots.push(slot);
    }
  }

  return html`
    <div class="uc-calendar-week-view">
      <!-- Week Header -->
      <div class="uc-calendar-week-header">
        <div class="uc-calendar-week-time-col"></div>
        ${weekDays.map(day => {
          const isToday = CalendarService.isToday(day);
          return html`
            <div class="uc-calendar-week-day-header ${isToday ? 'today' : ''}">
              <span class="uc-calendar-week-day-name">
                ${day.toLocaleDateString(module.language || hass?.locale?.language, { weekday: 'short' })}
              </span>
              <span class="uc-calendar-week-day-num">${day.getDate()}</span>
            </div>
          `;
        })}
      </div>

      <!-- All-day events row -->
      <div class="uc-calendar-week-allday-row">
        <div class="uc-calendar-week-time-col">
          <span class="uc-calendar-time-label">All day</span>
        </div>
        ${weekDays.map(day => {
          const dayEvents = CalendarService.getEventsForDate(events, day).filter(e => e.isAllDay);
          return html`
            <div class="uc-calendar-week-allday-cell">
              ${dayEvents.map(
                event => html`
                  <div
                    class="uc-calendar-week-allday-event"
                    style="background: ${event.calendarColor}; color: ${getContrastColor(event.calendarColor)};"
                    @click=${() => context.onEventClick(event)}
                  >
                    ${event.summary}
                  </div>
                `
              )}
            </div>
          `;
        })}
      </div>

      <!-- Time Grid -->
      <div class="uc-calendar-week-grid">
        ${timeSlots.map(slot => html`
          <div class="uc-calendar-week-row">
            <div class="uc-calendar-week-time-col">
              <span class="uc-calendar-time-label">${formatTime(slot)}</span>
            </div>
            ${weekDays.map(day => {
              // Get events that occur during this time slot
              const slotStart = new Date(day);
              slotStart.setHours(slot.getHours(), slot.getMinutes(), 0, 0);
              const slotEnd = new Date(slotStart);
              slotEnd.setMinutes(slotEnd.getMinutes() + interval);

              const slotEvents = events.filter(event => {
                if (event.isAllDay) return false;
                return event.start < slotEnd && event.end > slotStart &&
                       CalendarService.isSameDay(event.start, day);
              });

              return html`
                <div class="uc-calendar-week-cell">
                  ${slotEvents.map(
                    event => html`
                      <div
                        class="uc-calendar-week-event"
                        style="border-left-color: ${event.calendarColor}; background: rgba(${hexToRgb(event.calendarColor)}, 0.15);"
                        @click=${() => context.onEventClick(event)}
                      >
                        <span class="uc-calendar-week-event-title">${event.summary}</span>
                      </div>
                    `
                  )}
                </div>
              `;
            })}
          </div>
        `)}
      </div>
    </div>
  `;
}

// ==========================================
// DAY VIEW
// ==========================================

/**
 * Render day view with detailed time slots
 * Shows a single day with all events in detail
 */
export function renderDayView(context: CalendarViewContext): TemplateResult {
  const { module, events, hass, formatTime, onEventClick } = context;
  
  const now = new Date();
  const todayEvents = CalendarService.getEventsForDate(events, now);
  
  const startHour = module.day_start_hour ?? 0;
  const endHour = module.day_end_hour ?? 24;
  const interval = module.day_time_interval || 60;
  
  // Separate all-day and timed events
  const allDayEvents = todayEvents.filter(e => e.isAllDay);
  const timedEvents = todayEvents.filter(e => !e.isAllDay);

  // Generate time slots
  const timeSlots: Date[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const slot = new Date(now);
      slot.setHours(hour, min, 0, 0);
      timeSlots.push(slot);
    }
  }

  return html`
    <div class="uc-calendar-day-view">
      <!-- Day Header -->
      <div class="uc-calendar-day-header">
        <span class="uc-calendar-day-view-title">
          ${now.toLocaleDateString(module.language || hass?.locale?.language, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <!-- All-day events -->
      ${allDayEvents.length > 0
        ? html`
            <div class="uc-calendar-day-allday">
              <div class="uc-calendar-day-allday-label">All Day</div>
              <div class="uc-calendar-day-allday-events">
                ${allDayEvents.map(
                  event => html`
                    <div
                      class="uc-calendar-day-allday-event"
                      style="background: ${event.calendarColor}; color: ${getContrastColor(event.calendarColor)};"
                      @click=${() => onEventClick(event)}
                    >
                      ${event.summary}
                    </div>
                  `
                )}
              </div>
            </div>
          `
        : ''}

      <!-- Time Grid -->
      <div class="uc-calendar-day-grid">
        ${timeSlots.map(slot => {
          // Get events that occur during this time slot
          const slotStart = new Date(slot);
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + interval);

          const slotEvents = timedEvents.filter(
            event => event.start < slotEnd && event.end > slotStart
          );

          return html`
            <div class="uc-calendar-day-row">
              <div class="uc-calendar-day-time-col">
                <span class="uc-calendar-time-label">${formatTime(slot)}</span>
              </div>
              <div class="uc-calendar-day-events-col">
                ${slotEvents.map(
                  event => html`
                    <div
                      class="uc-calendar-day-event"
                      style="border-left: 3px solid ${event.calendarColor}; background: rgba(${hexToRgb(event.calendarColor)}, 0.1);"
                      @click=${() => onEventClick(event)}
                    >
                      <div class="uc-calendar-day-event-title">${event.summary}</div>
                      <div class="uc-calendar-day-event-time">
                        ${formatTime(event.start)} - ${formatTime(event.end)}
                      </div>
                      ${module.show_event_location && event.location
                        ? html`
                            <div class="uc-calendar-day-event-location">
                              <ha-icon icon="mdi:map-marker"></ha-icon>
                              ${event.location}
                            </div>
                          `
                        : ''}
                    </div>
                  `
                )}
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
}

// ==========================================
// TABLE VIEW
// ==========================================

/**
 * Render table view
 * Shows events in a sortable table format
 */
export function renderTableView(context: CalendarViewContext): TemplateResult {
  const { module, events, formatTime, onEventClick } = context;

  if (events.length === 0) {
    return renderEmptyState('No upcoming events');
  }

  return html`
    <div class="uc-calendar-table-container">
      <table class="uc-calendar-table">
        <thead>
          <tr>
            ${module.table_show_calendar_column !== false
              ? html`<th class="uc-calendar-table-color"></th>`
              : ''}
            ${module.table_show_date_column !== false
              ? html`<th>Date</th>`
              : ''}
            ${module.table_show_time_column !== false
              ? html`<th>Time</th>`
              : ''}
            <th>Event</th>
            ${module.table_show_location_column !== false
              ? html`<th>Location</th>`
              : ''}
            ${module.table_show_duration_column
              ? html`<th>Duration</th>`
              : ''}
          </tr>
        </thead>
        <tbody>
          ${events.map(
            event => html`
              <tr @click=${() => onEventClick(event)}>
                ${module.table_show_calendar_column !== false
                  ? html`
                      <td class="uc-calendar-table-color">
                        <div
                          class="uc-calendar-table-color-bar"
                          style="background: ${event.calendarColor};"
                        ></div>
                      </td>
                    `
                  : ''}
                ${module.table_show_date_column !== false
                  ? html`
                      <td>
                        ${event.start.toLocaleDateString(module.language || undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    `
                  : ''}
                ${module.table_show_time_column !== false
                  ? html`
                      <td>
                        ${event.isAllDay
                          ? 'All day'
                          : module.show_end_time !== false
                            ? `${formatTime(event.start)} - ${formatTime(event.end)}`
                            : formatTime(event.start)}
                      </td>
                    `
                  : ''}
                <td>
                  <div class="uc-calendar-table-event-title">${event.summary}</div>
                  ${module.show_event_description && event.description
                    ? html`<div class="uc-calendar-table-event-desc">${event.description}</div>`
                    : ''}
                </td>
                ${module.table_show_location_column !== false
                  ? html`<td>${event.location || '-'}</td>`
                  : ''}
                ${module.table_show_duration_column
                  ? html`<td>${CalendarService.formatDuration(event.start, event.end)}</td>`
                  : ''}
              </tr>
            `
          )}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// GRID VIEW
// ==========================================

/**
 * Render grid view
 * Shows events as cards in a responsive grid
 */
export function renderGridView(context: CalendarViewContext): TemplateResult {
  const { module, events, formatTime, onEventClick } = context;

  if (events.length === 0) {
    return renderEmptyState('No upcoming events');
  }

  return html`
    <div
      class="uc-calendar-grid"
      style="grid-template-columns: repeat(${module.grid_columns || 2}, 1fr);"
    >
      ${events.map(
        event => html`
          <div
            class="uc-calendar-grid-card"
            style="border-top: 3px solid ${event.calendarColor}; ${module.grid_card_height !== 'auto' ? `height: ${module.grid_card_height};` : ''}"
            @click=${() => onEventClick(event)}
          >
            <div class="uc-calendar-grid-card-header">
              <div class="uc-calendar-grid-card-date">
                ${event.start.toLocaleDateString(module.language || undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
            <div class="uc-calendar-grid-card-body">
              <div class="uc-calendar-grid-card-title">${event.summary}</div>
              ${module.show_event_time !== false
                ? html`
                    <div class="uc-calendar-grid-card-time">
                      <ha-icon icon="mdi:clock-outline"></ha-icon>
                      ${event.isAllDay
                        ? 'All day'
                        : module.show_end_time !== false
                          ? `${formatTime(event.start)} - ${formatTime(event.end)}`
                          : formatTime(event.start)}
                    </div>
                  `
                : ''}
              ${module.show_event_location && event.location
                ? html`
                    <div class="uc-calendar-grid-card-location">
                      <ha-icon icon="mdi:map-marker"></ha-icon>
                      ${module.remove_location_country
                        ? removeCountryFromLocation(event.location)
                        : event.location}
                    </div>
                  `
                : ''}
              ${module.show_event_description && event.description
                ? html`
                    <div class="uc-calendar-grid-card-desc">
                      ${truncateText(event.description, 100)}
                    </div>
                  `
                : ''}
            </div>
            <div
              class="uc-calendar-grid-card-calendar"
              style="color: ${event.calendarColor};"
            >
              ${event.calendarName}
            </div>
          </div>
        `
      )}
    </div>
  `;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function renderEmptyState(message: string): TemplateResult {
  return html`
    <div class="uc-calendar-empty">
      <ha-icon icon="mdi:calendar-blank"></ha-icon>
      <span>${message}</span>
    </div>
  `;
}

function getWeekdayHeaders(
  firstDayOfWeek: 'sunday' | 'monday' | 'saturday',
  locale?: string
): string[] {
  const days: string[] = [];
  const baseDate = new Date(2024, 0, 7); // A Sunday

  // Adjust start based on first day of week
  const offset = firstDayOfWeek === 'monday' ? 1 : firstDayOfWeek === 'saturday' ? 6 : 0;

  for (let i = 0; i < 7; i++) {
    const day = new Date(baseDate);
    day.setDate(day.getDate() + offset + i);
    days.push(day.toLocaleDateString(locale, { weekday: 'short' }));
  }

  return days;
}

function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function removeCountryFromLocation(location: string): string {
  // Common patterns for removing country
  const parts = location.split(',');
  if (parts.length > 1) {
    // Remove the last part (usually country)
    return parts.slice(0, -1).join(',').trim();
  }
  return location;
}

