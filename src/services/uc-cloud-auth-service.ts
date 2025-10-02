/**
 * Ultra Card Cloud Authentication Service
 * Handles user authentication with ultracard.io WordPress site using JWT
 */

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
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): CloudUser | null {
    return this._currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this._currentUser !== null && this._isTokenValid();
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

      console.log('✅ Successfully logged in to Ultra Card Cloud');
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
   * Refresh the current JWT token
   */
  async refreshToken(): Promise<string> {
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

      console.log('✅ Token refreshed successfully');
      return authData.token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // If refresh fails, logout user
      await this.logout();
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
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
      console.log('✅ Logged out successfully');
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
   * Check if current token is valid
   */
  private _isTokenValid(): boolean {
    if (!this._currentUser) return false;
    return Date.now() < this._currentUser.expiresAt - UcCloudAuthService.REFRESH_THRESHOLD;
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
        console.log(`Subscription loaded: ${subscription.tier} (${subscription.status})`);
      } else {
        console.warn('Failed to fetch subscription, defaulting to free tier');
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
      console.error('Error fetching subscription:', error);
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
          console.log(`Loaded cloud auth for user: ${user.displayName}`);
        } else {
          console.warn('Invalid stored user data, clearing');
          this._clearStorage();
        }
      }
    } catch (error) {
      console.error('Failed to load auth from storage:', error);
      this._clearStorage();
    }
  }

  /**
   * Save user to localStorage
   */
  private _saveToStorage(): void {
    try {
      if (this._currentUser) {
        localStorage.setItem(UcCloudAuthService.STORAGE_KEY, JSON.stringify(this._currentUser));
      } else {
        this._clearStorage();
      }
    } catch (error) {
      console.error('Failed to save auth to storage:', error);
    }
  }

  /**
   * Clear user from localStorage
   */
  private _clearStorage(): void {
    try {
      localStorage.removeItem(UcCloudAuthService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  }

  /**
   * Validate stored user data
   */
  private _isValidStoredUser(user: any): user is CloudUser {
    return (
      user &&
      typeof user.id === 'number' &&
      typeof user.username === 'string' &&
      typeof user.email === 'string' &&
      typeof user.token === 'string' &&
      typeof user.expiresAt === 'number'
    );
  }
}

// Export singleton instance
export const ucCloudAuthService = new UcCloudAuthService();
