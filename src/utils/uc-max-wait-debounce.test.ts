import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UcMaxWaitDebounce } from './uc-max-wait-debounce';

describe('UcMaxWaitDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('coalesces a burst into a single run', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    debounce.schedule();
    debounce.schedule();
    debounce.schedule();
    expect(run).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('waits for the quiet period after the most recent call', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    debounce.schedule();
    vi.advanceTimersByTime(40);
    debounce.schedule();
    vi.advanceTimersByTime(40);
    expect(run).not.toHaveBeenCalled();

    vi.advanceTimersByTime(10);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('still runs when calls never stop arriving', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    // A caller every 10ms never leaves a 50ms gap, which is what starves a plain
    // debounce forever.
    for (let elapsed = 0; elapsed < 300; elapsed += 10) {
      debounce.schedule();
      vi.advanceTimersByTime(10);
    }

    expect(run).toHaveBeenCalled();
  });

  it('runs about once per maxWait during a sustained stream', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    for (let elapsed = 0; elapsed < 1000; elapsed += 10) {
      debounce.schedule();
      vi.advanceTimersByTime(10);
    }

    // 1000ms of unbroken calls: about four runs, and certainly not zero or one per call.
    expect(run.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(run.mock.calls.length).toBeLessThanOrEqual(5);
  });

  it('starts a fresh burst after running', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    debounce.schedule();
    vi.advanceTimersByTime(50);
    expect(run).toHaveBeenCalledTimes(1);

    // The second burst must get its own full quiet period, not the tail of the first.
    debounce.schedule();
    vi.advanceTimersByTime(49);
    expect(run).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('scheduleNow replaces a pending run and does not run synchronously', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    debounce.schedule();
    debounce.scheduleNow();
    expect(run).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('cancel drops a pending run', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    debounce.schedule();
    expect(debounce.pending).toBe(true);
    debounce.cancel();
    expect(debounce.pending).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(run).not.toHaveBeenCalled();
  });

  it('cancel mid-burst resets it so the next call gets a full quiet period', () => {
    const run = vi.fn();
    const debounce = new UcMaxWaitDebounce(run, { wait: 50, maxWait: 250 });

    // Call every 40ms so the timer keeps rearming and the burst is still open,
    // without reaching maxWait and running on its own.
    for (let elapsed = 0; elapsed < 200; elapsed += 40) {
      debounce.schedule();
      vi.advanceTimersByTime(40);
    }
    expect(run).not.toHaveBeenCalled();
    expect(debounce.pending).toBe(true);

    debounce.cancel();
    debounce.schedule();

    vi.advanceTimersByTime(49);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
