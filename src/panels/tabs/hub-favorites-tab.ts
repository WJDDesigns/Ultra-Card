import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { FavoriteRow } from '../../types';
import { ucFavoritesService } from '../../services/uc-favorites-service';
import { panelStyles } from '../panel-styles';

@customElement('hub-favorites-tab')
export class HubFavoritesTab extends LitElement {
  @state() private _favorites: FavoriteRow[] = [];
  @state() private _toastMsg = '';
  @state() private _search = '';
  private _unsub?: () => void;
  private _toastTimer?: ReturnType<typeof setTimeout>;

  static styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Toolbar */
      .favorites-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
      }

      .search-box {
        flex: 1;
        min-width: 180px;
        max-width: 320px;
        position: relative;
      }

      .search-box input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--primary-color);
      }

      .search-box ha-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }

      .favorites-count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      .favorites-count strong {
        color: var(--primary-text-color);
      }

      /* Favorites grid — matching editor layout */
      .favorites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
      }

      @media (max-width: 600px) {
        .favorites-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Favorite card — matches editor */
      .favorite-card {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .favorite-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: var(--primary-color);
      }

      /* Card header */
      .fav-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 16px 12px;
      }

      .fav-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color, var(--primary-color)));
      }

      .fav-icon-wrap ha-icon {
        --mdc-icon-size: 22px;
        color: white;
      }

      .fav-title-area {
        flex: 1;
        min-width: 0;
      }

      .fav-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .fav-subtitle {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 2px 0 0;
      }

      .fav-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      /* Card body */
      .fav-body {
        padding: 0 16px 12px;
      }

      .fav-description {
        margin: 0 0 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Tags */
      .fav-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }

      .fav-tag {
        display: inline-flex;
        align-items: center;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        color: var(--primary-color);
      }

      /* Footer meta */
      .fav-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.04));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.01);
      }

      .fav-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .fav-meta .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .fav-meta ha-icon {
        --mdc-icon-size: 14px;
        opacity: 0.6;
      }

      /* Copy config button */
      .copy-config-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: none;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 8px;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .copy-config-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
      }

      .copy-config-btn ha-icon {
        --mdc-icon-size: 14px;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._favorites = ucFavoritesService.getFavorites();
    this._unsub = ucFavoritesService.subscribe(list => {
      this._favorites = list;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    if (this._toastTimer) clearTimeout(this._toastTimer);
  }

  private _showToast(msg: string): void {
    this._toastMsg = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (this._toastMsg = ''), 2000);
  }

  private _copyRowConfig(fav: FavoriteRow): void {
    try {
      navigator.clipboard.writeText(JSON.stringify(fav.row));
      this._showToast(`Copied "${fav.name}"`);
    } catch {
      /* ignore */
    }
  }

  private _removeFavorite(fav: FavoriteRow): void {
    if (ucFavoritesService.removeFavorite(fav.id)) {
      this._favorites = ucFavoritesService.getFavorites();
    }
  }

  private _formatDate(ts?: number | string): string {
    if (!ts) return '';
    try {
      const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  }

  private _getFilteredFavorites(): FavoriteRow[] {
    if (!this._search.trim()) return this._favorites;
    const q = this._search.toLowerCase().trim();
    return this._favorites.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q) ||
        (f.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  render() {
    if (this._favorites.length === 0) {
      return html`
        <div class="hub-tab-blurb">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <p><strong>Favorites</strong> are saved layout rows you can reuse. Save a row from the card editor (heart icon), then add it to any card from here.</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <ha-icon icon="mdi:heart-outline"></ha-icon>
          </div>
          <h3>No Favorites Yet</h3>
          <p>Save rows from the card editor to see them here.</p>
          <p class="empty-hint">Tip: Click the heart icon on any row in the editor to save it as a favorite</p>
        </div>
      `;
    }

    const filtered = this._getFilteredFavorites();

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Favorites</strong> are saved layout rows you can reuse. Save a row from the card editor (heart icon), then add it to any card from here.</p>
      </div>
      <!-- Toolbar -->
      <div class="favorites-toolbar">
        ${this._favorites.length > 3
          ? html`
              <div class="search-box">
                <ha-icon icon="mdi:magnify"></ha-icon>
                <input
                  type="text"
                  placeholder="Search favorites…"
                  .value=${this._search}
                  @input=${(e: InputEvent) => (this._search = (e.target as HTMLInputElement).value)}
                />
              </div>
            `
          : ''}
        <span class="favorites-count">
          <strong>${filtered.length}</strong> favorite${filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      ${filtered.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">
                <ha-icon icon="mdi:magnify-close"></ha-icon>
              </div>
              <h3>No Results</h3>
              <p>No favorites match "${this._search}"</p>
            </div>
          `
        : html`
            <div class="favorites-grid">
              ${filtered.map(fav => this._renderFavoriteCard(fav))}
            </div>
          `}

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  private _renderFavoriteCard(fav: FavoriteRow) {
    const colCount = fav.row?.columns?.length ?? 0;
    const dateStr = this._formatDate((fav as any).created || (fav as any).date);

    return html`
      <div class="favorite-card">
        <div class="fav-header">
          <div class="fav-icon-wrap">
            <ha-icon icon="mdi:heart"></ha-icon>
          </div>
          <div class="fav-title-area">
            <h4 class="fav-name">${fav.name}</h4>
            <p class="fav-subtitle">${colCount} column${colCount !== 1 ? 's' : ''}</p>
          </div>
          <div class="fav-actions">
            <button class="action-btn" title="Copy config" @click=${() => this._copyRowConfig(fav)}>
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </button>
            <button class="action-btn delete" title="Remove" @click=${() => this._removeFavorite(fav)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>
        </div>

        ${fav.description || (fav.tags && fav.tags.length)
          ? html`
              <div class="fav-body">
                ${fav.description ? html`<p class="fav-description">${fav.description}</p>` : ''}
                ${fav.tags && fav.tags.length
                  ? html`
                      <div class="fav-tags">
                        ${fav.tags.slice(0, 5).map(t => html`<span class="fav-tag">${t}</span>`)}
                      </div>
                    `
                  : ''}
              </div>
            `
          : ''}

        <div class="fav-footer">
          <div class="fav-meta">
            ${dateStr
              ? html`
                  <span class="meta-item">
                    <ha-icon icon="mdi:calendar-outline"></ha-icon>
                    ${dateStr}
                  </span>
                `
              : ''}
            <span class="meta-item">
              <ha-icon icon="mdi:view-column-outline"></ha-icon>
              ${colCount} col${colCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button class="copy-config-btn" @click=${() => this._copyRowConfig(fav)}>
            <ha-icon icon="mdi:code-json"></ha-icon>
            Copy Config
          </button>
        </div>
      </div>
    `;
  }
}
