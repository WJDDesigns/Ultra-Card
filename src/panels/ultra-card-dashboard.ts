/**
 * Ultra Card Hub - Home Assistant sidebar panel.
 * Dashboard (welcome + stats), Favorites, Presets, Colors, Variables, Templates, Pro, About.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { panelStyles } from './panel-styles';
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

type HubTab = 'dashboard' | 'favorites' | 'presets' | 'colors' | 'variables' | 'templates' | 'pro' | 'about';

interface TabDef {
  key: HubTab;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard' },
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

  private _unsub?: () => void;

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

      @media (max-width: 600px) {
        .tab-strip {
          padding: 0 8px;
        }
        .tab-strip button {
          padding: 12px 12px;
          font-size: 13px;
          gap: 6px;
        }
        .tab-strip button ha-icon {
          --mdc-icon-size: 18px;
        }
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._updateProState();
    if (this.hass?.connection) {
      this._unsub = this.hass.connection.subscribeEvents(() => {
        this._updateProState();
      }, 'state_changed');
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
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
  }

  private _renderTabContent(): unknown {
    switch (this._activeTab) {
      case 'dashboard':
        return html`<hub-dashboard-tab .hass=${this.hass}></hub-dashboard-tab>`;
      case 'favorites':
        return html`<hub-favorites-tab></hub-favorites-tab>`;
      case 'presets':
        return html`<hub-presets-tab></hub-presets-tab>`;
      case 'colors':
        return html`<hub-colors-tab></hub-colors-tab>`;
      case 'variables':
        return html`<hub-variables-tab .hass=${this.hass}></hub-variables-tab>`;
      case 'templates':
        return html`<hub-templates-tab></hub-templates-tab>`;
      case 'pro':
        return html`<hub-pro-tab .auth=${this._proAuth} .hass=${this.hass}></hub-pro-tab>`;
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
        <header class="hub-header">
          <h1>Ultra Card</h1>
        </header>

        <nav class="tab-strip">
          ${visibleTabs.map(
            tab => html`
              <button
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
