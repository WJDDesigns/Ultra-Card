/**
 * Backup History Modal Component
 * Shows list of auto-backups and snapshots with restore/delete actions
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import {
  ucCloudBackupService,
  BackupListItem,
  BackupListResponse,
} from '../services/uc-cloud-backup-service';
import { UserSubscription } from '../services/uc-cloud-auth-service';
import { UltraCardConfig } from '../types';

@customElement('uc-backup-history-modal')
export class UcBackupHistoryModal extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public subscription!: UserSubscription;
  @property({ type: Boolean }) public open = false;

  @state() private _activeTab: 'all' | 'auto' | 'snapshot' = 'all';
  @state() private _backups: BackupListItem[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _currentPage = 1;
  @state() private _totalPages = 1;
  @state() private _total = 0;

  connectedCallback() {
    super.connectedCallback();
    if (this.open) {
      this._loadBackups();
    }
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('open') && this.open) {
      this._loadBackups();
    }
  }

  private async _loadBackups() {
    this._loading = true;
    this._error = null;

    try {
      const type = this._activeTab === 'all' ? undefined : this._activeTab;
      const response: BackupListResponse = await ucCloudBackupService.listBackups(
        this._currentPage,
        20,
        type
      );

      this._backups = response.backups;
      this._total = response.total;
      this._totalPages = response.total_pages;
    } catch (error) {
      console.error('Failed to load backups:', error);
      this._error = error instanceof Error ? error.message : 'Failed to load backups';
    } finally {
      this._loading = false;
    }
  }

  private _handleTabChange(tab: 'all' | 'auto' | 'snapshot') {
    this._activeTab = tab;
    this._currentPage = 1;
    this._loadBackups();
  }

  private _handlePageChange(page: number) {
    this._currentPage = page;
    this._loadBackups();
  }

  private async _handleRestore(backup: BackupListItem) {
    if (!confirm(`Restore this backup? This will replace your current configuration.`)) {
      return;
    }

    try {
      const config: UltraCardConfig = await ucCloudBackupService.restoreBackup(backup.id);

      // Fire event with restored config
      this.dispatchEvent(
        new CustomEvent('backup-restored', {
          detail: { config, backup },
          bubbles: true,
          composed: true,
        })
      );

      this._close();
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert(
        `Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async _handleDownload(backup: BackupListItem) {
    try {
      const fullBackup = await ucCloudBackupService.getBackup(backup.id);
      const json = JSON.stringify(fullBackup.config, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ultra-card-backup-${backup.version_number}.json`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async _handleDelete(backup: BackupListItem) {
    if (backup.type !== 'snapshot') {
      alert('Only snapshots can be deleted. Auto-backups are automatically pruned after 30 days.');
      return;
    }

    if (!confirm(`Delete snapshot "${backup.snapshot_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await ucCloudBackupService.deleteSnapshot(backup.id);
      this._loadBackups(); // Reload list
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _close() {
    this.dispatchEvent(
      new CustomEvent('close-modal', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  private _renderTabs(): TemplateResult {
    return html`
      <div class="tabs">
        <button
          class="tab ${this._activeTab === 'all' ? 'active' : ''}"
          @click="${() => this._handleTabChange('all')}"
        >
          All (${this._total})
        </button>
        <button
          class="tab ${this._activeTab === 'auto' ? 'active' : ''}"
          @click="${() => this._handleTabChange('auto')}"
        >
          Auto-Backups
        </button>
        <button
          class="tab ${this._activeTab === 'snapshot' ? 'active' : ''}"
          @click="${() => this._handleTabChange('snapshot')}"
        >
          Snapshots
        </button>
      </div>
    `;
  }

  private _renderBackupList(): TemplateResult {
    if (this._loading) {
      return html`
        <div class="loading">
          <ha-circular-progress active></ha-circular-progress>
          <p>Loading backups...</p>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="error">
          <ha-alert alert-type="error">${this._error}</ha-alert>
          <button @click="${this._loadBackups}" class="retry-button">Retry</button>
        </div>
      `;
    }

    if (this._backups.length === 0) {
      return html`
        <div class="empty">
          <p>No backups found</p>
          <p class="empty-hint">
            ${this._activeTab === 'snapshot'
              ? 'Create your first snapshot to save important configurations.'
              : 'Your backups will appear here automatically.'}
          </p>
        </div>
      `;
    }

    return html`
      <div class="backup-list">${this._backups.map(backup => this._renderBackupItem(backup))}</div>
      ${this._totalPages > 1 ? this._renderPagination() : ''}
    `;
  }

  private _renderBackupItem(backup: BackupListItem): TemplateResult {
    const isSnapshot = backup.type === 'snapshot';
    const title = isSnapshot ? backup.snapshot_name : `Auto-backup v${backup.version_number}`;
    const canDelete = isSnapshot;

    return html`
      <div class="backup-item ${backup.type}">
        <div class="backup-header">
          <div class="backup-title">
            <ha-icon icon="${isSnapshot ? 'mdi:bookmark' : 'mdi:backup-restore'}"></ha-icon>
            <span class="title">${title}</span>
            ${isSnapshot
              ? html`<span class="badge snapshot-badge">Snapshot</span>`
              : html`<span class="badge auto-badge">Auto</span>`}
          </div>
          <div class="backup-date">${this._formatDate(backup.created)}</div>
        </div>

        ${backup.snapshot_description
          ? html`<div class="backup-description">${backup.snapshot_description}</div>`
          : ''}

        <div class="backup-stats">
          <span class="stat">
            <ha-icon icon="mdi:table-row"></ha-icon>
            ${backup.card_stats?.row_count || 0} rows
          </span>
          <span class="stat">
            <ha-icon icon="mdi:view-column"></ha-icon>
            ${backup.card_stats?.column_count || 0} columns
          </span>
          <span class="stat">
            <ha-icon icon="mdi:puzzle"></ha-icon>
            ${backup.card_stats?.module_count || 0} modules
          </span>
          <span class="stat">
            <ha-icon icon="mdi:file"></ha-icon>
            ${backup.size_kb} KB
          </span>
          ${backup.restore_count
            ? html`<span class="stat">
                <ha-icon icon="mdi:restore"></ha-icon>
                Restored ${backup.restore_count}x
              </span>`
            : ''}
        </div>

        <div class="backup-actions">
          <button @click="${() => this._handleRestore(backup)}" class="action-button primary">
            <ha-icon icon="mdi:restore"></ha-icon>
            Restore
          </button>
          <button @click="${() => this._handleDownload(backup)}" class="action-button">
            <ha-icon icon="mdi:download"></ha-icon>
            Download
          </button>
          ${canDelete
            ? html`
                <button @click="${() => this._handleDelete(backup)}" class="action-button danger">
                  <ha-icon icon="mdi:delete"></ha-icon>
                  Delete
                </button>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _renderPagination(): TemplateResult {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, this._currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this._totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return html`
      <div class="pagination">
        <button
          @click="${() => this._handlePageChange(this._currentPage - 1)}"
          ?disabled="${this._currentPage === 1}"
          class="page-button"
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>

        ${startPage > 1
          ? html`
              <button @click="${() => this._handlePageChange(1)}" class="page-button">1</button>
              ${startPage > 2 ? html`<span class="page-ellipsis">...</span>` : ''}
            `
          : ''}
        ${pages.map(
          page => html`
            <button
              @click="${() => this._handlePageChange(page)}"
              class="page-button ${page === this._currentPage ? 'active' : ''}"
            >
              ${page}
            </button>
          `
        )}
        ${endPage < this._totalPages
          ? html`
              ${endPage < this._totalPages - 1 ? html`<span class="page-ellipsis">...</span>` : ''}
              <button
                @click="${() => this._handlePageChange(this._totalPages)}"
                class="page-button"
              >
                ${this._totalPages}
              </button>
            `
          : ''}

        <button
          @click="${() => this._handlePageChange(this._currentPage + 1)}"
          ?disabled="${this._currentPage === this._totalPages}"
          class="page-button"
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this.open) return html``;

    return html`
      <ha-dialog open @closed="${this._close}" .heading="${'Backup History'}">
        <div class="dialog-content">${this._renderTabs()} ${this._renderBackupList()}</div>
        <mwc-button slot="primaryAction" @click="${this._close}">Close</mwc-button>
      </ha-dialog>
    `;
  }

  static get styles() {
    return css`
      :host {
        --dialog-max-width: 800px;
      }

      .dialog-content {
        min-height: 400px;
        max-height: 600px;
        overflow-y: auto;
      }

      /* Tabs */
      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        border-bottom: 2px solid var(--divider-color);
        padding-bottom: 0;
      }

      .tab {
        padding: 12px 16px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: var(--secondary-text-color);
        transition: all 0.2s;
      }

      .tab:hover {
        color: var(--primary-text-color);
        background: var(--secondary-background-color);
      }

      .tab.active {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
      }

      /* Loading/Error/Empty States */
      .loading,
      .error,
      .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 24px;
        text-align: center;
      }

      .loading ha-circular-progress {
        margin-bottom: 16px;
      }

      .empty-hint {
        color: var(--secondary-text-color);
        font-size: 14px;
        margin-top: 8px;
      }

      .retry-button {
        margin-top: 16px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      /* Backup List */
      .backup-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .backup-item {
        padding: 16px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        transition: all 0.2s;
      }

      .backup-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .backup-item.snapshot {
        border-left: 3px solid var(--primary-color);
      }

      .backup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .backup-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .backup-title ha-icon {
        --mdc-icon-size: 20px;
        color: var(--primary-color);
      }

      .backup-date {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .snapshot-badge {
        background: var(--primary-color);
        color: white;
      }

      .auto-badge {
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }

      .backup-description {
        margin: 8px 0;
        padding: 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .backup-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin: 12px 0;
        padding: 12px 0;
        border-top: 1px solid var(--divider-color);
        border-bottom: 1px solid var(--divider-color);
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .stat ha-icon {
        --mdc-icon-size: 16px;
      }

      .backup-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .action-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
      }

      .action-button:hover {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .action-button.primary {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .action-button.primary:hover {
        opacity: 0.9;
      }

      .action-button.danger:hover {
        background: var(--error-color);
        border-color: var(--error-color);
        color: white;
      }

      .action-button ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Pagination */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }

      .page-button {
        min-width: 36px;
        height: 36px;
        padding: 0 8px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .page-button:hover:not(:disabled) {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .page-button.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .page-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .page-ellipsis {
        padding: 0 8px;
        color: var(--secondary-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-backup-history-modal': UcBackupHistoryModal;
  }
}
