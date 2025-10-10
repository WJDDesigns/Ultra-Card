/**
 * Ultra Card Cloud Authentication Service
 * Handles user authentication with ultracard.io WordPress site using JWT
 * Supports cross-device session sync via cloud sessions
 */

import { ucSessionSyncService } from './uc-session-sync-service';

export interface SubscriptionFeatures {
  auto_backups: boolean;
  snapshots_enabled: boolean;
  snapshot_limit: number;
  backup_retention_days: number;
}

export interface UserSubscription {
  tier: 'free' | 'pro';
  status: 'active' | 'expired';
  expires?: number;
  features: SubscriptionFeatures;
  snapshot_count: number;
  snapshot_limit: number;
}

export interface CloudUser {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  token: string;
  refreshToken?: string;
  expiresAt: number;
  subscription?: UserSubscription;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  user_id: number;
  avatar_url?: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * Cloud authentication service for Ultra Card
 * Integrates with WordPress JWT Authentication plugin
 */
class UcCloudAuthService {
  private static readonly API_BASE = 'https://ultracard.io/wp-json';
  private static readonly JWT_ENDPOINT = '/jwt-auth/v1';
  private static readonly STORAGE_KEY = 'ultra-card-cloud-auth';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

  private _currentUser: CloudUser | null = null;
  private _listeners: Set<(user: CloudUser | null) => void> = new Set();
  private _refreshTimer?: number;

  constructor() {
    this._loadFromStorage();
    this._setupAutoRefresh();

    // DISABLED: Old cloud session sync system
    // Now using Ultra Card Pro Cloud integration instead
    // ucSessionSyncService.enable();
    // this._checkCloudSession();
    // this._retryCloudSessionCheck();
  }

  /**
   * Check if Ultra Card Pro Cloud integration is installed and authenticated
   * Returns integration auth data if available, null otherwise
   *
   * SECURITY: This reads from a protected sensor entity that users cannot manipulate.
   * The sensor is created by the Ultra Card Pro Cloud integration after successful
   * authentication with ultracard.io.
   */
  checkIntegrationAuth(hass: any): CloudUser | null {
    try {
      console.log('🔍 Checking for Ultra Card Pro Cloud integration...');

      // Check for the protected sensor entity
      const sensorEntityId = 'sensor.ultra_card_pro_cloud_authentication_status';
      const sensorState = hass?.states?.[sensorEntityId];

      if (!sensorState) {
        console.log('📝 Ultra Card Pro Cloud integration not installed (sensor not found)');
        return null;
      }

      console.log('✅ Found Ultra Card Pro Cloud sensor:', sensorState.state);
      console.log('   Attributes:', sensorState.attributes);

      // Check if authenticated
      if (sensorState.state !== 'connected' || !sensorState.attributes?.authenticated) {
        console.log('📝 Integration installed but not authenticated');
        return null;
      }

      const attrs = sensorState.attributes;

      // Convert sensor data to CloudUser format
      const user: CloudUser = {
        id: attrs.user_id,
        username: attrs.username || '',
        email: attrs.email || '',
        displayName: attrs.display_name || attrs.username || '',
        token: attrs.token || '', // Use token from sensor attributes for API calls
        expiresAt: 0, // Managed by integration server-side
        subscription: {
          tier: attrs.subscription_tier || 'free',
          status: attrs.subscription_status || 'expired',
          expires: attrs.subscription_expires,
          features: attrs.features || {
            auto_backups: attrs.subscription_tier === 'pro',
            snapshots_enabled: attrs.subscription_tier === 'pro',
            snapshot_limit: attrs.subscription_tier === 'pro' ? 10 : 0,
            backup_retention_days: 90,
          },
          snapshot_count: 0,
          snapshot_limit: attrs.subscription_tier === 'pro' ? 10 : 0,
        },
      };

      console.log('✅ Ultra Card Pro Cloud connected!', user);
      console.log(`   💫 Connected at: ${attrs.connected_at}`);

      return user;
    } catch (error) {
      console.debug('No Ultra Card Pro Cloud integration found:', error);
      return null;
    }
  }

  /**
   * Check if integration is installed (whether authenticated or not)
   */
  isIntegrationInstalled(hass: any): boolean {
    try {
      const sensorEntityId = 'sensor.ultra_card_pro_cloud_authentication_status';
      return !!hass?.states?.[sensorEntityId];
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Home Assistant user ID from hass object
   * First tries window.hass, then tries to find hass from any ultra-card element
   */
  private _getHassUserId(): string | null {
    try {
      // Try window.hass first
      let hass = (window as any).hass;

      // If not available, try to get from any ultra-card element in the DOM
      if (!hass) {
        const ultraCards = document.querySelectorAll('ultra-card');
        for (const card of Array.from(ultraCards)) {
          const cardHass = (card as any).hass;
          if (cardHass && cardHass.user) {
            hass = cardHass;
            break;
          }
        }
      }

      // If still not available, try home-assistant element
      if (!hass) {
        const homeAssistant = document.querySelector('home-assistant');
        if (homeAssistant) {
          hass = (homeAssistant as any).hass;
        }
      }

      const userId = hass?.user?.id || null;

      if (!userId) {
        console.log(
          '📝 HA user ID not available yet, hass object:',
          hass ? 'exists' : 'missing',
          'user:',
          hass?.user ? 'exists' : 'missing'
        );
      } else {
        console.log('✅ HA user ID found:', userId);
      }

      return userId;
    } catch (error) {
      console.warn('Failed to get HA user ID:', error);
      return null;
    }
  }

  /**
   * Retry cloud session check multiple times until HA user ID is available
   */
  private _retryCloudSessionCheck(): void {
    const maxRetries = 10;
    let retryCount = 0;

    const retry = () => {
      retryCount++;
      const haUserId = this._getHassUserId();

      if (haUserId && !this._currentUser) {
        console.log(
          '🔄 Retrying cloud session check with now-available HA user ID (attempt',
          retryCount,
          ')'
        );
        this._checkCloudSession();
      } else if (retryCount < maxRetries) {
        // Retry every 500ms for up to 5 seconds
        setTimeout(retry, 500);
      } else {
        console.log('📝 Max retries reached, HA user ID still not available');
      }
    };

    // Start first retry after 500ms
    setTimeout(retry, 500);
  }

  /**
   * Check for active cloud session (cross-device sync)
   */
  private async _checkCloudSession(): Promise<void> {
    if (!ucSessionSyncService.isEnabled()) {
      return; // Cloud session sync not enabled yet
    }

    console.log('🔄 Checking for active cloud session...');

    // Always check for cloud session first (cross-device sync)
    // Pass HA user ID for magic cross-device sync
    const storedUser = this._getFromLocalStorage();
    const haUserId = this._getHassUserId();
    const cloudUser = await ucSessionSyncService.getCurrentSession(haUserId, storedUser?.token);

    if (cloudUser) {
      console.log('✅ Found active cloud session, syncing authentication');
      this._setCurrentUser(cloudUser);
      this._saveToStorage();
      this._setupAutoRefresh();

      // Start polling
      ucSessionSyncService.startPolling(cloudUser.token, () => {
        this.logout();
      });
      return; // Found cloud session, we're done
    }

    // No cloud session found, validate local session if we have one
    if (this._currentUser) {
      const valid = await ucSessionSyncService.validateSession(this._currentUser.token);
      if (!valid) {
        console.warn('⚠️ Local session invalidated remotely');
        await this.logout();
      } else {
        // Start polling for session validation
        ucSessionSyncService.startPolling(this._currentUser.token, () => {
          this.logout();
        });
      }
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): CloudUser | null {
    return this._currentUser;
  }

  /**
   * Set current user from integration data (for Ultra Card Pro Cloud integration)
   */
  setIntegrationUser(user: CloudUser): void {
    this._setCurrentUser(user);
    this._saveToStorage();
  }

  /**
   * Check if user is authenticated (has valid, non-expired token)
   * For integration users with tokens, validate the token
   */
  isAuthenticated(): boolean {
    if (!this._currentUser) return false;

    // If user has a token (from integration or card auth), validate it
    if (this._currentUser.token && this._currentUser.token !== '') {
      return this._isTokenValid();
    }

    // If no token but user exists, they came from integration without token - always valid
    return true;
  }

  /**
   * Check if token should be refreshed proactively (before it expires)
   */
  shouldRefreshToken(): boolean {
    return this._shouldRefreshToken();
  }

  /**
   * Login with username/email and password
   */
  async login(credentials: LoginCredentials): Promise<CloudUser> {
    try {
      const response = await fetch(
        `${UcCloudAuthService.API_BASE}${UcCloudAuthService.JWT_ENDPOINT}/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const authData: AuthResponse = await response.json();
      const user = this._createUserFromAuth(authData);

      // Fetch subscription data
      await this._fetchSubscriptionData(user);

      this._setCurrentUser(user);
      this._saveToStorage();
      this._setupAutoRefresh();

      // Create cloud session for cross-device sync
      if (ucSessionSyncService.isEnabled()) {
        const haUserId = this._getHassUserId();
        if (haUserId) {
          await ucSessionSyncService.createSession(user, haUserId);

          // Start session validation polling
          ucSessionSyncService.startPolling(user.token, () => {
            this.logout();
          });
        } else {
          console.warn('⚠️ HA user ID not available, cloud session sync disabled');
        }
      }

      return user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user account
   */
  async register(data: RegisterData): Promise<CloudUser> {
    try {
      // First, register the user via WordPress REST API
      const registerResponse = await fetch(`${UcCloudAuthService.API_BASE}/wp/v2/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          first_name: data.firstName || '',
          last_name: data.lastName || '',
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse
          .json()
          .catch(() => ({ message: 'Registration failed' }));
        throw new Error(error.message || `Registration failed: ${registerResponse.statusText}`);
      }

      // After successful registration, login automatically
      return await this.login({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * Refresh the current JWT token with retry logic
   */
  async refreshToken(retryCount = 0): Promise<string> {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 1000; // 1 second

    if (!this._currentUser?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(
        `${UcCloudAuthService.API_BASE}${UcCloudAuthService.JWT_ENDPOINT}/token/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: this._currentUser.refreshToken,
          }),
        }
      );

      if (!response.ok) {
        // Check if it's a 4xx error (invalid credentials) vs 5xx (server error)
        const isClientError = response.status >= 400 && response.status < 500;
        if (isClientError) {
          // Invalid refresh token - don't retry
          throw new Error(`Invalid refresh token (${response.status})`);
        }
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const authData: AuthResponse = await response.json();

      // Update current user with new token
      this._currentUser = {
        ...this._currentUser,
        token: authData.token,
        expiresAt: Date.now() + (authData.expires_in || 3600) * 1000,
      };

      this._saveToStorage();
      this._notifyListeners();

      return authData.token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isInvalidToken = errorMessage.includes('Invalid refresh token');

      // Don't retry if token is invalid
      if (isInvalidToken) {
        console.error('❌ Refresh token invalid, logging out');
        await this.logout();
        throw error;
      }

      // Retry with exponential backoff for network errors
      if (retryCount < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, retryCount);
        console.warn(
          `⚠️ Token refresh failed (attempt ${retryCount + 1}/${MAX_RETRIES}), retrying in ${delay}ms...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.refreshToken(retryCount + 1);
      }

      // All retries exhausted
      // Only logout if token is actually expired
      if (!this._isTokenValid()) {
        console.error('❌ All refresh attempts failed and token expired, logging out');
        await this.logout();
      } else {
        console.warn('⚠️ Refresh failed but token still valid, keeping session');
      }

      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      // Invalidate cloud session (affects all devices)
      if (this._currentUser?.token && ucSessionSyncService.isEnabled()) {
        await ucSessionSyncService.invalidateSession(this._currentUser.token);
        ucSessionSyncService.stopPolling();
      }

      // Optionally invalidate token on server
      if (this._currentUser?.token) {
        await fetch(
          `${UcCloudAuthService.API_BASE}${UcCloudAuthService.JWT_ENDPOINT}/token/invalidate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this._currentUser.token}`,
            },
          }
        ).catch(() => {
          // Ignore errors - we're logging out anyway
        });
      }
    } finally {
      this._setCurrentUser(null);
      this._clearStorage();
      this._clearAutoRefresh();
    }
  }

  /**
   * Get valid authorization header
   */
  getAuthHeader(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return `Bearer ${this._currentUser!.token}`;
  }

  /**
   * Make authenticated API request
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    // If token expired, try to refresh and retry once
    if (response.status === 401 && this._currentUser?.refreshToken) {
      try {
        await this.refreshToken();
        const newAuthHeader = this.getAuthHeader();
        if (newAuthHeader) {
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: newAuthHeader,
              'Content-Type': 'application/json',
            },
          });
        }
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        throw new Error('Authentication expired. Please login again.');
      }
    }

    return response;
  }

  /**
   * Add authentication state listener
   */
  addListener(listener: (user: CloudUser | null) => void): void {
    this._listeners.add(listener);
  }

  /**
   * Remove authentication state listener
   */
  removeListener(listener: (user: CloudUser | null) => void): void {
    this._listeners.delete(listener);
  }

  /**
   * Create user object from auth response
   */
  private _createUserFromAuth(authData: AuthResponse): CloudUser {
    return {
      id: authData.user_id,
      username: authData.user_nicename,
      email: authData.user_email,
      displayName: authData.user_display_name,
      avatar: authData.avatar_url,
      token: authData.token,
      refreshToken: authData.refresh_token,
      expiresAt: Date.now() + (authData.expires_in || 3600) * 1000,
    };
  }

  /**
   * Set current user and notify listeners
   */
  private _setCurrentUser(user: CloudUser | null): void {
    this._currentUser = user;
    this._notifyListeners();
  }

  /**
   * Notify all listeners of auth state change
   */
  private _notifyListeners(): void {
    this._listeners.forEach(listener => {
      try {
        listener(this._currentUser);
      } catch (error) {
        console.error('Error in auth listener:', error);
      }
    });
  }

  /**
   * Check if current token is valid (not actually expired)
   * This checks the ACTUAL expiry time, not the refresh threshold
   * For integration users without expiresAt, always return true
   */
  private _isTokenValid(): boolean {
    if (!this._currentUser) return false;

    // If no expiresAt, user came from integration - always valid
    if (!this._currentUser.expiresAt || this._currentUser.expiresAt === 0) {
      return true;
    }

    return Date.now() < this._currentUser.expiresAt;
  }

  /**
   * Check if we should proactively refresh the token
   * (within REFRESH_THRESHOLD of expiry)
   */
  private _shouldRefreshToken(): boolean {
    if (!this._currentUser) return false;
    return Date.now() >= this._currentUser.expiresAt - UcCloudAuthService.REFRESH_THRESHOLD;
  }

  /**
   * Setup automatic token refresh
   */
  private _setupAutoRefresh(): void {
    this._clearAutoRefresh();

    if (!this._currentUser) return;

    const timeUntilRefresh =
      this._currentUser.expiresAt - Date.now() - UcCloudAuthService.REFRESH_THRESHOLD;

    if (timeUntilRefresh > 0) {
      this._refreshTimer = window.setTimeout(async () => {
        try {
          await this.refreshToken();
          this._setupAutoRefresh(); // Setup next refresh
        } catch (error) {
          console.error('Auto-refresh failed:', error);
        }
      }, timeUntilRefresh);
    }
  }

  /**
   * Clear automatic refresh timer
   */
  private _clearAutoRefresh(): void {
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = undefined;
    }
  }

  /**
   * Fetch subscription data for user
   */
  private async _fetchSubscriptionData(user: CloudUser): Promise<void> {
    try {
      const response = await fetch(`${UcCloudAuthService.API_BASE}/ultra-card/v1/subscription`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const subscription: UserSubscription = await response.json();
        user.subscription = subscription;
      } else {
        console.warn('⚠️ Failed to fetch subscription, defaulting to free tier');
        // Default to free tier if fetch fails
        user.subscription = {
          tier: 'free',
          status: 'active',
          features: {
            auto_backups: true,
            snapshots_enabled: false,
            snapshot_limit: 0,
            backup_retention_days: 30,
          },
          snapshot_count: 0,
          snapshot_limit: 0,
        };
      }
    } catch (error) {
      console.error('❌ Error fetching subscription:', error);
      // Default to free tier on error
      user.subscription = {
        tier: 'free',
        status: 'active',
        features: {
          auto_backups: true,
          snapshots_enabled: false,
          snapshot_limit: 0,
          backup_retention_days: 30,
        },
        snapshot_count: 0,
        snapshot_limit: 0,
      };
    }
  }

  /**
   * Load user from localStorage
   */
  private _loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(UcCloudAuthService.STORAGE_KEY);
      if (stored) {
        const user: CloudUser = JSON.parse(stored);
        if (this._isValidStoredUser(user)) {
          this._currentUser = user;

          // Only log warnings for problematic states
          const isExpired = Date.now() >= user.expiresAt;
          const hasRefreshToken = !!user.refreshToken;

          if (isExpired && !hasRefreshToken) {
            console.warn('⚠️ Session expired and no refresh token - re-login required');
          }
        } else {
          console.warn('⚠️ Invalid stored user data, clearing');
          this._clearStorage();
        }
      }
    } catch (error) {
      console.error('❌ Failed to load auth from storage:', error);
      this._clearStorage();
    }
  }

  /**
   * Save user to localStorage
   */
  private _saveToStorage(): void {
    try {
      if (this._currentUser) {
        const userJson = JSON.stringify(this._currentUser);
        localStorage.setItem(UcCloudAuthService.STORAGE_KEY, userJson);
      } else {
        this._clearStorage();
      }
    } catch (error) {
      console.error('❌ Failed to save auth to storage:', error);
    }
  }

  /**
   * Clear user from localStorage
   */
  private _clearStorage(): void {
    try {
      localStorage.removeItem(UcCloudAuthService.STORAGE_KEY);
    } catch (error) {
      console.error('❌ Failed to clear auth storage:', error);
    }
  }

  /**
   * Get user from localStorage (helper for cloud session check)
   */
  private _getFromLocalStorage(): CloudUser | null {
    try {
      const stored = localStorage.getItem(UcCloudAuthService.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Failed to read from storage:', error);
    }
    return null;
  }

  /**
   * Validate stored user data
   * Note: Token and expiresAt are optional for integration-based auth
   */
  private _isValidStoredUser(user: any): user is CloudUser {
    // Debug log to see what's wrong
    if (!user) {
      console.warn('❌ Validation failed: user is null/undefined');
      return false;
    }

    // Basic required fields
    const requiredChecks = {
      'user exists': !!user,
      'id is number': typeof user.id === 'number',
      'username is string': typeof user.username === 'string',
      'email is string': typeof user.email === 'string',
      'displayName is string': typeof user.displayName === 'string',
    };

    const failedChecks = Object.entries(requiredChecks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);

    if (failedChecks.length > 0) {
      console.warn('❌ Validation failed. Failed checks:', failedChecks);
      console.warn('   User data:', JSON.stringify(user, null, 2));
      return false;
    }

    // Token and expiresAt are optional (managed by integration)
    // Only validate them if they exist
    if (user.token !== undefined && typeof user.token !== 'string') {
      console.warn('❌ Validation failed: token exists but is not a string');
      return false;
    }
    if (user.expiresAt !== undefined && typeof user.expiresAt !== 'number') {
      console.warn('❌ Validation failed: expiresAt exists but is not a number');
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const ucCloudAuthService = new UcCloudAuthService();
