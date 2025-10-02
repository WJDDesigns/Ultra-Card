/**
 * Create Snapshot Dialog Component
 * Allows Pro users to create named snapshots of their configuration
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { ucCloudBackupService, CloudBackup, CardStats } from '../services/uc-cloud-backup-service';
import { UserSubscription } from '../services/uc-cloud-auth-service';
import { UltraCardConfig } from '../types';

@customElement('uc-create-snapshot-dialog')
export class UcCreateSnapshotDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: UltraCardConfig;
  @property({ attribute: false }) public subscription!: UserSubscription;
  @property({ type: Boolean }) public open = false;

  @state() private _snapshotName = '';
  @state() private _snapshotDescription = '';
  @state() private _creating = false;
  @state() private _error: string | null = null;

  private _calculateStats(): CardStats {
    const rows = this.config.layout?.rows || [];
    let columnCount = 0;
    let moduleCount = 0;

    rows.forEach(row => {
      const columns = row.columns || [];
      columnCount += columns.length;

      columns.forEach(column => {
        const modules = column.modules || [];
        moduleCount += modules.length;
      });
    });

    return {
      row_count: rows.length,
      column_count: columnCount,
      module_count: moduleCount,
    };
  }

  private async _handleCreate() {
    if (!this._snapshotName.trim()) {
      this._error = 'Snapshot name is required';
      return;
    }

    if (!this.subscription.features.snapshots_enabled) {
      this._error = 'Pro subscription required to create snapshots';
      return;
    }

    if (this.subscription.snapshot_count >= this.subscription.snapshot_limit) {
      this._error = `Maximum ${this.subscription.snapshot_limit} snapshots reached. Delete old snapshots first.`;
      return;
    }

    this._creating = true;
    this._error = null;

    try {
      const snapshot: CloudBackup = await ucCloudBackupService.createSnapshot(
        this.config,
        this._snapshotName.trim(),
        this._snapshotDescription.trim() || undefined
      );

      // Fire success event
      this.dispatchEvent(
        new CustomEvent('snapshot-created', {
          detail: { snapshot },
          bubbles: true,
          composed: true,
        })
      );

      // Reset and close
      this._snapshotName = '';
      this._snapshotDescription = '';
      this._close();
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      this._error = error instanceof Error ? error.message : 'Failed to create snapshot';
    } finally {
      this._creating = false;
    }
  }

  private _close() {
    this._snapshotName = '';
    this._snapshotDescription = '';
    this._error = null;
    this.dispatchEvent(
      new CustomEvent('close-dialog', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && !this._creating) {
      e.preventDefault();
      this._handleCreate();
    }
  }

  protected render(): TemplateResult {
    if (!this.open) return html``;

    const stats = this._calculateStats();
    const remaining = this.subscription.snapshot_limit - this.subscription.snapshot_count;

    return html`
      <ha-dialog open @closed="${this._close}" .heading="${'Create Snapshot'}">
        <div class="dialog-content">
          ${this._error
            ? html`
                <ha-alert
                  alert-type="error"
                  dismissable
                  @alert-dismissed-clicked="${() => (this._error = null)}"
                >
                  ${this._error}
                </ha-alert>
              `
            : ''}

          <div class="form-group">
            <label for="snapshot-name"> Snapshot Name <span class="required">*</span> </label>
            <ha-textfield
              id="snapshot-name"
              .value="${this._snapshotName}"
              @input="${(e: any) => (this._snapshotName = e.target.value)}"
              @keypress="${this._handleKeyPress}"
              placeholder="e.g., Winter Dashboard, Pre-Redesign"
              .disabled="${this._creating}"
              required
            ></ha-textfield>
          </div>

          <div class="form-group">
            <label for="snapshot-description">Description (Optional)</label>
            <ha-textarea
              id="snapshot-description"
              .value="${this._snapshotDescription}"
              @input="${(e: any) => (this._snapshotDescription = e.target.value)}"
              placeholder="Add notes about this snapshot..."
              rows="3"
              .disabled="${this._creating}"
            ></ha-textarea>
          </div>

          <div class="config-stats">
            <h4>Current Configuration</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <ha-icon icon="mdi:table-row"></ha-icon>
                <span class="stat-value">${stats.row_count}</span>
                <span class="stat-label">Rows</span>
              </div>
              <div class="stat-item">
                <ha-icon icon="mdi:view-column"></ha-icon>
                <span class="stat-value">${stats.column_count}</span>
                <span class="stat-label">Columns</span>
              </div>
              <div class="stat-item">
                <ha-icon icon="mdi:puzzle"></ha-icon>
                <span class="stat-value">${stats.module_count}</span>
                <span class="stat-label">Modules</span>
              </div>
            </div>
          </div>

          <div class="snapshot-limit-info ${remaining <= 5 ? 'warning' : ''}">
            <ha-icon icon="mdi:information"></ha-icon>
            <span>
              ${remaining} of ${this.subscription.snapshot_limit} snapshots remaining
              ${remaining <= 5 ? html` - Consider deleting old snapshots` : ''}
            </span>
          </div>
        </div>

        <mwc-button slot="secondaryAction" @click="${this._close}" .disabled="${this._creating}">
          Cancel
        </mwc-button>
        <mwc-button
          slot="primaryAction"
          @click="${this._handleCreate}"
          .disabled="${this._creating || !this._snapshotName.trim()}"
        >
          ${this._creating
            ? html`
                <ha-circular-progress active size="small"></ha-circular-progress>
                Creating...
              `
            : 'Create Snapshot'}
        </mwc-button>
      </ha-dialog>
    `;
  }

  static get styles() {
    return css`
      :host {
        --dialog-max-width: 500px;
      }

      .dialog-content {
        padding: 8px 0;
      }

      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .required {
        color: var(--error-color);
      }

      ha-textfield,
      ha-textarea {
        width: 100%;
      }

      .config-stats {
        margin: 24px 0;
        padding: 16px;
        background: var(--secondary-background-color);
        border-radius: 8px;
      }

      .config-stats h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .stat-item ha-icon {
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .stat-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .snapshot-limit-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background: var(--primary-color);
        color: white;
        border-radius: 4px;
        font-size: 13px;
      }

      .snapshot-limit-info.warning {
        background: var(--warning-color);
      }

      .snapshot-limit-info ha-icon {
        --mdc-icon-size: 20px;
      }

      ha-alert {
        margin-bottom: 16px;
      }

      mwc-button ha-circular-progress {
        --md-circular-progress-size: 16px;
        margin-right: 8px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-create-snapshot-dialog': UcCreateSnapshotDialog;
  }
}
