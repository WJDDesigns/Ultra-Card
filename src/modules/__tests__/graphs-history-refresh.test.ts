/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UltraGraphsModule } from '../graphs-module';

/**
 * Cover for #154: history was fetched once per session, so long-lived
 * dashboards kept showing the window from first page load.
 */

function makeHass() {
  return {
    locale: { language: 'en' },
    states: {
      'sensor.temp': {
        entity_id: 'sensor.temp',
        state: '21',
        attributes: { friendly_name: 'Temp', unit_of_measurement: '°C' },
        last_changed: new Date().toISOString(),
      },
    },
  } as any;
}

function makeModule(overrides: Record<string, unknown> = {}) {
  return {
    id: 'g1',
    type: 'graphs',
    data_source: 'history',
    chart_type: 'line',
    time_period: '24h',
    entities: [{ id: 'e1', entity: 'sensor.temp' }],
    ...overrides,
  } as any;
}

function setup(module: any) {
  const graphs = new UltraGraphsModule() as any;
  const fetchSpy = vi
    .spyOn(graphs, '_fetchHistoryDataAsync')
    .mockImplementation(async (m: any) => {
      graphs._historyFetchStartedAt[m.id] = Date.now();
      graphs._historyLoading[m.id] = false;
    });
  return { graphs, fetchSpy, load: () => graphs._loadHistoryData(module, makeHass()) };
}

describe('graphs module history refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T12:00:00Z'));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not refetch while history is fresh', () => {
    const { fetchSpy, load } = setup(makeModule());
    load();
    vi.advanceTimersByTime(60 * 1000);
    load();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('refetches once history is older than the max age for the period', () => {
    const { fetchSpy, load } = setup(makeModule());
    load();
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    load();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('uses a shorter max age for short periods', () => {
    const { fetchSpy, load } = setup(makeModule({ time_period: '1h' }));
    load();
    vi.advanceTimersByTime(61 * 1000);
    load();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('does not start a second fetch while one is in flight', () => {
    const { graphs, fetchSpy, load } = setup(makeModule());
    fetchSpy.mockImplementation(async (m: any) => {
      graphs._historyFetchStartedAt[m.id] = Date.now();
    });
    load();
    vi.advanceTimersByTime(10 * 60 * 1000);
    load();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('refetches stale forecast data', () => {
    const graphs = new UltraGraphsModule() as any;
    const fetchSpy = vi
      .spyOn(graphs, '_fetchForecastDataAsync')
      .mockImplementation(async (m: any) => {
        graphs._historyFetchStartedAt[m.id] = Date.now();
        graphs._historyLoading[m.id] = false;
      });
    const module = makeModule({ data_source: 'forecast', forecast_entity: 'weather.home' });
    graphs._loadHistoryData(module, makeHass());
    vi.advanceTimersByTime(30 * 60 * 1000 + 1);
    graphs._loadHistoryData(module, makeHass());
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
