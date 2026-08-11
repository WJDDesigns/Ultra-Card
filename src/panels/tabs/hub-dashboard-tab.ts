/**
 * Ultra Card Hub – Dashboard tab (welcome, stats, changelog).
 */
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from '../panel-styles';
import { ucDashboardScannerService } from '../../services/uc-dashboard-scanner-service';
import { ucCloudAuthService, type CloudUser } from '../../services/uc-cloud-auth-service';
import { ucPresetAuthorService, type AuthorPreset } from '../../services/uc-preset-author-service';
import { VERSION } from '../../version';
import { dispatchHubNavigate } from '../hub-navigation';
import { localize } from '../../localize/localize';

const SENSOR_ENTITY = 'sensor.ultra_card_pro_cloud_authentication_status';

interface DashboardStats {
  cardCount: number;
  viewCount: number;
  dashboardCount: number;
}

@customElement('hub-dashboard-tab')
export class HubDashboardTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _stats: DashboardStats | null = null;
  @state() private _statsLoading = true;
  @state() private _statsError = '';
  @state() private _changelogBody = '';
  @state() private _changelogLoading = true;
  @state() private _changelogError = '';
  @state() private _changelogTitle = '';
  @state() private _authorPresets: AuthorPreset[] = [];
  @state() private _authorPresetsLoaded = false;

  private _authListener: ((user: CloudUser | null) => void) | undefined;
  static override styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      .welcome-hero {
        text-align: center;
        padding: 32px 24px 28px;
        margin-bottom: 24px;
        background: linear-gradient(135deg, rgba(var(--rgb-primary-color, 3, 169, 244), 0.08), rgba(var(--rgb-primary-color, 3, 169, 244), 0.02));
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        border-radius: 16px;
      }

      .welcome-hero h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--primary-text-color);
      }

      .welcome-hero p {
        margin: 0;
        font-size: 15px;
        color: var(--secondary-text-color);
        line-height: 1.5;
        max-width: 520px;
        margin-left: auto;
        margin-right: auto;
      }

      .stats-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 20px 24px;
        margin-bottom: 24px;
      }

      .stats-card h3 {
        margin: 0 0 16px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .stats-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
      }

      .stat-item {
        padding: 12px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
        text-align: center;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--primary-color);
        line-height: 1.2;
      }

      .stat-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .stats-loading,
      .stats-error {
        padding: 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .stats-error {
        color: var(--error-color, #f44336);
      }

      .changelog-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .changelog-card h3 {
        margin: 0 0 16px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .changelog-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .changelog-list {
        margin: 0;
        padding-left: 20px;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.7;
      }

      .changelog-list li {
        margin-bottom: 6px;
      }

      .changelog-body {
        margin-top: 12px;
        padding: 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        border-radius: 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.6;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 320px;
        overflow-y: auto;
      }

      .changelog-body-loading,
      .changelog-body-error {
        padding: 16px;
        text-align: center;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .changelog-body-error {
        color: var(--error-color, #f44336);
      }

      .version-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-color);
        margin-top: 8px;
      }

      .version-badge ha-icon {
        --mdc-icon-size: 16px;
      }

      .command-center {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .command-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 18px 20px;
      }

      .command-card h3 {
        margin: 0 0 10px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--primary-text-color);
      }

      .command-card p {
        margin: 0 0 12px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
      }

      .status-pill.connected {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }

      .status-pill.disconnected {
        background: rgba(244, 67, 54, 0.12);
        color: #f44336;
      }

      .status-pill.unknown {
        background: rgba(158, 158, 158, 0.15);
        color: var(--secondary-text-color);
      }

      .status-pill.warning {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;
      }

      .quick-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .quick-links button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--primary-text-color);
        font-size: 12px;
        cursor: pointer;
      }

      .quick-links button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .author-prompt {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        margin-bottom: 24px;
        border-radius: 12px;
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.25);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }

      .author-prompt ha-icon {
        --mdc-icon-size: 22px;
        color: var(--primary-color);
        flex-shrink: 0;
        margin-top: 2px;
      }

      .author-prompt-body {
        flex: 1;
        min-width: 0;
      }

      .author-prompt-body p {
        margin: 0 0 8px;
        font-size: 14px;
        line-height: 1.45;
        color: var(--primary-text-color);
      }

      .author-prompt-body button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 8px;
        border: 1px solid var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }

      .author-prompt-body button:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.1);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this._loadStats();
    this._loadChangelog();
    this._authListener = () => {
      void this._loadAuthorPresets();
    };
    ucCloudAuthService.addListener(this._authListener);
    void this._loadAuthorPresets();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = undefined;
    }
  }

  private _lang(): string {
    return this.hass?.locale?.language ?? 'en';
  }

  private _t(key: string, fallback: string): string {
    return localize(key, this._lang(), fallback);
  }

  private async _loadAuthorPresets(): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) {
      this._authorPresets = [];
      this._authorPresetsLoaded = true;
      return;
    }
    try {
      this._authorPresets = await ucPresetAuthorService.listMine();
    } catch {
      // Non-admins get 403; ignore quietly on the dashboard
      this._authorPresets = [];
    } finally {
      this._authorPresetsLoaded = true;
    }
  }

  private _authorAttention(): { awaiting: number; changes: number } {
    let awaiting = 0;
    let changes = 0;
    for (const p of this._authorPresets) {
      if (p.review_status === 'changes_requested') changes += 1;
      else if (p.review_status === 'pending' || p.has_pending_revision) awaiting += 1;
    }
    return { awaiting, changes };
  }

  private _openMyPresets(): void {
    dispatchHubNavigate(this, { tab: 'presets', presetsView: 'mine' });
  }

  private _connectionStatus(): {
    label: string;
    className: string;
    detail: string;
    needsReauth: boolean;
    lastPoll: string;
    subStatus: string;
  } {
    const sensor = this.hass?.states?.[SENSOR_ENTITY];
    if (!sensor) {
      return {
        label: 'Not configured',
        className: 'unknown',
        detail: 'Install Ultra Card Connect to sync your account and Pro features.',
        needsReauth: false,
        lastPoll: '',
        subStatus: '',
      };
    }
    const attrs = sensor.attributes ?? {};
    const needsReauth = Boolean(attrs.needs_reauth);
    const lastPoll = (attrs.last_poll as string) || '';
    const subStatus = (attrs.subscription_status as string) || '';
    if (needsReauth) {
      return {
        label: 'Reconfiguration needed',
        className: 'warning',
        detail:
          'Ultra Card Connect needs updated credentials. Open the integration to reconfigure.',
        needsReauth: true,
        lastPoll,
        subStatus,
      };
    }
    if (sensor.state === 'connected') {
      const tier = (attrs.subscription_tier as string) || 'free';
      const tierLabel = tier === 'pro' ? 'Pro' : 'Free';
      const statusPart = subStatus && subStatus !== 'active' ? ` · ${subStatus}` : '';
      const pollPart = lastPoll ? ` Last sync: ${this._formatIso(lastPoll)}.` : '';
      return {
        label: 'Connected',
        className: 'connected',
        detail: `Signed in via Ultra Card Connect · ${tierLabel} tier${statusPart}.${pollPart}`,
        needsReauth: false,
        lastPoll,
        subStatus,
      };
    }
    return {
      label: 'Disconnected',
      className: 'disconnected',
      detail: 'Sign in again from the Account section or reconfigure the integration.',
      needsReauth: false,
      lastPoll,
      subStatus,
    };
  }

  private _formatIso(iso: string): string {
    if (!iso) return 'Never';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  private _nav(tab: 'presets' | 'colors' | 'docs' | 'account', slug?: string): void {
    if (slug) {
      dispatchHubNavigate(this, { tab, slug });
    } else {
      dispatchHubNavigate(this, { tab });
    }
  }

  private async _loadChangelog(): Promise<void> {
    this._changelogLoading = true;
    this._changelogError = '';
    this._changelogBody = '';
    this._changelogTitle = '';
    const isBeta = /beta|alpha/i.test(VERSION);
    try {
      const res = await fetch(
        'https://api.github.com/repos/WJDDesigns/Ultra-Card/releases?per_page=20',
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const releases: Array<{ prerelease: boolean; body: string | null; name: string; tag_name: string }> = await res.json();
      const target = isBeta
        ? releases.find(r => r.prerelease)
        : releases.find(r => !r.prerelease);
      if (target?.body) {
        this._changelogTitle = target.name || target.tag_name || 'Changelog';
        this._changelogBody = target.body;
      } else {
        this._changelogBody = isBeta
          ? 'No beta release notes found.'
          : 'No stable release notes found.';
      }
    } catch (e: any) {
      console.warn('Changelog fetch failed:', e);
      this._changelogError = 'Could not load changelog from GitHub.';
    } finally {
      this._changelogLoading = false;
    }
  }

  private async _loadStats(): Promise<void> {
    if (!this.hass) {
      this._statsLoading = false;
      return;
    }
    this._statsLoading = true;
    this._statsError = '';
    try {
      ucDashboardScannerService.initialize(this.hass);

      // Scan all dashboards so totals include every UC card across every dashboard
      const snapshot = await ucDashboardScannerService.scanAllDashboards();

      // Dashboard count = default (Overview) + any custom dashboards in the list
      let dashboardCount = 1; // always at least the default Overview
      try {
        const dashboards: any[] = await (this.hass as any).callWS({ type: 'lovelace/dashboards/list' });
        if (Array.isArray(dashboards)) {
          // HA's list includes custom ones; add 1 for Overview
          dashboardCount = dashboards.length + 1;
        }
      } catch {
        // fall back to 1 if the WS call fails
      }

      this._stats = {
        cardCount: snapshot.card_count,
        viewCount: snapshot.views?.length ?? 0,
        dashboardCount,
      };
    } catch (e: any) {
      console.warn('Dashboard scan for stats failed:', e);
      this._statsError = 'Could not load dashboard stats.';
      this._stats = null;
    } finally {
      this._statsLoading = false;
    }
  }

  override render() {
    const attention = this._authorAttention();
    const showAuthorPrompt =
      this._authorPresetsLoaded && (attention.awaiting > 0 || attention.changes > 0);

    return html`
      <div class="welcome-hero">
        <h2>Welcome to Ultra Card</h2>
        <p>
          Build beautiful, modular dashboards with the layout builder. Use presets, favorites,
          variables, and templates to create cards that fit your Home Assistant setup.
        </p>
        <div class="version-badge">
          <ha-icon icon="mdi:tag-outline"></ha-icon>
          Version ${VERSION}
        </div>
      </div>

      ${showAuthorPrompt
        ? html`
            <div class="author-prompt">
              <ha-icon icon="mdi:clipboard-text-clock-outline"></ha-icon>
              <div class="author-prompt-body">
                <p>
                  ${attention.awaiting > 0
                    ? this._t(
                        'hub.dashboard.presets_awaiting_review',
                        '{count} presets awaiting review'
                      ).replace('{count}', String(attention.awaiting))
                    : nothing}
                  ${attention.awaiting > 0 && attention.changes > 0 ? ' · ' : nothing}
                  ${attention.changes > 0
                    ? this._t(
                        'hub.dashboard.presets_changes_requested',
                        '{count} with changes requested'
                      ).replace('{count}', String(attention.changes))
                    : nothing}
                </p>
                <button type="button" @click=${this._openMyPresets}>
                  <ha-icon icon="mdi:account-edit-outline"></ha-icon>
                  ${this._t('hub.dashboard.view_my_presets', 'View My Presets')}
                </button>
              </div>
            </div>
          `
        : nothing}

      <div class="command-center">
        <div class="command-card">
          <h3><ha-icon icon="mdi:cloud-sync"></ha-icon> Cloud connection</h3>
          ${(() => {
            const status = this._connectionStatus();
            return html`
              <span class="status-pill ${status.className}">${status.label}</span>
              <p>${status.detail}</p>
              <div class="quick-links">
                <button @click=${() => this._nav('account')}>
                  <ha-icon icon="mdi:account-cog"></ha-icon>
                  Account
                </button>
                ${status.needsReauth
                  ? html`
                      <button
                        @click=${() => {
                          window.location.href =
                            '/config/integrations/integration/ultra_card_pro_cloud';
                        }}
                      >
                        <ha-icon icon="mdi:cog"></ha-icon>
                        Reconfigure
                      </button>
                    `
                  : nothing}
              </div>
            `;
          })()}
        </div>

        <div class="command-card">
          <h3><ha-icon icon="mdi:lightning-bolt"></ha-icon> Quick actions</h3>
          <p>Jump to library tools and documentation.</p>
          <div class="quick-links">
            <button @click=${() => this._nav('presets')}>
              <ha-icon icon="mdi:palette"></ha-icon>
              Presets
            </button>
            <button @click=${() => this._nav('colors')}>
              <ha-icon icon="mdi:eyedropper-variant"></ha-icon>
              Colors
            </button>
            <button @click=${() => this._nav('docs', 'layout-system')}>
              <ha-icon icon="mdi:book-open-page-variant"></ha-icon>
              Layout docs
            </button>
            <button @click=${() => this._nav('docs', 'installation')}>
              <ha-icon icon="mdi:download"></ha-icon>
              Install guide
            </button>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <h3><ha-icon icon="mdi:view-dashboard"></ha-icon> Your Home Assistant</h3>
        ${this._statsLoading
          ? html`<div class="stats-loading">Scanning all dashboards…</div>`
          : this._statsError
            ? html`<div class="stats-error">${this._statsError}</div>`
            : this._stats
              ? html`
                  <div class="stats-grid">
                    <div class="stat-item">
                      <div class="stat-value">${this._stats.dashboardCount}</div>
                      <div class="stat-label">Lovelace Dashboard${this._stats.dashboardCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">${this._stats.viewCount}</div>
                      <div class="stat-label">View${this._stats.viewCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-value">${this._stats.cardCount}</div>
                      <div class="stat-label">Ultra Card${this._stats.cardCount !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                `
              : html`<div class="stats-loading">No data</div>`}
      </div>

      <div class="changelog-card">
        <h3><ha-icon icon="mdi:new-box"></ha-icon> ${this._changelogTitle || 'Recent updates'}</h3>
        ${this._changelogLoading
          ? html`<div class="changelog-body-loading">Loading changelog…</div>`
          : this._changelogError
            ? html`<div class="changelog-body-error">${this._changelogError}</div>`
            : html`<div class="changelog-body">${this._changelogBody}</div>`}
      </div>
    `;
  }
}
