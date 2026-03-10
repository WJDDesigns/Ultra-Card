/**
 * Ultra Card Hub - Home Assistant sidebar panel.
 * Dashboard (welcome + stats), Favorites, Presets, Colors, Variables, Templates, Pro, About.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from './panel-styles';
import { ucCloudAuthService, CloudUser } from '../services/uc-cloud-auth-service';
import './tabs/hub-account-tab';
import './tabs/hub-dashboard-tab';
import './tabs/hub-favorites-tab';
import './tabs/hub-presets-tab';
import './tabs/hub-colors-tab';
import './tabs/hub-variables-tab';
import './tabs/hub-templates-tab';
import './tabs/hub-pro-tab';
import '../editor/tabs/about-tab';
import type { HubProTab } from './tabs/hub-pro-tab';

const SENSOR_ENTITY = 'sensor.ultra_card_pro_cloud_authentication_status';

type HubTab = 'dashboard' | 'account' | 'favorites' | 'presets' | 'colors' | 'variables' | 'templates' | 'pro' | 'about';

interface TabDef {
  key: HubTab;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard' },
  { key: 'account', label: 'Account', icon: 'mdi:account-circle' },
  { key: 'pro', label: 'Pro', icon: 'mdi:star' },
  { key: 'favorites', label: 'Favorites', icon: 'mdi:heart' },
  { key: 'presets', label: 'Presets', icon: 'mdi:palette' },
  { key: 'colors', label: 'Colors', icon: 'mdi:eyedropper-variant' },
  { key: 'variables', label: 'Variables', icon: 'mdi:variable' },
  { key: 'templates', label: 'Templates', icon: 'mdi:code-tags' },
  { key: 'about', label: 'About', icon: 'mdi:information-outline' },
];

@customElement('ultra-card-panel')
export class UltraCardPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _activeTab: HubTab = 'dashboard';
  @state() private _proAuth: HubProTab['auth'] = null;
  @state() private _showProTab = false;
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _narrow = window.matchMedia('(max-width: 870px)').matches;

  // subscribeEvents returns Promise<() => void>; store the resolved unsub only
  private _unsub?: (() => void) | (() => Promise<void>);
  private _authListener?: (user: CloudUser | null) => void;
  private _mql?: MediaQueryList;
  private _onMqlChange = (e: MediaQueryListEvent) => { this._narrow = e.matches; };

  static styles = [
    panelStyles,
    css`
      /* Tab strip */
      .tab-strip {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        padding: 0 24px;
        background: var(--ha-card-background, var(--card-background-color));
        /* Horizontal scroll on overflow */
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        /* Hide scrollbar visually but keep it functional */
        scrollbar-width: none;
        -ms-overflow-style: none;
        /* Prevent shrinking below content */
        flex-shrink: 0;
      }

      .tab-strip::-webkit-scrollbar {
        display: none;
      }

      .tab-strip button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 20px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: all 0.2s ease;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .tab-strip button ha-icon {
        --mdc-icon-size: 20px;
      }

      .tab-strip button:hover {
        color: var(--primary-text-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.04);
      }

      .tab-strip button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .tab-strip button.active ha-icon {
        color: var(--primary-color);
      }

      /* Mobile burger menu button */
      .mobile-menu-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border: none;
        background: none;
        color: var(--primary-text-color);
        cursor: pointer;
        border-radius: 50%;
        padding: 0;
        transition: background 0.15s ease;
        margin-left: -8px;
      }

      .mobile-menu-btn:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }

      .mobile-menu-btn ha-icon {
        --mdc-icon-size: 24px;
      }

      /* Narrow header layout: burger | title | account chip */
      .hub-header--narrow {
        padding: 8px 16px 8px 8px;
        gap: 8px;
      }

      .hub-header--narrow h1 {
        font-size: 20px;
        flex: 1;
      }

      @media (max-width: 870px) {
        .tab-strip {
          padding: 0 4px;
        }
        .tab-strip button {
          padding: 12px 14px;
          font-size: 13px;
          gap: 5px;
        }
        .tab-strip button ha-icon {
          --mdc-icon-size: 18px;
        }
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._mql = window.matchMedia('(max-width: 870px)');
    this._mql.addEventListener('change', this._onMqlChange);
    this._updateProState();
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
    };
    ucCloudAuthService.addListener(this._authListener);
    if (this.hass?.connection) {
      // subscribeEvents is async — store the resolved unsub function, not the Promise,
      // so that disconnectedCallback can safely call it.
      this.hass.connection.subscribeEvents(() => {
        this._updateProState();
      }, 'state_changed').then((unsub) => {
        this._unsub = unsub;
      }).catch(() => {/* ignore subscribe errors */});
    }
    this.addEventListener('hub-navigate-tab', this._onNavigateTab as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._mql?.removeEventListener('change', this._onMqlChange);
    this._mql = undefined;
    if (this._unsub) {
      try { this._unsub(); } catch { /* ignore */ }
      this._unsub = undefined;
    }
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = undefined;
    }
    this.removeEventListener('hub-navigate-tab', this._onNavigateTab as EventListener);
  }

  private _onNavigateTab(e: CustomEvent<{ tab: string }>): void {
    const tab = e.detail?.tab as typeof this._activeTab;
    if (tab) this._activeTab = tab;
  }

  updated(changed: Map<string, unknown>): void {
    if (changed.has('hass')) {
      this._updateProState();
    }
  }

  private _updateProState(): void {
    if (!this.hass?.states) {
      this._showProTab = false;
      this._proAuth = null;
      return;
    }
    const sensor = this.hass.states[SENSOR_ENTITY];
    this._showProTab = !!sensor;
    if (!sensor) {
      this._proAuth = null;
      return;
    }
    const attrs = sensor.attributes as Record<string, unknown>;
    this._proAuth = {
      authenticated: sensor.state === 'connected' && !!attrs?.authenticated,
      user_id: attrs?.user_id as number | undefined,
      username: attrs?.username as string | undefined,
      email: attrs?.email as string | undefined,
      display_name: attrs?.display_name as string | undefined,
      subscription_tier: attrs?.subscription_tier as string | undefined,
      subscription_status: attrs?.subscription_status as string | undefined,
      subscription_expires: attrs?.subscription_expires as number | undefined,
    };
    // Sync integration user into auth service so snapshot/backup services see "logged in"
    // when user only has the panel open (no Ultra Card on the dashboard).
    const integrationUser = ucCloudAuthService.checkIntegrationAuth(this.hass);
    if (integrationUser) {
      ucCloudAuthService.setIntegrationUser(integrationUser);
    }
  }

  private _toggleSidebar(): void {
    this.dispatchEvent(new CustomEvent('hass-toggle-menu', { bubbles: true, composed: true }));
  }

  private _renderAccountChip(): unknown {
    const user = this._proAuth?.authenticated
      ? {
          name: this._proAuth.display_name || this._proAuth.username || 'Account',
          tier: this._proAuth.subscription_tier,
        }
      : this._cloudUser
        ? {
            name: this._cloudUser.displayName || this._cloudUser.username || 'Account',
            tier: this._cloudUser.subscription?.tier,
          }
        : null;

    if (user) {
      const isPro = user.tier === 'pro';
      return html`
        <button
          class="hub-account-chip"
          @click=${() => (this._activeTab = 'account')}
          title="View account"
          aria-label="View account"
        >
          <ha-icon icon="mdi:account-circle"></ha-icon>
          <span>Hi, ${user.name}</span>
          <span class="hub-tier-badge ${isPro ? 'pro' : 'free'}">
            ${isPro ? html`<ha-icon icon="mdi:star" style="--mdc-icon-size:10px"></ha-icon>` : ''}
            ${isPro ? 'PRO' : 'Free'}
          </span>
        </button>
      `;
    }

    return html`
      <button
        class="hub-sign-in-btn"
        @click=${() => (this._activeTab = 'account')}
        aria-label="Sign in"
      >
        <ha-icon icon="mdi:login"></ha-icon>
        Sign In
      </button>
    `;
  }

  private _renderTabContent(): unknown {
    switch (this._activeTab) {
      case 'dashboard':
        return html`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;
      case 'account':
        return html`<hub-account-tab
          .hass=${this.hass}
          .auth=${this._proAuth}
          .cloudUser=${this._cloudUser}
        ></hub-account-tab>`;
      case 'favorites':
        return html`<hub-favorites-tab></hub-favorites-tab>`;
      case 'presets':
        return html`<hub-presets-tab></hub-presets-tab>`;
      case 'colors':
        return html`<hub-colors-tab .hass=${this.hass}></hub-colors-tab>`;
      case 'variables':
        return html`<hub-variables-tab .hass=${this.hass}></hub-variables-tab>`;
      case 'templates':
        return html`<hub-templates-tab></hub-templates-tab>`;
      case 'pro':
        return html`<hub-pro-tab .auth=${this._proAuth} .hass=${this.hass} .cloudUser=${this._cloudUser}></hub-pro-tab>`;
      case 'about':
        return html`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`;
      default:
        return html`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;
    }
  }

  render() {
    const visibleTabs = TABS;

    return html`
      <div class="hub-container">
        <header class="hub-header ${this._narrow ? 'hub-header--narrow' : ''}">
          ${this._narrow ? html`
            <button
              class="mobile-menu-btn"
              @click=${this._toggleSidebar}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>
          ` : ''}
          <h1>Ultra Card</h1>
          ${this._renderAccountChip()}
        </header>

        <nav class="tab-strip" role="tablist" aria-label="Hub navigation">
          ${visibleTabs.map(
            tab => html`
              <button
                role="tab"
                aria-selected=${this._activeTab === tab.key ? 'true' : 'false'}
                class=${this._activeTab === tab.key ? 'active' : ''}
                @click=${() => (this._activeTab = tab.key)}
              >
                <ha-icon icon=${tab.icon}></ha-icon>
                ${tab.label}
              </button>
            `
          )}
        </nav>

        <div class="hub-content">
          ${this._renderTabContent()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-card-panel': UltraCardPanel;
  }
}
