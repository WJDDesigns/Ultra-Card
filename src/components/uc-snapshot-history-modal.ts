/**
 * Snapshot History Modal Component
 * Two-tab interface: Dashboard Snapshots | Card Backups
 * Shows full snapshot system with expandable cards and restore functionality
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Z_INDEX } from '../utils/uc-z-index';
import { HomeAssistant } from 'custom-card-helpers';
import { ucSnapshotService, SnapshotListItem } from '../services/uc-snapshot-service';
import { ucCardBackupService, CardBackup } from '../services/uc-card-backup-service';
import { UserSubscription } from '../services/uc-cloud-auth-service';
import { UltraCardConfig } from '../types';
import './uc-snapshot-restore-dialog';
import type { RestoreMethodChoice } from './uc-snapshot-restore-dialog';

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
  @state() private _showRestoreDialog = false;
  @state() private _pendingRestoreSnapshot: SnapshotListItem | null = null;

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
    console.log(`🔄 Modal _loadData() called - Active tab: ${this._activeTab}`);
    this._loading = true;
    this._error = null;

    try {
      if (this._activeTab === 'snapshots') {
        console.log('📋 Requesting snapshot list...');
        this._snapshots = await ucSnapshotService.listSnapshots(30);
        console.log(`✅ Loaded ${this._snapshots.length} snapshots`);
      } else {
        console.log('💾 Requesting card backups...');
        this._cardBackups = await ucCardBackupService.listBackups(30);
        console.log(`✅ Loaded ${this._cardBackups.length} card backups`);
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
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
    // Show restore dialog
    this._pendingRestoreSnapshot = snapshot;
    this._showRestoreDialog = true;
  }

  private async _handleMethodSelected(e: CustomEvent<RestoreMethodChoice>) {
    const { method } = e.detail;
    const snapshot = this._pendingRestoreSnapshot;

    if (!method || !snapshot) {
      return;
    }

    // Close dialog
    this._showRestoreDialog = false;
    this._pendingRestoreSnapshot = null;

    try {
      const result = await ucSnapshotService.restoreSnapshot(snapshot.id);

      // Perform the actual dashboard restoration
      const stats =
        method === 'smart'
          ? await this._performSmartRestore(result.snapshot_data)
          : await this._performCleanRestore(result.snapshot_data);

      alert(
        `✅ Snapshot Restored Successfully!\n\n` +
          `${stats.restored} Ultra Cards restored\n` +
          `${stats.deleted > 0 ? `${stats.deleted} cards deleted\n` : ''}` +
          `${stats.skipped > 0 ? `${stats.skipped} cards skipped (no match)\n` : ''}` +
          `\nRefreshing page...`
      );

      // Fire success event
      this.dispatchEvent(
        new CustomEvent('snapshot-restored', {
          detail: { snapshot, result, stats },
          bubbles: true,
          composed: true,
        })
      );

      // Reload the page to show updated cards
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to restore snapshot:', error);
      alert(
        `❌ Snapshot Restore Failed\n\n` +
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
          `Your dashboard has not been modified.`
      );
    }
  }

  private async _performDashboardRestore(snapshotData: any): Promise<void> {
    console.log('🔄 Starting dashboard restore...');

    // Get current Lovelace config
    const lovelaceConfig = await this._getLovelaceConfig();

    if (!lovelaceConfig) {
      throw new Error('Could not access dashboard configuration');
    }

    console.log('📋 Current dashboard config loaded');

    // Get all views
    const views = lovelaceConfig.views || [];
    let totalRestored = 0;

    // Group snapshot cards by view path/id
    const cardsByViewPath: { [key: string]: any[] } = {};
    snapshotData.cards.forEach((card: any) => {
      const viewPath = card.view_path || card.view_id;
      if (!cardsByViewPath[viewPath]) {
        cardsByViewPath[viewPath] = [];
      }
      cardsByViewPath[viewPath].push(card);
    });

    // Update each view
    views.forEach((view: any, viewIndex: number) => {
      const viewPath = view.path || `view-${viewIndex}`;
      const viewId = view.id || viewPath;
      const snapshotCardsForView = cardsByViewPath[viewPath] || cardsByViewPath[viewId] || [];

      if (snapshotCardsForView.length === 0) {
        return;
      }

      console.log(
        `  📝 Restoring ${snapshotCardsForView.length} cards in view: ${view.title || viewPath}`
      );

      // Sort snapshot cards by their original index
      snapshotCardsForView.sort((a, b) => a.card_index - b.card_index);

      // Handle both regular views and sections views
      if (view.type === 'sections' && view.sections) {
        // Sections view - need to update cards within sections
        view.sections.forEach((section: any) => {
          if (section.cards) {
            section.cards = section.cards.map((card: any, cardIndex: number) => {
              // Check if this card is an Ultra Card
              if (card.type === 'custom:ultra-card') {
                // Find matching card in snapshot
                const snapshotCard = snapshotCardsForView.find(sc => sc.card_index === cardIndex);
                if (snapshotCard && snapshotCard.config) {
                  console.log(`    ✅ Restored card at index ${cardIndex}`);
                  totalRestored++;
                  return snapshotCard.config;
                }
              }
              return card;
            });
          }
        });
      } else if (view.cards) {
        // Regular view - update cards array directly
        view.cards = view.cards.map((card: any, cardIndex: number) => {
          // Check if this card is an Ultra Card
          if (card.type === 'custom:ultra-card') {
            // Find matching card in snapshot
            const snapshotCard = snapshotCardsForView.find(sc => sc.card_index === cardIndex);
            if (snapshotCard && snapshotCard.config) {
              console.log(`    ✅ Restored card at index ${cardIndex}`);
              totalRestored++;
              return snapshotCard.config;
            }
          }
          return card;
        });
      }
    });

    console.log(`✅ Total cards restored: ${totalRestored}`);

    if (totalRestored === 0) {
      throw new Error(
        'No Ultra Cards were found to restore. Dashboard may have changed since snapshot was taken.'
      );
    }

    // Save the updated config back to Home Assistant
    await this._saveLovelaceConfig(lovelaceConfig);

    console.log('💾 Dashboard configuration saved successfully');
  }

  /**
   * SMART REPLACE: Match cards by name and view, replace in-place
   * Safest method - no duplicates, only replaces matching cards
   */
  private async _performSmartRestore(snapshotData: any): Promise<{
    restored: number;
    deleted: number;
    skipped: number;
  }> {
    console.log('🧠 Starting SMART REPLACE restore...');

    const lovelaceConfig = await this._getLovelaceConfig();
    if (!lovelaceConfig) {
      throw new Error('Could not access dashboard configuration');
    }

    const views = lovelaceConfig.views || [];
    let restored = 0;
    let skipped = 0;

    // Build TWO indices for smart matching:
    // 1. Custom names (user-set names) - match by name
    // 2. Auto-generated names (starts with "Ultra Card ") - match by position
    const customNameIndex: { [key: string]: any } = {};
    const positionIndex: { [key: string]: any } = {};

    snapshotData.cards.forEach((card: any) => {
      const viewKey = card.view_path || card.view_id;
      const cardName = card.card_name || card.config?.card_name || '';

      // Check if this is a custom name or auto-generated
      const isCustomName = cardName && !cardName.startsWith('Ultra Card ');

      if (isCustomName) {
        // Use name-based matching for custom names
        const key = `${viewKey}::${cardName}`;
        customNameIndex[key] = card;
      } else {
        // Use position-based matching for auto-generated names
        const posKey = `${viewKey}::${card.card_index}`;
        positionIndex[posKey] = card;
      }
    });

    console.log(
      `📋 Indexed ${Object.keys(customNameIndex).length} custom-named cards and ${Object.keys(positionIndex).length} position-based cards`
    );

    // Update each view
    views.forEach((view: any, viewIndex: number) => {
      const viewPath = view.path || `view-${viewIndex}`;
      const viewId = view.id || viewPath;
      let currentCardIndex = 0;

      if (view.type === 'sections' && view.sections) {
        // Sections view
        view.sections.forEach((section: any) => {
          if (section.cards) {
            section.cards = section.cards.map((card: any) => {
              if (card.type === 'custom:ultra-card') {
                const cardName = card.card_name || '';
                const isCustomName = cardName && !cardName.startsWith('Ultra Card ');
                let snapshotCard = null;

                if (isCustomName) {
                  // Try name-based match for custom names
                  const nameKey = `${viewPath}::${cardName}`;
                  snapshotCard =
                    customNameIndex[nameKey] || customNameIndex[`${viewId}::${cardName}`];

                  if (snapshotCard) {
                    console.log(`  ✅ Name match: "${cardName}" in ${view.title || viewPath}`);
                  }
                } else {
                  // Use position-based match for auto-generated names
                  const posKey = `${viewPath}::${currentCardIndex}`;
                  snapshotCard =
                    positionIndex[posKey] || positionIndex[`${viewId}::${currentCardIndex}`];

                  if (snapshotCard) {
                    console.log(
                      `  ✅ Position match: card ${currentCardIndex} in ${view.title || viewPath}`
                    );
                  }
                }

                currentCardIndex++;

                if (snapshotCard && snapshotCard.config) {
                  restored++;
                  return snapshotCard.config;
                } else {
                  console.log(
                    `  ⏭️ Skipped: "${cardName}" at position ${currentCardIndex - 1} (no match)`
                  );
                  skipped++;
                }
              }
              return card;
            });
          }
        });
      } else if (view.cards) {
        // Regular view
        view.cards = view.cards.map((card: any) => {
          if (card.type === 'custom:ultra-card') {
            const cardName = card.card_name || '';
            const isCustomName = cardName && !cardName.startsWith('Ultra Card ');
            let snapshotCard = null;

            if (isCustomName) {
              // Try name-based match for custom names
              const nameKey = `${viewPath}::${cardName}`;
              snapshotCard = customNameIndex[nameKey] || customNameIndex[`${viewId}::${cardName}`];

              if (snapshotCard) {
                console.log(`  ✅ Name match: "${cardName}" in ${view.title || viewPath}`);
              }
            } else {
              // Use position-based match for auto-generated names
              const posKey = `${viewPath}::${currentCardIndex}`;
              snapshotCard =
                positionIndex[posKey] || positionIndex[`${viewId}::${currentCardIndex}`];

              if (snapshotCard) {
                console.log(
                  `  ✅ Position match: card ${currentCardIndex} in ${view.title || viewPath}`
                );
              }
            }

            currentCardIndex++;

            if (snapshotCard && snapshotCard.config) {
              restored++;
              return snapshotCard.config;
            } else {
              console.log(
                `  ⏭️ Skipped: "${cardName}" at position ${currentCardIndex - 1} (no match)`
              );
              skipped++;
            }
          }
          return card;
        });
      }
    });

    console.log(`✅ Smart restore complete: ${restored} replaced, ${skipped} skipped`);

    if (restored === 0) {
      throw new Error('No matching cards found. Check that your dashboard structure matches.');
    }

    await this._saveLovelaceConfig(lovelaceConfig);
    return { restored, deleted: 0, skipped };
  }

  /**
   * CLEAN & RESTORE: Delete all Ultra Cards, then restore snapshot cards in exact positions
   * Nuclear option - use when dashboard is messed up with duplicates
   */
  private async _performCleanRestore(snapshotData: any): Promise<{
    restored: number;
    deleted: number;
    skipped: number;
  }> {
    console.log('🧹 Starting CLEAN & RESTORE...');

    const lovelaceConfig = await this._getLovelaceConfig();
    if (!lovelaceConfig) {
      throw new Error('Could not access dashboard configuration');
    }

    const views = lovelaceConfig.views || [];
    let deleted = 0;
    let restored = 0;

    // Step 1: Delete ALL Ultra Cards
    console.log('🗑️ Step 1: Deleting all existing Ultra Cards...');
    views.forEach((view: any) => {
      if (view.type === 'sections' && view.sections) {
        view.sections.forEach((section: any) => {
          if (section.cards) {
            const before = section.cards.length;
            section.cards = section.cards.filter((card: any) => {
              if (card.type === 'custom:ultra-card') {
                deleted++;
                return false;
              }
              return true;
            });
            console.log(
              `  🗑️ Deleted ${before - section.cards.length} Ultra Cards from section in ${view.title || 'view'}`
            );
          }
        });
      } else if (view.cards) {
        const before = view.cards.length;
        view.cards = view.cards.filter((card: any) => {
          if (card.type === 'custom:ultra-card') {
            deleted++;
            return false;
          }
          return true;
        });
        console.log(
          `  🗑️ Deleted ${before - view.cards.length} Ultra Cards from ${view.title || 'view'}`
        );
      }
    });

    // Step 2: Group snapshot cards by view
    console.log('📦 Step 2: Restoring snapshot cards...');
    const cardsByView: { [key: string]: any[] } = {};
    snapshotData.cards.forEach((card: any) => {
      const viewKey = card.view_path || card.view_id;
      if (!cardsByView[viewKey]) {
        cardsByView[viewKey] = [];
      }
      cardsByView[viewKey].push(card);
    });

    // Step 3: Restore cards to their original views and positions
    views.forEach((view: any, viewIndex: number) => {
      const viewPath = view.path || `view-${viewIndex}`;
      const viewId = view.id || viewPath;
      const viewCards = cardsByView[viewPath] || cardsByView[viewId] || [];

      if (viewCards.length === 0) return;

      console.log(`  ➕ Restoring ${viewCards.length} cards to ${view.title || viewPath}`);

      if (view.type === 'sections' && view.sections) {
        // Check if snapshot has section information
        const hasSectionInfo = viewCards.some(card => card.section_index !== undefined);

        if (hasSectionInfo) {
          // NEW SNAPSHOTS: Restore to original sections using captured section_index
          console.log('    ✓ Using section info from snapshot (new format)');
          const cardsBySection: { [sectionIndex: number]: any[] } = {};
          viewCards.forEach(card => {
            const sectionIndex = card.section_index ?? 0;
            if (!cardsBySection[sectionIndex]) {
              cardsBySection[sectionIndex] = [];
            }
            cardsBySection[sectionIndex].push(card);
          });

          // Ensure we have enough sections
          Object.keys(cardsBySection).forEach(sectionIndexStr => {
            const sectionIndex = parseInt(sectionIndexStr);
            while (view.sections.length <= sectionIndex) {
              view.sections.push({ cards: [] });
            }
            if (!view.sections[sectionIndex].cards) {
              view.sections[sectionIndex].cards = [];
            }
          });

          // Restore cards to their original sections in order
          Object.entries(cardsBySection).forEach(([sectionIndexStr, cards]) => {
            const sectionIndex = parseInt(sectionIndexStr);
            cards.sort((a, b) => {
              const aIdx = a.card_index_in_section ?? a.card_index;
              const bIdx = b.card_index_in_section ?? b.card_index;
              return aIdx - bIdx;
            });
            cards.forEach(snapshotCard => {
              view.sections[sectionIndex].cards.push(snapshotCard.config);
              restored++;
            });
          });
        } else {
          // OLD SNAPSHOTS: Intelligently distribute across existing sections
          console.log(
            '    ⚠️ No section info - distributing evenly across sections (old snapshot format)'
          );

          // Sort cards by original index
          viewCards.sort((a, b) => a.card_index - b.card_index);

          // Distribute cards evenly across existing sections
          const numSections = view.sections.length;
          const cardsPerSection = Math.ceil(viewCards.length / numSections);

          viewCards.forEach((snapshotCard, index) => {
            const targetSection = Math.floor(index / cardsPerSection);

            // Ensure section exists and has cards array
            if (!view.sections[targetSection]) {
              view.sections[targetSection] = { cards: [] };
            }
            if (!view.sections[targetSection].cards) {
              view.sections[targetSection].cards = [];
            }

            view.sections[targetSection].cards.push(snapshotCard.config);
            restored++;
          });
        }
      } else {
        // For regular view, restore in order
        if (!view.cards) {
          view.cards = [];
        }
        // Sort by original card index
        viewCards.sort((a, b) => a.card_index - b.card_index);
        viewCards.forEach(snapshotCard => {
          view.cards.push(snapshotCard.config);
          restored++;
        });
      }
    });

    console.log(`✅ Clean restore complete: ${deleted} deleted, ${restored} restored`);

    await this._saveLovelaceConfig(lovelaceConfig);
    return { restored, deleted, skipped: 0 };
  }

  private async _getLovelaceConfig(): Promise<any> {
    return this.hass.callWS({
      type: 'lovelace/config',
    });
  }

  private async _saveLovelaceConfig(config: any): Promise<void> {
    await this.hass.callWS({
      type: 'lovelace/config/save',
      config: config,
    });
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

      <!-- Restore Method Dialog -->
      ${this._showRestoreDialog && this._pendingRestoreSnapshot
        ? html`
            <uc-snapshot-restore-dialog
              .open="${this._showRestoreDialog}"
              .cardCount="${this._pendingRestoreSnapshot.card_count}"
              .viewNames="${Object.keys(this._pendingRestoreSnapshot.views_breakdown)}"
              @method-selected="${this._handleMethodSelected}"
              @dialog-closed="${() => {
                this._showRestoreDialog = false;
                this._pendingRestoreSnapshot = null;
              }}"
            ></uc-snapshot-restore-dialog>
          `
        : ''}
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
      z-index: ${Z_INDEX.DIALOG_OVERLAY};
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
      margin-right: 12px;
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
