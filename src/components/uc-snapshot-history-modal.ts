/**
 * Snapshot History Modal Component
 * Two-tab interface: Dashboard Snapshots | Card Backups
 * Shows full snapshot system with expandable cards and restore functionality
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucSnapshotService, SnapshotListItem } from '../services/uc-snapshot-service';
import { ucCardBackupService, CardBackup } from '../services/uc-card-backup-service';
import { UserSubscription } from '../services/uc-cloud-auth-service';
import { UltraCardConfig } from '../types';

type TabType = 'snapshots' | 'card-backups';

@customElement('uc-snapshot-history-modal')
export class UcSnapshotHistoryModal extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public subscription!: UserSubscription;
  @property({ type: Boolean }) public open = false;

  @state() private _activeTab: TabType = 'snapshots';
  @state() private _snapshots: SnapshotListItem[] = [];
  @state() private _cardBackups: CardBackup[] = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _expandedSnapshotId: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (this.open) {
      this._loadData();
    }
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('open') && this.open) {
      this._loadData();
    }
  }

  private async _loadData() {
    this._loading = true;
    this._error = null;

    try {
      if (this._activeTab === 'snapshots') {
        this._snapshots = await ucSnapshotService.listSnapshots(30);
      } else {
        this._cardBackups = await ucCardBackupService.listBackups(30);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this._error = error instanceof Error ? error.message : 'Failed to load data';
    } finally {
      this._loading = false;
    }
  }

  private _handleTabChange(tab: TabType) {
    this._activeTab = tab;
    this._expandedSnapshotId = null;
    this._loadData();
  }

  private async _handleRestoreSnapshot(snapshot: SnapshotListItem) {
    if (
      !confirm(
        `Restore entire dashboard from snapshot? This will provide configs for ${snapshot.card_count} cards.`
      )
    ) {
      return;
    }

    try {
      const result = await ucSnapshotService.restoreSnapshot(snapshot.id);

      // Fire event with restore instructions
      this.dispatchEvent(
        new CustomEvent('snapshot-restored', {
          detail: { snapshot, result },
          bubbles: true,
          composed: true,
        })
      );

      alert(
        `Snapshot ready! ${snapshot.card_count} card configs available for restoration.\n\n${result.instructions}`
      );
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      alert(
        `Failed to restore snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async _handleRestoreCardBackup(backup: CardBackup) {
    if (
      !confirm(`Restore "${backup.card_name}"? This will replace your current card configuration.`)
    ) {
      return;
    }

    try {
      const config: UltraCardConfig = await ucCardBackupService.restoreBackup(backup.id);

      // Fire event with restored config
      this.dispatchEvent(
        new CustomEvent('card-backup-restored', {
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

  private async _handleDeleteSnapshot(snapshot: SnapshotListItem) {
    if (snapshot.type === 'auto') {
      alert('Auto snapshots cannot be deleted manually');
      return;
    }

    if (!confirm(`Delete snapshot from ${snapshot.date}? This cannot be undone.`)) {
      return;
    }

    try {
      await ucSnapshotService.deleteSnapshot(snapshot.id);
      this._loadData();
    } catch (error) {
      console.error('Failed to delete snapshot:', error);
      alert(
        `Failed to delete snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async _handleDeleteCardBackup(backup: CardBackup) {
    if (!confirm(`Delete backup "${backup.card_name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await ucCardBackupService.deleteBackup(backup.id);
      this._loadData();
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert(`Failed to delete backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async _handleRenameCardBackup(backup: CardBackup) {
    const newName = prompt('Enter new name for backup:', backup.card_name);

    if (!newName || newName === backup.card_name) {
      return;
    }

    try {
      await ucCardBackupService.renameBackup(backup.id, newName);
      this._loadData();
    } catch (error) {
      console.error('Failed to rename backup:', error);
      alert(`Failed to rename backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async _handleDownloadCardBackup(backup: CardBackup) {
    try {
      const fullBackup = await ucCardBackupService.getBackup(backup.id);
      ucCardBackupService.downloadBackup(fullBackup);
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert(
        `Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private _toggleSnapshotExpand(snapshotId: number) {
    this._expandedSnapshotId = this._expandedSnapshotId === snapshotId ? null : snapshotId;
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close-modal', { bubbles: true, composed: true }));
  }

  private _formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  private _formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp * 1000;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return this._formatDate(new Date(timestamp * 1000).toISOString());
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="modal-backdrop" @click="${this._close}">
        <div class="modal-container" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h2>💾 Backup & Snapshot History</h2>
            <button class="close-btn" @click="${this._close}">✕</button>
          </div>

          <!-- TABS -->
          <div class="tabs">
            <button
              class="tab ${this._activeTab === 'snapshots' ? 'active' : ''}"
              @click="${() => this._handleTabChange('snapshots')}"
            >
              📸 Dashboard Snapshots
            </button>
            <button
              class="tab ${this._activeTab === 'card-backups' ? 'active' : ''}"
              @click="${() => this._handleTabChange('card-backups')}"
            >
              💾 Manual Card Backups
            </button>
          </div>

          <!-- CONTENT -->
          <div class="modal-body">
            ${this._loading
              ? html`<div class="loading">Loading...</div>`
              : this._error
                ? html`<div class="error">${this._error}</div>`
                : this._activeTab === 'snapshots'
                  ? this._renderSnapshotsTab()
                  : this._renderCardBackupsTab()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderSnapshotsTab(): TemplateResult {
    if (this._snapshots.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">📸</div>
          <p>No dashboard snapshots yet</p>
          <p class="empty-hint">
            Dashboard snapshots capture all Ultra Cards across your entire dashboard
          </p>
        </div>
      `;
    }

    return html`
      <div class="list">${this._snapshots.map(snapshot => this._renderSnapshotItem(snapshot))}</div>
    `;
  }

  private _renderSnapshotItem(snapshot: SnapshotListItem): TemplateResult {
    const isExpanded = this._expandedSnapshotId === snapshot.id;
    const viewsList = Object.entries(snapshot.views_breakdown);

    return html`
      <div class="list-item snapshot-item ${isExpanded ? 'expanded' : ''}">
        <div class="item-header" @click="${() => this._toggleSnapshotExpand(snapshot.id)}">
          <div class="item-main">
            <div class="item-title">
              <span class="item-icon">${snapshot.type === 'auto' ? '🤖' : '⭐'}</span>
              <span class="item-name">${snapshot.date}</span>
              <span class="badge ${snapshot.type}">${snapshot.type}</span>
            </div>
            <div class="item-meta">
              <span class="meta-item">📦 ${snapshot.card_count} cards</span>
              <span class="meta-item">📏 ${snapshot.size_kb} KB</span>
              <span class="meta-item"
                >🕐 ${this._formatRelativeTime(snapshot.created_timestamp)}</span
              >
            </div>
          </div>
          <div class="expand-icon">${isExpanded ? '▼' : '▶'}</div>
        </div>

        ${isExpanded
          ? html`
              <div class="item-details">
                <div class="details-section">
                  <h4>Views Breakdown:</h4>
                  <ul class="views-list">
                    ${viewsList.map(
                      ([viewName, count]) => html`
                        <li><strong>${viewName}:</strong> ${count} card${count > 1 ? 's' : ''}</li>
                      `
                    )}
                  </ul>
                </div>

                <div class="item-actions">
                  <button
                    class="btn btn-primary"
                    @click="${() => this._handleRestoreSnapshot(snapshot)}"
                  >
                    🔄 Restore All
                  </button>
                  ${snapshot.type === 'manual'
                    ? html`
                        <button
                          class="btn btn-danger"
                          @click="${() => this._handleDeleteSnapshot(snapshot)}"
                        >
                          🗑️ Delete
                        </button>
                      `
                    : ''}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderCardBackupsTab(): TemplateResult {
    if (this._cardBackups.length === 0) {
      return html`
        <div class="empty-state">
          <div class="empty-icon">💾</div>
          <p>No card backups yet</p>
          <p class="empty-hint">Card backups save individual Ultra Card configurations</p>
        </div>
      `;
    }

    return html`
      <div class="list">${this._cardBackups.map(backup => this._renderCardBackupItem(backup))}</div>
      <div class="backup-info">
        <p>
          💡 You can have up to 30 card backups. Oldest backups are automatically removed when limit
          is reached.
        </p>
      </div>
    `;
  }

  private _renderCardBackupItem(backup: CardBackup): TemplateResult {
    return html`
      <div class="list-item">
        <div class="item-main">
          <div class="item-title">
            <span class="item-icon">💾</span>
            <span class="item-name">${backup.card_name}</span>
          </div>
          <div class="item-meta">
            <span class="meta-item">${backup.stats.row_count} rows</span>
            <span class="meta-item">${backup.stats.column_count} cols</span>
            <span class="meta-item">${backup.stats.module_count} modules</span>
            <span class="meta-item">📏 ${backup.size_kb} KB</span>
            <span class="meta-item">🕐 ${this._formatRelativeTime(backup.created_timestamp)}</span>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-primary" @click="${() => this._handleRestoreCardBackup(backup)}">
            🔄 Restore
          </button>
          <button class="btn btn-secondary" @click="${() => this._handleRenameCardBackup(backup)}">
            ✏️ Rename
          </button>
          <button
            class="btn btn-secondary"
            @click="${() => this._handleDownloadCardBackup(backup)}"
          >
            ⬇️ Download
          </button>
          <button class="btn btn-danger" @click="${() => this._handleDeleteCardBackup(backup)}">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }

    .modal-container {
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 2px solid var(--divider-color, #e0e0e0);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: var(--primary-text-color, #000);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 4px 8px;
      color: var(--secondary-text-color, #666);
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--primary-color, #03a9f4);
    }

    /* TABS */
    .tabs {
      display: flex;
      border-bottom: 2px solid var(--divider-color, #e0e0e0);
      padding: 0 24px;
      gap: 8px;
    }

    .tab {
      background: none;
      border: none;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      color: var(--secondary-text-color, #666);
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--primary-text-color, #000);
    }

    .tab.active {
      color: var(--primary-color, #03a9f4);
      border-bottom-color: var(--primary-color, #03a9f4);
    }

    /* BODY */
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .loading,
    .error {
      text-align: center;
      padding: 40px;
      color: var(--secondary-text-color, #666);
    }

    .error {
      color: var(--error-color, #f44336);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.3;
    }

    .empty-state p {
      margin: 8px 0;
      color: var(--secondary-text-color, #666);
    }

    .empty-hint {
      font-size: 13px;
      opacity: 0.7;
    }

    /* LIST */
    .list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .list-item {
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .list-item:hover {
      border-color: var(--primary-color, #03a9f4);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .snapshot-item .item-header {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .item-main {
      flex: 1;
    }

    .item-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 15px;
      font-weight: 600;
      color: var(--primary-text-color, #000);
    }

    .item-icon {
      font-size: 18px;
    }

    .item-name {
      flex: 1;
    }

    .badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.auto {
      background: #e0e0e0;
      color: #666;
    }

    .badge.manual {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .item-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 13px;
      color: var(--secondary-text-color, #666);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .expand-icon {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      transition: transform 0.2s;
    }

    .snapshot-item.expanded .expand-icon {
      transform: rotate(0deg);
    }

    /* DETAILS */
    .item-details {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }

    .details-section {
      margin-bottom: 16px;
    }

    .details-section h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color, #000);
    }

    .views-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .views-list li {
      padding: 6px 0;
      font-size: 13px;
      color: var(--secondary-text-color, #666);
    }

    /* ACTIONS */
    .item-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-color, #03a9f4);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
    }

    .btn-secondary {
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color, #000);
    }

    .btn-secondary:hover {
      background: var(--divider-color, #ccc);
    }

    .btn-danger {
      background: var(--error-color, #f44336);
      color: white;
    }

    .btn-danger:hover {
      background: #d32f2f;
    }

    .backup-info {
      margin-top: 16px;
      padding: 12px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 6px;
      font-size: 13px;
      color: var(--secondary-text-color, #666);
    }

    .backup-info p {
      margin: 0;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      .modal-backdrop {
        padding: 0;
      }

      .modal-container {
        max-height: 100vh;
        border-radius: 0;
      }

      .item-actions {
        width: 100%;
      }

      .btn {
        flex: 1;
        min-width: 0;
      }
    }
  `;
}
