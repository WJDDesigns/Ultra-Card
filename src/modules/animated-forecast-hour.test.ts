import { describe, it, expect } from 'vitest';
import { formatForecastHour } from './animated-forecast-module';

describe('formatForecastHour', () => {
  const date = new Date(2026, 9, 26, 14);

  it('keeps the language style by default', () => {
    expect(formatForecastHour(date, 'de', false)).toContain('Uhr');
  });

  it('drops words like "Uhr" when number only is on', () => {
    expect(formatForecastHour(date, 'de', true)).toBe('14');
  });

  it('keeps AM/PM for 12-hour languages', () => {
    expect(formatForecastHour(date, 'en-US', true)).toBe('2 PM');
  });
});
