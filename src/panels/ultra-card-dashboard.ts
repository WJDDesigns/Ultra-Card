/**
 * Ultra Card Hub - Home Assistant sidebar panel.
 * Dashboard (welcome + stats), Favorites, Presets, Colors, Variables, Templates, Pro, About.
 * Tab implementations are lazy-loaded when first opened.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from './panel-styles';
import { ucCloudAuthService, CloudUser } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import type { HubProTab } from './tabs/hub-pro-tab';

const SENSOR_ENTITY = 'sensor.ultra_card_pro_cloud_authentication_status';

type HubTab = 'dashboard' | 'account' | 'favorites' | 'presets' | 'colors' | 'variables' | 'templates' | 'pro' | 'about';

/** Lazy-load a tab chunk; resolves when the custom element is registered. */
const TAB_LOADERS: Record<HubTab, () => Promise<unknown>> = {
  dashboard: () => import('./tabs/hub-dashboard-tab'),
  account: () => import('./tabs/hub-account-tab'),
  favorites: () => import('./tabs/hub-favorites-tab'),
  presets: () => import('./tabs/hub-presets-tab'),
  colors: () => import('./tabs/hub-colors-tab'),
  variables: () => import('./tabs/hub-variables-tab'),
  templates: () => import('./tabs/hub-templates-tab'),
  pro: () => import('./tabs/hub-pro-tab'),
  about: () => import('../editor/tabs/about-tab'),
};

interface TabDef {
  key: HubTab;
  labelKey: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'dashboard', labelKey: 'hub.tabs.dashboard', icon: 'mdi:view-dashboard' },
  { key: 'account', labelKey: 'hub.tabs.account', icon: 'mdi:account-circle' },
  { key: 'pro', labelKey: 'hub.tabs.pro', icon: 'mdi:star' },
  { key: 'favorites', labelKey: 'hub.tabs.favorites', icon: 'mdi:heart' },
  { key: 'presets', labelKey: 'hub.tabs.presets', icon: 'mdi:palette' },
  { key: 'colors', labelKey: 'hub.tabs.colors', icon: 'mdi:eyedropper-variant' },
  { key: 'variables', labelKey: 'hub.tabs.variables', icon: 'mdi:variable' },
  { key: 'templates', labelKey: 'hub.tabs.templates', icon: 'mdi:code-tags' },
  { key: 'about', labelKey: 'hub.tabs.about', icon: 'mdi:information-outline' },
];

@customElement('ultra-card-panel')
export class UltraCardPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _activeTab: HubTab = 'dashboard';
  @state() private _proAuth: HubProTab['auth'] = null;
  @state() private _showProTab = false;
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _narrow = window.matchMedia('(max-width: 870px)').matches;
  /** Tabs whose chunk has been loaded (so we can render the custom element). */
  @state() private _loadedTabs = new Set<HubTab>();
  /** In-flight load promises so we don't double-load. */
  private _tabLoadPromises = new Map<HubTab, Promise<void>>();

  private _authListener: ((user: CloudUser | null) => void) | undefined;
  private _mql: MediaQueryList | undefined;
  private _onMqlChange = (e: MediaQueryListEvent) => { this._narrow = e.matches; };

  static override styles = [
    panelStyles,
    css`
      /* Tab strip */
      .tab-strip {
        display: flex;
        gap: 0;
        border-bottom: 2px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        padding: 0 24px;
        background: var(--ha-card-background, var(--card-background-color));
        /* Horizontal scroll if tabs overflow on narrow screens */
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        /* Hide scrollbar visually but keep it functional */
        scrollbar-width: none;
        -ms-overflow-style: none;
        /* Never shrink — this is the sticky nav bar */
        flex-shrink: 0;
        /* Ensure it stays on-screen and doesn't participate in vertical scroll */
        position: relative;
        z-index: 1;
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

      .tab-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }
      .tab-loading ha-icon {
        --mdc-icon-size: 24px;
        margin-right: 8px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this._mql = window.matchMedia('(max-width: 870px)');
    this._mql.addEventListener('change', this._onMqlChange);
    this._updateProState();
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
    };
    ucCloudAuthService.addListener(this._authListener);
    // Pro state is updated when hass changes (updated()) — no global state_changed subscription
    this.addEventListener('hub-navigate-tab', this._onNavigateTab as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._mql?.removeEventListener('change', this._onMqlChange);
    this._mql = undefined;
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

  override updated(changed: Map<string, unknown>): void {
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
      ucCloudAuthService.setIntegrationUser(integrationUser, this.hass);
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

  /** Start loading a tab chunk if not already loaded; updates _loadedTabs when done. */
  private _ensureTabLoaded(tab: HubTab): void {
    if (this._loadedTabs.has(tab)) return;
    let promise = this._tabLoadPromises.get(tab);
    if (!promise) {
      const loader = TAB_LOADERS[tab];
      promise = (loader ? loader() : Promise.resolve())
        .then((): void => {
          this._loadedTabs = new Set(this._loadedTabs);
          this._loadedTabs.add(tab);
          this._tabLoadPromises.delete(tab);
          this.requestUpdate();
        })
        .catch((): void => {
          this._tabLoadPromises.delete(tab);
        }) as Promise<void>;
      this._tabLoadPromises.set(tab, promise);
    }
  }

  private _renderTabContent(): unknown {
    const tab = this._activeTab;
    const lang = this.hass?.locale?.language ?? 'en';
    this._ensureTabLoaded(tab);

    if (!this._loadedTabs.has(tab)) {
      return html`
        <div class="tab-loading" aria-busy="true">
          <ha-icon icon="mdi:loading"></ha-icon>
          <span>${localize('hub.loading', lang, 'Loading…')}</span>
        </div>
      `;
    }

    switch (tab) {
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

  override render() {
    const visibleTabs = TABS;
    const lang = this.hass?.locale?.language ?? 'en';

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
                id="hub-tab-${tab.key}"
                aria-selected=${this._activeTab === tab.key ? 'true' : 'false'}
                aria-controls="hub-tabpanel-${tab.key}"
                class=${this._activeTab === tab.key ? 'active' : ''}
                @click=${() => (this._activeTab = tab.key)}
              >
                <ha-icon icon=${tab.icon}></ha-icon>
                ${localize(tab.labelKey, lang, tab.key)}
              </button>
            `
          )}
        </nav>

        <div
          class="hub-content"
          role="tabpanel"
          id="hub-tabpanel-${this._activeTab}"
          aria-labelledby="hub-tab-${this._activeTab}"
        >
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
