/**
 * Cloud Session Sync Service
 * Manages cross-device authentication sync via ultracard.io backend
 *
 * NOTE: Requires backend API implementation (see CLOUD_SESSION_SYNC_API.md)
 * Falls back gracefully to localStorage-only mode if API unavailable
 */

import { CloudUser } from './uc-cloud-auth-service';

interface SessionResponse {
  success: boolean;
  session_id?: string;
  session?: {
    session_id: string;
    user: CloudUser;
    created_at: number;
    last_validated: number;
  };
  user?: CloudUser;
  valid?: boolean;
  message?: string;
}

class UcSessionSyncService {
  private static readonly API_BASE = 'https://ultracard.io/wp-json';
  private static readonly SESSION_ID_KEY = 'ultra-card-session-id';
  private static readonly POLL_INTERVAL = 30000; // 30 seconds
  private static readonly DEVICE_ID_KEY = 'ultra-card-device-id';

  private _pollTimer?: number;
  private _sessionId: string | null = null;
  private _deviceId: string;
  private _isEnabled = false; // Will be true once backend API is implemented
  private _listeners: Set<(user: CloudUser | null) => void> = new Set();

  constructor() {
    this._deviceId = this._getOrCreateDeviceId();
    this._sessionId = this._loadSessionId();
  }

  /**
   * Check if cloud session sync is enabled
   * Currently returns false until backend API is implemented
   */
  isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Enable cloud session sync (call this once backend API is ready)
   */
  enable(): void {
    this._isEnabled = true;
    console.log('✅ Cloud session sync enabled');
  }

  /**
   * Disable cloud session sync (fallback to localStorage only)
   */
  disable(): void {
    this._isEnabled = false;
    this.stopPolling();
    console.log('📴 Cloud session sync disabled');
  }

  /**
   * Create a cloud session after successful login
   */
  async createSession(user: CloudUser, haUserId: string): Promise<string | null> {
    if (!this._isEnabled) {
      console.log('📝 Cloud session sync disabled, skipping session creation');
      return null;
    }

    try {
      console.log('🔄 Creating cloud session...');

      const response = await fetch(
        `${UcSessionSyncService.API_BASE}/ultra-card/v1/session/create`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_id: this._deviceId,
            device_name: this._getDeviceName(),
            user_id: user.id,
            ha_user_id: haUserId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Session creation failed: ${response.status}`);
      }

      const data: SessionResponse = await response.json();

      if (data.success && data.session_id) {
        this._sessionId = data.session_id;
        this._saveSessionId(data.session_id);
        console.log('✅ Cloud session created:', data.session_id);
        return data.session_id;
      }

      throw new Error('Invalid session response');
    } catch (error) {
      console.warn('⚠️ Failed to create cloud session, using local-only mode:', error);
      return null;
    }
  }

  /**
   * Get current active session from cloud
   * Other devices use this to sync authentication
   * Uses HA user ID for magic cross-device sync
   */
  async getCurrentSession(haUserId?: string | null, token?: string): Promise<CloudUser | null> {
    if (!this._isEnabled) {
      return null;
    }

    try {
      console.log('🔄 Checking for active cloud session...');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header only if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Build URL with HA user ID if provided
      let url = `${UcSessionSyncService.API_BASE}/ultra-card/v1/session/current`;
      if (haUserId) {
        url += `?ha_user_id=${encodeURIComponent(haUserId)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies for WordPress auth
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 No active cloud session found');
          return null;
        }
        if (response.status === 401) {
          console.log('🔐 Not authenticated, cannot retrieve session');
          return null;
        }
        throw new Error(`Session fetch failed: ${response.status}`);
      }

      const data: SessionResponse = await response.json();

      if (data.success && data.session?.user) {
        this._sessionId = data.session.session_id;
        this._saveSessionId(data.session.session_id);
        console.log('✅ Retrieved active cloud session');
        return data.session.user;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Failed to fetch cloud session:', error);
      return null;
    }
  }

  /**
   * Validate current session
   * Returns false if session was invalidated (user logged out elsewhere)
   */
  async validateSession(token: string): Promise<boolean> {
    if (!this._isEnabled || !this._sessionId) {
      return true; // Skip validation if disabled or no session
    }

    try {
      const response = await fetch(
        `${UcSessionSyncService.API_BASE}/ultra-card/v1/session/validate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: this._sessionId,
          }),
        }
      );

      if (!response.ok) {
        return false;
      }

      const data: SessionResponse = await response.json();
      return data.success && data.valid === true;
    } catch (error) {
      console.warn('⚠️ Session validation failed:', error);
      return true; // Assume valid on error to avoid false logouts
    }
  }

  /**
   * Invalidate cloud session (logout across all devices)
   */
  async invalidateSession(token: string): Promise<void> {
    if (!this._isEnabled) {
      return;
    }

    try {
      console.log('🔄 Invalidating cloud session...');

      await fetch(`${UcSessionSyncService.API_BASE}/ultra-card/v1/session/logout`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      this._clearSessionId();
      console.log('✅ Cloud session invalidated');
    } catch (error) {
      console.warn('⚠️ Failed to invalidate cloud session:', error);
    }
  }

  /**
   * Start polling for session validation
   */
  startPolling(token: string, onInvalidated: () => void): void {
    if (!this._isEnabled) {
      return;
    }

    this.stopPolling();

    console.log('🔄 Starting session validation polling');

    this._pollTimer = window.setInterval(async () => {
      const valid = await this.validateSession(token);
      if (!valid) {
        console.warn('⚠️ Session invalidated remotely, logging out');
        this.stopPolling();
        onInvalidated();
      }
    }, UcSessionSyncService.POLL_INTERVAL);
  }

  /**
   * Stop polling for session validation
   */
  stopPolling(): void {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = undefined;
      console.log('✅ Stopped session validation polling');
    }
  }

  /**
   * Add listener for session changes
   */
  addListener(listener: (user: CloudUser | null) => void): void {
    this._listeners.add(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (user: CloudUser | null) => void): void {
    this._listeners.delete(listener);
  }

  /**
   * Get or create unique device ID
   */
  private _getOrCreateDeviceId(): string {
    try {
      let deviceId = localStorage.getItem(UcSessionSyncService.DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(UcSessionSyncService.DEVICE_ID_KEY, deviceId);
      }
      return deviceId;
    } catch (error) {
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  /**
   * Get human-readable device name
   */
  private _getDeviceName(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Detect browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return `${browser} on ${os}`;
  }

  /**
   * Load session ID from storage
   */
  private _loadSessionId(): string | null {
    try {
      return localStorage.getItem(UcSessionSyncService.SESSION_ID_KEY);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save session ID to storage
   */
  private _saveSessionId(sessionId: string): void {
    try {
      localStorage.setItem(UcSessionSyncService.SESSION_ID_KEY, sessionId);
    } catch (error) {
      console.error('Failed to save session ID:', error);
    }
  }

  /**
   * Clear session ID from storage
   */
  private _clearSessionId(): void {
    try {
      localStorage.removeItem(UcSessionSyncService.SESSION_ID_KEY);
      this._sessionId = null;
    } catch (error) {
      console.error('Failed to clear session ID:', error);
    }
  }
}

// Export singleton instance
export const ucSessionSyncService = new UcSessionSyncService();
