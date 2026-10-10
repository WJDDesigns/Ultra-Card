import { describe, it, expect } from 'vitest';
import {
  adjustPrice,
  adjustSlots,
  chartRange,
  collectAttributeSlots,
  computeEvNeed,
  computeStats,
  detectPriceFormat,
  findCheapestWindow,
  localDateKey,
  localDayBounds,
  mergeRanges,
  nextTimeOfDay,
  normalizeSlots,
  octopusSiblingIds,
  parseAmberForecasts,
  parseDepartureState,
  parseEnergiDataService,
  parseEntsoe,
  parseGenericSlots,
  parseNordpoolAttributes,
  parseNordpoolCoreResponse,
  parseTibberResponse,
  parseTimeOfDay,
  planCharging,
  powerToKw,
  priceLevel,
  slotAt,
  slotsForDay,
  slotsFromValueArray,
  toDate,
  toNumber,
  upcomingSegments,
  type LevelConfig,
  type PriceSlot,
} from './uc-energy-price-service';

const H = 3600000;
const Q = 15 * 60000;

/** Consecutive slots from an absolute UTC start. Every assertion uses instants, so any TZ works. */
function slots(startIso: string, prices: number[], stepMs = H): PriceSlot[] {
  const t0 = Date.parse(startIso);
  return prices.map((price, i) => ({
    start: new Date(t0 + i * stepMs),
    end: new Date(t0 + (i + 1) * stepMs),
    price,
  }));
}

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

const LEVELS: LevelConfig = {
  mode: 'relative',
  cheapPercent: 33,
  expensivePercent: 67,
  cheapPrice: 0.1,
  expensivePrice: 0.3,
};

describe('coercion', () => {
  it('reads numbers from numbers and numeric strings only', () => {
    expect(toNumber(1.5)).toBe(1.5);
    expect(toNumber(' 0.25 ')).toBe(0.25);
    expect(toNumber('0,25')).toBe(0.25);
    expect(toNumber('')).toBeNull();
    expect(toNumber(null)).toBeNull();
    expect(toNumber('unavailable')).toBeNull();
    expect(toNumber(Number.NaN)).toBeNull();
  });

  it('reads dates from ISO strings (including a space separator), epochs and Dates', () => {
    expect(toDate('2026-03-29T01:00:00+01:00')?.toISOString()).toBe('2026-03-29T00:00:00.000Z');
    expect(toDate('2026-03-29 01:00:00+01:00')?.toISOString()).toBe('2026-03-29T00:00:00.000Z');
    expect(toDate(0)?.getTime()).toBe(0);
    expect(toDate('nope')).toBeNull();
    expect(toDate(undefined)).toBeNull();
  });

  it('parses times of day', () => {
    expect(parseTimeOfDay('07:30')).toEqual({ hours: 7, minutes: 30 });
    expect(parseTimeOfDay('23:59:00')).toEqual({ hours: 23, minutes: 59 });
    expect(parseTimeOfDay('24:00')).toBeNull();
    expect(parseTimeOfDay('')).toBeNull();
  });
});

describe('local day handling (DST-safe in any time zone)', () => {
  it('every day of a year starts at local midnight and lasts 23, 24 or 25 hours', () => {
    const ref = new Date(2026, 0, 1, 12, 0, 0);
    for (let i = 0; i < 366; i++) {
      const day = new Date(ref.getTime());
      day.setDate(day.getDate() + i);
      const { start, end } = localDayBounds(day);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(end.getHours()).toBe(0);
      expect([23 * H, 24 * H, 25 * H]).toContain(end.getTime() - start.getTime());
      expect(localDayBounds(day, 1).start.getTime()).toBe(end.getTime());
      expect(localDateKey(start)).toBe(localDateKey(day));
    }
  });

  it('nextTimeOfDay is always in the future, at the requested wall-clock time', () => {
    const ref = new Date(2026, 2, 20, 6, 0, 0);
    for (let i = 0; i < 20 * 24; i++) {
      const after = new Date(ref.getTime() + i * H);
      const next = nextTimeOfDay('07:15', after)!;
      expect(next.getTime()).toBeGreaterThan(after.getTime());
      expect(next.getTime() - after.getTime()).toBeLessThanOrEqual(25 * H);
      // 07:15 exists on every DST day in every zone that shifts at 01:00–03:00.
      expect(next.getHours()).toBe(7);
      expect(next.getMinutes()).toBe(15);
    }
    expect(nextTimeOfDay('bad', ref)).toBeNull();
  });

  it('spreads a 23-value hourly array over a spring-forward day', () => {
    // Europe/Stockholm, 2026-03-29: local midnight is 23:00Z, the next one 22:00Z (23 h).
    const start = new Date('2026-03-28T23:00:00Z');
    const end = new Date('2026-03-29T22:00:00Z');
    const out = slotsFromValueArray(Array.from({ length: 23 }, (_, i) => i), start, end);
    expect(out).toHaveLength(23);
    for (const s of out) expect(s.end.getTime() - s.start.getTime()).toBe(H);
    expect(out[0].start.getTime()).toBe(start.getTime());
    expect(out[22].end.getTime()).toBe(end.getTime());
  });

  it('spreads 100 quarter-hour values over a fall-back day', () => {
    // 2026-10-25 in Europe/Stockholm is 25 h long: 22:00Z → 23:00Z next day.
    const start = new Date('2026-10-24T22:00:00Z');
    const end = new Date('2026-10-25T23:00:00Z');
    const out = slotsFromValueArray(Array.from({ length: 100 }, () => 0.1), start, end);
    expect(out).toHaveLength(100);
    for (const s of out) expect(s.end.getTime() - s.start.getTime()).toBe(Q);
    // Contiguous with no gaps.
    for (let i = 1; i < out.length; i++) expect(out[i].start.getTime()).toBe(out[i - 1].end.getTime());
  });

  it('skips null entries in a value array without shifting the rest', () => {
    const start = new Date('2026-05-01T00:00:00Z');
    const end = new Date('2026-05-01T04:00:00Z');
    const out = slotsFromValueArray([1, null, 3, 4], start, end);
    expect(out.map(s => s.price)).toEqual([1, 3, 4]);
    expect(out[1].start.toISOString()).toBe('2026-05-01T02:00:00.000Z');
  });
});

describe('normalizeSlots', () => {
  it('sorts, de-duplicates by start and infers missing ends', () => {
    const out = normalizeSlots([
      { start: new Date('2026-05-01T02:00:00Z'), price: 3 },
      { start: new Date('2026-05-01T00:00:00Z'), price: 1 },
      { start: new Date('2026-05-01T01:00:00Z'), price: 2 },
      { start: new Date('2026-05-01T01:00:00Z'), price: 2.5 },
    ]);
    expect(out.map(s => s.price)).toEqual([1, 2.5, 3]);
    expect(out[0].end.toISOString()).toBe('2026-05-01T01:00:00.000Z');
    // Last slot gets the typical spacing.
    expect(out[2].end.toISOString()).toBe('2026-05-01T03:00:00.000Z');
  });

  it('infers 15-minute ends for quarter-hour data', () => {
    const t0 = Date.parse('2026-05-01T00:00:00Z');
    const out = normalizeSlots(
      [0, 1, 2, 3].map(i => ({ start: new Date(t0 + i * Q), price: i }))
    );
    for (const s of out) expect(s.end.getTime() - s.start.getTime()).toBe(Q);
  });

  it('drops invalid prices and dates', () => {
    const out = normalizeSlots([
      { start: new Date('invalid'), price: 1 },
      { start: new Date('2026-05-01T00:00:00Z'), price: Number.NaN },
      { start: new Date('2026-05-01T01:00:00Z'), price: 1 },
    ]);
    expect(out).toHaveLength(1);
  });
});

describe('format detection', () => {
  it('detects each supported integration', () => {
    expect(
      detectPriceFormat('sensor.nordpool_kwh_se3_sek_3_10_025', {
        raw_today: [{ start: '2026-05-01T00:00:00+02:00', end: '2026-05-01T01:00:00+02:00', value: 0.5 }],
        tomorrow_valid: false,
      })
    ).toBe('nordpool');
    expect(detectPriceFormat('sensor.np', { today: [1, 2, 3], tomorrow: [], tomorrow_valid: false })).toBe(
      'nordpool'
    );
    expect(
      detectPriceFormat('sensor.energi_data_service', {
        raw_today: [{ hour: '2026-05-01T00:00:00+02:00', price: 1.2 }],
      })
    ).toBe('energi_data_service');
    expect(
      detectPriceFormat('sensor.average_electricity_price_today', {
        prices_today: [{ time: '2026-05-01T00:00:00+02:00', price: 0.2 }],
      })
    ).toBe('entsoe');
    expect(
      detectPriceFormat('event.octopus_energy_electricity_19m_123_current_day_rates', {
        rates: [{ start: '2026-05-01T00:00:00Z', end: '2026-05-01T00:30:00Z', value_inc_vat: 0.2 }],
      })
    ).toBe('octopus');
    expect(detectPriceFormat('sensor.octopus_energy_electricity_19m_123_current_rate', {})).toBe('octopus');
    expect(detectPriceFormat('sensor.home_general_forecast', { forecasts: [] })).toBe('amber');
    expect(detectPriceFormat('sensor.nord_pool_se3_current_price', {})).toBe('nordpool_core');
    expect(detectPriceFormat('sensor.price', {}, 'nordpool')).toBe('nordpool_core');
    expect(detectPriceFormat('sensor.electricity_price_home', { max_price: 1 }, 'tibber')).toBe('tibber');
    expect(
      detectPriceFormat('sensor.custom', {
        data: [
          { start_time: '2026-05-01T00:00:00Z', price: 1 },
          { start_time: '2026-05-01T01:00:00Z', price: 2 },
        ],
      })
    ).toBe('generic');
    expect(detectPriceFormat('sensor.plain_price', { unit_of_measurement: 'EUR/kWh' })).toBe('none');
    expect(detectPriceFormat('', undefined)).toBe('none');
  });
});

describe('attribute parsers', () => {
  it('Nord Pool custom: raw_today + raw_tomorrow with offsets', () => {
    const out = parseNordpoolAttributes(
      {
        raw_today: [
          { start: '2026-05-01T00:00:00+02:00', end: '2026-05-01T01:00:00+02:00', value: 0.5 },
          { start: '2026-05-01T01:00:00+02:00', end: '2026-05-01T02:00:00+02:00', value: 0.4 },
        ],
        raw_tomorrow: [
          { start: '2026-05-02T00:00:00+02:00', end: '2026-05-02T01:00:00+02:00', value: 0.3 },
        ],
        tomorrow_valid: true,
      },
      new Date('2026-05-01T08:00:00Z')
    );
    expect(out).toHaveLength(3);
    expect(out[0].start.toISOString()).toBe('2026-04-30T22:00:00.000Z');
    expect(out[2].price).toBe(0.3);
  });

  it('Nord Pool custom: ignores tomorrow until it is valid, and null placeholders', () => {
    const attrs = {
      raw_today: [{ start: '2026-05-01T00:00:00+02:00', end: '2026-05-01T01:00:00+02:00', value: 0.5 }],
      raw_tomorrow: [{ start: '2026-05-02T00:00:00+02:00', end: '2026-05-02T01:00:00+02:00', value: null }],
      tomorrow_valid: false,
    };
    expect(parseNordpoolAttributes(attrs, new Date('2026-05-01T08:00:00Z'))).toHaveLength(1);
    expect(
      parseNordpoolAttributes({ ...attrs, tomorrow_valid: true }, new Date('2026-05-01T08:00:00Z'))
    ).toHaveLength(1);
  });

  it('Nord Pool custom: missing tomorrow attributes entirely', () => {
    const out = parseNordpoolAttributes(
      { raw_today: [{ start: '2026-05-01T00:00:00Z', end: '2026-05-01T00:15:00Z', value: 0.1 }] },
      new Date('2026-05-01T00:05:00Z')
    );
    expect(out).toHaveLength(1);
    expect(out[0].end.getTime() - out[0].start.getTime()).toBe(Q);
  });

  it('Nord Pool custom: falls back to the today/tomorrow value arrays', () => {
    const now = new Date(2026, 4, 1, 10, 0, 0);
    const today = localDayBounds(now);
    const hours = Math.round((today.end.getTime() - today.start.getTime()) / H);
    const out = parseNordpoolAttributes(
      { today: Array.from({ length: hours }, (_, i) => i / 10), tomorrow: [], tomorrow_valid: false },
      now
    );
    expect(out).toHaveLength(hours);
    expect(out[0].start.getTime()).toBe(today.start.getTime());
    expect(out[hours - 1].end.getTime()).toBe(today.end.getTime());
    expect(slotAt(out, now)?.price).toBeCloseTo(1.0, 5);
  });

  it('Energi Data Service: {hour, price} entries', () => {
    const out = parseEnergiDataService({
      raw_today: [
        { hour: '2026-05-01T00:00:00+02:00', price: 1.1 },
        { hour: '2026-05-01T01:00:00+02:00', price: 1.2 },
      ],
      raw_tomorrow: [],
      tomorrow_valid: false,
    });
    expect(out.map(s => s.price)).toEqual([1.1, 1.2]);
    expect(out[0].end.toISOString()).toBe(out[1].start.toISOString());
  });

  it('ENTSO-e: prefers `prices`, else prices_today + prices_tomorrow', () => {
    const today = [
      { time: '2026-05-01T00:00:00+02:00', price: 0.2 },
      { time: '2026-05-01T01:00:00+02:00', price: 0.21 },
    ];
    const tomorrow = [{ time: '2026-05-02T00:00:00+02:00', price: 0.19 }];
    expect(parseEntsoe({ prices_today: today, prices_tomorrow: tomorrow })).toHaveLength(3);
    expect(parseEntsoe({ prices: today, prices_today: today })).toHaveLength(2);
    expect(parseEntsoe({})).toEqual([]);
  });

  it('Octopus: reads current and next day-rate events next to a rate sensor', () => {
    const states = {
      'sensor.octopus_energy_electricity_19m_123_current_rate': {
        state: '0.25',
        attributes: { start: '2026-05-01T10:00:00Z', end: '2026-05-01T10:30:00Z', value_inc_vat: 0.25 },
      },
      'event.octopus_energy_electricity_19m_123_current_day_rates': {
        attributes: {
          rates: [
            { start: '2026-05-01T10:00:00Z', end: '2026-05-01T10:30:00Z', value_inc_vat: 0.25, value_exc_vat: 0.2 },
            { start: '2026-05-01T10:30:00Z', end: '2026-05-01T11:00:00Z', value_inc_vat: 0.15 },
          ],
        },
      },
      'event.octopus_energy_electricity_19m_123_next_day_rates': {
        attributes: {
          rates: [{ start: '2026-05-02T00:00:00Z', end: '2026-05-02T00:30:00Z', value_inc_vat: 0.07 }],
        },
      },
    };
    const out = collectAttributeSlots(
      'octopus',
      'sensor.octopus_energy_electricity_19m_123_current_rate',
      states,
      new Date('2026-05-01T10:10:00Z')
    );
    expect(out.map(s => s.price)).toEqual([0.25, 0.15, 0.07]);
    expect(out[0].end.getTime() - out[0].start.getTime()).toBe(30 * 60000);
  });

  it('Octopus sibling ids', () => {
    expect(octopusSiblingIds('event.octopus_energy_electricity_19m_123_next_day_rates')).toEqual({
      current: 'event.octopus_energy_electricity_19m_123_current_day_rates',
      next: 'event.octopus_energy_electricity_19m_123_next_day_rates',
    });
    expect(octopusSiblingIds('sensor.something_else')).toBeNull();
  });

  it('Amber: forecasts with start_time/end_time/per_kwh', () => {
    const out = parseAmberForecasts({
      forecasts: [
        { start_time: '2026-05-01T00:00:01Z', end_time: '2026-05-01T00:30:00Z', per_kwh: 0.3, spot_per_kwh: 0.1 },
        { start_time: '2026-05-01T00:30:01Z', end_time: '2026-05-01T01:00:00Z', per_kwh: 0.2 },
      ],
    });
    expect(out.map(s => s.price)).toEqual([0.3, 0.2]);
  });

  it('generic: picks the longest parseable list attribute', () => {
    const out = collectAttributeSlots(
      'generic',
      'sensor.custom',
      {
        'sensor.custom': {
          attributes: {
            short: [{ start: '2026-05-01T00:00:00Z', price: 1 }],
            data: [
              { from: '2026-05-01T00:00:00Z', till: '2026-05-01T01:00:00Z', total: 1 },
              { from: '2026-05-01T01:00:00Z', till: '2026-05-01T02:00:00Z', total: 2 },
            ],
          },
        },
      },
      new Date('2026-05-01T00:00:00Z')
    );
    expect(out.map(s => s.price)).toEqual([1, 2]);
  });

  it('generic parser ignores junk', () => {
    expect(parseGenericSlots('nope')).toEqual([]);
    expect(parseGenericSlots([1, 'x', null, { start: 'bad', price: 1 }, { start: '2026-05-01T00:00:00Z' }])).toEqual(
      []
    );
  });

  it('collectAttributeSlots returns nothing for service-backed or unknown formats', () => {
    expect(collectAttributeSlots('nordpool_core', 'sensor.x', {}, new Date())).toEqual([]);
    expect(collectAttributeSlots('none', 'sensor.x', {}, new Date())).toEqual([]);
  });
});

describe('service responses', () => {
  it('core Nord Pool: unwraps the response, picks the area from the entity id and converts MWh to kWh', () => {
    const response = {
      context: { id: 'x' },
      response: {
        SE3: [{ start: '2026-05-01T22:00:00+00:00', end: '2026-05-01T22:15:00+00:00', price: 500 }],
        SE4: [
          { start: '2026-05-01T22:00:00+00:00', end: '2026-05-01T22:15:00+00:00', price: 1234.5 },
          { start: '2026-05-01T22:15:00+00:00', end: '2026-05-01T22:30:00+00:00', price: 1000 },
        ],
      },
    };
    const out = parseNordpoolCoreResponse(response, 'sensor.nord_pool_se4_current_price');
    expect(out).toHaveLength(2);
    expect(out[0].price).toBeCloseTo(1.2345, 6);
    expect(parseNordpoolCoreResponse(response)[0].price).toBeCloseTo(0.5, 6);
    expect(parseNordpoolCoreResponse(response, 'sensor.unknown', false)[0].price).toBe(500);
    expect(parseNordpoolCoreResponse(null)).toEqual([]);
  });

  it('Tibber: picks the home by name and infers 15-minute ends from start_time', () => {
    const t0 = Date.parse('2026-05-01T00:00:00Z');
    const response = {
      response: {
        prices: {
          Cabin: [{ start_time: iso(t0), price: 9 }],
          'Main street 1': [0, 1, 2, 3].map(i => ({ start_time: iso(t0 + i * Q), price: 0.1 * i })),
        },
      },
    };
    const out = parseTibberResponse(response, 'Electricity price Main street 1');
    expect(out).toHaveLength(4);
    expect(out[3].end.getTime() - out[3].start.getTime()).toBe(Q);
    expect(parseTibberResponse(response)[0].price).toBe(9);
  });
});

describe('prices, stats and levels', () => {
  it('adjusts by multiplier then additive', () => {
    expect(adjustPrice(0.2, 1.25, 0.05)).toBeCloseTo(0.3, 10);
    expect(adjustPrice(0.2, Number.NaN, Number.NaN)).toBe(0.2);
    const base = slots('2026-05-01T00:00:00Z', [1, 2]);
    expect(adjustSlots(base)).toBe(base);
    expect(adjustSlots(base, 2, 1).map(s => s.price)).toEqual([3, 5]);
  });

  it('computes a time-weighted average across mixed slot lengths', () => {
    const mixed: PriceSlot[] = [
      ...slots('2026-05-01T00:00:00Z', [1], H),
      ...slots('2026-05-01T01:00:00Z', [4], Q),
    ];
    const st = computeStats(mixed)!;
    expect(st.min).toBe(1);
    expect(st.max).toBe(4);
    expect(st.avg).toBeCloseTo((1 * 60 + 4 * 15) / 75, 10);
    expect(computeStats([])).toBeNull();
  });

  it('relative levels use the day range', () => {
    const refs = [0, 10];
    expect(priceLevel(2, refs, LEVELS)).toBe('cheap');
    expect(priceLevel(5, refs, LEVELS)).toBe('normal');
    expect(priceLevel(9, refs, LEVELS)).toBe('expensive');
    expect(priceLevel(5, [5, 5], LEVELS)).toBe('normal');
    expect(priceLevel(5, [], LEVELS)).toBe('normal');
  });

  it('percentile levels rank against the day', () => {
    const refs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const cfg: LevelConfig = { ...LEVELS, mode: 'percentile', cheapPercent: 30, expensivePercent: 70 };
    expect(priceLevel(3, refs, cfg)).toBe('cheap');
    expect(priceLevel(7, refs, cfg)).toBe('normal');
    expect(priceLevel(8, refs, cfg)).toBe('expensive');
  });

  it('absolute levels compare against fixed prices', () => {
    const cfg: LevelConfig = { ...LEVELS, mode: 'absolute' };
    expect(priceLevel(0.05, [], cfg)).toBe('cheap');
    expect(priceLevel(0.2, [], cfg)).toBe('normal');
    expect(priceLevel(0.3, [], cfg)).toBe('expensive');
    expect(priceLevel(-0.1, [], cfg)).toBe('cheap');
  });

  it('finds slots by instant and by local day', () => {
    const now = new Date(2026, 4, 1, 12, 30);
    const day = localDayBounds(now);
    const today = slotsFromValueArray([1, 2, 3, 4], day.start, day.end);
    expect(slotAt(today, now)?.price).toBe(3);
    expect(slotAt(today, day.end)).toBeNull();
    expect(slotsForDay(today, now)).toHaveLength(4);
    expect(slotsForDay(today, now, 1)).toHaveLength(0);
  });
});

describe('cheapest window', () => {
  const day = slots('2026-05-01T00:00:00Z', [5, 4, 1, 1, 1, 6, 7, 2, 2, 9]);

  it('finds the cheapest contiguous run', () => {
    const win = findCheapestWindow(day, new Date('2026-05-01T00:00:00Z'), 3)!;
    expect(win.start.toISOString()).toBe('2026-05-01T02:00:00.000Z');
    expect(win.end.toISOString()).toBe('2026-05-01T05:00:00.000Z');
    expect(win.avgPrice).toBeCloseTo(1, 10);
    expect(win.parts).toHaveLength(3);
  });

  it('never starts in the past and can start "now" inside the current slot', () => {
    const now = new Date('2026-05-01T02:30:00Z');
    const win = findCheapestWindow(day, now, 2)!;
    expect(win.start.toISOString()).toBe('2026-05-01T02:30:00.000Z');
    expect(win.avgPrice).toBeCloseTo(1, 10);
  });

  it('weights a partial last slot by the time used', () => {
    const win = findCheapestWindow(day, new Date('2026-05-01T07:00:00Z'), 1.5)!;
    // 07:00 → 08:30 at 2 is the only 1.5 h run that cheap.
    expect(win.start.toISOString()).toBe('2026-05-01T07:00:00.000Z');
    expect(win.end.toISOString()).toBe('2026-05-01T08:30:00.000Z');
    expect(win.avgPrice).toBeCloseTo(2, 10);
  });

  it('respects a latest-finish deadline', () => {
    const win = findCheapestWindow(day, new Date('2026-05-01T00:00:00Z'), 2, new Date('2026-05-01T03:00:00Z'))!;
    expect(win.end.getTime()).toBeLessThanOrEqual(Date.parse('2026-05-01T03:00:00Z'));
    expect(win.start.toISOString()).toBe('2026-05-01T01:00:00.000Z');
    expect(
      findCheapestWindow(day, new Date('2026-05-01T00:00:00Z'), 4, new Date('2026-05-01T03:00:00Z'))
    ).toBeNull();
  });

  it('works on 15-minute slots', () => {
    const prices = Array.from({ length: 96 }, (_, i) => (i >= 40 && i < 44 ? 0.01 : 0.5 + (i % 3) * 0.1));
    const quarter = slots('2026-05-01T00:00:00Z', prices, Q);
    const win = findCheapestWindow(quarter, new Date('2026-05-01T00:00:00Z'), 1)!;
    expect(win.start.toISOString()).toBe('2026-05-01T10:00:00.000Z');
    expect(win.parts).toHaveLength(4);
    expect(win.avgPrice).toBeCloseTo(0.01, 10);
  });

  it('does not bridge gaps in the data', () => {
    const gappy = [
      ...slots('2026-05-01T00:00:00Z', [1, 1]),
      ...slots('2026-05-01T05:00:00Z', [1, 1]),
    ];
    expect(findCheapestWindow(gappy, new Date('2026-05-01T00:00:00Z'), 3)).toBeNull();
    expect(findCheapestWindow(gappy, new Date('2026-05-01T00:00:00Z'), 2)).not.toBeNull();
  });

  it('returns null for nothing to plan', () => {
    expect(findCheapestWindow([], new Date(), 3)).toBeNull();
    expect(findCheapestWindow(day, new Date('2026-05-01T00:00:00Z'), 0)).toBeNull();
    expect(findCheapestWindow(day, new Date('2026-05-02T00:00:00Z'), 1)).toBeNull();
  });

  it('upcomingSegments clips the current slot and drops past ones', () => {
    const segs = upcomingSegments(day, new Date('2026-05-01T08:20:00Z'));
    expect(segs).toHaveLength(2);
    expect(segs[0].start.toISOString()).toBe('2026-05-01T08:20:00.000Z');
  });
});

describe('EV charging plan', () => {
  it('computes grid energy and charging time', () => {
    const need = computeEvNeed({
      currentSoc: 40,
      targetSoc: 80,
      capacityKwh: 60,
      efficiencyPercent: 90,
      powerKw: 11,
    });
    expect(need.kwhNeeded).toBeCloseTo(24 / 0.9, 6);
    expect(need.hoursNeeded).toBeCloseTo(24 / 0.9 / 11, 6);
    expect(
      computeEvNeed({ currentSoc: 90, targetSoc: 80, capacityKwh: 60, efficiencyPercent: 90, powerKw: 11 })
        .kwhNeeded
    ).toBe(0);
    expect(
      computeEvNeed({ currentSoc: 10, targetSoc: 20, capacityKwh: 50, efficiencyPercent: 100, powerKw: 0 })
        .hoursNeeded
    ).toBe(0);
  });

  const night = slots('2026-05-01T18:00:00Z', [3, 3, 2, 1, 1.5, 4, 0.5, 2, 3, 3, 3, 3, 3]);
  const now = new Date('2026-05-01T18:00:00Z');
  const departure = new Date('2026-05-02T06:00:00Z');

  it('split mode picks the cheapest slots before departure, partial last slot', () => {
    const plan = planCharging(night, now, departure, 2.5, 10, true);
    expect(plan.feasible).toBe(true);
    // Cheapest: 0.5 (00:00), 1 (21:00), then half of 1.5 (22:00).
    expect(plan.segments.map(s => s.price)).toEqual([1, 1.5, 0.5]);
    expect(plan.hoursPlanned).toBeCloseTo(2.5, 10);
    expect(plan.kwh).toBeCloseTo(25, 10);
    expect(plan.cost).toBeCloseTo(10 * 1 + 5 * 1.5 + 10 * 0.5, 10);
    expect(plan.ranges).toHaveLength(2);
    expect(plan.ranges[0].start.toISOString()).toBe('2026-05-01T21:00:00.000Z');
    expect(plan.ranges[0].end.toISOString()).toBe('2026-05-01T22:30:00.000Z');
    expect(plan.shortfallHours).toBe(0);
  });

  it('contiguous mode uses one unbroken run', () => {
    const plan = planCharging(night, now, departure, 2, 10, false);
    expect(plan.feasible).toBe(true);
    expect(plan.ranges).toHaveLength(1);
    expect(plan.ranges[0].start.toISOString()).toBe('2026-05-01T21:00:00.000Z');
    expect(plan.cost).toBeCloseTo(10 * 1 + 10 * 1.5, 10);
  });

  it('reports a shortfall when there is not enough time before departure', () => {
    const plan = planCharging(night, now, new Date('2026-05-01T20:00:00Z'), 3, 10, true);
    expect(plan.feasible).toBe(false);
    expect(plan.hoursPlanned).toBeCloseTo(2, 10);
    expect(plan.shortfallHours).toBeCloseTo(1, 10);
  });

  it('reports a shortfall when tomorrow is not published yet', () => {
    const plan = planCharging(night.slice(0, 3), now, departure, 5, 10, true);
    expect(plan.feasible).toBe(false);
    expect(plan.shortfallHours).toBeCloseTo(2, 10);
  });

  it('clips the slot that straddles departure', () => {
    const plan = planCharging(night, now, new Date('2026-05-01T21:30:00Z'), 3.5, 10, true);
    expect(plan.hoursPlanned).toBeCloseTo(3.5, 10);
    const last = plan.segments[plan.segments.length - 1];
    expect(last.end.toISOString()).toBe('2026-05-01T21:30:00.000Z');
  });

  it('plans nothing when already at target', () => {
    const plan = planCharging(night, now, departure, 0, 10, true);
    expect(plan.feasible).toBe(true);
    expect(plan.segments).toEqual([]);
    expect(plan.cost).toBe(0);
  });

  it('merges touching ranges', () => {
    const r = mergeRanges([
      { start: new Date('2026-05-01T02:00:00Z'), end: new Date('2026-05-01T03:00:00Z') },
      { start: new Date('2026-05-01T00:00:00Z'), end: new Date('2026-05-01T01:00:00Z') },
      { start: new Date('2026-05-01T01:00:00Z'), end: new Date('2026-05-01T01:30:00Z') },
    ]);
    expect(r).toHaveLength(2);
    expect(r[0].end.toISOString()).toBe('2026-05-01T01:30:00.000Z');
  });

  it('parses departure from time-only and timestamp states', () => {
    const at = new Date(2026, 4, 1, 22, 0, 0);
    const t = parseDepartureState('07:00:00', at)!;
    expect(t.getHours()).toBe(7);
    expect(t.getTime()).toBeGreaterThan(at.getTime());
    const future = new Date(at.getTime() + 5 * H);
    expect(parseDepartureState(future.toISOString(), at)?.getTime()).toBe(future.getTime());
    expect(parseDepartureState(new Date(at.getTime() - H).toISOString(), at)).toBeNull();
    expect(parseDepartureState('unknown', at)).toBeNull();
    expect(parseDepartureState(undefined, at)).toBeNull();
  });

  it('converts charger power to kW', () => {
    expect(powerToKw(7400, 'W')).toBeCloseTo(7.4, 10);
    expect(powerToKw(11, 'kW')).toBe(11);
    expect(powerToKw(3600, undefined)).toBeCloseTo(3.6, 10);
    expect(powerToKw(7.2, '')).toBe(7.2);
  });
});

describe('chart range', () => {
  it('shows today only until tomorrow is published', () => {
    const now = new Date(2026, 4, 1, 10, 0, 0);
    const today = localDayBounds(now);
    const tomorrow = localDayBounds(now, 1);
    const onlyToday = slotsFromValueArray([1, 2, 3, 4], today.start, today.end);
    expect(chartRange(onlyToday, now, 0, true)).toEqual(today);
    const both = [...onlyToday, ...slotsFromValueArray([1, 2], tomorrow.start, tomorrow.end)];
    expect(chartRange(both, now, 0, true).end.getTime()).toBe(tomorrow.end.getTime());
    expect(chartRange(both, now, 0, false).end.getTime()).toBe(today.end.getTime());
  });

  it('a fixed number of hours starts at the current hour', () => {
    const now = new Date(2026, 4, 1, 10, 42, 0);
    const r = chartRange([], now, 12, true);
    expect(r.start.getMinutes()).toBe(0);
    expect(r.end.getTime() - r.start.getTime()).toBe(12 * H);
  });
});
