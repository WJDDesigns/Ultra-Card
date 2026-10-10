/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { clockUpdateService } from './clock-update-service';

describe('ClockUpdateService multi-card', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clockUpdateService.clearAll();
    expect(clockUpdateService.activeConsumerCount).toBe(0);
  });

  afterEach(() => {
    clockUpdateService.clearAll();
    vi.useRealTimers();
  });

  it('addUpdateCallback invokes all listeners on tick', () => {
    const a = vi.fn();
    const b = vi.fn();
    const rmA = clockUpdateService.addUpdateCallback(a);
    clockUpdateService.addUpdateCallback(b);
    clockUpdateService.registerClock('clock-1', 1);
    vi.advanceTimersByTime(1000);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    rmA();
    vi.advanceTimersByTime(1000);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(2);
  });

  it('unregisterConsumer clears everything only when last consumer', () => {
    clockUpdateService.registerConsumer();
    clockUpdateService.registerConsumer();
    const cb = vi.fn();
    clockUpdateService.addUpdateCallback(cb);
    clockUpdateService.registerClock('c1', 1);
    clockUpdateService.unregisterConsumer();
    expect(clockUpdateService.activeConsumerCount).toBe(1);
    expect(clockUpdateService.getActiveClockCount()).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalled();
    clockUpdateService.unregisterConsumer();
    expect(clockUpdateService.activeConsumerCount).toBe(0);
    expect(clockUpdateService.getActiveClockCount()).toBe(0);
  });

  it('clearAll resets consumer count', () => {
    clockUpdateService.registerConsumer();
    clockUpdateService.clearAll();
    expect(clockUpdateService.activeConsumerCount).toBe(0);
  });
});

describe('ClockUpdateService shared interval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clockUpdateService.clearAll();
  });

  afterEach(() => {
    clockUpdateService.clearAll();
    vi.useRealTimers();
  });

  it('ticks once per interval no matter how many clocks are registered', () => {
    const cb = vi.fn();
    clockUpdateService.addUpdateCallback(cb);
    clockUpdateService.registerClock('a', 1);
    clockUpdateService.registerClock('b', 1);
    clockUpdateService.registerClock('c', 60);
    vi.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('slows to the remaining fastest frequency when the fast clock goes away', () => {
    const cb = vi.fn();
    clockUpdateService.addUpdateCallback(cb);
    clockUpdateService.registerClock('fast', 1);
    clockUpdateService.registerClock('slow', 60);
    clockUpdateService.unregisterClock('fast');
    vi.advanceTimersByTime(59_000);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(cb).toHaveBeenCalledTimes(1);
    clockUpdateService.unregisterClock('slow');
    vi.advanceTimersByTime(120_000);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
