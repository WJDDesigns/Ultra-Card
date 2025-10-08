/**
 * Clock Update Service
 *
 * Manages interval timers for animated clock modules to ensure they update at the configured frequency.
 * This service maintains a registry of active clocks and their update intervals.
 */

interface ClockTimer {
  intervalId: number;
  frequency: number; // in seconds
}

class ClockUpdateService {
  private timers: Map<string, ClockTimer> = new Map();
  private updateCallback?: () => void;

  /**
   * Register a callback function that will be called when any clock needs to update
   */
  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
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
      if (this.updateCallback) {
        this.updateCallback();
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
      this.timers.delete(moduleId);
    }
  }

  /**
   * Check if a clock is registered
   * @param moduleId - Unique identifier for the clock module
   */
  isRegistered(moduleId: string): boolean {
    return this.timers.has(moduleId);
  }

  /**
   * Clear all timers (cleanup)
   */
  clearAll(): void {
    this.timers.forEach(timer => clearInterval(timer.intervalId));
    this.timers.clear();
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
