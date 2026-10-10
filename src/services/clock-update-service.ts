/**
 * Clock Update Service
 *
 * Manages interval timers for animated clock modules to ensure they update at the configured frequency.
 * Multiple ultra-card instances may be mounted; disconnecting one must not clear timers or callbacks
 * needed by sibling cards.
 */

class ClockUpdateService {
  /** Registered clocks and their update frequency in seconds. */
  private clocks: Map<string, number> = new Map();
  /**
   * One shared interval at the fastest registered frequency. One interval per
   * clock meant N clocks re-rendered every card N times per tick.
   */
  private sharedIntervalId: number | null = null;
  private sharedFrequency = 0;
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
   * Register a callback invoked on each clock tick (fastest registered frequency).
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
    if (this.clocks.get(moduleId) === frequency) return;
    this.clocks.set(moduleId, frequency);
    this.syncInterval();
  }

  /**
   * Unregister a clock module
   * @param moduleId - Unique identifier for the clock module
   */
  unregisterClock(moduleId: string): void {
    if (!this.clocks.delete(moduleId)) return;
    this.syncInterval();
  }

  /**
   * Check if a clock is registered
   * @param moduleId - Unique identifier for the clock module
   */
  isRegistered(moduleId: string): boolean {
    return this.clocks.has(moduleId);
  }

  private syncInterval(): void {
    const frequency = this.clocks.size ? Math.min(...this.clocks.values()) : 0;
    if (frequency === this.sharedFrequency && this.sharedIntervalId !== null) return;
    this.stopInterval();
    if (!frequency) return;
    this.sharedFrequency = frequency;
    this.sharedIntervalId = window.setInterval(() => {
      const listeners = [...this.updateCallbacks];
      for (const fn of listeners) {
        try {
          fn();
        } catch {
          // ignore per-card errors
        }
      }
    }, frequency * 1000);
  }

  private stopInterval(): void {
    if (this.sharedIntervalId !== null) clearInterval(this.sharedIntervalId);
    this.sharedIntervalId = null;
    this.sharedFrequency = 0;
  }

  private clearAllInternal(): void {
    this.stopInterval();
    this.clocks.clear();
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
    return this.clocks.size;
  }
}

// Export singleton instance
export const clockUpdateService = new ClockUpdateService();
