/**
 * Clock Update Service
 *
 * Manages interval timers for animated clock modules to ensure they update at the configured frequency.
 * Multiple ultra-card instances may be mounted; disconnecting one must not clear timers or callbacks
 * needed by sibling cards.
 */

interface ClockTimer {
  intervalId: number;
  frequency: number; // in seconds
}

class ClockUpdateService {
  private timers: Map<string, ClockTimer> = new Map();
  private updateCallbacks: Array<() => void> = [];
  /** Mounted `ultra-card` count; full teardown only when the last card disconnects. */
  private consumerRefCount = 0;

  get activeConsumerCount(): number {
    return this.consumerRefCount;
  }

  public registerConsumer(): void {
    this.consumerRefCount += 1;
  }

  public unregisterConsumer(): void {
    if (this.consumerRefCount <= 0) {
      return;
    }
    this.consumerRefCount -= 1;
    if (this.consumerRefCount === 0) {
      this.clearAllInternal();
    }
  }

  /**
   * Register a callback invoked on each clock tick (per registered clock interval).
   * Returns a disposer; call it when the owning ultra-card disconnects.
   */
  public addUpdateCallback(callback: () => void): () => void {
    this.updateCallbacks.push(callback);
    return () => {
      const idx = this.updateCallbacks.indexOf(callback);
      if (idx >= 0) {
        this.updateCallbacks.splice(idx, 1);
      }
    };
  }

  /**
   * Register a clock module to receive updates
   * @param moduleId - Unique identifier for the clock module
   * @param frequency - Update frequency in seconds (1 or 60)
   */
  registerClock(moduleId: string, frequency: number = 1): void {
    // If already registered with same frequency, do nothing
    const existing = this.timers.get(moduleId);
    if (existing && existing.frequency === frequency) {
      return;
    }

    // Clear existing timer if frequency changed
    if (existing) {
      this.unregisterClock(moduleId);
    }

    // Create new interval timer
    const intervalMs = frequency * 1000;
    const intervalId = window.setInterval(() => {
      const listeners = [...this.updateCallbacks];
      for (const fn of listeners) {
        try {
          fn();
        } catch {
          // ignore per-card errors
        }
      }
    }, intervalMs);

    this.timers.set(moduleId, { intervalId, frequency });
  }

  /**
   * Unregister a clock module
   * @param moduleId - Unique identifier for the clock module
   */
  unregisterClock(moduleId: string): void {
    const timer = this.timers.get(moduleId);
    if (timer) {
      clearInterval(timer.intervalId);
    }
    this.timers.delete(moduleId);
  }

  /**
   * Check if a clock is registered
   * @param moduleId - Unique identifier for the clock module
   */
  isRegistered(moduleId: string): boolean {
    return this.timers.has(moduleId);
  }

  private clearAllInternal(): void {
    this.timers.forEach(timer => clearInterval(timer.intervalId));
    this.timers.clear();
    this.updateCallbacks = [];
  }

  /**
   * Force full teardown (resets consumer count). Tests and hard-reset paths.
   */
  clearAll(): void {
    this.consumerRefCount = 0;
    this.clearAllInternal();
  }

  /**
   * Get active clock count
   */
  getActiveClockCount(): number {
    return this.timers.size;
  }
}

// Export singleton instance
export const clockUpdateService = new ClockUpdateService();
