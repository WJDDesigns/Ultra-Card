/**
 * Ultra Card Hub – Dashboard tab (welcome, stats, changelog).
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from '../panel-styles';
import { ucDashboardScannerService } from '../../services/uc-dashboard-scanner-service';
import { VERSION } from '../../version';

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

  static styles = [
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
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._loadStats();
    this._loadChangelog();
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

  render() {
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

      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Dashboard.</strong> Totals across all your dashboards — how many dashboards, views, and Ultra Cards you have — plus the latest release notes.</p>
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
