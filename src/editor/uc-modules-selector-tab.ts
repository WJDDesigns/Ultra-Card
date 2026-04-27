/**
 * Modules tab body for the module selector: layout and content modules with search and Standard/PRO tabs.
 * Add-module mutations stay in the parent (layout-tab); this component only emits module-selected.
 */
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import type { ModuleManifest } from '../modules/module-registry';

@customElement('uc-modules-selector-tab')
export class UcModulesSelectorTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public allModules: ModuleManifest[] = [];
  @property({ type: Boolean }) public isAddingToLayoutModule = false;
  @property({ type: String }) public parentLayoutType: string | null = null;
  @property({ type: Boolean }) public isPro = false;
  @property({ type: Boolean }) public isLoggedIn = false;

  @state() private _moduleSearchQuery = '';
  @state() private _activeModuleCategoryTab: 'standard' | 'pro' = 'standard';

  override connectedCallback(): void {
    super.connectedCallback();
  }

  focusSearchInput(): void {
    requestAnimationFrame(() => {
      const input = this.shadowRoot?.getElementById('module-search-input') as HTMLInputElement;
      if (input) input.focus();
    });
  }

  private _filterBySearch(modules: ModuleManifest[], query: string): ModuleManifest[] {
    if (!query || query.trim() === '') return modules;
    const searchLower = query.toLowerCase().trim();
    return modules.filter(meta => {
      const name = meta.title?.toLowerCase() || '';
      const description = meta.description?.toLowerCase() || '';
      const type = meta.type?.toLowerCase() || '';
      const tags = (meta.tags || []).join(' ').toLowerCase();
      return (
        name.includes(searchLower) ||
        description.includes(searchLower) ||
        type.includes(searchLower) ||
        tags.includes(searchLower)
      );
    });
  }

  private _emitModuleSelected(type: string): void {
    this.dispatchEvent(
      new CustomEvent('module-selected', { detail: { type }, bubbles: true, composed: true })
    );
    this._moduleSearchQuery = '';
  }

  private _emitUpgradeClick(): void {
    this.dispatchEvent(
      new CustomEvent('upgrade-click', { bubbles: true, composed: true })
    );
  }

  protected override render(): TemplateResult {
    const hasSearchQuery = this._moduleSearchQuery.trim() !== '';
    const standardModules = this.allModules.filter(m => !m.tags?.includes('pro'));
    const proModules = this.allModules.filter(m => m.tags?.includes('pro'));
    const filteredModules = hasSearchQuery
      ? this._filterBySearch(this.allModules, this._moduleSearchQuery)
      : this._activeModuleCategoryTab === 'standard'
        ? standardModules
        : proModules;

    const layoutModules = filteredModules
      .filter(m => m.category === 'layout' && m.type !== 'pagebreak')
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    let contentModules = filteredModules
      .filter(m => m.category !== 'layout' && m.category !== 'input')
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    const inputModules = filteredModules
      .filter(m => m.category === 'input')
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    if (this.isAddingToLayoutModule && this.parentLayoutType === 'slider') {
      const pageBreakMeta = this.allModules.find(m => m.type === 'pagebreak');
      if (pageBreakMeta) contentModules = [pageBreakMeta, ...contentModules];
    }

    let allowedLayoutModules: ModuleManifest[] = [];
    if (this.isAddingToLayoutModule && this.parentLayoutType) {
      allowedLayoutModules = layoutModules;
    } else if (!this.isAddingToLayoutModule) {
      allowedLayoutModules = layoutModules;
    }

    return html`
      <div class="modules-tab-container">
        ${this._renderSearchBar()}
        ${hasSearchQuery
          ? this._renderSearchResults(filteredModules)
          : html`
              <div class="module-category-tabs">
                <button
                  class="category-tab ${this._activeModuleCategoryTab === 'standard' ? 'active' : ''}"
                  @click=${() => (this._activeModuleCategoryTab = 'standard')}
                >
                  <ha-icon icon="mdi:puzzle"></ha-icon>
                  <span>Standard</span>
                </button>
                <button
                  class="category-tab pro-tab ${this._activeModuleCategoryTab === 'pro' ? 'active' : ''}"
                  @click=${() => (this._activeModuleCategoryTab = 'pro')}
                >
                  <ha-icon icon="mdi:star-circle"></ha-icon>
                  <span>PRO</span>
                  <span class="pro-badge-mini">⭐</span>
                </button>
              </div>

              ${this._activeModuleCategoryTab === 'pro' && !this.isPro
                ? this._renderProUpgradePrompt()
                : html`
                    ${allowedLayoutModules.length > 0
                      ? html`
                          <div class="module-category layout-containers">
                            <h4 class="category-title">Layout Containers</h4>
                            <p class="category-description">
                              ${this.isAddingToLayoutModule
                                ? 'Add layout or content modules at any nesting level'
                                : 'Create containers to organize your modules'}
                            </p>
                            <div class="module-types layout-modules">
                              ${allowedLayoutModules.map(meta => {
                                const isHorizontal = meta.type === 'horizontal';
                                const isVertical = meta.type === 'vertical';
                                return html`
                                  <button
                                    class="module-type-btn layout-module ${isHorizontal ? 'horizontal-layout' : ''} ${isVertical ? 'vertical-layout' : ''}"
                                    @click=${() => this._emitModuleSelected(meta.type)}
                                    title="${meta.description}"
                                  >
                                    <ha-icon icon="${meta.icon}"></ha-icon>
                                    <div class="module-info">
                                      <span class="module-title">${meta.title}</span>
                                      <span class="module-description">${meta.description}</span>
                                    </div>
                                  </button>
                                `;
                              })}
                            </div>
                          </div>
                        `
                      : ''}
                    ${contentModules.length > 0
                      ? html`
                          <div class="module-category">
                            <h4 class="category-title">Content Modules</h4>
                            <p class="category-description">Add content and interactive elements</p>
                            <div class="module-types content-modules">
                              ${contentModules.map(meta => html`
                                <button
                                  class="module-type-btn content-module"
                                  @click=${() => this._emitModuleSelected(meta.type)}
                                  title="${meta.description}"
                                >
                                  <ha-icon icon="${meta.icon}"></ha-icon>
                                  <div class="module-info">
                                    <span class="module-title">${meta.title}</span>
                                    <span class="module-description">${meta.description}</span>
                                  </div>
                                </button>
                              `)}
                            </div>
                          </div>
                        `
                      : ''}
                    ${inputModules.length > 0
                      ? html`
                          <div class="module-category input-modules-category">
                            <h4 class="category-title">
                              <ha-icon icon="mdi:form-textbox" style="--mdc-icon-size: 18px; margin-right: 6px; vertical-align: middle; opacity: 0.7;"></ha-icon>
                              Input Modules
                            </h4>
                            <p class="category-description">Link to Home Assistant input helpers for interactive control</p>
                            <div class="module-types content-modules">
                              ${inputModules.map(meta => html`
                                <button
                                  class="module-type-btn content-module"
                                  @click=${() => this._emitModuleSelected(meta.type)}
                                  title="${meta.description}"
                                >
                                  <ha-icon icon="${meta.icon}"></ha-icon>
                                  <div class="module-info">
                                    <span class="module-title">${meta.title}</span>
                                    <span class="module-description">${meta.description}</span>
                                  </div>
                                </button>
                              `)}
                            </div>
                          </div>
                        `
                      : ''}
                  `}
            `}
      </div>
    `;
  }

  private _renderSearchBar(): TemplateResult {
    return html`
      <div class="search-bar-container">
        <div class="search-bar">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            id="module-search-input"
            type="text"
            placeholder="Search modules..."
            .value=${this._moduleSearchQuery}
            @input=${(e: Event) => {
              const target = e.target as HTMLInputElement;
              this._moduleSearchQuery = target.value;
            }}
          />
          ${this._moduleSearchQuery
            ? html`
                <button
                  class="clear-search-btn"
                  @click=${() => {
                    this._moduleSearchQuery = '';
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

  private _renderSearchResults(modules: ModuleManifest[]): TemplateResult {
    if (modules.length === 0) {
      return html`
        <div class="search-results-empty">
          <ha-icon icon="mdi:magnify-close"></ha-icon>
          <p>No modules found matching "${this._moduleSearchQuery}"</p>
          <button class="clear-search-btn-large" @click=${() => (this._moduleSearchQuery = '')}>
            Clear Search
          </button>
        </div>
      `;
    }
    return html`
      <div class="search-results-container">
        <div class="search-results-header">
          <span>${modules.length} module${modules.length !== 1 ? 's' : ''} found</span>
        </div>
        <div class="search-results-list">
          ${modules.map(meta => {
            const isProModule = meta.tags?.includes('pro') || false;
            const hasAccess = !isProModule || this.isPro;
            const tierLabel = isProModule ? 'PRO' : 'Standard';
            return html`
              <div
                class="search-result-item ${!hasAccess ? 'locked' : ''}"
                @click=${() => {
                  if (hasAccess) this._emitModuleSelected(meta.type);
                }}
              >
                <div class="search-result-icon">
                  <ha-icon icon="${meta.icon}"></ha-icon>
                </div>
                <div class="search-result-content">
                  <div class="search-result-header-row">
                    <span class="search-result-title">${meta.title}</span>
                    <span class="search-result-tier ${isProModule ? 'pro' : 'standard'}">
                      ${isProModule ? '⭐ ' : ''}${tierLabel}
                    </span>
                  </div>
                  <p class="search-result-description">${meta.description}</p>
                </div>
                ${!hasAccess
                  ? html`<ha-icon class="lock-icon" icon="mdi:lock"></ha-icon>`
                  : html`<ha-icon class="add-icon" icon="mdi:plus-circle"></ha-icon>`}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _renderProUpgradePrompt(): TemplateResult {
    return html`
      <div class="pro-upgrade-prompt">
        <div class="pro-icon">
          <ha-icon icon="mdi:star-circle"></ha-icon>
        </div>
        <h3>Ultra Card PRO</h3>
        <p>
          Access premium modules like Weather Forecast, advanced animations, and more exclusive
          features.
        </p>
        <ul class="pro-features">
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Premium Modules</li>
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Cloud Backups</li>
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Auto Snapshots</li>
          <li><ha-icon icon="mdi:check-circle"></ha-icon> Priority Support</li>
        </ul>
        <button class="upgrade-btn" @click=${this._emitUpgradeClick}>
          ${this.isLoggedIn ? 'Upgrade to PRO' : 'Login or Upgrade'}
        </button>
      </div>
    `;
  }

  static override styles = css`
    .modules-tab-container {
      padding: 20px;
    }
    .module-category-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background: var(--secondary-background-color);
      border-radius: 12px;
    }
    .category-tab {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid transparent;
      border-radius: 8px;
      background: var(--card-background-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 600;
      transition: all 0.3s;
      font-family: inherit;
    }
    .category-tab.active {
      border-color: var(--primary-color);
      background: linear-gradient(135deg, rgba(3, 169, 244, 0.1) 0%, rgba(3, 169, 244, 0.05) 100%);
    }
    .category-tab.pro-tab {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }
    .category-tab.pro-tab.active {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
    }
    .pro-badge-mini {
      font-size: 12px;
    }
    .pro-upgrade-prompt {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 32px;
      border-radius: 16px;
      text-align: center;
    }
    .pro-upgrade-prompt .pro-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    .pro-upgrade-prompt .pro-icon ha-icon {
      --mdc-icon-size: 64px;
    }
    .pro-upgrade-prompt h3 {
      font-size: 24px;
      margin: 0 0 12px 0;
      font-weight: 700;
    }
    .pro-upgrade-prompt p {
      opacity: 0.95;
      margin: 0 0 20px 0;
      font-size: 16px;
    }
    .pro-features {
      list-style: none;
      padding: 0;
      margin: 24px auto;
      display: grid;
      gap: 12px;
      text-align: left;
      max-width: 300px;
    }
    .pro-features li {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 500;
    }
    .pro-features li ha-icon {
      --mdc-icon-size: 20px;
    }
    .upgrade-btn {
      padding: 14px 32px;
      background: rgba(255, 255, 255, 0.25);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      color: white;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s;
      font-family: inherit;
    }
    .upgrade-btn:hover {
      background: rgba(255, 255, 255, 0.35);
      transform: translateY(-2px);
    }
    .module-category {
      margin-bottom: 24px;
    }
    .category-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--primary-text-color);
    }
    .category-description {
      font-size: 14px;
      color: var(--secondary-text-color);
      margin: 0 0 16px 0;
      line-height: 1.4;
    }
    .module-types {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .module-type-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
      width: 100%;
      min-height: 60px;
    }
    .module-type-btn:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
    }
    .module-type-btn:hover .module-title,
    .module-type-btn:hover .module-description {
      color: white !important;
    }
    .module-type-btn ha-icon {
      font-size: 32px;
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
      border-radius: 8px;
    }
    .module-type-btn:hover ha-icon {
      background: white;
      color: var(--primary-color);
    }
    .module-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }
    .module-title {
      font-weight: 500;
      font-size: 16px;
      color: var(--primary-text-color);
    }
    .module-description {
      font-size: 14px;
      color: var(--secondary-text-color);
      line-height: 1.3;
    }
    .layout-modules .module-type-btn.layout-module {
      position: relative;
      border: 2px solid var(--success-color, #4caf50);
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.1));
    }
    .layout-modules .module-type-btn.layout-module:hover {
      border-color: var(--success-color, #4caf50);
      background: var(--success-color, #4caf50);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
    .layout-modules .module-type-btn.layout-module:hover .module-title,
    .layout-modules .module-type-btn.layout-module:hover .module-description {
      color: white !important;
    }
    .layout-modules .module-type-btn.layout-module ha-icon {
      background: var(--success-color, #4caf50);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    .layout-modules .module-type-btn.layout-module:hover ha-icon {
      background: white;
      color: var(--success-color, #4caf50);
    }
    .content-modules .module-type-btn.content-module {
      border: 1px solid var(--divider-color);
    }
    .content-modules .module-type-btn.content-module:hover {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
    }
    .content-modules .module-type-btn.content-module:hover .module-title,
    .content-modules .module-type-btn.content-module:hover .module-description {
      color: white !important;
    }
    .search-bar-container {
      padding: 16px;
      background: var(--secondary-background-color);
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      transition: all 0.2s;
    }
    .search-bar:focus-within {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 1px var(--primary-color);
    }
    .search-bar ha-icon {
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
      flex-shrink: 0;
    }
    .search-bar input {
      flex: 1;
      border: none;
      background: none;
      outline: none;
      font-size: 14px;
      font-family: inherit;
      color: var(--primary-text-color);
    }
    .search-bar input::placeholder {
      color: var(--secondary-text-color);
      opacity: 0.7;
    }
    .clear-search-btn {
      padding: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .clear-search-btn:hover {
      background: var(--divider-color);
    }
    .clear-search-btn ha-icon {
      --mdc-icon-size: 18px;
    }
    .search-results-container {
      padding: 16px;
    }
    .search-results-header {
      margin-bottom: 16px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .search-results-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .search-result-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .search-result-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .search-result-item.locked {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .search-result-item.locked:hover {
      border-color: var(--divider-color);
      transform: none;
    }
    .search-result-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
      border-radius: 8px;
      flex-shrink: 0;
    }
    .search-result-icon ha-icon {
      --mdc-icon-size: 28px;
    }
    .search-result-content {
      flex: 1;
      min-width: 0;
    }
    .search-result-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      gap: 12px;
    }
    .search-result-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .search-result-tier {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }
    .search-result-tier.standard {
      background: var(--primary-color);
      color: white;
    }
    .search-result-tier.pro {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .search-result-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .add-icon,
    .lock-icon {
      --mdc-icon-size: 24px;
      flex-shrink: 0;
      color: var(--primary-color);
    }
    .lock-icon {
      color: var(--secondary-text-color);
    }
    .search-results-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
    .search-results-empty ha-icon {
      --mdc-icon-size: 64px;
      color: var(--secondary-text-color);
      opacity: 0.5;
      margin-bottom: 16px;
    }
    .search-results-empty p {
      font-size: 15px;
      color: var(--secondary-text-color);
      margin: 0 0 20px 0;
    }
    .clear-search-btn-large {
      padding: 12px 24px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .clear-search-btn-large:hover {
      background: var(--primary-color-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `;
}
