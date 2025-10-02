import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from '../localize/localize';
import { ucCardBackupService } from '../services/uc-card-backup-service';
import { UltraCardConfig } from '../types';

@customElement('uc-manual-backup-dialog')
export class UcManualBackupDialog extends LitElement {
  @property({ attribute: false }) public config!: UltraCardConfig;
  @property({ type: Boolean }) public open = false;

  @state() private _backupName = '';
  @state() private _isCreating = false;
  @state() private _error = '';

  static styles = css`
    :host {
      display: block;
    }

    .dialog-overlay {
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
      backdrop-filter: blur(4px);
    }

    .dialog {
      background: var(--card-background-color, #fff);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      padding: 24px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #00796b 100%);
      color: white;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .dialog-title ha-icon {
      --mdc-icon-size: 28px;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .dialog-content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .form-field {
      margin-bottom: 24px;
    }

    .form-field label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--primary-text-color, #000);
    }

    .form-field .description {
      font-size: 13px;
      color: var(--secondary-text-color, #666);
      margin-bottom: 12px;
      line-height: 1.5;
    }

    .form-field ha-textfield {
      width: 100%;
    }

    .card-info {
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .card-info-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--primary-text-color, #000);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 12px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .stat-item ha-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-color, #03a9f4);
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dialog-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .dialog-footer button {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    .cancel-btn {
      background: transparent;
      color: var(--primary-text-color, #000);
    }

    .cancel-btn:hover {
      background: var(--secondary-background-color, #f5f5f5);
    }

    .create-btn {
      background: linear-gradient(135deg, var(--primary-color, #03a9f4) 0%, #00796b 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(3, 169, 244, 0.3);
    }

    .create-btn:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(3, 169, 244, 0.4);
      transform: translateY(-1px);
    }

    .create-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .creating {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `;

  render() {
    if (!this.open) return html``;

    const lang = 'en'; // TODO: Get from hass if available
    const cardName =
      this.config.card_name ||
      localize('editor.ultra_card_pro.card_name_placeholder', lang, 'My Ultra Card');
    const defaultBackupName = `${cardName} - ${new Date().toLocaleString()}`;

    // Calculate card stats
    const rowCount = this.config.layout?.rows?.length || 0;
    let columnCount = 0;
    let moduleCount = 0;
    this.config.layout?.rows?.forEach(row => {
      const cols = row.columns?.length || 0;
      columnCount += cols;
      row.columns?.forEach(col => {
        moduleCount += col.modules?.length || 0;
      });
    });

    return html`
      <div class="dialog-overlay" @click="${this._handleOverlayClick}">
        <div class="dialog" @click="${(e: Event) => e.stopPropagation()}">
          <div class="dialog-header">
            <h3 class="dialog-title">
              <ha-icon icon="mdi:bookmark-plus"></ha-icon>
              ${localize('editor.ultra_card_pro.manual_backup_title', lang, 'Name Your Backup')}
            </h3>
            <button class="close-btn" @click="${this._handleClose}">
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="dialog-content">
            ${this._error
              ? html`
                  <div class="error-message">
                    <ha-icon icon="mdi:alert-circle"></ha-icon>
                    ${this._error}
                  </div>
                `
              : ''}

            <div class="card-info">
              <div class="card-info-title">
                <ha-icon icon="mdi:card-text"></ha-icon>
                Current Card: ${cardName}
              </div>
              <div class="card-stats">
                <div class="stat-item">
                  <ha-icon icon="mdi:view-grid"></ha-icon>
                  ${rowCount} rows
                </div>
                <div class="stat-item">
                  <ha-icon icon="mdi:view-column"></ha-icon>
                  ${columnCount} columns
                </div>
                <div class="stat-item">
                  <ha-icon icon="mdi:package-variant"></ha-icon>
                  ${moduleCount} modules
                </div>
              </div>
            </div>

            <div class="form-field">
              <label for="backup-name">Backup Name</label>
              <div class="description">
                ${localize(
                  'editor.ultra_card_pro.manual_backup_desc',
                  lang,
                  'Create a manual backup that will be stored alongside backups from all your other Ultra Cards (max 30 total)'
                )}
              </div>
              <ha-textfield
                id="backup-name"
                .value="${this._backupName || defaultBackupName}"
                @input="${this._handleNameInput}"
                placeholder="${defaultBackupName}"
                maxlength="100"
              ></ha-textfield>
            </div>
          </div>

          <div class="dialog-footer">
            <button
              class="cancel-btn"
              @click="${this._handleClose}"
              ?disabled="${this._isCreating}"
            >
              Cancel
            </button>
            <button
              class="create-btn"
              @click="${this._handleCreate}"
              ?disabled="${this._isCreating}"
            >
              ${this._isCreating
                ? html`
                    <span class="creating">
                      <ha-circular-progress active size="small"></ha-circular-progress>
                      Creating...
                    </span>
                  `
                : html`
                    <ha-icon icon="mdi:check"></ha-icon>
                    Create Backup
                  `}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleNameInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this._backupName = input.value;
  }

  private _handleOverlayClick() {
    if (!this._isCreating) {
      this._handleClose();
    }
  }

  private _handleClose() {
    this.open = false;
    this._backupName = '';
    this._error = '';
    this.dispatchEvent(new CustomEvent('dialog-closed'));
  }

  private async _handleCreate() {
    const lang = 'en';
    const cardName =
      this.config.card_name ||
      localize('editor.ultra_card_pro.card_name_placeholder', lang, 'My Ultra Card');
    const backupName = this._backupName || `${cardName} - ${new Date().toLocaleString()}`;

    if (!backupName.trim()) {
      this._error = 'Please enter a backup name';
      return;
    }

    this._isCreating = true;
    this._error = '';

    try {
      // Use the new card backup service
      await ucCardBackupService.createBackup(this.config, backupName);

      this.dispatchEvent(
        new CustomEvent('backup-created', {
          detail: { name: backupName },
          bubbles: true,
          composed: true,
        })
      );

      this._handleClose();
    } catch (error) {
      console.error('Failed to create backup:', error);
      this._error = error instanceof Error ? error.message : 'Failed to create backup';
    } finally {
      this._isCreating = false;
    }
  }
}
