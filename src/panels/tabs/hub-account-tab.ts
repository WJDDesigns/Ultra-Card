/**
 * Ultra Card Hub — Account tab.
 * Sign in, register, and upgrade to Pro. Shown to all users.
 */
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { panelStyles } from '../panel-styles';
import type { HomeAssistant } from 'custom-card-helpers';
import {
  ucCloudAuthService,
  CloudUser,
} from '../../services/uc-cloud-auth-service';
import { ucCloudSyncService, SyncStatus } from '../../services/uc-cloud-sync-service';
import type { ProAuthData } from './hub-pro-tab';

type FormMode = 'signin' | 'register';

interface SyncCounts {
  colors: number;
  variables: number;
  presets: number;
  favorites: number;
}

@customElement('hub-account-tab')
export class HubAccountTab extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) auth: ProAuthData | null = null;
  @property({ attribute: false }) cloudUser: CloudUser | null = null;

  @state() private _formMode: FormMode = 'signin';
  @state() private _username = '';
  @state() private _password = '';
  @state() private _email = '';
  @state() private _displayName = '';
  @state() private _confirmPassword = '';
  @state() private _loading = false;
  @state() private _error = '';
  @state() private _autoConfigNote = '';
  @state() private _syncStatus: SyncStatus | null = null;
  @state() private _syncCounts: SyncCounts = { colors: 0, variables: 0, presets: 0, favorites: 0 };

  private _syncListener?: (status: SyncStatus) => void;

  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
        padding-bottom: 60px;
      }

      .account-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .account-card h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .account-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .form-tabs {
        display: flex;
        gap: 0;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .form-tabs button {
        padding: 10px 16px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        transition: color 0.2s ease;
      }

      .form-tabs button:hover {
        color: var(--primary-text-color);
      }

      .form-tabs button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .form-section {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-field label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
      }

      .form-field input {
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        box-sizing: border-box;
      }

      .form-field input:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      .form-submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 4px;
      }

      .form-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .form-submit ha-icon {
        --mdc-icon-size: 18px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .spinning {
        animation: spin 0.8s linear infinite;
      }

      .form-error {
        font-size: 13px;
        color: var(--error-color, #db4437);
        margin-top: 4px;
      }

      .form-note {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 8px;
      }

      .form-note a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .form-note a:hover {
        text-decoration: underline;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .user-info-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .user-info-row ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }

      .tier-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        margin-top: 8px;
      }

      .tier-badge.pro {
        background: linear-gradient(135deg, rgba(245, 87, 108, 0.2), rgba(240, 147, 251, 0.2));
        color: var(--primary-text-color);
      }

      .tier-badge.free {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        color: var(--primary-text-color);
      }

      .upgrade-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      }

      .upgrade-section h4 {
        margin: 0 0 12px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .upgrade-section p {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .upgrade-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, #f5576c, #f093fb);
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: opacity 0.15s ease;
      }

      .upgrade-btn:hover {
        opacity: 0.95;
      }

      .upgrade-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .manage-link {
        font-size: 13px;
        margin-top: 12px;
      }

      .manage-link a {
        color: var(--primary-color);
        text-decoration: none;
      }

      /* Password strength meter */
      .strength-meter {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }

      .strength-bar {
        display: flex;
        gap: 3px;
        flex: 1;
      }

      .strength-segment {
        height: 4px;
        flex: 1;
        border-radius: 2px;
        background: var(--divider-color, rgba(0, 0, 0, 0.12));
        transition: background 0.25s ease;
      }

      .strength-label {
        font-size: 11px;
        font-weight: 600;
        min-width: 58px;
        text-align: right;
        transition: color 0.2s ease;
      }

      /* Register notice */
      .register-notice {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.07);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        border-radius: 8px;
        padding: 12px 14px;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .register-notice ha-icon {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
        flex-shrink: 0;
        margin-top: 1px;
      }

      .form-submit-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: 8px;
        border: 1px solid var(--primary-color);
        background: none;
        color: var(--primary-color);
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
        transition: all 0.15s ease;
      }

      .form-submit-outline:hover {
        background: var(--primary-color);
        color: white;
      }

      .form-submit-outline ha-icon {
        --mdc-icon-size: 18px;
      }

      .form-submit-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 11px 18px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: white;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 4px;
        transition: opacity 0.15s ease;
      }

      .form-submit-btn:hover:not(:disabled) {
        opacity: 0.88;
      }

      .form-submit-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .form-submit-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      .spin {
        animation: spin 0.8s linear infinite;
      }

      .manage-link a:hover {
        text-decoration: underline;
      }

      .logout-btn {
        margin-top: 16px;
        padding: 8px 14px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 13px;
        cursor: pointer;
      }

      .logout-btn:hover {
        background: rgba(0, 0, 0, 0.05);
        color: var(--primary-text-color);
      }

      /* ── Sync Stats ─────────────────────────────────────────────────────── */
      .sync-stats-section {
        margin: 16px 0 4px;
        padding: 14px;
        border-radius: 10px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
      }

      .sync-stats-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .sync-stats-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .sync-stats-title ha-icon {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
      }

      .sync-stats-badge {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 2px 8px;
        border-radius: 20px;
      }

      .sync-stats-badge.pro {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }

      .sync-stats-badge.free {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        color: var(--primary-color);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
      }

      .sync-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .sync-stat-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 6px 8px;
        border-radius: 8px;
        background: var(--card-background-color, var(--ha-card-background));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.08));
        text-align: center;
        min-width: 0;
      }

      .sync-stat-icon ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
        opacity: 0.8;
      }

      .sync-stat-count {
        font-size: 22px;
        font-weight: 700;
        color: var(--primary-text-color);
        line-height: 1;
      }

      .sync-stat-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }

      .sync-stat-time {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        font-size: 10px;
        color: var(--secondary-text-color);
        opacity: 0.7;
        margin-top: 2px;
      }

      .sync-stat-time ha-icon {
        --mdc-icon-size: 11px;
      }

      .sync-now-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        border-radius: 7px;
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        color: var(--primary-color);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .sync-now-btn:hover:not(:disabled) {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.18);
      }

      .sync-now-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .sync-now-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .spin {
        animation: spin 0.8s linear infinite;
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this._syncStatus = ucCloudSyncService.getSyncStatus();
    this._refreshCounts();
    this._syncListener = (status: SyncStatus) => {
      this._syncStatus = status;
      this._refreshCounts();
    };
    ucCloudSyncService.addListener(this._syncListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._syncListener) ucCloudSyncService.removeListener(this._syncListener);
  }

  private _refreshCounts(): void {
    try {
      const colors = JSON.parse(localStorage.getItem('ultra-card-favorite-colors') ?? '[]');
      const variables = JSON.parse(localStorage.getItem('ultra-card-custom-variables') ?? '[]');
      const favorites = JSON.parse(localStorage.getItem('ultra-card-favorites') ?? '[]');
      const presets = JSON.parse(localStorage.getItem('ultra-card-presets') ?? '[]');
      this._syncCounts = {
        colors: Array.isArray(colors) ? colors.length : 0,
        variables: Array.isArray(variables) ? variables.length : 0,
        favorites: Array.isArray(favorites) ? favorites.length : 0,
        presets: Array.isArray(presets) ? presets.length : 0,
      };
    } catch {
      this._syncCounts = { colors: 0, variables: 0, presets: 0, favorites: 0 };
    }
  }

  private _formatSyncTime(date: Date | null): string {
    if (!date) return 'Never';
    const now = Date.now();
    const diff = now - date.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return date.toLocaleDateString();
  }

  private get _effectiveUser(): CloudUser | null {
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    if (integrationUser) return integrationUser;
    return this.cloudUser;
  }

  private _switchFormMode(mode: FormMode): void {
    this._formMode = mode;
    this._error = '';
    this._autoConfigNote = '';
  }

  private async _handleSignIn(e: Event): Promise<void> {
    e.preventDefault();
    const email = this._username.trim();
    if (!email || !this._password) {
      this._error = 'Please enter your email and password';
      return;
    }
    this._loading = true;
    this._error = '';
    this._autoConfigNote = '';

    try {
      // Single auth path: store credentials in HA config entry, coordinator handles JWT
      await ucCloudAuthService.loginViaHass(this.hass, email, this._password);
      this._username = '';
      this._password = '';
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      this._loading = false;
    }
  }

  private async _handleRegister(e: Event): Promise<void> {
    e.preventDefault();
    this._error = '';

    if (!this._username.trim() || !this._email.trim() || !this._password) {
      this._error = 'Please fill in all required fields.';
      return;
    }
    if (this._password !== this._confirmPassword) {
      this._error = 'Passwords do not match.';
      return;
    }
    if (this._password.length < 8) {
      this._error = 'Password must be at least 8 characters.';
      return;
    }

    this._loading = true;
    try {
      // Creates the ultracard.io account AND stores credentials in HA config entry
      await ucCloudAuthService.registerViaHass(
        this.hass,
        this._username.trim(),
        this._email.trim(),
        this._password,
      );
      this._username = '';
      this._email = '';
      this._password = '';
      this._confirmPassword = '';
      this._displayName = '';
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    } finally {
      this._loading = false;
    }
  }

  private _getPasswordStrength(password: string): {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
    color: string;
  } {
    if (!password) return { score: 0, label: '', color: '' };
    if (password.length < 8) return { score: 1, label: 'Too short', color: '#e74c3c' };

    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;

    if (score <= 1) return { score: 1, label: 'Very Weak', color: '#e74c3c' };
    if (score === 2) return { score: 2, label: 'Weak', color: '#f39c12' };
    if (score === 3) return { score: 3, label: 'Good', color: '#2980b9' };
    return { score: 4, label: 'Strong', color: '#27ae60' };
  }

  private async _handleLogout(): Promise<void> {
    await ucCloudAuthService.logoutViaHass(this.hass);
  }

  protected render(): TemplateResult {
    const user = this._effectiveUser;

    if (user) {
      return this._renderAuthenticated(user);
    }

    // If the Ultra Card Connect integration is not installed, show a setup guide.
    // Auth runs through the integration — it must be present.
    const integrationInstalled = ucCloudAuthService.isIntegrationInstalled(this.hass);
    if (!integrationInstalled) {
      return this._renderSetupGuide();
    }

    return this._renderUnauthenticated();
  }

  private _renderSetupGuide(): TemplateResult {
    return html`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:connection"></ha-icon>
          Connect Ultra Card
        </h3>
        <p style="font-size:13px;color:var(--secondary-text-color);line-height:1.6;margin:0 0 20px;">
          Ultra Card uses the <strong>Ultra Card Connect</strong> integration to securely
          store your account credentials in Home Assistant — so your login persists across
          any device and browser, with no local storage needed.
        </p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
            <ha-icon icon="mdi:numeric-1-circle" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
            <span>Install <strong>Ultra Card Connect</strong> via HACS → Integrations</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
            <ha-icon icon="mdi:numeric-2-circle" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
            <span>Add it under <strong>Settings → Integrations → Add Integration</strong>, or click below</span>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;font-size:13px;">
            <ha-icon icon="mdi:numeric-3-circle" style="color:var(--primary-color);flex-shrink:0;margin-top:1px;"></ha-icon>
            <span>Come back here to sign in — your account stays logged in permanently</span>
          </div>
        </div>
        <a
          href="/config/integrations/integration/ultra_card_pro_cloud"
          style="display:inline-flex;align-items:center;gap:6px;margin-top:20px;padding:9px 16px;
                 background:var(--primary-color);color:white;border-radius:8px;font-size:13px;
                 font-weight:500;text-decoration:none;"
        >
          <ha-icon icon="mdi:plus-circle" style="--mdc-icon-size:16px;"></ha-icon>
          Set Up Integration
        </a>
      </div>
    `;
  }

  private _renderAuthenticated(user: CloudUser): TemplateResult {
    const isPro =
      user.subscription?.tier === 'pro' && user.subscription?.status === 'active';

    return html`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:account-circle"></ha-icon>
          Account
        </h3>
        <div class="user-info">
          <div class="user-info-row">
            <ha-icon icon="mdi:account"></ha-icon>
            <span>${user.displayName || user.username}</span>
          </div>
          <div class="user-info-row">
            <ha-icon icon="mdi:email-outline"></ha-icon>
            <span>${user.email}</span>
          </div>
          <div class="tier-badge ${isPro ? 'pro' : 'free'}">
            ${isPro ? html`<ha-icon icon="mdi:star" style="--mdc-icon-size:14px"></ha-icon>` : ''}
            ${isPro ? 'Pro' : 'Free'}
          </div>
        </div>

        ${this._renderSyncStats(isPro)}

        ${!isPro
          ? html`
              <div class="upgrade-section">
                <h4>Upgrade to Ultra Card Pro</h4>
                <p>
                  Unlock dashboard snapshots, auto-backups, and all Pro modules. Sync across devices.
                </p>
                <a
                  class="upgrade-btn"
                  href="https://ultracard.io/product/ultra-card-pro/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ha-icon icon="mdi:star"></ha-icon>
                  Upgrade to Pro
                </a>
              </div>
            `
          : html`
              <div class="manage-link">
                <a href="https://ultracard.io/dashboard/" target="_blank" rel="noopener noreferrer">
                  Manage account at ultracard.io
                </a>
              </div>
            `}

        <button class="logout-btn" @click=${this._handleLogout}>Sign out</button>
      </div>
    `;
  }

  private _renderSyncStats(isPro: boolean): TemplateResult {
    const s = this._syncStatus;
    const syncing = s?.isSyncing ?? false;
    const lastColors    = this._formatSyncTime(s?.lastColorsSync ?? null);
    const lastVariables = this._formatSyncTime(s?.lastVariablesSync ?? null);
    const lastFavorites = this._formatSyncTime(s?.lastFavoritesSync ?? null);

    const stats: Array<{ icon: string; label: string; count: number; lastSync: string; proOnly?: boolean }> = [
      { icon: 'mdi:palette',       label: 'Colors',    count: this._syncCounts.colors,    lastSync: lastColors },
      { icon: 'mdi:variable',      label: 'Variables', count: this._syncCounts.variables, lastSync: lastVariables },
      { icon: 'mdi:heart',         label: 'Favorites', count: this._syncCounts.favorites, lastSync: lastFavorites },
      { icon: 'mdi:view-dashboard',label: 'Presets',   count: this._syncCounts.presets,   lastSync: '—', proOnly: false },
    ];

    return html`
      <div class="sync-stats-section">
        <div class="sync-stats-header">
          <span class="sync-stats-title">
            <ha-icon icon="mdi:cloud-sync"></ha-icon>
            Cloud Sync
          </span>
          <span class="sync-stats-badge ${isPro ? 'pro' : 'free'}">
            ${isPro ? 'Pro' : 'Free'}
          </span>
        </div>

        <div class="sync-stats-grid">
          ${stats.map(({ icon, label, count, lastSync }) => html`
            <div class="sync-stat-card">
              <div class="sync-stat-icon">
                <ha-icon icon=${icon}></ha-icon>
              </div>
              <div class="sync-stat-body">
                <div class="sync-stat-count">${count}</div>
                <div class="sync-stat-label">${label}</div>
                ${lastSync !== '—' ? html`
                  <div class="sync-stat-time">
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${lastSync}
                  </div>
                ` : ''}
              </div>
            </div>
          `)}
        </div>

        <button
          class="sync-now-btn"
          ?disabled=${syncing}
          @click=${async () => {
            await ucCloudSyncService.syncAll();
            this._refreshCounts();
          }}
        >
          <ha-icon icon="mdi:${syncing ? 'loading' : 'cloud-upload'}" class="${syncing ? 'spin' : ''}"></ha-icon>
          ${syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </div>
    `;
  }

  private _renderUnauthenticated(): TemplateResult {
    return html`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:login"></ha-icon>
          Sign in or create an account
        </h3>
        <p class="form-note" style="margin: 0 0 16px 0;">
          Sign in to cloud-save favorites, colors, and presets. Upgrade to Pro for full features.
        </p>

        <div class="form-tabs">
          <button
            class="${this._formMode === 'signin' ? 'active' : ''}"
            @click=${() => this._switchFormMode('signin')}
          >
            Sign In
          </button>
          <button
            class="${this._formMode === 'register' ? 'active' : ''}"
            @click=${() => this._switchFormMode('register')}
          >
            Create account
          </button>
        </div>

        ${this._formMode === 'signin' ? this._renderSignInForm() : this._renderRegisterForm()}
      </div>
    `;
  }

  private _renderSignInForm(): TemplateResult {
    return html`
      <form class="form-section" @submit=${this._handleSignIn}>
        <div class="form-field">
          <label for="account-signin-username">Username or email</label>
          <input
            id="account-signin-username"
            type="text"
            .value=${this._username}
            @input=${(e: Event) => {
              this._username = (e.target as HTMLInputElement).value;
              this._error = '';
            }}
            autocomplete="username"
            ?disabled=${this._loading}
          />
        </div>
        <div class="form-field">
          <label for="account-signin-password">Password</label>
          <input
            id="account-signin-password"
            type="password"
            .value=${this._password}
            @input=${(e: Event) => {
              this._password = (e.target as HTMLInputElement).value;
              this._error = '';
            }}
            autocomplete="current-password"
            ?disabled=${this._loading}
          />
        </div>
        <p class="form-note">
          <a href="https://ultracard.io/wp-login.php?action=lostpassword" target="_blank" rel="noopener">
            Forgot password?
          </a>
        </p>
        ${this._error ? html`<p class="form-error">${this._error}</p>` : ''}
        ${this._autoConfigNote ? html`<p class="form-note">${this._autoConfigNote}</p>` : ''}
        <button type="submit" class="form-submit" ?disabled=${this._loading}>
          ${this._loading
            ? html`<ha-icon icon="mdi:loading" class="spinning"></ha-icon> Signing in…`
            : html`<ha-icon icon="mdi:login"></ha-icon> Sign In`}
        </button>
      </form>
    `;
  }

  private _renderRegisterForm(): TemplateResult {
    const strength = this._getPasswordStrength(this._password);

    return html`
      <form class="form-section" @submit=${this._handleRegister}>
        <div class="register-notice">
          <ha-icon icon="mdi:cloud-check"></ha-icon>
          <span>
            Create a free account to cloud-sync your Favorites, Colors &amp; Variables across devices.
            Upgrade to Pro anytime for advanced features.
          </span>
        </div>
        <div class="form-field">
          <label for="account-reg-display">Display name</label>
          <input
            id="account-reg-display"
            type="text"
            .value=${this._displayName}
            @input=${(e: Event) => { this._displayName = (e.target as HTMLInputElement).value; }}
            autocomplete="name"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-email">Email</label>
          <input
            id="account-reg-email"
            type="email"
            .value=${this._email}
            @input=${(e: Event) => { this._email = (e.target as HTMLInputElement).value; }}
            autocomplete="email"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-username">Username</label>
          <input
            id="account-reg-username"
            type="text"
            .value=${this._username}
            @input=${(e: Event) => { this._username = (e.target as HTMLInputElement).value; }}
            autocomplete="username"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-password">Password</label>
          <input
            id="account-reg-password"
            type="password"
            .value=${this._password}
            @input=${(e: Event) => {
              this._password = (e.target as HTMLInputElement).value;
            }}
            autocomplete="new-password"
            placeholder="At least 8 characters"
          />
          ${this._password
            ? html`
                <div class="strength-meter">
                  <div class="strength-bar">
                    ${[1, 2, 3, 4].map(
                      i => html`<div
                        class="strength-segment"
                        style="background: ${strength.score >= i ? strength.color : ''}"
                      ></div>`
                    )}
                  </div>
                  ${strength.label
                    ? html`<span class="strength-label" style="color: ${strength.color}"
                        >${strength.label}</span
                      >`
                    : ''}
                </div>
              `
            : ''}
        </div>
        <div class="form-field">
          <label for="account-reg-confirm">Confirm password</label>
          <input
            id="account-reg-confirm"
            type="password"
            .value=${this._confirmPassword}
            @input=${(e: Event) => { this._confirmPassword = (e.target as HTMLInputElement).value; }}
            autocomplete="new-password"
          />
          ${this._confirmPassword && this._password !== this._confirmPassword
            ? html`<p class="form-error" style="margin:4px 0 0">Passwords do not match</p>`
            : ''}
        </div>
        ${this._error ? html`<p class="form-error">${this._error}</p>` : ''}
        <button
          type="submit"
          class="form-submit-btn"
          ?disabled=${this._loading || !this._username || !this._email || !this._password || this._password !== this._confirmPassword}
        >
          ${this._loading
            ? html`<ha-icon icon="mdi:loading" class="spin"></ha-icon> Creating account…`
            : html`<ha-icon icon="mdi:account-plus"></ha-icon> Create Account`}
        </button>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hub-account-tab': HubAccountTab;
  }
}
