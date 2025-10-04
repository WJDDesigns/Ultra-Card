/**
 * Ultra Card Auto-Snapshot Scheduler Service
 *
 * Manages daily auto-snapshot scheduling using localStorage and interval checks.
 * Triggers snapshots at user-configured time (default 3 AM).
 *
 * @author WJD Designs
 */

import { ucSnapshotService } from './uc-snapshot-service';
import { ucCloudAuthService } from './uc-cloud-auth-service';

const STORAGE_KEY_LAST_SNAPSHOT = 'ultra_card_last_auto_snapshot';
const CHECK_INTERVAL = 60 * 1000; // Check every minute

export interface SnapshotSchedulerStatus {
  enabled: boolean;
  nextSnapshotTime: Date | null;
  lastSnapshotTime: Date | null;
  isRunning: boolean;
}

class UcSnapshotSchedulerService {
  private _checkInterval: number | null = null;
  private _isRunning = false;
  private _listeners: Set<(status: SnapshotSchedulerStatus) => void> = new Set();

  constructor() {
    this._loadLastSnapshotTime();
  }

  /**
   * Start the auto-snapshot scheduler
   */
  start(): void {
    if (this._checkInterval) {
      console.log('📸 Snapshot scheduler already running');
      return;
    }

    console.log('🚀 Starting auto-snapshot scheduler');

    // Check immediately
    this._checkAndTriggerSnapshot();

    // Then check every minute
    this._checkInterval = window.setInterval(() => {
      this._checkAndTriggerSnapshot();
    }, CHECK_INTERVAL);

    this._notifyListeners();
  }

  /**
   * Stop the auto-snapshot scheduler
   */
  stop(): void {
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
      console.log('⏸️ Auto-snapshot scheduler stopped');
      this._notifyListeners();
    }
  }

  /**
   * Check if it's time to trigger a snapshot
   */
  private async _checkAndTriggerSnapshot(): Promise<void> {
    // Don't run if already in progress
    if (this._isRunning) {
      return;
    }

    // Check if user is authenticated and Pro
    if (!ucCloudAuthService.isAuthenticated()) {
      return;
    }

    const user = ucCloudAuthService.getCurrentUser();
    if (!user || user.subscription?.tier !== 'pro') {
      return;
    }

    try {
      // Get user settings
      const settings = await ucSnapshotService.getSettings();

      if (!settings.enabled) {
        return;
      }

      // Check if we need to run a snapshot
      if (this._shouldRunSnapshot(settings.time, settings.timezone)) {
        console.log('⏰ Time to create auto-snapshot!');
        this._isRunning = true;
        this._notifyListeners();

        try {
          await ucSnapshotService.createAutoSnapshot();
          this._saveLastSnapshotTime();
          console.log('✅ Auto-snapshot completed successfully');
        } catch (error) {
          console.error('❌ Auto-snapshot failed:', error);
        } finally {
          this._isRunning = false;
          this._notifyListeners();
        }
      }
    } catch (error) {
      console.error('❌ Error checking snapshot schedule:', error);
    }
  }

  /**
   * Determine if a snapshot should run now based on schedule
   */
  private _shouldRunSnapshot(time: string, timezone: string): boolean {
    const lastSnapshot = this._getLastSnapshotTime();
    const now = new Date();

    // Parse scheduled time (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number);

    // Create scheduled time for today in user's timezone
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If we've never run a snapshot before, run it now if we're past the scheduled time
    if (!lastSnapshot) {
      return now >= scheduledTime;
    }

    // Check if we've already run today
    const lastSnapshotDate = new Date(lastSnapshot);
    const isSameDay =
      lastSnapshotDate.getFullYear() === now.getFullYear() &&
      lastSnapshotDate.getMonth() === now.getMonth() &&
      lastSnapshotDate.getDate() === now.getDate();

    if (isSameDay) {
      // Already ran today
      return false;
    }

    // We haven't run today - check if we're past the scheduled time
    return now >= scheduledTime;
  }

  /**
   * Get last snapshot time from localStorage
   */
  private _getLastSnapshotTime(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_LAST_SNAPSHOT);
    } catch (error) {
      console.error('Failed to read last snapshot time:', error);
      return null;
    }
  }

  /**
   * Save current time as last snapshot time
   */
  private _saveLastSnapshotTime(): void {
    try {
      const now = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY_LAST_SNAPSHOT, now);
      console.log(`💾 Saved last snapshot time: ${now}`);
    } catch (error) {
      console.error('Failed to save last snapshot time:', error);
    }
  }

  /**
   * Update last snapshot time (public method for manual snapshots)
   */
  updateLastSnapshotTime(): void {
    this._saveLastSnapshotTime();
    this._notifyListeners();
  }

  /**
   * Load last snapshot time on init
   */
  private _loadLastSnapshotTime(): void {
    const lastTime = this._getLastSnapshotTime();
    if (lastTime) {
      console.log(`📅 Last auto-snapshot: ${new Date(lastTime).toLocaleString()}`);
    } else {
      console.log('📅 No previous auto-snapshot found');
    }
  }

  /**
   * Manually trigger a snapshot now (ignores schedule)
   */
  async triggerManualSnapshot(): Promise<void> {
    console.log('🔄 Manually triggering snapshot...');
    try {
      await ucSnapshotService.createSnapshot();
      this._saveLastSnapshotTime();
      this._notifyListeners();
    } catch (error) {
      console.error('❌ Manual snapshot failed:', error);
      throw error;
    }
  }

  /**
   * Get current scheduler status
   */
  async getStatus(): Promise<SnapshotSchedulerStatus> {
    const lastSnapshotTime = this._getLastSnapshotTime();
    let nextSnapshotTime: Date | null = null;

    try {
      const settings = await ucSnapshotService.getSettings();
      if (settings.enabled) {
        nextSnapshotTime = this._calculateNextSnapshotTime(
          settings.time,
          settings.timezone,
          lastSnapshotTime
        );
      }
    } catch (error) {
      console.error('Failed to get snapshot settings:', error);
    }

    return {
      enabled: !!this._checkInterval,
      nextSnapshotTime,
      lastSnapshotTime: lastSnapshotTime ? new Date(lastSnapshotTime) : null,
      isRunning: this._isRunning,
    };
  }

  /**
   * Calculate next snapshot time based on schedule and last run
   */
  private _calculateNextSnapshotTime(
    time: string,
    timezone: string,
    lastSnapshot: string | null
  ): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);

    next.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    // If we ran today, schedule for tomorrow
    if (lastSnapshot) {
      const lastDate = new Date(lastSnapshot);
      const isSameDay =
        lastDate.getFullYear() === now.getFullYear() &&
        lastDate.getMonth() === now.getMonth() &&
        lastDate.getDate() === now.getDate();

      if (isSameDay && next.getDate() === now.getDate()) {
        next.setDate(next.getDate() + 1);
      }
    }

    return next;
  }

  /**
   * Subscribe to status updates
   */
  subscribe(callback: (status: SnapshotSchedulerStatus) => void): () => void {
    this._listeners.add(callback);

    // Send initial status
    this.getStatus().then(status => callback(status));

    // Return unsubscribe function
    return () => {
      this._listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private _notifyListeners(): void {
    this.getStatus().then(status => {
      this._listeners.forEach(listener => listener(status));
    });
  }
}

// Export singleton instance
export const ucSnapshotSchedulerService = new UcSnapshotSchedulerService();
