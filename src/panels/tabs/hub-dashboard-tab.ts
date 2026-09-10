/**
 * Ultra Card Hub – Dashboard tab (welcome, stats, changelog).
 */
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from '../panel-styles';
import { ucDashboardScannerService } from '../../services/uc-dashboard-scanner-service';
import { ucCloudAuthService, type CloudUser } from '../../services/uc-cloud-auth-service';
import { ucPresetAuthorService, type AuthorPreset } from '../../services/uc-preset-author-service';
import { VERSION } from '../../version';
import { dispatchHubNavigate } from '../hub-navigation';
import { formatRelativeTime } from '../hub-format';
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
  @state() private _changelogHtml = '';
  @state() private _changelogUrl = '';
  @state() private _changelogExpanded = false;
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

      /* Hero */
      .welcome-hero {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 28px 28px;
        margin-bottom: 20px;
        background:
          radial-gradient(
            120% 140% at 100% 0%,
            rgba(var(--uc-hub-primary-rgb), 0.16),
            transparent 55%
          ),
          var(--uc-hub-surface);
        border: 1px solid var(--uc-hub-border);
        border-radius: var(--uc-hub-radius-lg);
        box-shadow: var(--uc-hub-shadow-sm);
        overflow: hidden;
      }

      .hero-mark {
        width: 64px;
        height: 64px;
        flex-shrink: 0;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        background: linear-gradient(
          135deg,
          var(--primary-color),
          var(--accent-color, var(--primary-color))
        );
        box-shadow: 0 6px 18px rgba(var(--uc-hub-primary-rgb), 0.35);
      }

      .hero-mark ha-icon {
        --mdc-icon-size: 34px;
      }

      .hero-body {
        flex: 1;
        min-width: 0;
      }

      .hero-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(var(--uc-hub-primary-rgb), 0.12);
        color: var(--primary-color);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .hero-eyebrow ha-icon {
        --mdc-icon-size: 14px;
      }

      .welcome-hero h2 {
        margin: 0 0 6px 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--primary-text-color);
      }

      .welcome-hero p {
        margin: 0;
        font-size: 14px;
        color: var(--secondary-text-color);
        line-height: 1.55;
        max-width: 620px;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      @media (max-width: 700px) {
        .welcome-hero {
          flex-direction: column;
          align-items: flex-start;
          padding: 20px;
          gap: 16px;
        }
        .hero-mark {
          width: 52px;
          height: 52px;
          border-radius: 14px;
        }
        .hero-mark ha-icon {
          --mdc-icon-size: 28px;
        }
        .welcome-hero h2 {
          font-size: 21px;
        }
      }

      /* Cards */
      .dash-card {
        background: var(--uc-hub-surface);
        border: 1px solid var(--uc-hub-border);
        border-radius: var(--uc-hub-radius-lg);
        box-shadow: var(--uc-hub-shadow-sm);
        padding: 20px 22px;
        margin-bottom: 20px;
        min-width: 0;
      }

      .dash-card h3 {
        margin: 0 0 14px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dash-card h3 ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .dash-card h3 .h3-spacer {
        flex: 1;
      }

      .dash-card h3 a {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-color);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .dash-card h3 a ha-icon {
        --mdc-icon-size: 14px;
      }

      .dash-card h3 a:hover {
        text-decoration: underline;
      }

      .stats-loading,
      .stats-error {
        padding: 12px 0;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .stats-error {
        color: var(--error-color, #f44336);
      }

      .stat-tile-value {
        color: var(--primary-color);
      }

      /* Changelog */
      .changelog-body {
        font-size: 13.5px;
        color: var(--primary-text-color);
        line-height: 1.6;
        word-break: break-word;
        max-height: 360px;
        overflow: hidden;
        position: relative;
        transition: max-height 0.2s ease;
      }

      .changelog-body.expanded {
        max-height: none;
      }

      .changelog-body:not(.expanded)::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 72px;
        background: linear-gradient(to bottom, transparent, var(--uc-hub-surface));
        pointer-events: none;
      }

      .changelog-body :is(h1, h2, h3, h4) {
        margin: 18px 0 8px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .changelog-body :is(h1, h2, h3, h4):first-child {
        margin-top: 0;
      }

      .changelog-body p {
        margin: 0 0 10px;
      }

      .changelog-body ul,
      .changelog-body ol {
        margin: 0 0 10px;
        padding-left: 22px;
      }

      .changelog-body li {
        margin-bottom: 4px;
      }

      .changelog-body code {
        font-family: var(--code-font-family, 'SF Mono', 'Fira Code', monospace);
        font-size: 12px;
        padding: 1px 6px;
        border-radius: 4px;
        background: var(--uc-hub-surface-2);
        border: 1px solid var(--uc-hub-border);
      }

      .changelog-body pre {
        padding: 12px;
        border-radius: var(--uc-hub-radius-sm);
        background: var(--uc-hub-surface-2);
        border: 1px solid var(--uc-hub-border);
        overflow-x: auto;
      }

      .changelog-body pre code {
        border: none;
        background: none;
        padding: 0;
      }

      .changelog-body a {
        color: var(--primary-color);
        text-decoration: none;
      }

      .changelog-body a:hover {
        text-decoration: underline;
      }

      .changelog-body img {
        max-width: 100%;
        border-radius: var(--uc-hub-radius-sm);
      }

      .changelog-body hr {
        border: none;
        border-top: 1px solid var(--uc-hub-border);
        margin: 14px 0;
      }

      .changelog-toggle {
        margin-top: 10px;
      }

      .changelog-plain {
        white-space: pre-wrap;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .changelog-body-loading,
      .changelog-body-error {
        padding: 12px 0;
        color: var(--secondary-text-color);
        font-size: 13px;
      }

      .changelog-body-error {
        color: var(--error-color, #f44336);
      }

      /* Command centre */
      .command-center {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
      }

      .command-center .dash-card {
        margin-bottom: 0;
      }

      .dash-card p {
        margin: 0 0 12px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .status-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }

      .status-pill::before {
        content: '';
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }

      .status-pill.connected {
        background: rgba(76, 175, 80, 0.14);
        color: var(--success-color, #4caf50);
      }

      .status-pill.disconnected {
        background: rgba(244, 67, 54, 0.12);
        color: var(--error-color, #f44336);
      }

      .status-pill.unknown {
        background: rgba(158, 158, 158, 0.15);
        color: var(--secondary-text-color);
      }

      .status-pill.warning {
        background: rgba(255, 152, 0, 0.15);
        color: var(--warning-color, #ff9800);
      }

      .quick-links {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
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
      const pollPart = lastPoll ? ` Last checked ${formatRelativeTime(lastPoll)}.` : '';
      return {
        label: 'Connected',
        className: 'connected',
        detail: `Signed in through Ultra Card Connect · ${tierLabel} plan${statusPart}.${pollPart}`,
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

  private _nav(
    tab: 'presets' | 'themes' | 'colors' | 'favorites' | 'variables' | 'docs' | 'account',
    slug?: string
  ): void {
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
    this._changelogHtml = '';
    this._changelogUrl = '';
    this._changelogTitle = '';
    const isBeta = /beta|alpha/i.test(VERSION);
    try {
      const res = await fetch(
        'https://api.github.com/repos/WJDDesigns/Ultra-Card/releases?per_page=20',
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const releases: Array<{
        prerelease: boolean;
        body: string | null;
        name: string;
        tag_name: string;
        html_url?: string;
      }> = await res.json();
      const target = isBeta
        ? releases.find(r => r.prerelease)
        : releases.find(r => !r.prerelease);
      if (target?.body) {
        this._changelogTitle = target.name || target.tag_name || 'Changelog';
        this._changelogUrl = target.html_url || '';
        this._changelogBody = target.body;
        this._changelogHtml = await this._renderMarkdown(target.body);
      } else {
        this._changelogBody = isBeta
          ? 'No beta release notes found.'
          : 'No stable release notes found.';
      }
    } catch (e: any) {
      console.warn('Changelog fetch failed:', e);
      this._changelogError = 'Could not load release notes from GitHub.';
    } finally {
      this._changelogLoading = false;
    }
  }

  /**
   * Release notes arrive as GitHub-flavoured markdown. Render + sanitise them so
   * headings and bullet lists read properly instead of showing raw `###`/`**`.
   * Falls back to plain text if the renderer chunk fails to load.
   */
  private async _renderMarkdown(markdown: string): Promise<string> {
    try {
      const [{ marked }, { sanitizeMarkdownHtml }] = await Promise.all([
        import('marked'),
        import('../../utils/html-sanitizer'),
      ]);
      const raw = marked.parse(markdown, { gfm: true, breaks: true, async: false }) as string;
      // Downloaded content: keep cosmetic markup, drop anything that could fetch a URL.
      return sanitizeMarkdownHtml(raw, false, { trusted: false });
    } catch (err) {
      console.warn('Changelog markdown render failed:', err);
      return '';
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

    const isBeta = /beta|alpha/i.test(VERSION);

    return html`
      <div class="welcome-hero">
        <div class="hero-mark" aria-hidden="true">
          <ha-icon icon="mdi:cards"></ha-icon>
        </div>
        <div class="hero-body">
          <span class="hero-eyebrow">
            <ha-icon icon="mdi:tag-outline"></ha-icon>
            Version ${VERSION}${isBeta ? ' · Beta' : ''}
          </span>
          <h2>Welcome to Ultra Card</h2>
          <p>
            Build beautiful, modular dashboards with the layout builder. Use presets, favorites,
            variables, and templates to create cards that fit your Home Assistant setup.
          </p>
          <div class="hero-actions">
            <button class="hub-btn hub-btn--primary" @click=${() => this._nav('presets')}>
              <ha-icon icon="mdi:palette"></ha-icon>
              Browse presets
            </button>
            <button class="hub-btn" @click=${() => this._nav('themes')}>
              <ha-icon icon="mdi:palette-swatch"></ha-icon>
              Themes
            </button>
            <button class="hub-btn" @click=${() => this._nav('docs', 'quick-start')}>
              <ha-icon icon="mdi:rocket-launch-outline"></ha-icon>
              Quick start
            </button>
          </div>
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
        <div class="dash-card">
          <h3><ha-icon icon="mdi:cloud-sync"></ha-icon> Cloud connection</h3>
          ${(() => {
            const status = this._connectionStatus();
            return html`
              <div class="status-row">
                <span class="status-pill ${status.className}">${status.label}</span>
              </div>
              <p>${status.detail}</p>
              <div class="quick-links">
                <button class="hub-btn hub-btn--sm" @click=${() => this._nav('account')}>
                  <ha-icon icon="mdi:account-cog"></ha-icon>
                  Account
                </button>
                ${status.needsReauth
                  ? html`
                      <button
                        class="hub-btn hub-btn--sm hub-btn--outline"
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

        <div class="dash-card">
          <h3><ha-icon icon="mdi:lightning-bolt"></ha-icon> Quick actions</h3>
          <p>Jump to library tools and documentation.</p>
          <div class="quick-links">
            <button class="hub-btn hub-btn--sm" @click=${() => this._nav('favorites')}>
              <ha-icon icon="mdi:heart"></ha-icon>
              Favorites
            </button>
            <button class="hub-btn hub-btn--sm" @click=${() => this._nav('colors')}>
              <ha-icon icon="mdi:eyedropper-variant"></ha-icon>
              Colors
            </button>
            <button class="hub-btn hub-btn--sm" @click=${() => this._nav('variables')}>
              <ha-icon icon="mdi:variable"></ha-icon>
              Variables
            </button>
            <button class="hub-btn hub-btn--sm" @click=${() => this._nav('docs', 'layout-system')}>
              <ha-icon icon="mdi:book-open-page-variant"></ha-icon>
              Layout docs
            </button>
            <button class="hub-btn hub-btn--sm" @click=${() => this._nav('docs', 'installation')}>
              <ha-icon icon="mdi:download"></ha-icon>
              Install guide
            </button>
          </div>
        </div>
      </div>

      <div class="dash-card">
        <h3><ha-icon icon="mdi:view-dashboard"></ha-icon> Your Home Assistant</h3>
        ${this._statsLoading
          ? html`<div class="stats-loading">Scanning all dashboards…</div>`
          : this._statsError
            ? html`<div class="stats-error">${this._statsError}</div>`
            : this._stats
              ? html`
                  <div class="stat-tiles">
                    <div class="stat-tile">
                      <div class="stat-tile-value">${this._stats.dashboardCount}</div>
                      <div class="stat-tile-label">
                        Dashboard${this._stats.dashboardCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div class="stat-tile">
                      <div class="stat-tile-value">${this._stats.viewCount}</div>
                      <div class="stat-tile-label">View${this._stats.viewCount !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="stat-tile">
                      <div class="stat-tile-value">${this._stats.cardCount}</div>
                      <div class="stat-tile-label">
                        Ultra Card${this._stats.cardCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                `
              : html`<div class="stats-loading">No data</div>`}
      </div>

      <div class="dash-card">
        <h3>
          <ha-icon icon="mdi:new-box"></ha-icon>
          ${this._changelogTitle
            ? /what'?s new/i.test(this._changelogTitle)
              ? this._changelogTitle
              : `What's new · ${this._changelogTitle}`
            : "What's new"}
          <span class="h3-spacer"></span>
          ${this._changelogUrl
            ? html`<a href=${this._changelogUrl} target="_blank" rel="noopener noreferrer">
                View on GitHub <ha-icon icon="mdi:open-in-new"></ha-icon>
              </a>`
            : nothing}
        </h3>
        ${this._changelogLoading
          ? html`<div class="changelog-body-loading">Loading release notes…</div>`
          : this._changelogError
            ? html`<div class="changelog-body-error">${this._changelogError}</div>`
            : this._changelogHtml
              ? html`
                  <div class="changelog-body ${this._changelogExpanded ? 'expanded' : ''}">
                    ${unsafeHTML(this._changelogHtml)}
                  </div>
                  <button
                    class="hub-btn hub-btn--ghost hub-btn--sm changelog-toggle"
                    @click=${() => {
                      this._changelogExpanded = !this._changelogExpanded;
                    }}
                  >
                    <ha-icon
                      icon=${this._changelogExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                    ></ha-icon>
                    ${this._changelogExpanded ? 'Show less' : 'Show full release notes'}
                  </button>
                `
              : html`<div class="changelog-plain">${this._changelogBody}</div>`}
      </div>
    `;
  }
}
