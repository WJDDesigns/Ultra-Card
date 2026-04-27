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
