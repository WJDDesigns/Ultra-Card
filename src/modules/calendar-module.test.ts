import { describe, it, expect, vi } from 'vitest';
import { render } from 'lit';
import { UltraCalendarModule } from './calendar-module';
import type { CalendarModule, ProcessedCalendarEvent } from '../types';

const ev = (calendarId: string, summary: string): ProcessedCalendarEvent => {
  const start = new Date();
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + 3600000);
  return {
    id: `${calendarId}-${summary}`,
    calendarId,
    calendarColor: '#ff0000',
    calendarName: calendarId,
    summary,
    location: 'Rathenaustraße 1',
    start,
    end,
    isAllDay: false,
    isMultiDay: false,
    raw: {} as ProcessedCalendarEvent['raw'],
  };
};

const hass = {
  states: {
    'calendar.trash': { state: 'off', attributes: {} },
    'calendar.family': { state: 'off', attributes: {} },
  },
  locale: { language: 'en' },
} as any;

const baseModule = (entity: string): CalendarModule =>
  ({
    id: 'cal1',
    type: 'calendar',
    calendars: [{ id: 'c1', entity, color: '#ff0000', visible: true }],
    view_type: 'month',
    days_to_show: 7,
    month_event_display: 'titles',
    month_show_day_details: true,
  }) as CalendarModule;

function setup() {
  const mod = new UltraCalendarModule();
  const fetchEvents = vi.fn(async (_h: unknown, cals: Array<{ entity: string }>) =>
    cals[0].entity === 'calendar.trash' ? [ev('c1', 'Restmüll Abholung')] : [ev('c1', 'Birthday Mila')]
  );
  (mod as any)._calendarService = { fetchEvents, clearCache: vi.fn() };
  return { mod, fetchEvents };
}

const flush = () => new Promise(r => setTimeout(r, 0));

function textOf(tpl: unknown): string {
  const el = document.createElement('div');
  render(tpl as any, el);
  return el.textContent || '';
}

describe('calendar module', () => {
  it('editor preview and dashboard card with different calendars do not overwrite each other', async () => {
    const { mod } = setup();
    const card = baseModule('calendar.trash');
    const edited = baseModule('calendar.family');
    mod.renderPreview(card, hass, undefined, 'dashboard');
    mod.renderPreview(edited, hass, undefined, 'live');
    await flush();
    await flush();
    expect(textOf(mod.renderPreview(edited, hass, undefined, 'live'))).toContain('Birthday Mila');
    expect(textOf(mod.renderPreview(edited, hass, undefined, 'live'))).not.toContain('Restmüll');
    expect(textOf(mod.renderPreview(card, hass, undefined, 'dashboard'))).toContain('Restmüll');
  });

  it('event rules rename, re-colour and add an icon', async () => {
    const { mod } = setup();
    const m = {
      ...baseModule('calendar.trash'),
      event_rules: [{ id: 'r1', match: 'restmüll', rename: 'Black bin', icon: 'mdi:trash-can', color: 'rgb(0, 128, 0)' }],
    } as CalendarModule;
    mod.renderPreview(m, hass);
    await flush();
    const out = (mod as any)._applyEventRules(m, [ev('c1', 'Restmüll Abholung'), ev('c1', 'Papier')]);
    expect(out[0].summary).toBe('Black bin');
    expect(out[0].icon).toBe('mdi:trash-can');
    expect(out[0].calendarColor).toBe('#008000');
    expect(out[1].summary).toBe('Papier');
  });

  it('per-view event display overrides only when turned on', () => {
    const { mod } = setup();
    const m = {
      ...baseModule('calendar.trash'),
      show_event_location: true,
      view_event_display: { month: { show_event_location: false } },
    } as CalendarModule;
    expect((mod as any)._effectiveModule(m, 'month').show_event_location).toBe(true);
    const on = { ...m, event_display_per_view: true };
    expect((mod as any)._effectiveModule(on, 'month').show_event_location).toBe(false);
    expect((mod as any)._effectiveModule(on, 'day').show_event_location).toBe(true);
  });
});

describe('calendar day details', () => {
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  async function detailsFor(m: CalendarModule, ctx: 'dashboard' | 'live' = 'live') {
    const { mod } = setup();
    mod.renderPreview(m, hass, undefined, ctx);
    await flush();
    await flush();
    (mod as any)._stateFor(m.id).selectedDateKey = todayKey();
    const el = document.createElement('div');
    render(mod.renderPreview(m, hass, undefined, ctx) as any, el);
    return { mod, el };
  }

  it('hides time, location and calendar name when turned off', async () => {
    const m = {
      ...baseModule('calendar.trash'),
      show_event_time: false,
      show_event_location: false,
      show_calendar_name: false,
    } as CalendarModule;
    const { el } = await detailsFor(m);
    const details = el.querySelector('.uc-calendar-details')!;
    expect(details.textContent).toContain('Restmüll');
    expect(details.querySelectorAll('.uc-calendar-details-meta').length).toBe(0);
    expect(details.querySelector('.uc-calendar-details-cal')).toBeNull();
  });

  it('popup mode shows the day over the card in the editor preview, not under the grid', async () => {
    const m = { ...baseModule('calendar.trash'), month_day_details_mode: 'popup' } as CalendarModule;
    const { el } = await detailsFor(m);
    expect(el.querySelector('.uc-calendar-month-view .uc-calendar-details')).toBeNull();
    const popup = el.querySelector('.uc-calendar-popup');
    expect(popup?.textContent).toContain('Restmüll');
    expect(popup?.querySelector('.uc-calendar-details-close')).not.toBeNull();
  });

  it('popup mode on the dashboard opens over the page and closes', async () => {
    const m = { ...baseModule('calendar.trash'), id: 'calpop', month_day_details_mode: 'popup' } as CalendarModule;
    const { mod } = await detailsFor(m, 'dashboard');
    await flush();
    const portal = document.querySelector('.uc-calendar-popup-portal');
    expect(portal?.textContent).toContain('Restmüll');
    (portal!.querySelector('.uc-calendar-details-close') as HTMLElement).click();
    expect(document.querySelector('.uc-calendar-popup-portal')).toBeNull();
    expect((mod as any)._stateFor('calpop').selectedDateKey).toBeUndefined();
  });
});

describe('calendar editor', () => {
  it('shared Event Display changes reach views still on the shared value', () => {
    const { mod } = setup();
    const m = {
      ...baseModule('calendar.trash'),
      event_display_per_view: true,
      view_event_display: {
        month: { show_event_location: true, show_event_time: true },
        day: { show_event_location: false },
      },
    } as CalendarModule;
    const updates: Partial<CalendarModule>[] = [];
    (mod as any)._setSharedEventDisplay(m, 'show_event_location', false, (u: Partial<CalendarModule>) => updates.push(u));
    expect(updates[0].show_event_location).toBe(false);
    expect(updates[0].view_event_display?.month?.show_event_location).toBe(false);
    expect(updates[0].view_event_display?.month?.show_event_time).toBe(true);
    expect(updates[0].view_event_display?.day?.show_event_location).toBe(false);
  });

  it('shows one section per offered view and locks per-view event settings until turned on', () => {
    const { mod } = setup();
    const m = {
      ...baseModule('calendar.trash'),
      show_view_switcher: true,
      available_views: ['month', 'week', 'table'],
    } as CalendarModule;
    const el = document.createElement('div');
    render(mod.renderGeneralTab(m, hass, {} as any, () => {}) as any, el);
    const titles = [...el.querySelectorAll('.per-view-section > .section-title')].map(t => t.textContent?.trim());
    expect(titles).toEqual(['Month view', 'Week view', 'Table view']);
    expect(el.querySelectorAll('.per-view-event-display.locked').length).toBe(2);
    render(mod.renderGeneralTab({ ...m, event_display_per_view: true }, hass, {} as any, () => {}) as any, el);
    expect(el.querySelectorAll('.per-view-event-display.locked').length).toBe(0);
  });
});

describe('Calendar edit events', () => {
  const editHass = (features: number) =>
    ({
      ...hass,
      states: { 'calendar.home': { state: 'off', attributes: { supported_features: features } } },
      callWS: vi.fn(async () => null),
      callService: vi.fn(async () => null),
    }) as any;

  const evt = (raw: Record<string, unknown>, allDay = false): ProcessedCalendarEvent => {
    const start = allDay ? new Date(2026, 10, 20) : new Date(2026, 10, 20, 9, 30);
    const end = allDay ? new Date(2026, 10, 22) : new Date(2026, 10, 20, 10, 45);
    return {
      id: 'e1',
      calendarId: 'c1',
      calendarColor: '#ff0000',
      calendarName: 'Home',
      summary: 'Renamed by rule',
      start,
      end,
      isAllDay: allDay,
      isMultiDay: allDay,
      raw: { summary: 'Dentist', location: 'Main St', description: '', start: '', end: '', ...raw } as any,
    };
  };

  const editModule = () => ({ ...baseModule('calendar.home'), allow_edit_events: true }) as CalendarModule;
  const cals = [{ id: 'c1', entity: 'calendar.home', color: '#ff0000', visible: true }] as any;

  it('tap opens the form with the event’s own values and saves via calendar/event/update', async () => {
    const { mod } = setup();
    const h = editHass(7);
    const m = editModule();
    (mod as any).handleEventClick(evt({ uid: 'u1' }), m, h, cals);
    const st = (mod as any)._stateFor(m.id);
    expect(st.form.edit.uid).toBe('u1');
    expect(st.form.summary).toBe('Dentist');
    expect(st.form.startTime).toBe('09:30');
    expect(st.form.endTime).toBe('10:45');
    st.form.summary = 'Dentist (moved)';
    await (mod as any)._saveEvent(m, h, st, 'en');
    expect(h.callService).not.toHaveBeenCalled();
    const msg = h.callWS.mock.calls[0][0];
    expect(msg.type).toBe('calendar/event/update');
    expect(msg.entity_id).toBe('calendar.home');
    expect(msg.uid).toBe('u1');
    expect(msg.recurrence_id).toBeUndefined();
    expect(msg.event.summary).toBe('Dentist (moved)');
    expect(msg.event.dtstart).toBe(new Date(2026, 10, 20, 9, 30).toISOString().replace('.000Z', 'Z'));
    expect(msg.event.location).toBe('Main St');
    expect(st.form).toBeNull();
  });

  it('all-day events show the last day and send an exclusive end date', async () => {
    const { mod } = setup();
    const h = editHass(7);
    const m = editModule();
    (mod as any).handleEventClick(evt({ uid: 'u2' }, true), m, h, cals);
    const st = (mod as any)._stateFor(m.id);
    expect(st.form.startDate).toBe('2026-11-20');
    expect(st.form.endDate).toBe('2026-11-21');
    await (mod as any)._saveEvent(m, h, st, 'en');
    const msg = h.callWS.mock.calls[0][0];
    expect(msg.event.dtstart).toBe('2026-11-20');
    expect(msg.event.dtend).toBe('2026-11-22');
  });

  it('repeating events send recurrence id and range; rrule only for this-and-following', async () => {
    const { mod } = setup();
    const h = editHass(7);
    const m = editModule();
    const raw = { uid: 'u3', recurrence_id: '20261120T093000', rrule: 'FREQ=WEEKLY' };
    (mod as any).handleEventClick(evt(raw), m, h, cals);
    let st = (mod as any)._stateFor(m.id);
    await (mod as any)._saveEvent(m, h, st, 'en');
    let msg = h.callWS.mock.calls[0][0];
    expect(msg.recurrence_id).toBe('20261120T093000');
    expect(msg.recurrence_range).toBe('');
    expect(msg.event.rrule).toBeUndefined();

    (mod as any).handleEventClick(evt(raw), m, h, cals);
    st = (mod as any)._stateFor(m.id);
    st.form.edit.range = 'THISANDFUTURE';
    await (mod as any)._saveEvent(m, h, st, 'en');
    msg = h.callWS.mock.calls[1][0];
    expect(msg.recurrence_range).toBe('THISANDFUTURE');
    expect(msg.event.rrule).toBe('FREQ=WEEKLY');
  });

  it('delete sends calendar/event/delete', async () => {
    const { mod } = setup();
    const h = editHass(3);
    const m = editModule();
    (mod as any).handleEventClick(evt({ uid: 'u4' }), m, h, cals);
    const st = (mod as any)._stateFor(m.id);
    expect(st.form.edit.canUpdate).toBe(false);
    expect(st.form.edit.canDelete).toBe(true);
    await (mod as any)._deleteEvent(st, h);
    expect(h.callWS.mock.calls[0][0]).toEqual({ type: 'calendar/event/delete', entity_id: 'calendar.home', uid: 'u4' });
    expect(st.form).toBeNull();
  });

  it('calendars that cannot change events, events without uid, or the option off keep the tap action', () => {
    const { mod } = setup();
    const m = editModule();
    (mod as any).handleEventClick(evt({ uid: 'u5' }), m, editHass(1), cals);
    expect((mod as any)._stateFor(m.id).form).toBeNull();
    (mod as any).handleEventClick(evt({}), m, editHass(7), cals);
    expect((mod as any)._stateFor(m.id).form).toBeNull();
    (mod as any).handleEventClick(evt({ uid: 'u6' }), { ...m, allow_edit_events: false }, editHass(7), cals);
    expect((mod as any)._stateFor(m.id).form).toBeNull();
  });

  it('edit form renders title, scope picker and delete button', () => {
    const { mod } = setup();
    const h = editHass(7);
    const m = editModule();
    (mod as any).handleEventClick(evt({ uid: 'u7', recurrence_id: 'r1' }), m, h, cals);
    const st = (mod as any)._stateFor(m.id);
    const text = textOf((mod as any)._renderAddForm(m, h, cals, st, 'en'));
    expect(text).toContain('Edit event');
    expect(text).toContain('This and following events');
    expect(text).toContain('Delete');
  });
});
