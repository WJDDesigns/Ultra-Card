/**
 * Ultra Card Hub - Home Assistant sidebar panel (grouped navigation).
 */
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from './panel-styles';
import { ucCloudAuthService, CloudUser } from '../services/uc-cloud-auth-service';
import { localize } from '../localize/localize';
import type { HubProTab } from './tabs/hub-pro-tab';
import type { HubGroup, HubTab, HubTabDef } from './ultra-card-dashboard-types';
import {
  HUB_NAVIGATE_EVENT,
  PENDING_DOCS_SLUG_KEY,
  tabToGroup,
  type HubNavigateDetail,
} from './hub-navigation';

const SENSOR_ENTITY = 'sensor.ultra_card_pro_cloud_authentication_status';
const STORAGE_GROUP_KEY = 'ultra_card_hub_group';
const STORAGE_TAB_KEY = 'ultra_card_hub_tab';

export type { HubTab, HubGroup } from './ultra-card-dashboard-types';

const TAB_LOADERS: Record<HubTab, () => Promise<unknown>> = {
  dashboard: () => import('./tabs/hub-dashboard-tab'),
  account: () => import('./tabs/hub-account-tab'),
  favorites: () => import('./tabs/hub-favorites-tab'),
  presets: () => import('./tabs/hub-presets-tab'),
  colors: () => import('./tabs/hub-colors-tab'),
  variables: () => import('./tabs/hub-variables-tab'),
  templates: () => import('./tabs/hub-templates-tab'),
  docs: () => import('./tabs/hub-docs-tab'),
  pro: () => import('./tabs/hub-pro-tab'),
  about: () => import('../editor/tabs/about-tab'),
};

const HUB_TABS: HubTabDef[] = [
  { key: 'dashboard', labelKey: 'hub.tabs.dashboard', icon: 'mdi:view-dashboard', group: 'home' },
  { key: 'favorites', labelKey: 'hub.tabs.favorites', icon: 'mdi:heart', group: 'library' },
  { key: 'presets', labelKey: 'hub.tabs.presets', icon: 'mdi:palette', group: 'library' },
  { key: 'colors', labelKey: 'hub.tabs.colors', icon: 'mdi:eyedropper-variant', group: 'library' },
  { key: 'variables', labelKey: 'hub.tabs.variables', icon: 'mdi:variable', group: 'library' },
  { key: 'templates', labelKey: 'hub.tabs.templates', icon: 'mdi:code-tags', group: 'library' },
  { key: 'account', labelKey: 'hub.tabs.account', icon: 'mdi:account-circle', group: 'account' },
  { key: 'pro', labelKey: 'hub.tabs.pro', icon: 'mdi:star', group: 'account' },
  { key: 'docs', labelKey: 'hub.tabs.docs', icon: 'mdi:book-open-page-variant', group: 'help' },
  { key: 'about', labelKey: 'hub.tabs.about', icon: 'mdi:information-outline', group: 'help' },
];

const HUB_GROUPS: { key: HubGroup; labelKey: string; icon: string }[] = [
  { key: 'home', labelKey: 'hub.groups.home', icon: 'mdi:home' },
  { key: 'library', labelKey: 'hub.groups.library', icon: 'mdi:bookshelf' },
  { key: 'account', labelKey: 'hub.groups.account', icon: 'mdi:account-circle' },
  { key: 'help', labelKey: 'hub.groups.help', icon: 'mdi:help-circle' },
];

@customElement('ultra-card-panel')
export class UltraCardPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _activeGroup: HubGroup = 'home';
  @state() private _activeTab: HubTab = 'dashboard';
  @state() private _pendingDocsSlug = '';
  @state() private _proAuth: HubProTab['auth'] = null;
  @state() private _showProTab = false;
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _narrow = window.matchMedia('(max-width: 870px)').matches;
  @state() private _loadedTabs = new Set<HubTab>();
  @state() private _showShortcuts = false;
  private _tabLoadPromises = new Map<HubTab, Promise<void>>();

  private _authListener: ((user: CloudUser | null) => void) | undefined;
  private _hubKeydownHandler = (e: KeyboardEvent): void => {
    if (e.key !== '?') return;
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
      return;
    }
    e.preventDefault();
    this._showShortcuts = !this._showShortcuts;
  };
  private _mql: MediaQueryList | undefined;
  private _onMqlChange = (e: MediaQueryListEvent) => { this._narrow = e.matches; };

  static override styles = [
    panelStyles,
    css`
      .hub-nav {
        display: flex;
        flex-direction: column;
        gap: 0;
        flex-shrink: 0;
        border-bottom: 2px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        background: var(--ha-card-background, var(--card-background-color));
      }

      .group-strip {
        display: flex;
        gap: 0;
        padding: 0 16px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .group-strip::-webkit-scrollbar {
        display: none;
      }

      .group-strip button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 18px;
        border: none;
        background: none;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .group-strip button.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      .sub-strip {
        display: flex;
        gap: 4px;
        padding: 8px 16px 10px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .sub-strip button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border: none;
        border-radius: 20px;
        background: transparent;
        color: var(--secondary-text-color);
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .sub-strip button.active {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
        color: var(--primary-color);
        font-weight: 600;
      }

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
        margin-left: -8px;
      }

      .hub-header--narrow {
        padding: 8px 16px 8px 8px;
        gap: 8px;
      }

      .hub-header--narrow h1 {
        font-size: 20px;
        flex: 1;
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
        to {
          transform: rotate(360deg);
        }
      }

      .shortcuts-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .shortcuts-panel {
        max-width: 400px;
        width: 100%;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: 14px;
        padding: 20px 24px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .shortcuts-panel h2 {
        margin: 0 0 12px;
        font-size: 18px;
      }

      .shortcuts-panel ul {
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .shortcuts-panel li {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
      }

      .shortcuts-panel kbd {
        font-family: inherit;
        padding: 2px 8px;
        border-radius: 6px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font-size: 12px;
      }

      .shortcuts-panel button.close {
        margin-top: 16px;
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: none;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        cursor: pointer;
        font: inherit;
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this._restoreNavState();
    this._mql = window.matchMedia('(max-width: 870px)');
    this._mql.addEventListener('change', this._onMqlChange);
    this._updateProState();
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
    };
    ucCloudAuthService.addListener(this._authListener);
    this.addEventListener(HUB_NAVIGATE_EVENT, this._onNavigateTab as EventListener);
    document.addEventListener(HUB_NAVIGATE_EVENT, this._onNavigateTab as EventListener);
    document.addEventListener('keydown', this._hubKeydownHandler);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._mql?.removeEventListener('change', this._onMqlChange);
    this._mql = undefined;
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = undefined;
    }
    this.removeEventListener(HUB_NAVIGATE_EVENT, this._onNavigateTab as EventListener);
    document.removeEventListener(HUB_NAVIGATE_EVENT, this._onNavigateTab as EventListener);
    document.removeEventListener('keydown', this._hubKeydownHandler);
  }

  private _restoreNavState(): void {
    try {
      const tab = localStorage.getItem(STORAGE_TAB_KEY) as HubTab | null;
      const group = localStorage.getItem(STORAGE_GROUP_KEY) as HubGroup | null;
      if (tab && HUB_TABS.some(t => t.key === tab)) {
        this._activeTab = tab;
        this._activeGroup = tabToGroup(tab);
      } else if (group && HUB_GROUPS.some(g => g.key === group)) {
        this._activeGroup = group;
        this._activeTab = this._tabsForGroup(group)[0]?.key ?? 'dashboard';
      }
      const pendingDocs = localStorage.getItem(PENDING_DOCS_SLUG_KEY);
      if (pendingDocs) {
        this._pendingDocsSlug = pendingDocs;
        localStorage.removeItem(PENDING_DOCS_SLUG_KEY);
      }
    } catch {
      /* ignore */
    }
  }

  private _persistNavState(): void {
    try {
      localStorage.setItem(STORAGE_TAB_KEY, this._activeTab);
      localStorage.setItem(STORAGE_GROUP_KEY, this._activeGroup);
    } catch {
      /* ignore */
    }
  }

  private _onNavigateTab(e: CustomEvent<HubNavigateDetail>): void {
    const detail = e.detail;
    if (!detail?.tab) return;
    if (detail.slug) {
      this._selectTab(detail.tab, { docsSlug: detail.slug });
    } else {
      this._selectTab(detail.tab);
    }
  }

  private _tabsForGroup(group: HubGroup): HubTabDef[] {
    return HUB_TABS.filter(t => {
      if (t.key === 'pro' && !this._showProTab) return false;
      return t.group === group;
    });
  }

  private _selectGroup(group: HubGroup): void {
    this._activeGroup = group;
    const tabs = this._tabsForGroup(group);
    if (!tabs.some(t => t.key === this._activeTab)) {
      this._activeTab = tabs[0]?.key ?? 'dashboard';
    }
    this._persistNavState();
    this._onTabActivated(this._activeTab);
  }

  private _selectTab(tab: HubTab, options?: { docsSlug?: string }): void {
    this._activeTab = tab;
    this._activeGroup = tabToGroup(tab);
    if (options?.docsSlug) {
      this._pendingDocsSlug = options.docsSlug;
    }
    this._persistNavState();
    this._onTabActivated(tab);
  }

  private _onTabActivated(tab: HubTab): void {
    if (tab === 'presets') {
      void this._refreshPresetsTab();
    }
    if (tab === 'docs') {
      void this._refreshDocsTab();
    }
  }

  private async _refreshPresetsTab(): Promise<void> {
    const { ucPresetsService } = await import('../services/uc-presets-service');
    ucPresetsService.ensureWordPressLoaded();
    await ucPresetsService.refreshWordPressPresets();
    await import('./tabs/hub-presets-tab');
    requestAnimationFrame(() => {
      const el = this.renderRoot?.querySelector('hub-presets-tab') as { refresh?: () => void } | null;
      el?.refresh?.();
    });
  }

  private async _refreshDocsTab(): Promise<void> {
    const slug = this._pendingDocsSlug;
    await import('./tabs/hub-docs-tab');
    requestAnimationFrame(() => {
      const el = this.renderRoot?.querySelector('hub-docs-tab') as
        | { reload?: () => void; openSlug?: (s: string) => void }
        | null;
      if (slug && el?.openSlug) {
        void el.openSlug(slug);
        this._pendingDocsSlug = '';
      } else {
        el?.reload?.();
      }
    });
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
      if (this._activeTab === 'pro') {
        this._selectTab('account');
      }
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
          @click=${() => this._selectGroup('account')}
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
        @click=${() => this._selectGroup('account')}
        aria-label="Sign in"
      >
        <ha-icon icon="mdi:login"></ha-icon>
        Sign In
      </button>
    `;
  }

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
      case 'docs':
        return html`<hub-docs-tab .initialSlug=${this._pendingDocsSlug}></hub-docs-tab>`;
      case 'pro':
        return html`<hub-pro-tab
          .auth=${this._proAuth}
          .hass=${this.hass}
          .cloudUser=${this._cloudUser}
        ></hub-pro-tab>`;
      case 'about':
        return html`<ultra-about-tab .hass=${this.hass}></ultra-about-tab>`;
      default:
        return html`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;
    }
  }

  override render() {
    const lang = this.hass?.locale?.language ?? 'en';
    const subTabs = this._tabsForGroup(this._activeGroup);

    return html`
      <div class="hub-container">
        <header class="hub-header ${this._narrow ? 'hub-header--narrow' : ''}">
          ${this._narrow
            ? html`
                <button
                  class="mobile-menu-btn"
                  @click=${this._toggleSidebar}
                  aria-label="Toggle sidebar"
                >
                  <ha-icon icon="mdi:menu"></ha-icon>
                </button>
              `
            : ''}
          <h1>Ultra Card</h1>
          ${this._renderAccountChip()}
        </header>

        <nav class="hub-nav" aria-label="Hub navigation">
          <div class="group-strip" role="tablist">
            ${HUB_GROUPS.map(
              group => html`
                <button
                  role="tab"
                  class=${this._activeGroup === group.key ? 'active' : ''}
                  @click=${() => this._selectGroup(group.key)}
                >
                  <ha-icon icon=${group.icon}></ha-icon>
                  ${localize(group.labelKey, lang, group.key)}
                </button>
              `
            )}
          </div>
          ${subTabs.length > 1
            ? html`
                <div class="sub-strip">
                  ${subTabs.map(
                    tab => html`
                      <button
                        class=${this._activeTab === tab.key ? 'active' : ''}
                        @click=${() => this._selectTab(tab.key)}
                      >
                        <ha-icon icon=${tab.icon}></ha-icon>
                        ${localize(tab.labelKey, lang, tab.key)}
                      </button>
                    `
                  )}
                </div>
              `
            : ''}
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

      ${this._showShortcuts
        ? html`
            <div
              class="shortcuts-backdrop"
              role="dialog"
              aria-label="Keyboard shortcuts"
              @click=${() => {
                this._showShortcuts = false;
              }}
            >
              <div class="shortcuts-panel" @click=${(e: Event) => e.stopPropagation()}>
                <h2>Keyboard shortcuts</h2>
                <ul>
                  <li><span>Toggle this help</span><kbd>?</kbd></li>
                  <li><span>Focus docs search (Docs tab)</span><kbd>/</kbd></li>
                </ul>
                <button
                  type="button"
                  class="close"
                  @click=${() => {
                    this._showShortcuts = false;
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ultra-card-panel': UltraCardPanel;
  }
}
