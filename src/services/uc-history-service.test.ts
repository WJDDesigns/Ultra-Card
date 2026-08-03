import { describe, it, expect } from 'vitest';
import {
  parseHistoryItem,
  toNumericSeries,
  timeWeightedAverage,
  timeWeightedPercentile,
  linearSlopePerMs,
  estimateDischarge,
  detectRuns,
  latestValue,
  numericState,
  type NumericPoint,
} from './uc-history-service';

const HOUR = 3600000;
const MINUTE = 60000;

/** Builds an evenly-spaced series starting at t=0. */
function series(values: number[], stepMs = HOUR): NumericPoint[] {
  return values.map((v, i) => ({ t: i * stepMs, v }));
}

describe('parseHistoryItem', () => {
  it('parses the compressed WebSocket shape', () => {
    const point = parseHistoryItem({ s: '42.5', lu: 1700000000, a: { unit: 'W' } });
    expect(point).toEqual({
      t: 1700000000000,
      state: '42.5',
      attributes: { unit: 'W' },
    });
  });

  it('parses the REST shape', () => {
    const point = parseHistoryItem({
      state: '17',
      last_changed: '2026-08-01T12:00:00.000Z',
      attributes: { battery_level: 80 },
    });
    expect(point?.t).toBe(Date.parse('2026-08-01T12:00:00.000Z'));
    expect(point?.state).toBe('17');
  });

  it('rejects malformed items', () => {
    expect(parseHistoryItem(null)).toBeNull();
    expect(parseHistoryItem('nope')).toBeNull();
    expect(parseHistoryItem({})).toBeNull();
    expect(parseHistoryItem({ s: '1', lu: 'not-a-number' })).toBeNull();
  });
});

describe('toNumericSeries', () => {
  it('drops unavailable and non-numeric samples', () => {
    const result = toNumericSeries([
      { t: 0, state: '10' },
      { t: 1, state: 'unavailable' },
      { t: 2, state: 'unknown' },
      { t: 3, state: '' },
      { t: 4, state: 'banana' },
      { t: 5, state: '20' },
    ]);
    expect(result).toEqual([
      { t: 0, v: 10 },
      { t: 5, v: 20 },
    ]);
  });

  it('reads a named attribute instead of the state', () => {
    const result = toNumericSeries(
      [
        { t: 0, state: 'docked', attributes: { battery_level: 55 } },
        { t: 1, state: 'cleaning', attributes: { battery_level: 50 } },
        { t: 2, state: 'cleaning', attributes: {} },
      ],
      { attribute: 'battery_level' }
    );
    expect(result).toEqual([
      { t: 0, v: 55 },
      { t: 1, v: 50 },
    ]);
  });

  it('returns an empty array for missing input', () => {
    expect(toNumericSeries(undefined)).toEqual([]);
    expect(toNumericSeries([])).toEqual([]);
  });
});

describe('timeWeightedAverage', () => {
  it('weights each sample by how long it was held', () => {
    // 2000 W held for 1 minute, then 10 W held for 59 minutes.
    const points: NumericPoint[] = [
      { t: 0, v: 2000 },
      { t: MINUTE, v: 10 },
    ];
    const avg = timeWeightedAverage(points, 0, 60 * MINUTE);
    // A plain mean would be 1005; time-weighting must land near 43.
    expect(avg).toBeCloseTo((2000 * 1 + 10 * 59) / 60, 5);
    expect(avg!).toBeLessThan(100);
  });

  it('handles single-sample and empty series', () => {
    expect(timeWeightedAverage([])).toBeNull();
    expect(timeWeightedAverage([{ t: 0, v: 7 }])).toBe(7);
  });
});

describe('timeWeightedPercentile', () => {
  it('finds the standby floor beneath brief active bursts', () => {
    // 3 W for 9 hours, 500 W for 1 hour.
    const points: NumericPoint[] = [
      { t: 0, v: 3 },
      { t: 9 * HOUR, v: 500 },
    ];
    expect(timeWeightedPercentile(points, 0.1, 0, 10 * HOUR)).toBe(3);
    expect(timeWeightedPercentile(points, 0.95, 0, 10 * HOUR)).toBe(500);
  });

  it('is not fooled by many short high samples', () => {
    // One long idle stretch, then ten rapid spikes.
    const points: NumericPoint[] = [{ t: 0, v: 2 }];
    for (let i = 0; i < 10; i++) {
      points.push({ t: 8 * HOUR + i * MINUTE, v: 300 });
    }
    const floor = timeWeightedPercentile(points, 0.1, 0, 8 * HOUR + 10 * MINUTE);
    expect(floor).toBe(2);
  });

  it('clamps out-of-range percentiles', () => {
    const points = series([1, 2, 3]);
    expect(timeWeightedPercentile(points, -5, 0, 3 * HOUR)).toBe(1);
    expect(timeWeightedPercentile(points, 5, 0, 3 * HOUR)).toBe(3);
  });

  it('gives the trailing sample no weight until the window end is supplied', () => {
    // Without endMs the last sample spans zero time, so it cannot be the answer.
    // Callers pass the query window (usually `now`) to give it real duration.
    const points = series([1, 2, 3]);
    expect(timeWeightedPercentile(points, 1)).toBe(2);
    expect(timeWeightedPercentile(points, 1, 0, 3 * HOUR)).toBe(3);
  });
});

describe('linearSlopePerMs', () => {
  it('measures a steady rise', () => {
    const slope = linearSlopePerMs(series([0, 10, 20, 30]));
    expect(slope).toBeCloseTo(10 / HOUR, 12);
  });

  it('returns null when undetermined', () => {
    expect(linearSlopePerMs([])).toBeNull();
    expect(linearSlopePerMs([{ t: 0, v: 1 }])).toBeNull();
  });
});

describe('estimateDischarge', () => {
  it('computes a drain rate and time to empty', () => {
    // 100% → 76% over 24 hours = 1%/hour.
    const points: NumericPoint[] = [];
    for (let h = 0; h <= 24; h++) points.push({ t: h * HOUR, v: 100 - h });
    const est = estimateDischarge(points, { floor: 0 });
    expect(est).not.toBeNull();
    expect(est!.ratePerHour).toBeCloseTo(1, 6);
    expect(est!.msToEmpty).toBeCloseTo(76 * HOUR, 0);
    expect(est!.charging).toBe(false);
    expect(est!.coverage).toBeCloseTo(1, 6);
  });

  it('ignores recharge segments when measuring the drain rate', () => {
    // Drain 100→90 over 10h, charge back to 100, then drain 100→90 again.
    const points: NumericPoint[] = [];
    for (let h = 0; h <= 10; h++) points.push({ t: h * HOUR, v: 100 - h });
    points.push({ t: 11 * HOUR, v: 100 });
    for (let h = 1; h <= 10; h++) points.push({ t: (11 + h) * HOUR, v: 100 - h });

    const est = estimateDischarge(points, { floor: 0 });
    // Both falling segments run at 1%/hour; the recharge must not flatten it.
    expect(est!.ratePerHour).toBeCloseTo(1, 6);
  });

  it('reports charging when the latest sample rises', () => {
    const points: NumericPoint[] = [
      { t: 0, v: 50 },
      { t: HOUR, v: 48 },
      { t: 2 * HOUR, v: 47 },
      { t: 3 * HOUR, v: 70 },
    ];
    expect(estimateDischarge(points)!.charging).toBe(true);
  });

  it('respects the replacement floor', () => {
    const points: NumericPoint[] = [];
    for (let h = 0; h <= 10; h++) points.push({ t: h * HOUR, v: 50 - h });
    // At 40% now, draining 1%/h, a floor of 20% is 20 hours away.
    const est = estimateDischarge(points, { floor: 20 });
    expect(est!.msToEmpty).toBeCloseTo(20 * HOUR, 0);
  });

  it('returns no ETA for a flat battery reading', () => {
    const est = estimateDischarge(series([80, 80, 80, 80, 80]));
    expect(est!.ratePerHour).toBe(0);
    expect(est!.msToEmpty).toBeNull();
  });

  it('returns null when there is too little data', () => {
    expect(estimateDischarge([{ t: 0, v: 100 }])).toBeNull();
    expect(estimateDischarge([])).toBeNull();
  });
});

describe('detectRuns', () => {
  const opts = {
    startThreshold: 20,
    stopThreshold: 5,
    settleMs: 5 * MINUTE,
    minDurationMs: 15 * MINUTE,
  };

  it('detects a single wash cycle', () => {
    const points: NumericPoint[] = [
      { t: 0, v: 1 },
      { t: 10 * MINUTE, v: 400 },
      { t: 40 * MINUTE, v: 350 },
      { t: 70 * MINUTE, v: 1 },
      { t: 90 * MINUTE, v: 1 },
    ];
    const runs = detectRuns(points, { ...opts, endMs: 120 * MINUTE });
    expect(runs).toHaveLength(1);
    expect(runs[0]!.startMs).toBe(10 * MINUTE);
    expect(runs[0]!.peak).toBe(400);
    expect(runs[0]!.durationMs).toBeGreaterThan(50 * MINUTE);
  });

  it('does not split a cycle at a mid-cycle soak', () => {
    // Washer drops to 2 W for 4 minutes mid-cycle, under the 5-minute settle window.
    const points: NumericPoint[] = [
      { t: 0, v: 1 },
      { t: 10 * MINUTE, v: 400 },
      { t: 30 * MINUTE, v: 2 },
      { t: 34 * MINUTE, v: 380 },
      { t: 60 * MINUTE, v: 1 },
      { t: 80 * MINUTE, v: 1 },
    ];
    const runs = detectRuns(points, { ...opts, endMs: 120 * MINUTE });
    expect(runs).toHaveLength(1);
  });

  it('splits genuinely separate cycles', () => {
    const points: NumericPoint[] = [
      { t: 0, v: 1 },
      { t: 10 * MINUTE, v: 400 },
      { t: 50 * MINUTE, v: 1 },
      { t: 120 * MINUTE, v: 1 },
      { t: 130 * MINUTE, v: 500 },
      { t: 180 * MINUTE, v: 1 },
      { t: 220 * MINUTE, v: 1 },
    ];
    const runs = detectRuns(points, { ...opts, endMs: 240 * MINUTE });
    expect(runs).toHaveLength(2);
  });

  it('discards runs shorter than the minimum duration', () => {
    const points: NumericPoint[] = [
      { t: 0, v: 1 },
      { t: 10 * MINUTE, v: 400 },
      { t: 12 * MINUTE, v: 1 },
      { t: 40 * MINUTE, v: 1 },
    ];
    expect(detectRuns(points, { ...opts, endMs: 60 * MINUTE })).toEqual([]);
  });

  it('closes an in-progress run at the window end', () => {
    const points: NumericPoint[] = [
      { t: 0, v: 1 },
      { t: 10 * MINUTE, v: 400 },
    ];
    const runs = detectRuns(points, { ...opts, endMs: 60 * MINUTE });
    expect(runs).toHaveLength(1);
    expect(runs[0]!.endMs).toBe(60 * MINUTE);
  });

  it('reports watt-hours as areaHours', () => {
    // 1000 W held for exactly one hour = 1000 Wh.
    const points: NumericPoint[] = [
      { t: 0, v: 1000 },
      { t: HOUR, v: 0 },
    ];
    const runs = detectRuns(points, {
      startThreshold: 20,
      stopThreshold: 5,
      settleMs: 0,
      minDurationMs: 0,
      endMs: HOUR,
    });
    expect(runs[0]!.areaHours).toBeCloseTo(1000, 6);
  });

  it('returns nothing for a series that never crosses the threshold', () => {
    expect(detectRuns(series([1, 2, 1, 2]), opts)).toEqual([]);
  });

  /**
   * The recorder is step-shaped: an idle sensor emits one sample and then holds
   * it for hours. The settle window therefore has to be measured against the
   * *next* sample's timestamp, not against a second below-threshold sample that
   * real data never sends.
   */
  it('splits separate cycles when the idle gap is a single held sample', () => {
    const points: NumericPoint[] = [
      { t: 0, v: 400 },
      { t: 40 * MINUTE, v: 2 },
      // Two days of silence, then the next wash. No second low sample arrives.
      { t: 40 * MINUTE + 48 * HOUR, v: 500 },
      { t: 40 * MINUTE + 49 * HOUR, v: 2 },
    ];
    const runs = detectRuns(points, { ...opts, endMs: 40 * MINUTE + 50 * HOUR });
    expect(runs).toHaveLength(2);
    expect(runs[0]!.endMs).toBe(40 * MINUTE);
    expect(runs[0]!.durationMs).toBe(40 * MINUTE);
    expect(runs[1]!.startMs).toBe(40 * MINUTE + 48 * HOUR);
  });

  it('excludes the settled tail from the run integral', () => {
    // 1000 W for an hour, then 0 W held for an hour. The run is one hour long
    // and 1000 Wh; the idle tail must not dilute the mean.
    const points: NumericPoint[] = [
      { t: 0, v: 1000 },
      { t: HOUR, v: 0 },
    ];
    const runs = detectRuns(points, {
      ...opts,
      settleMs: 5 * MINUTE,
      minDurationMs: 0,
      endMs: 2 * HOUR,
    });
    expect(runs).toHaveLength(1);
    expect(runs[0]!.endMs).toBe(HOUR);
    expect(runs[0]!.areaHours).toBeCloseTo(1000, 6);
    expect(runs[0]!.mean).toBeCloseTo(1000, 6);
  });
});

describe('latestValue', () => {
  it('returns the last sample', () => {
    expect(latestValue(series([1, 2, 3]))).toBe(3);
    expect(latestValue([])).toBeNull();
  });
});

describe('numericState', () => {
  const hass = {
    states: {
      'sensor.power': { state: '42.5', attributes: { unit_of_measurement: 'W' } },
      'sensor.dead': { state: 'unavailable', attributes: {} },
      'vacuum.robot': { state: 'docked', attributes: { battery_level: 88 } },
    },
  } as any;

  it('reads numeric states and attributes', () => {
    expect(numericState(hass, 'sensor.power')).toBe(42.5);
    expect(numericState(hass, 'vacuum.robot', 'battery_level')).toBe(88);
  });

  it('returns null for unavailable, missing or non-numeric values', () => {
    expect(numericState(hass, 'sensor.dead')).toBeNull();
    expect(numericState(hass, 'sensor.nope')).toBeNull();
    expect(numericState(hass, 'vacuum.robot')).toBeNull();
    expect(numericState(undefined, 'sensor.power')).toBeNull();
    expect(numericState(hass, undefined)).toBeNull();
  });
});
