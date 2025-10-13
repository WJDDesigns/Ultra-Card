/**
 * Snapshot Settings Dialog Component
 * Configure auto-snapshot schedule, time, and timezone
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Z_INDEX } from '../utils/uc-z-index';
import { ucSnapshotService, SnapshotSettings } from '../services/uc-snapshot-service';

@customElement('uc-snapshot-settings-dialog')
export class UcSnapshotSettingsDialog extends LitElement {
  @property({ type: Boolean }) public open = false;

  @state() private _settings: SnapshotSettings = {
    enabled: true,
    time: '03:00',
    timezone: 'UTC',
  };
  @state() private _loading = false;
  @state() private _saving = false;
  @state() private _error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (this.open) {
      this._loadSettings();
    }
  }

  updated(changedProps: Map<string, any>) {
    if (changedProps.has('open') && this.open) {
      this._loadSettings();
    }
  }

  private async _loadSettings() {
    this._loading = true;
    this._error = null;

    try {
      this._settings = await ucSnapshotService.getSettings();
    } catch (error) {
      console.error('Failed to load snapshot settings:', error);
      this._error = error instanceof Error ? error.message : 'Failed to load settings';
    } finally {
      this._loading = false;
    }
  }

  private async _handleSave() {
    this._saving = true;
    this._error = null;

    try {
      await ucSnapshotService.updateSettings(this._settings);

      this.dispatchEvent(
        new CustomEvent('settings-saved', {
          detail: { settings: this._settings },
          bubbles: true,
          composed: true,
        })
      );

      this._close();
    } catch (error) {
      console.error('Failed to save settings:', error);
      this._error = error instanceof Error ? error.message : 'Failed to save settings';
    } finally {
      this._saving = false;
    }
  }

  private _handleEnabledToggle(e: Event) {
    const target = e.target as HTMLInputElement;
    this._settings = { ...this._settings, enabled: target.checked };
  }

  private _handleTimeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this._settings = { ...this._settings, time: target.value };
  }

  private _handleTimezoneChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this._settings = { ...this._settings, timezone: target.value };
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('dialog-closed', { bubbles: true, composed: true }));
  }

  private _getNextSnapshotTime(): string {
    if (!this._settings.enabled) {
      return 'Disabled';
    }

    const [hours, minutes] = this._settings.time.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);

    next.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const isToday = next.getDate() === now.getDate();
    const timeString = next.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return `${isToday ? 'Today' : 'Tomorrow'} at ${timeString}`;
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="modal-backdrop" @click="${this._close}">
        <div class="modal-container" @click="${(e: Event) => e.stopPropagation()}">
          <div class="modal-header">
            <h2>⚙️ Snapshot Settings</h2>
            <button class="close-btn" @click="${this._close}">✕</button>
          </div>

          <div class="modal-body">
            ${this._loading
              ? html`<div class="loading">Loading settings...</div>`
              : this._error
                ? html`<div class="error">${this._error}</div>`
                : html`
                    <div class="settings-form">
                      <!-- ENABLE/DISABLE AUTO SNAPSHOTS -->
                      <div class="form-group">
                        <label class="toggle-label">
                          <input
                            type="checkbox"
                            .checked="${this._settings.enabled}"
                            @change="${this._handleEnabledToggle}"
                          />
                          <span class="toggle-text">
                            <strong>Enable Daily Auto-Snapshots</strong>
                            <p class="help-text">
                              Automatically backup all Ultra Cards in your dashboard every day
                            </p>
                          </span>
                        </label>
                      </div>

                      ${this._settings.enabled
                        ? html`
                            <!-- SNAPSHOT TIME -->
                            <div class="form-group">
                              <label for="snapshot-time">
                                <strong>Snapshot Time</strong>
                                <p class="help-text">
                                  What time should snapshots be created? (24-hour format)
                                </p>
                              </label>
                              <input
                                type="time"
                                id="snapshot-time"
                                .value="${this._settings.time}"
                                @change="${this._handleTimeChange}"
                              />
                            </div>

                            <!-- TIMEZONE -->
                            <div class="form-group">
                              <label for="timezone">
                                <strong>Timezone</strong>
                                <p class="help-text">Snapshot time will use this timezone</p>
                              </label>
                              <select
                                id="timezone"
                                .value="${this._settings.timezone}"
                                @change="${this._handleTimezoneChange}"
                              >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (ET)</option>
                                <option value="America/Chicago">Central Time (CT)</option>
                                <option value="America/Denver">Mountain Time (MT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                <option value="Europe/London">London</option>
                                <option value="Europe/Paris">Paris</option>
                                <option value="Europe/Berlin">Berlin</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                                <option value="Asia/Shanghai">Shanghai</option>
                                <option value="Australia/Sydney">Sydney</option>
                              </select>
                            </div>

                            <!-- NEXT SNAPSHOT PREVIEW -->
                            <div class="info-box">
                              <div class="info-icon">📅</div>
                              <div class="info-content">
                                <strong>Next Snapshot:</strong>
                                <p>${this._getNextSnapshotTime()}</p>
                              </div>
                            </div>
                          `
                        : html`
                            <div class="info-box disabled">
                              <div class="info-icon">ℹ️</div>
                              <div class="info-content">
                                <p>
                                  Auto-snapshots are currently disabled. You can still create manual
                                  snapshots anytime.
                                </p>
                              </div>
                            </div>
                          `}

                      <!-- RETENTION INFO -->
                      <div class="info-box">
                        <div class="info-icon">💾</div>
                        <div class="info-content">
                          <strong>Storage Policy:</strong>
                          <ul>
                            <li>Auto-snapshots are kept for <strong>30 days</strong></li>
                            <li>Older snapshots are automatically deleted</li>
                            <li>Manual snapshots are never automatically deleted</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  `}
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="${this._close}" ?disabled="${this._saving}">
              Cancel
            </button>
            <button
              class="btn btn-primary"
              @click="${this._handleSave}"
              ?disabled="${this._loading || this._saving}"
            >
              ${this._saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>
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
      max-width: 600px;
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
      font-size: 20px;
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

    /* FORM */
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 14px;
      color: var(--primary-text-color, #000);
    }

    .help-text {
      font-size: 12px;
      color: var(--secondary-text-color, #666);
      margin: 4px 0 0 0;
    }

    .toggle-label {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      cursor: pointer;
      padding: 16px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      transition: all 0.2s;
    }

    .toggle-label:hover {
      background: var(--divider-color, #e0e0e0);
    }

    .toggle-label input[type='checkbox'] {
      width: 20px;
      height: 20px;
      cursor: pointer;
      margin-top: 2px;
    }

    .toggle-text {
      flex: 1;
    }

    .toggle-text strong {
      display: block;
      margin-bottom: 4px;
    }

    input[type='time'],
    select {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid var(--divider-color, #e0e0e0);
      border-radius: 6px;
      font-size: 14px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
      transition: border-color 0.2s;
    }

    input[type='time']:focus,
    select:focus {
      outline: none;
      border-color: var(--primary-color, #03a9f4);
    }

    /* INFO BOX */
    .info-box {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 8px;
      border-left: 4px solid var(--primary-color, #03a9f4);
    }

    .info-box.disabled {
      border-left-color: var(--secondary-text-color, #666);
    }

    .info-icon {
      font-size: 24px;
    }

    .info-content {
      flex: 1;
    }

    .info-content strong {
      display: block;
      margin-bottom: 4px;
      color: var(--primary-text-color, #000);
    }

    .info-content p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: var(--secondary-text-color, #666);
    }

    .info-content ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
      font-size: 13px;
      color: var(--secondary-text-color, #666);
    }

    .info-content li {
      margin: 4px 0;
    }

    /* FOOTER */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 2px solid var(--divider-color, #e0e0e0);
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--secondary-background-color, #e0e0e0);
      color: var(--primary-text-color, #000);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--divider-color, #ccc);
    }

    .btn-primary {
      background: var(--primary-color, #03a9f4);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(3, 169, 244, 0.3);
    }

    @media (max-width: 768px) {
      .modal-backdrop {
        padding: 0;
      }

      .modal-container {
        max-height: 100vh;
        border-radius: 0;
      }
    }
  `;
}
