/**
 * Ultra Card Hub — Account tab.
 * Sign in, register, and upgrade to Pro. Shown to all users.
 */
import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { panelStyles } from '../panel-styles';
import type { HomeAssistant } from 'custom-card-helpers';
import {
  ucCloudAuthService,
  CloudUser,
} from '../../services/uc-cloud-auth-service';
import { ucCloudSyncService, SyncStatus } from '../../services/uc-cloud-sync-service';
import {
  downloadDiagnosticsJson,
  fetchConnectDiagnostics,
  type ConnectDiagnosticsReport,
} from '../../services/uc-connect-diagnostics';
import { getConnectInfo } from '../../services/uc-connect-compatibility';
import {
  fetchBillingSummary,
  formatBillingDate,
  formatMoney,
  type BillingSummary,
} from '../../services/uc-billing-service';
import { VERSION } from '../../version';
import './hub-pro-tab';
import type { ProAuthData } from './hub-pro-tab';

type FormMode = 'signin' | 'register';
type AccountView = 'overview' | 'tools' | 'diagnostics';

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
  @state() private _loading = false;
  @state() private _error = '';
  @state() private _autoConfigNote = '';
  @state() private _syncStatus: SyncStatus | null = null;
  @state() private _syncCounts: SyncCounts = { colors: 0, variables: 0, presets: 0, favorites: 0 };
  @state() private _diagLoading = false;
  @state() private _diagError = '';
  @state() private _diagReport: ConnectDiagnosticsReport | null = null;
  @state() private _billing: BillingSummary | null = null;
  @state() private _billingLoading = false;
  @state() private _billingError = '';
  @state() private _view: AccountView = 'overview';
  private _billingRequested = false;

  private _syncListener: ((status: SyncStatus) => void) | undefined;

  static override styles = [
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

      .admin-notice {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        margin-bottom: 20px;
        border-radius: 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
      }

      .admin-notice ha-icon {
        --mdc-icon-size: 22px;
        color: var(--primary-color);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .admin-notice strong {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .admin-notice p {
        margin: 0;
        color: var(--secondary-text-color);
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

      .account-subnav {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 20px;
      }

      .account-subnav button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 20px;
        background: transparent;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
      }

      .account-subnav button ha-icon {
        --mdc-icon-size: 16px;
      }

      .account-subnav button.active {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
        border-color: rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
        color: var(--primary-color);
        font-weight: 600;
      }

      .billing-rows {
        margin-bottom: 4px;
      }

      .billing-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        font-size: 13px;
      }

      .billing-row.invoice {
        display: grid;
        grid-template-columns: 1.4fr auto 1fr auto;
        justify-items: start;
      }

      .billing-row.invoice > :nth-child(3) {
        justify-self: end;
      }

      .billing-row.invoice > :last-child {
        justify-self: end;
      }

      .billing-label {
        color: var(--secondary-text-color);
      }

      .billing-value {
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .billing-pill {
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: capitalize;
        background: rgba(158, 158, 158, 0.15);
        color: var(--secondary-text-color);
      }

      .billing-pill.ok {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }

      .billing-pill.warn {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;
      }

      .billing-pill.bad {
        background: rgba(244, 67, 54, 0.12);
        color: #f44336;
      }

      .billing-invoices {
        margin-top: 14px;
      }

      .billing-invoices-title {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }

      .billing-link {
        font-size: 12px;
        font-weight: 600;
        color: var(--primary-color);
        text-decoration: none;
      }

      .billing-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      .billing-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 7px;
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
        color: var(--primary-color);
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
      }

      .billing-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      .billing-note {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 12px 0 0;
        line-height: 1.5;
      }
    `,
  ];

  override connectedCallback() {
    super.connectedCallback();
    this._syncStatus = ucCloudSyncService.getSyncStatus();
    this._refreshCounts();
    this._syncListener = (status: SyncStatus) => {
      this._syncStatus = status;
      this._refreshCounts();
    };
    ucCloudSyncService.addListener(this._syncListener);
  }

  override disconnectedCallback() {
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
    this._autoConfigNote = '';

    if (!this._username.trim() || !this._email.trim()) {
      this._error = 'Please fill in all required fields.';
      return;
    }

    this._loading = true;
    try {
      const message = await ucCloudAuthService.registerViaHass(
        this.hass,
        this._username.trim(),
        this._email.trim(),
        this._displayName.trim(),
      );
      this._username = '';
      this._email = '';
      this._displayName = '';
      this._autoConfigNote =
        message ||
        'Account created. Check your email inbox, junk, or spam for the ultracard.io message to finish setting your password, then come back here to sign in.';
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    } finally {
      this._loading = false;
    }
  }

  private async _handleLogout(): Promise<void> {
    await ucCloudAuthService.logoutViaHass(this.hass);
  }

  override updated(): void {
    // Billing goes through the Connect proxy (HA-admin only); fetch once per mount
    // as soon as the signed-in user is known.
    if (!this._billingRequested && this._effectiveUser && this._isHaAdmin()) {
      this._billingRequested = true;
      void this._loadBilling();
    }
  }

  private async _loadBilling(): Promise<void> {
    this._billingLoading = true;
    this._billingError = '';
    try {
      this._billing = await fetchBillingSummary();
    } catch (err) {
      this._billingError = err instanceof Error ? err.message : 'Could not load billing details';
    } finally {
      this._billingLoading = false;
    }
  }

  private _billingStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (['active', 'completed', 'paid', 'processing'].includes(s)) return 'ok';
    if (['on-hold', 'pending', 'pending-cancel'].includes(s)) return 'warn';
    if (['cancelled', 'expired', 'failed', 'refunded'].includes(s)) return 'bad';
    return '';
  }

  private _renderBilling(): TemplateResult | typeof nothing {
    // Nothing billable: free account with no order history.
    const woo = this._billing?.woocommerce;
    const invoices = this._billing?.invoices ?? [];
    if (!this._billingLoading && !this._billingError && !woo && invoices.length === 0) {
      return nothing;
    }

    const period =
      woo?.billing_interval && woo.billing_interval !== '1'
        ? `every ${woo.billing_interval} ${woo.billing_period || 'month'}s`
        : `/ ${woo?.billing_period || 'month'}`;

    return html`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:credit-card-outline"></ha-icon>
          Billing
        </h3>
        ${this._billingLoading
          ? html`<p class="billing-note">Loading billing details…</p>`
          : this._billingError
            ? html`<p class="billing-note">
                ${this._billingError} —
                <a href="https://ultracard.io/my-account/" target="_blank" rel="noopener noreferrer">
                  manage billing at ultracard.io
                </a>
              </p>`
            : html`
                ${woo
                  ? html`
                      <div class="billing-rows">
                        <div class="billing-row">
                          <span class="billing-label">Plan</span>
                          <span class="billing-value">
                            Ultra Card Pro · ${formatMoney(woo.total, woo.currency)} ${period}
                          </span>
                        </div>
                        <div class="billing-row">
                          <span class="billing-label">Status</span>
                          <span class="billing-pill ${this._billingStatusClass(woo.status)}">
                            ${woo.status || 'unknown'}
                          </span>
                        </div>
                        <div class="billing-row">
                          <span class="billing-label">Next payment</span>
                          <span class="billing-value">${formatBillingDate(woo.next_payment_date)}</span>
                        </div>
                        <div class="billing-row">
                          <span class="billing-label">Last payment</span>
                          <span class="billing-value">${formatBillingDate(woo.last_payment_date)}</span>
                        </div>
                        ${woo.payment_method_title
                          ? html`
                              <div class="billing-row">
                                <span class="billing-label">Payment method</span>
                                <span class="billing-value">${woo.payment_method_title}</span>
                              </div>
                            `
                          : nothing}
                      </div>
                    `
                  : nothing}
                ${invoices.length > 0
                  ? html`
                      <div class="billing-invoices">
                        <div class="billing-invoices-title">Recent invoices</div>
                        ${invoices.slice(0, 6).map(
                          inv => html`
                            <div class="billing-row invoice">
                              <span class="billing-value">${formatBillingDate(inv.date)}</span>
                              <span class="billing-pill ${this._billingStatusClass(inv.status)}">
                                ${inv.status}
                              </span>
                              <span class="billing-value">${formatMoney(inv.total, inv.currency)}</span>
                              ${inv.invoice_url
                                ? html`
                                    <a
                                      class="billing-link"
                                      href=${inv.invoice_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View
                                    </a>
                                  `
                                : html`<span></span>`}
                            </div>
                          `
                        )}
                      </div>
                    `
                  : nothing}
                <div class="billing-actions">
                  ${woo?.view_subscription_url
                    ? html`
                        <a
                          class="billing-btn"
                          href=${woo.view_subscription_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ha-icon icon="mdi:autorenew"></ha-icon>
                          Manage subscription
                        </a>
                      `
                    : nothing}
                  <a
                    class="billing-btn"
                    href="https://ultracard.io/my-account/payment-methods/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ha-icon icon="mdi:credit-card-edit-outline"></ha-icon>
                    Payment methods
                  </a>
                </div>
                <p class="billing-note">
                  Payment changes and cancellations are completed securely on ultracard.io.
                </p>
              `}
      </div>
    `;
  }

  private async _runDiagnostics(download: boolean): Promise<void> {
    if (!this._isHaAdmin()) {
      this._diagError = 'Only Home Assistant administrators can run Connect diagnostics.';
      return;
    }
    this._diagLoading = true;
    this._diagError = '';
    try {
      const report = await fetchConnectDiagnostics(this.hass, { runConnectivity: true });
      this._diagReport = report;
      if (download) downloadDiagnosticsJson(report);
    } catch (err) {
      const fallback = (err as { fallback?: ConnectDiagnosticsReport })?.fallback;
      if (fallback) {
        this._diagReport = fallback;
        // Still download a useful report when the API is missing (old Connect).
        if (download) downloadDiagnosticsJson(fallback);
      }
      this._diagError = err instanceof Error ? err.message : 'Failed to load diagnostics';
    } finally {
      this._diagLoading = false;
    }
  }

  private _renderDiagnostics(): TemplateResult {
    const info = getConnectInfo(this.hass);
    const liveUser = this._effectiveUser;
    const entry = (this._diagReport?.entries?.[0] || {}) as Record<string, any>;
    const coord = (entry.coordinator || {}) as Record<string, any>;
    const connectivity = (entry.connectivity || {}) as Record<string, any>;
    const signedIn =
      typeof coord.authenticated === 'boolean' ? coord.authenticated : Boolean(liveUser);
    const tokenLabel =
      coord.token_present === true
        ? 'Present (server-side)'
        : coord.token_present === false
          ? 'Missing'
          : signedIn
            ? 'Managed by Connect'
            : 'Missing';

    const tiles: Array<{ label: string; value: string; ok?: boolean }> = [
      {
        label: 'Connect version',
        value:
          info.integrationVersion ||
          (this._diagReport?.integration_version as string) ||
          (info.installed ? 'pre-1.6.0 (update required)' : 'not installed'),
        ok: info.installed && !info.outdated,
      },
      {
        label: 'Card version',
        value: VERSION,
      },
      {
        label: 'Signed in',
        value: signedIn ? 'Yes' : 'No',
        ok: signedIn,
      },
      {
        label: 'Token',
        value: tokenLabel,
        ok: signedIn ? true : false,
      },
      {
        label: 'Cloud reachability',
        value: connectivity.api
          ? 'OK'
          : connectivity.bot_challenge
            ? 'Blocked by bot protection'
            : connectivity.errors?.length
              ? 'Failed'
              : this._diagReport?.source === 'api'
                ? 'Not tested'
                : this._diagReport
                  ? 'Unavailable (update Connect)'
                  : 'Run diagnostics',
        ok: connectivity.api === true,
      },
      {
        label: 'Last success',
        value:
          typeof coord.last_successful_age_seconds === 'number'
            ? `${Math.round(coord.last_successful_age_seconds)}s ago`
            : coord.last_poll || coord.connected_at || '—',
      },
    ];

    return html`
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:stethoscope"></ha-icon>
          Connect diagnostics
        </h3>
        <p style="font-size:13px;color:var(--secondary-text-color);line-height:1.5;margin:0 0 16px;">
          Check authentication, cloud reachability, and integration version. Downloads never include
          passwords or JWT tokens.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px;">
          ${tiles.map(
            t => html`
              <div
                style="border:1px solid var(--divider-color);border-radius:10px;padding:10px 12px;background:var(--secondary-background-color, transparent);"
              >
                <div style="font-size:11px;color:var(--secondary-text-color);margin-bottom:4px;">
                  ${t.label}
                </div>
                <div style="font-size:13px;font-weight:600;color:${t.ok === false
                  ? 'var(--error-color, #f44336)'
                  : t.ok === true
                    ? 'var(--success-color, #4caf50)'
                    : 'var(--primary-text-color)'};">
                  ${t.value}
                </div>
              </div>
            `
          )}
        </div>
        ${this._diagError
          ? html`<div class="error-message" style="margin-bottom:12px;">${this._diagError}</div>`
          : ''}
        ${connectivity.bot_challenge || coord.last_error
          ? html`<div class="error-message" style="margin-bottom:12px;">
              ${connectivity.bot_challenge
                ? (connectivity.errors || []).join(' ')
                : coord.last_error}
            </div>`
          : ''}
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          <button
            class="sync-now-btn"
            style="width:auto;padding:8px 14px;"
            ?disabled=${this._diagLoading || !this._isHaAdmin()}
            @click=${() => this._runDiagnostics(false)}
          >
            <ha-icon
              icon="mdi:${this._diagLoading ? 'loading' : 'refresh'}"
              class="${this._diagLoading ? 'spin' : ''}"
            ></ha-icon>
            ${this._diagLoading ? 'Running…' : 'Run diagnostics'}
          </button>
          <button
            class="sync-now-btn"
            style="width:auto;padding:8px 14px;"
            ?disabled=${this._diagLoading || !this._isHaAdmin()}
            @click=${() => this._runDiagnostics(true)}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            Download report
          </button>
        </div>
      </div>
    `;
  }

  private _isHaAdmin(): boolean {
    return Boolean(this.hass?.user?.is_admin);
  }

  private _renderAdminNotice(): TemplateResult | typeof nothing {
    if (this._isHaAdmin()) return nothing;
    return html`
      <div class="admin-notice" role="note">
        <ha-icon icon="mdi:shield-account-outline"></ha-icon>
        <div>
          <strong>Home Assistant administrator required</strong>
          <p>
            Shared sign-in, cloud sync, and uploads through Ultra Card Connect are managed by
            HA administrators only. You can still use Hub presets, colors, and documentation.
          </p>
        </div>
      </div>
    `;
  }

  protected override render(): TemplateResult {
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
      ${this._renderDiagnostics()}
    `;
  }

  private _renderAuthenticated(user: CloudUser): TemplateResult {
    const isPro =
      user.subscription?.tier === 'pro' && user.subscription?.status === 'active';
    // "Pro tools" only exists for Pro users; fall back if the tier changed.
    const view: AccountView = this._view === 'tools' && !isPro ? 'overview' : this._view;
    const views: Array<{ key: AccountView; label: string; icon: string }> = [
      { key: 'overview', label: 'Overview', icon: 'mdi:account-circle' },
      ...(isPro ? [{ key: 'tools' as AccountView, label: 'Pro Tools', icon: 'mdi:tools' }] : []),
      { key: 'diagnostics', label: 'Diagnostics', icon: 'mdi:stethoscope' },
    ];

    return html`
      ${this._renderAdminNotice()}
      <div class="account-subnav" role="tablist" aria-label="Account sections">
        ${views.map(
          v => html`
            <button
              role="tab"
              aria-selected=${view === v.key ? 'true' : 'false'}
              class=${view === v.key ? 'active' : ''}
              @click=${() => {
                this._view = v.key;
              }}
            >
              <ha-icon icon=${v.icon}></ha-icon>
              ${v.label}
            </button>
          `
        )}
      </div>
      ${view === 'overview'
        ? this._renderOverview(user, isPro)
        : view === 'tools'
          ? html`<hub-pro-tab
              .hass=${this.hass}
              .auth=${this.auth}
              .cloudUser=${this.cloudUser}
            ></hub-pro-tab>`
          : this._renderDiagnostics()}
    `;
  }

  private _renderOverview(user: CloudUser, isPro: boolean): TemplateResult {
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
          ${this.auth?.subscription_expires != null
            ? html`
                <div class="user-info-row">
                  <ha-icon icon="mdi:calendar-refresh"></ha-icon>
                  <span>
                    Renews
                    ${new Date(this.auth.subscription_expires * 1000).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              `
            : nothing}
          <div class="tier-badge ${isPro ? 'pro' : 'free'}">
            ${isPro ? html`<ha-icon icon="mdi:star" style="--mdc-icon-size:14px"></ha-icon>` : ''}
            ${isPro ? 'Pro' : 'Free'}
          </div>
        </div>

        ${this._renderSyncStats(isPro)}

        ${isPro
          ? html`
              <div class="manage-link">
                <a href="https://ultracard.io/dashboard/" target="_blank" rel="noopener noreferrer">
                  Manage account at ultracard.io
                </a>
              </div>
            `
          : nothing}

        <button class="logout-btn" @click=${this._handleLogout}>Sign out</button>
      </div>
      ${this._renderBilling()}
      ${!isPro
        ? html`<hub-pro-tab
            .hass=${this.hass}
            .auth=${this.auth}
            .cloudUser=${this.cloudUser}
          ></hub-pro-tab>`
        : nothing}
    `;
  }

  private _renderSyncStats(isPro: boolean): TemplateResult {
    const s = this._syncStatus;
    const syncing = s?.isSyncing ?? false;
    const lastColors    = this._formatSyncTime(s?.lastColorsSync ?? null);
    const lastVariables = this._formatSyncTime(s?.lastVariablesSync ?? null);
    const lastFavorites = this._formatSyncTime(s?.lastFavoritesSync ?? null);

    const stats: Array<{ icon: string; label: string; count: number; lastSync: string; proOnly?: boolean }> = [
      // Colours are listed here only once they really sync; showing a count under
      // "Cloud Sync" implied those colours were backed up when they were not.
      ...(ucCloudSyncService.isColorSyncAvailable()
        ? [{ icon: 'mdi:palette', label: 'Colors', count: this._syncCounts.colors, lastSync: lastColors }]
        : []),
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
      ${this._renderAdminNotice()}
      <div class="account-card">
        <h3>
          <ha-icon icon="mdi:login"></ha-icon>
          Sign in or create an account
        </h3>
        <p class="form-note" style="margin: 0 0 16px 0;">
          Sign in to cloud-save favorites and presets. Upgrade to Pro for full features.
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
      ${this._renderDiagnostics()}
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
    return html`
      <form class="form-section" @submit=${this._handleRegister}>
        <div class="register-notice">
          <ha-icon icon="mdi:cloud-check"></ha-icon>
          <span>
            Create a free account to cloud-sync your Favorites, Colors &amp; Variables across devices.
            After you register, we will email you from ultracard.io so you can set your password.
          </span>
        </div>
        <div class="form-field">
          <label for="account-reg-display">Display name</label>
          <input
            id="account-reg-display"
            type="text"
            .value=${this._displayName}
            @input=${(e: Event) => {
              this._displayName = (e.target as HTMLInputElement).value;
              this._error = '';
              this._autoConfigNote = '';
            }}
            autocomplete="name"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-email">Email</label>
          <input
            id="account-reg-email"
            type="email"
            .value=${this._email}
            @input=${(e: Event) => {
              this._email = (e.target as HTMLInputElement).value;
              this._error = '';
              this._autoConfigNote = '';
            }}
            autocomplete="email"
          />
        </div>
        <div class="form-field">
          <label for="account-reg-username">Username</label>
          <input
            id="account-reg-username"
            type="text"
            .value=${this._username}
            @input=${(e: Event) => {
              this._username = (e.target as HTMLInputElement).value;
              this._error = '';
              this._autoConfigNote = '';
            }}
            autocomplete="username"
          />
        </div>
        ${this._error ? html`<p class="form-error">${this._error}</p>` : ''}
        ${this._autoConfigNote ? html`<p class="form-note">${this._autoConfigNote}</p>` : ''}
        <button
          type="submit"
          class="form-submit-btn"
          ?disabled=${this._loading || !this._username.trim() || !this._email.trim()}
        >
          ${this._loading
            ? html`<ha-icon icon="mdi:loading" class="spin"></ha-icon> Creating account…`
            : html`<ha-icon icon="mdi:email-fast"></ha-icon> Create Account`}
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
