export interface UcMaxWaitDebounceOptions {
  /** Quiet period after the most recent call before the callback runs. */
  wait: number;
  /** Longest an unbroken stream of calls may postpone the callback. */
  maxWait: number;
}

/**
 * A debounce that cannot be starved.
 *
 * A plain debounce rearms its timer on every call, so callers arriving closer
 * together than `wait` postpone the callback indefinitely. That is fine for a
 * search box, where nobody types forever, and wrong for anything driven by Home
 * Assistant state: several templated modules watching a sensor that updates
 * twice a second, or the flood of state changes during an HA restart, produce a
 * stream with no gap long enough to let the timer expire, and the repaint that
 * was being coalesced never happens at all.
 *
 * `maxWait` bounds that. As a burst goes on the delay shrinks, so the callback
 * runs at least once per `maxWait` and the burst then starts over.
 */
export class UcMaxWaitDebounce {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private burstStartedAt: number | null = null;

  constructor(
    private readonly run: () => void,
    private readonly options: UcMaxWaitDebounceOptions
  ) {}

  get pending(): boolean {
    return this.timer !== null;
  }

  /** Debounce a call, running no later than `maxWait` after the burst began. */
  schedule(): void {
    const now = Date.now();
    if (this.burstStartedAt === null) this.burstStartedAt = now;

    const remaining = Math.max(0, this.options.maxWait - (now - this.burstStartedAt));
    this.arm(Math.min(this.options.wait, remaining));
  }

  /**
   * Drop anything pending and run on the next macrotask.
   *
   * Deliberately not synchronous: callers replaced a `setTimeout(fn, 0)` here and
   * some of them dispatch events that must not re-enter the caller's own render.
   */
  scheduleNow(): void {
    this.arm(0);
  }

  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.burstStartedAt = null;
  }

  private arm(delay: number): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.burstStartedAt = null;
      this.run();
    }, delay);
  }
}
