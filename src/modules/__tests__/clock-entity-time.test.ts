/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { getModuleRegistry } from '../module-registry';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';
import type { ClockModule, UltraCardConfig } from '../../types';

const CONFIG: UltraCardConfig = { type: 'custom:ultra-card', layout: { rows: [] } };

function renderClock(module: Partial<ClockModule>, states: Record<string, string>): string {
  const handler = getModuleRegistry().getModule('clock')!;
  const hass = {
    ...mockHass,
    locale: { language: 'en' },
    states: Object.fromEntries(
      Object.entries(states).map(([id, state]) => [id, { entity_id: id, state, attributes: {} }])
    ),
  } as any;
  const full = { ...handler.createDefault('c1'), ...module } as ClockModule;
  const host = document.createElement('div');
  render(html`${handler.renderPreview(full, hass, CONFIG)}`, host);
  const text = (host.textContent || '').replace(/\s+/g, ' ').trim();
  (handler as any).destroy?.();
  return text;
}

describe('Clock module time from an entity', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('clock');
  });

  it('shows the time and date an input_datetime holds', () => {
    const text = renderClock(
      { entity: 'input_datetime.done', time_format: '24', date_style: 'numeric' },
      { 'input_datetime.done': '2026-10-18 21:45:00' }
    );
    expect(text).toContain('21:45');
    expect(text).toContain('10/18/2026');
  });

  it('shows a timestamp sensor in the chosen timezone', () => {
    const text = renderClock(
      { entity: 'sensor.dishwasher_end', time_format: '24', timezone: 'UTC', show_date: false },
      { 'sensor.dishwasher_end': '2026-10-18T19:30:00+00:00' }
    );
    expect(text).toBe('19:30');
  });

  it('shows only the time for a time-only helper', () => {
    const text = renderClock(
      { entity: 'input_datetime.alarm', time_format: '24' },
      { 'input_datetime.alarm': '06:15:00' }
    );
    expect(text).toBe('06:15');
  });

  it('shows only the date for a date-only helper', () => {
    const text = renderClock(
      { entity: 'input_datetime.trip', date_style: 'numeric' },
      { 'input_datetime.trip': '2026-12-24' }
    );
    expect(text).toBe('12/24/2026');
  });

  it('shows a placeholder while the entity is unavailable', () => {
    expect(
      renderClock({ entity: 'sensor.dishwasher_end' }, { 'sensor.dishwasher_end': 'unavailable' })
    ).toBe('--:--');
    expect(renderClock({ entity: 'sensor.missing' }, {})).toBe('--:--');
  });
});
