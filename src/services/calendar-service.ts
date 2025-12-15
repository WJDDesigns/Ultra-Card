import { HomeAssistant } from 'custom-card-helpers';
import {
  CalendarEntityConfig,
  CalendarEventData,
  ProcessedCalendarEvent,
} from '../types';

/**
 * Calendar Service
 *
 * Handles fetching and caching calendar events from Home Assistant.
 * Provides utilities for:
 * - Fetching events from multiple calendars
 * - Processing and normalizing event data
 * - Caching results with configurable TTL
 * - Grouping events by day, week, or month
 */
export class CalendarService {
  private _cache: Map<string, { events: ProcessedCalendarEvent[]; timestamp: number }> = new Map();
  private _cacheTTL: number = 5 * 60 * 1000; // 5 minutes default

  constructor(cacheTTL?: number) {
    if (cacheTTL) {
      this._cacheTTL = cacheTTL;
    }
  }

  /**
   * Fetch calendar events from multiple calendar entities
   */
  async fetchEvents(
    hass: HomeAssistant,
    calendars: CalendarEntityConfig[],
    startDate: Date,
    endDate: Date
  ): Promise<ProcessedCalendarEvent[]> {
    const cacheKey = this.generateCacheKey(calendars, startDate, endDate);
    
    // Check cache
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this._cacheTTL) {
      return cached.events;
    }

    // Fetch events from all calendars in parallel
    const eventPromises = calendars.map(calendar =>
      this.fetchCalendarEvents(hass, calendar, startDate, endDate)
    );

    const results = await Promise.allSettled(eventPromises);
    
    // Combine all events
    let allEvents: ProcessedCalendarEvent[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allEvents = allEvents.concat(result.value);
      } else {
        console.warn(
          `Calendar module: Failed to fetch events for ${calendars[index].entity}`,
          result.reason
        );
      }
    });

    // Sort by start date
    allEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Cache results
    this._cache.set(cacheKey, { events: allEvents, timestamp: Date.now() });

    return allEvents;
  }

  /**
   * Fetch events from a single calendar entity
   */
  private async fetchCalendarEvents(
    hass: HomeAssistant,
    calendar: CalendarEntityConfig,
    startDate: Date,
    endDate: Date
  ): Promise<ProcessedCalendarEvent[]> {
    if (!calendar.entity || !hass?.callApi) {
      return [];
    }

    try {
      // Format dates for API
      const start = this.formatDateForApi(startDate);
      const end = this.formatDateForApi(endDate);

      // Call Home Assistant API
      const response = await hass.callApi<CalendarEventData[]>(
        'GET',
        `calendars/${calendar.entity}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
      );

      if (!Array.isArray(response)) {
        return [];
      }

      // Process events
      return response.map(event => this.processEvent(event, calendar));
    } catch (error) {
      console.error(`Calendar module: Error fetching ${calendar.entity}:`, error);
      throw error;
    }
  }

  /**
   * Process raw event data into a normalized format
   */
  private processEvent(
    event: CalendarEventData,
    calendar: CalendarEntityConfig
  ): ProcessedCalendarEvent {
    const start = this.parseEventDate(event.start);
    const end = this.parseEventDate(event.end);
    
    // Determine if all-day event
    const isAllDay = this.isAllDayEvent(event);
    
    // Determine if multi-day event
    const isMultiDay = this.isMultiDayEvent(start, end, isAllDay);

    return {
      id: event.uid || `${calendar.entity}-${start.getTime()}-${event.summary}`,
      calendarId: calendar.id,
      calendarColor: calendar.color || '#03a9f4',
      calendarName: calendar.name || this.getCalendarDisplayName(calendar.entity),
      summary: event.summary || 'Untitled Event',
      description: event.description,
      location: event.location,
      start,
      end,
      isAllDay,
      isMultiDay,
      raw: event,
    };
  }

  /**
   * Parse event date from various formats
   */
  private parseEventDate(dateValue: string | { dateTime?: string; date?: string }): Date {
    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }

    if (dateValue.dateTime) {
      return new Date(dateValue.dateTime);
    }

    if (dateValue.date) {
      // All-day event date (no time component)
      return new Date(dateValue.date + 'T00:00:00');
    }

    return new Date();
  }

  /**
   * Check if event is an all-day event
   */
  private isAllDayEvent(event: CalendarEventData): boolean {
    const start = event.start;
    const end = event.end;

    // If dates are objects with 'date' property, it's an all-day event
    if (typeof start === 'object' && 'date' in start && !('dateTime' in start)) {
      return true;
    }

    // Check if event spans full days (midnight to midnight)
    if (typeof start === 'string' && typeof end === 'string') {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      // Check if times are exactly midnight
      if (
        startDate.getHours() === 0 &&
        startDate.getMinutes() === 0 &&
        endDate.getHours() === 0 &&
        endDate.getMinutes() === 0
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if event spans multiple days
   */
  private isMultiDayEvent(start: Date, end: Date, isAllDay: boolean): boolean {
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);

    // For all-day events, end date is exclusive, so subtract one day
    if (isAllDay) {
      endDay.setDate(endDay.getDate() - 1);
    }

    return endDay.getTime() > startDay.getTime();
  }

  /**
   * Get display name for calendar entity
   */
  private getCalendarDisplayName(entityId: string): string {
    // Remove domain prefix and clean up
    const name = entityId.replace('calendar.', '').replace(/_/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Format date for API call
   */
  private formatDateForApi(date: Date): string {
    return date.toISOString();
  }

  /**
   * Generate cache key for a set of calendars and date range
   */
  private generateCacheKey(
    calendars: CalendarEntityConfig[],
    startDate: Date,
    endDate: Date
  ): string {
    const calendarIds = calendars.map(c => c.entity).sort().join('|');
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    return `${calendarIds}:${startStr}:${endStr}`;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this._cache.clear();
  }

  /**
   * Set cache TTL (in milliseconds)
   */
  setCacheTTL(ttl: number): void {
    this._cacheTTL = ttl;
  }

  // ==========================================
  // EVENT GROUPING UTILITIES
  // ==========================================

  /**
   * Group events by day
   */
  static groupByDay(events: ProcessedCalendarEvent[]): Map<string, ProcessedCalendarEvent[]> {
    const grouped = new Map<string, ProcessedCalendarEvent[]>();

    events.forEach(event => {
      const dateKey = CalendarService.getDateKey(event.start);
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }

  /**
   * Group events by week
   */
  static groupByWeek(
    events: ProcessedCalendarEvent[],
    firstDayOfWeek: 'sunday' | 'monday' | 'saturday' = 'sunday'
  ): Map<string, ProcessedCalendarEvent[]> {
    const grouped = new Map<string, ProcessedCalendarEvent[]>();

    events.forEach(event => {
      const weekKey = CalendarService.getWeekKey(event.start, firstDayOfWeek);
      
      if (!grouped.has(weekKey)) {
        grouped.set(weekKey, []);
      }
      
      grouped.get(weekKey)!.push(event);
    });

    return grouped;
  }

  /**
   * Group events by month
   */
  static groupByMonth(events: ProcessedCalendarEvent[]): Map<string, ProcessedCalendarEvent[]> {
    const grouped = new Map<string, ProcessedCalendarEvent[]>();

    events.forEach(event => {
      const monthKey = CalendarService.getMonthKey(event.start);
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      
      grouped.get(monthKey)!.push(event);
    });

    return grouped;
  }

  /**
   * Get events for a specific date
   */
  static getEventsForDate(events: ProcessedCalendarEvent[], date: Date): ProcessedCalendarEvent[] {
    const dateKey = CalendarService.getDateKey(date);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return events.filter(event => {
      // Check if event starts on this date
      if (CalendarService.getDateKey(event.start) === dateKey) {
        return true;
      }
      
      // Check if this is a multi-day event that spans this date
      if (event.isMultiDay && event.start <= dateEnd && event.end >= dateStart) {
        return true;
      }

      return false;
    });
  }

  /**
   * Get date key (YYYY-MM-DD format)
   */
  static getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get week key (YYYY-Www format, where ww is week number)
   */
  static getWeekKey(date: Date, firstDayOfWeek: 'sunday' | 'monday' | 'saturday'): string {
    const year = date.getFullYear();
    const weekNum = CalendarService.getWeekNumber(date, firstDayOfWeek);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }

  /**
   * Get month key (YYYY-MM format)
   */
  static getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Calculate week number
   */
  static getWeekNumber(date: Date, firstDayOfWeek: 'sunday' | 'monday' | 'saturday'): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    
    // Adjust for first day of week
    const firstDayOffset =
      firstDayOfWeek === 'monday' ? 1 : firstDayOfWeek === 'saturday' ? 6 : 0;
    
    // Calculate days since year start
    const daysSinceYearStart = Math.floor(
      (d.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    // Calculate week number
    const weekNum = Math.ceil((daysSinceYearStart + yearStart.getDay() + 1 - firstDayOffset) / 7);
    
    return weekNum;
  }

  /**
   * Get days of a week for a given date
   */
  static getWeekDays(
    date: Date,
    firstDayOfWeek: 'sunday' | 'monday' | 'saturday' = 'sunday'
  ): Date[] {
    const days: Date[] = [];
    const d = new Date(date);
    
    // Get day of week (0 = Sunday)
    const currentDay = d.getDay();
    
    // Calculate offset to first day of week
    const firstDayOffset =
      firstDayOfWeek === 'monday' ? 1 : firstDayOfWeek === 'saturday' ? 6 : 0;
    
    // Calculate days to subtract to get to first day of week
    let daysToSubtract = currentDay - firstDayOffset;
    if (daysToSubtract < 0) daysToSubtract += 7;
    
    // Set to first day of week
    d.setDate(d.getDate() - daysToSubtract);
    d.setHours(0, 0, 0, 0);
    
    // Generate 7 days
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    
    return days;
  }

  /**
   * Get days of a month including padding days from adjacent months
   */
  static getMonthDays(
    year: number,
    month: number,
    firstDayOfWeek: 'sunday' | 'monday' | 'saturday' = 'sunday'
  ): { date: Date; currentMonth: boolean }[] {
    const days: { date: Date; currentMonth: boolean }[] = [];
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate offset based on first day of week
    const firstDayOffset =
      firstDayOfWeek === 'monday' ? 1 : firstDayOfWeek === 'saturday' ? 6 : 0;
    
    // Days to add from previous month
    let daysFromPrevMonth = firstDay.getDay() - firstDayOffset;
    if (daysFromPrevMonth < 0) daysFromPrevMonth += 7;
    
    // Add days from previous month
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      days.push({ date, currentMonth: false });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({ date, currentMonth: true });
    }
    
    // Add days from next month to complete the grid (6 rows × 7 days = 42)
    const daysToAdd = 42 - days.length;
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, currentMonth: false });
    }
    
    return days;
  }

  /**
   * Check if two dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date): boolean {
    return CalendarService.isSameDay(date, new Date());
  }

  /**
   * Format duration between two dates
   */
  static formatDuration(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    }
    
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
  }

  /**
   * Format relative time (e.g., "in 2 hours", "in 3 days")
   */
  static formatRelativeTime(date: Date, locale?: string): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Past events
    if (diffMs < 0) {
      if (diffMins > -60) {
        return `${Math.abs(diffMins)}m ago`;
      }
      if (diffHours > -24) {
        return `${Math.abs(diffHours)}h ago`;
      }
      return `${Math.abs(diffDays)}d ago`;
    }

    // Future events
    if (diffMins < 60) {
      return `in ${diffMins}m`;
    }
    if (diffHours < 24) {
      return `in ${diffHours}h`;
    }
    return `in ${diffDays}d`;
  }
}

