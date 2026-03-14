/**
 * Cards tab body for the module selector: native HA cards and 3rd party cards.
 * Add-card mutations stay in the parent (layout-tab); this component only emits card-selected.
 */
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucExternalCardsService } from '../services/uc-external-cards-service';
import {
  NATIVE_HA_CARDS,
  CUSTOM_YAML_CARD_TYPE,
  type NativeCardEntry,
} from './tabs/layout-tab-constants';

export interface ThirdPartyCardEntry {
  type: string;
  name: string;
  description?: string;
  version?: string;
}

@customElement('uc-card-selector-tab')
export class UcCardSelectorTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Number }) public globalExternalCardCount = 0;
  @property({ type: Boolean }) public isPro = false;

  @state() private _cardSearchQuery = '';

  /** Cached snapshot of third-party cards; refreshed on tab enter and on explicit Refresh. */
  @state() private _cachedAvailableCards: ThirdPartyCardEntry[] = [];
  private _cachedCardsByType = new Map<string, ThirdPartyCardEntry>();

  static styles = css`
    .cards-tab-container {
      padding: 20px;
    }
    .cards-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--divider-color);
    }
    .cards-header h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .refresh-btn {
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .refresh-btn:hover {
      background: var(--primary-color-hover);
    }
    .search-bar-container {
      margin-bottom: 16px;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }
    .search-bar ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    .search-bar input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .search-bar input::placeholder {
      color: var(--secondary-text-color);
    }
    .clear-search-btn {
      padding: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
    }
    .clear-search-btn:hover {
      color: var(--primary-text-color);
    }
    .cards-section {
      margin-bottom: 32px;
      padding: 16px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
    }
    .native-section {
      border-left: 4px solid var(--primary-color);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--divider-color);
    }
    .section-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title-row ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 20px;
    }
    .section-title-row h5 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .unlimited-badge, .limit-badge, .pro-badge-mini {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    .unlimited-badge {
      background: var(--success-color, #4caf50);
      color: white;
    }
    .limit-badge {
      background: var(--warning-color, #ff9800);
      color: white;
    }
    .pro-badge-mini {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .upgrade-notice {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 14px;
      gap: 12px;
    }
    .get-pro-btn-mini {
      padding: 6px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .thirdparty-notebox {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 152, 0, 0.1);
      border: 1px solid rgba(255, 152, 0, 0.3);
      border-radius: 8px;
      margin-bottom: 16px;
      align-items: flex-start;
    }
    .thirdparty-notebox ha-icon {
      color: #ff9800;
      --mdc-icon-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .notebox-content {
      flex: 1;
      font-size: 12px;
      line-height: 1.5;
    }
    .notebox-content strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }
    .card-item {
      padding: 14px;
      background: var(--secondary-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .card-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(var(--rgb-primary-color), 0.2);
      transform: translateY(-2px);
    }
    .native-card-item .card-icon {
      background: rgba(var(--rgb-primary-color), 0.15);
    }
    .yaml-card-item {
      border: 2px dashed var(--primary-color);
      background: rgba(var(--rgb-primary-color), 0.05);
    }
    .yaml-card-item .card-icon {
      background: var(--primary-color);
    }
    .yaml-card-item .card-icon ha-icon {
      color: white;
    }
    .card-icon {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 8px;
      flex-shrink: 0;
    }
    .card-icon ha-icon {
      --mdc-icon-size: 22px;
      color: var(--primary-color);
    }
    .card-info {
      flex: 1;
      min-width: 0;
    }
    .card-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 3px;
    }
    .card-type {
      font-size: 11px;
      color: var(--secondary-text-color);
      font-family: 'Courier New', monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-version {
      font-size: 10px;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }
    .card-add-hint {
      opacity: 0.4;
      transition: opacity 0.2s;
      color: var(--primary-color);
    }
    .card-add-hint ha-icon {
      --mdc-icon-size: 22px;
    }
    .card-item:hover .card-add-hint {
      opacity: 1;
    }
    .empty-state-mini {
      padding: 32px 16px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .empty-state-mini ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.3;
      margin-bottom: 12px;
    }
    .empty-state-mini p {
      margin: 6px 0;
      font-size: 14px;
    }
    .empty-hint {
      font-size: 12px;
      opacity: 0.7;
    }
    .cards-info {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: rgba(var(--rgb-primary-color), 0.05);
      border: 1px solid rgba(var(--rgb-primary-color), 0.2);
      border-radius: 8px;
      align-items: flex-start;
      margin-top: 16px;
      margin-bottom: 20px;
    }
    .cards-info ha-icon {
      color: var(--primary-color);
      --mdc-icon-size: 18px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .info-content {
      flex: 1;
      font-size: 12px;
      line-height: 1.5;
    }
    .info-content strong {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .search-results-empty {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .search-results-empty ha-icon {
      --mdc-icon-size: 48px;
      opacity: 0.5;
      margin-bottom: 12px;
    }
    .clear-search-btn-large {
      margin-top: 12px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .search-results-container {
      margin-top: 16px;
    }
    .search-results-header {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .search-results-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .search-category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0 8px 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--secondary-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .search-result-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(var(--rgb-primary-color), 0.15);
    }
    .search-result-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 8px;
      flex-shrink: 0;
    }
    .search-result-icon ha-icon {
      --mdc-icon-size: 22px;
      color: var(--primary-color);
    }
    .search-result-content {
      flex: 1;
      min-width: 0;
    }
    .search-result-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .search-result-title {
      font-weight: 600;
      font-size: 14px;
    }
    .search-result-tier {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 500;
    }
    .search-result-tier.standard {
      background: rgba(var(--rgb-primary-color), 0.15);
      color: var(--primary-color);
    }
    .search-result-tier.pro {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
      color: #764ba2;
    }
    .search-result-description {
      margin: 0;
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .search-result-version {
      margin: 4px 0 0 0;
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    .add-icon {
      color: var(--primary-color);
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this._refreshCardsCache();
  }

  /** Refresh cached third-party cards snapshot (tab enter / explicit Refresh). */
  private _refreshCardsCache(): void {
    const cards = ucExternalCardsService.getAvailableCards();
    this._cachedAvailableCards = cards.map(c => ({
      type: c.type,
      name: c.name,
      description: c.description,
      version: c.version,
    }));
    this._cachedCardsByType = new Map(cards.map(c => [c.type, { type: c.type, name: c.name, description: c.description, version: c.version }]));
  }

  /** Focus the search input (called by parent for #card-search-input focus behavior). */
  public focusSearchInput(): void {
    requestAnimationFrame(() => {
      const input = this.shadowRoot?.getElementById('card-search-input') as HTMLInputElement;
      if (input) input.focus();
    });
  }

  private _filterCardsBySearch(
    cards: Array<{ type: string; name: string; icon?: string; description?: string }>,
    query: string
  ): Array<{ type: string; name: string; icon?: string; description?: string }> {
    if (!query || !query.trim()) return cards;
    const searchLower = query.toLowerCase().trim();
    return cards.filter(
      card =>
        (card.name?.toLowerCase() || '').includes(searchLower) ||
        (card.description?.toLowerCase() || '').includes(searchLower) ||
        (card.type?.toLowerCase() || '').includes(searchLower)
    );
  }

  private _emitCardSelected(type: string): void {
    this.dispatchEvent(
      new CustomEvent('card-selected', { detail: { type }, bubbles: true, composed: true })
    );
  }

  private _emitRefresh(): void {
    this._refreshCardsCache();
    this.dispatchEvent(new CustomEvent('refresh', { bubbles: true, composed: true }));
  }

  private _emitOpenPro(): void {
    this.dispatchEvent(new CustomEvent('open-pro', { bubbles: true, composed: true }));
  }

  private _renderSearchBar(): TemplateResult {
    return html`
      <div class="search-bar-container">
        <div class="search-bar">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            id="card-search-input"
            type="text"
            placeholder="Search cards..."
            .value=${this._cardSearchQuery}
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              this._cardSearchQuery = target.value;
            }}
          />
          ${this._cardSearchQuery
            ? html`
                <button
                  class="clear-search-btn"
                  @click=${() => {
                    this._cardSearchQuery = '';
                    this.focusSearchInput();
                  }}
                  title="Clear search"
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderSearchResults(
    filteredNative: NativeCardEntry[],
    filteredThirdParty: Array<{ type: string; name: string; description?: string }>
  ): TemplateResult {
    const totalResults = filteredNative.length + filteredThirdParty.length;

    if (totalResults === 0) {
      return html`
        <div class="search-results-empty">
          <ha-icon icon="mdi:magnify-close"></ha-icon>
          <p>No cards found matching "${this._cardSearchQuery}"</p>
          <button
            class="clear-search-btn-large"
            @click=${() => {
              this._cardSearchQuery = '';
              this.focusSearchInput();
            }}
          >
            Clear Search
          </button>
        </div>
      `;
    }

    return html`
      <div class="search-results-container">
        <div class="search-results-header">
          <span>${totalResults} card${totalResults !== 1 ? 's' : ''} found</span>
        </div>
        <div class="search-results-list">
          ${filteredNative.length > 0
            ? html`
                <div class="search-category-header">
                  <ha-icon icon="mdi:home-assistant"></ha-icon>
                  <span>Native Home Assistant Cards</span>
                </div>
                ${filteredNative.map(
                  card => html`
                    <div class="search-result-item" @click=${() => this._emitCardSelected(card.type)}>
                      <div class="search-result-icon">
                        <ha-icon icon="${card.icon || 'mdi:home-assistant'}"></ha-icon>
                      </div>
                      <div class="search-result-content">
                        <div class="search-result-header-row">
                          <span class="search-result-title">${card.name}</span>
                          <span class="search-result-tier standard">Native</span>
                        </div>
                        <p class="search-result-description">${card.description || card.type}</p>
                      </div>
                      <ha-icon class="add-icon" icon="mdi:plus-circle"></ha-icon>
                    </div>
                  `
                )}
              `
            : ''}
          ${filteredThirdParty.length > 0
            ? html`
                <div class="search-category-header">
                  <ha-icon icon="mdi:puzzle"></ha-icon>
                  <span>Community & 3rd Party Cards</span>
                </div>
                ${filteredThirdParty.map(card => {
                  const actualCard = this._cachedCardsByType.get(card.type);
                  return html`
                    <div class="search-result-item" @click=${() => this._emitCardSelected(card.type)}>
                      <div class="search-result-icon">
                        <ha-icon icon="mdi:card-bulleted"></ha-icon>
                      </div>
                      <div class="search-result-content">
                        <div class="search-result-header-row">
                          <span class="search-result-title">${card.name}</span>
                          <span class="search-result-tier ${this.isPro ? 'pro' : 'standard'}">
                            ${this.isPro ? '⭐ Pro' : '3rd Party'}
                          </span>
                        </div>
                        <p class="search-result-description">${card.description ?? ''}</p>
                        ${actualCard?.version
                          ? html`<p class="search-result-version">v${actualCard.version}</p>`
                          : ''}
                      </div>
                      <ha-icon class="add-icon" icon="mdi:plus-circle"></ha-icon>
                    </div>
                  `;
                })}
              `
            : ''}
        </div>
      </div>
    `;
  }

  protected render(): TemplateResult {
    const nativeCards = NATIVE_HA_CARDS;
    const availableCards = this._cachedAvailableCards;
    const hasSearchQuery = this._cardSearchQuery.trim() !== '';

    const filteredNativeCards = hasSearchQuery
      ? this._filterCardsBySearch(nativeCards, this._cardSearchQuery)
      : nativeCards;

    const thirdPartyForFilter = availableCards.map(c => ({
      type: c.type,
      name: c.name,
      description: c.type,
    }));
    const filteredAvailableCards = hasSearchQuery
      ? this._filterCardsBySearch(thirdPartyForFilter, this._cardSearchQuery)
      : thirdPartyForFilter;

    return html`
      <div class="cards-tab-container">
        <div class="cards-header">
          <h4>Cards</h4>
          <button class="refresh-btn" @click=${() => this._emitRefresh()}>
            <ha-icon icon="mdi:refresh"></ha-icon>
            <span>Refresh</span>
          </button>
        </div>

        ${this._renderSearchBar()}

        <div class="cards-info">
          <ha-icon icon="mdi:information"></ha-icon>
          <div class="info-content">
            <strong>How to use:</strong>
            <p>
              Click any card to add it to your selected column. Native HA cards and 3rd party cards
              will use their native editors when available.
            </p>
          </div>
        </div>

        ${hasSearchQuery
          ? this._renderSearchResults(filteredNativeCards, filteredAvailableCards)
          : html`
              <!-- Native Home Assistant Cards -->
              <div class="cards-section native-section">
                <div class="section-header">
                  <div class="section-title-row">
                    <ha-icon icon="mdi:home-assistant"></ha-icon>
                    <h5>Native Home Assistant</h5>
                  </div>
                  <div class="unlimited-badge">
                    <ha-icon icon="mdi:infinity"></ha-icon>
                    <span>Unlimited</span>
                  </div>
                </div>

                ${nativeCards.length > 0
                  ? html`
                      <div class="cards-grid">
                        ${nativeCards.map(
                          (card: NativeCardEntry) => html`
                            <div
                              class="card-item native-card-item ${card.type === CUSTOM_YAML_CARD_TYPE
                                ? 'yaml-card-item'
                                : ''}"
                              @click=${() => this._emitCardSelected(card.type)}
                            >
                              <div
                                class="card-icon ${card.type === CUSTOM_YAML_CARD_TYPE
                                  ? 'yaml-icon'
                                  : 'native-icon'}"
                              >
                                <ha-icon icon="${card.icon || 'mdi:home-assistant'}"></ha-icon>
                              </div>
                              <div class="card-info">
                                <div class="card-name">${card.name}</div>
                                <div class="card-type">${card.description || card.type}</div>
                              </div>
                              <div class="card-add-hint">
                                <ha-icon icon="mdi:plus-circle"></ha-icon>
                              </div>
                            </div>
                          `
                        )}
                      </div>
                    `
                  : html`
                      <div class="empty-state-mini">
                        <ha-icon icon="mdi:information-outline"></ha-icon>
                        <p>No native cards detected</p>
                      </div>
                    `}
              </div>

              <!-- Community & 3rd Party Cards -->
              <div class="cards-section thirdparty-section-wrapper">
                <div class="section-header">
                  <div class="section-title-row">
                    <ha-icon icon="mdi:puzzle"></ha-icon>
                    <h5>Community & 3rd Party</h5>
                  </div>
                  ${!this.isPro
                    ? html`
                        <div class="limit-badge">
                          <ha-icon icon="mdi:information-outline"></ha-icon>
                          <span>${this.globalExternalCardCount} 3rd party cards</span>
                        </div>
                      `
                    : html`
                        <div class="pro-badge-mini">
                          <ha-icon icon="mdi:crown"></ha-icon>
                          <span>Unlimited</span>
                        </div>
                      `}
                </div>

                ${!this.isPro
                  ? html`
                      <div class="upgrade-notice">
                        <span>Want unlimited 3rd party cards?</span>
                        <button class="get-pro-btn-mini" @click=${() => this._emitOpenPro()}>
                          Get Pro
                        </button>
                      </div>
                    `
                  : ''}

                <div class="thirdparty-notebox">
                  <ha-icon icon="mdi:alert-circle"></ha-icon>
                  <div class="notebox-content">
                    <strong>Compatibility Notice:</strong>
                    <p>Some 3rd party cards may not work as intended. Please report any issues.</p>
                  </div>
                </div>

                ${availableCards.length > 0
                  ? html`
                      <div class="cards-grid">
                        ${availableCards.map(
                          (card: ThirdPartyCardEntry) => html`
                            <div class="card-item" @click=${() => this._emitCardSelected(card.type)}>
                              <div class="card-icon">
                                <ha-icon icon="mdi:card-bulleted"></ha-icon>
                              </div>
                              <div class="card-info">
                                <div class="card-name">${card.name}</div>
                                <div class="card-type">${card.type}</div>
                                ${card.version
                                  ? html`<div class="card-version">v${card.version}</div>`
                                  : ''}
                              </div>
                              <div class="card-add-hint">
                                <ha-icon icon="mdi:plus-circle"></ha-icon>
                              </div>
                            </div>
                          `
                        )}
                      </div>
                    `
                  : html`
                      <div class="empty-state-mini">
                        <ha-icon icon="mdi:card-off"></ha-icon>
                        <p>No 3rd party cards installed</p>
                        <p class="empty-hint">Install custom cards via HACS</p>
                      </div>
                    `}
              </div>
            `}
      </div>
    `;
  }
}
