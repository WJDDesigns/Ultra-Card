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

describe('calendar editor', () => {
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
