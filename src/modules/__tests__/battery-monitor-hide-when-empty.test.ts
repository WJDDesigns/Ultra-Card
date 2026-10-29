/** @vitest-environment jsdom */
import { describe, it, expect, beforeAll } from 'vitest';
import { getModuleRegistry } from '../module-registry';

const hassWith = (states: Record<string, unknown>) =>
  ({ states, locale: { language: 'en' } }) as any;

const battery = (level: number) => ({
  state: String(level),
  attributes: { device_class: 'battery', unit_of_measurement: '%' },
});

describe('battery monitor isEmpty (hide when empty)', () => {
  beforeAll(async () => {
    await getModuleRegistry().ensureModuleLoaded('battery_monitor');
  });

  it('reports empty when only-low is on and every battery is above the threshold', () => {
    const handler = getModuleRegistry().getModule('battery_monitor')!;
    const module = {
      ...handler.createDefault('bm-1'),
      show_only_below_threshold: true,
      hide_when_empty: true,
    };
    const hass = hassWith({ 'sensor.phone_battery': battery(80) });
    expect(handler.isEmpty?.(module as any, hass)).toBe(true);
  });

  it('is not empty once a battery drops below the threshold', () => {
    const handler = getModuleRegistry().getModule('battery_monitor')!;
    const module = {
      ...handler.createDefault('bm-2'),
      show_only_below_threshold: true,
      hide_when_empty: true,
    };
    const hass = hassWith({
      'sensor.phone_battery': battery(80),
      'sensor.remote_battery': battery(12),
    });
    expect(handler.isEmpty?.(module as any, hass)).toBe(false);
  });

  it('never reports empty before Home Assistant states arrive', () => {
    const handler = getModuleRegistry().getModule('battery_monitor')!;
    const module = handler.createDefault('bm-3');
    expect(handler.isEmpty?.(module as any, {} as any)).toBe(false);
  });
});
