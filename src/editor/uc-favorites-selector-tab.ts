/**
 * Favorites tab body for the module selector.
 * Add/export/delete/import stay in the parent (layout-tab); this component emits events.
 */
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { FavoriteRow } from '../types';
import { ucFavoritesService } from '../services/uc-favorites-service';

@customElement('uc-favorites-selector-tab')
export class UcFavoritesSelectorTab extends LitElement {
  private _unsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this._unsub = ucFavoritesService.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
  }

  static styles = css`
    .favorites-container {
      padding: 16px;
    }
    .favorites-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .favorites-header h4 {
      margin: 0;
      color: var(--primary-text-color);
    }
    .import-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }
    .import-btn:hover {
      background: var(--primary-color-dark);
    }
    .import-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    .favorite-card {
      padding: 16px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
    }
    .favorite-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .favorite-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
    }
    .favorite-actions {
      display: flex;
      gap: 4px;
    }
    .action-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .action-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .action-btn.delete:hover {
      border-color: var(--error-color);
      color: var(--error-color);
    }
    .action-btn ha-icon {
      --mdc-icon-size: 14px;
    }
    .favorite-description {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
    .favorite-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .favorite-date {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    .favorite-tags {
      display: flex;
      gap: 4px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .empty-state ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    .empty-state p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    .empty-hint {
      font-size: 12px;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .favorites-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .favorite-card {
        padding: 12px;
      }
    }
  `;

  private _emitAdd(favorite: FavoriteRow): void {
    this.dispatchEvent(
      new CustomEvent('favorite-add', { detail: { favorite }, bubbles: true, composed: true })
    );
  }

  private _emitExport(favorite: FavoriteRow): void {
    this.dispatchEvent(
      new CustomEvent('favorite-export', { detail: { favorite }, bubbles: true, composed: true })
    );
  }

  private _emitDelete(favoriteId: string): void {
    this.dispatchEvent(
      new CustomEvent('favorite-delete', { detail: { favoriteId }, bubbles: true, composed: true })
    );
  }

  private _emitImport(): void {
    this.dispatchEvent(new CustomEvent('import-click', { bubbles: true, composed: true }));
  }

  protected render(): TemplateResult {
    const favorites = ucFavoritesService.getFavorites();

    return html`
      <div class="favorites-container">
        <div class="favorites-header">
          <h4>Saved Favorites</h4>
          <button class="import-btn" @click=${this._emitImport}>
            <ha-icon icon="mdi:import"></ha-icon>
            <span>Import</span>
          </button>
        </div>

        <div class="favorites-grid">
          ${favorites.length > 0
            ? favorites.map(
                favorite => html`
                  <div class="favorite-card">
                    <div class="favorite-header">
                      <h4>${favorite.name}</h4>
                      <div class="favorite-actions">
                        <button
                          class="action-btn"
                          @click=${() => this._emitAdd(favorite)}
                          title="Add to layout"
                        >
                          <ha-icon icon="mdi:plus"></ha-icon>
                        </button>
                        <button
                          class="action-btn"
                          @click=${() => this._emitExport(favorite)}
                          title="Export"
                        >
                          <ha-icon icon="mdi:export"></ha-icon>
                        </button>
                        <button
                          class="action-btn delete"
                          @click=${() => this._emitDelete(favorite.id)}
                          title="Delete"
                        >
                          <ha-icon icon="mdi:delete"></ha-icon>
                        </button>
                      </div>
                    </div>
                    ${favorite.description
                      ? html`<p class="favorite-description">${favorite.description}</p>`
                      : ''}
                    <div class="favorite-meta">
                      <span class="favorite-date">
                        ${new Date(favorite.created).toLocaleDateString()}
                      </span>
                      ${favorite.tags.length > 0
                        ? html`<div class="favorite-tags">
                            ${favorite.tags
                              .slice(0, 2)
                              .map(tag => html`<span class="tag">${tag}</span>`)}
                          </div>`
                        : ''}
                    </div>
                  </div>
                `
              )
            : html`<div class="empty-state">
                <ha-icon icon="mdi:heart-outline"></ha-icon>
                <p>No favorites saved yet</p>
                <p class="empty-hint">Use the heart icon on any row to save it as a favorite</p>
              </div>`}
        </div>
      </div>
    `;
  }
}
