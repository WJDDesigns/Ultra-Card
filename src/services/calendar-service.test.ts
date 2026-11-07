import { describe, expect, it } from 'vitest';
import { CalendarService } from './calendar-service';
import type { ProcessedCalendarEvent } from '../types';

const ev = (start: Date, end: Date, isAllDay: boolean, isMultiDay: boolean): ProcessedCalendarEvent => ({
  id: 'x',
  calendarId: 'c',
  calendarColor: '#03a9f4',
  calendarName: 'Cal',
  summary: 'Event',
  start,
  end,
  isAllDay,
  isMultiDay,
  raw: { summary: 'Event', start: '', end: '' },
});

describe('CalendarService day keys', () => {
  it('uses the local calendar day, not UTC', () => {
    expect(CalendarService.getDateKey(new Date(2026, 10, 9, 0, 30))).toBe('2026-11-09');
    expect(CalendarService.getDateKey(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09');
  });

  it('groups an all-day event under its own day', () => {
    const e = ev(new Date(2026, 10, 9), new Date(2026, 10, 10), true, false);
    expect([...CalendarService.groupByDay([e]).keys()]).toEqual(['2026-11-09']);
  });

  it('does not show a multi-day all-day event on its exclusive end day', () => {
    const e = ev(new Date(2026, 10, 9), new Date(2026, 10, 11), true, true);
    expect(CalendarService.getEventsForDate([e], new Date(2026, 10, 10))).toHaveLength(1);
    expect(CalendarService.getEventsForDate([e], new Date(2026, 10, 11))).toHaveLength(0);
  });
});
