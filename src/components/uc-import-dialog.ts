import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { Z_INDEX } from '../utils/uc-z-index';
import { ucExportImportService } from '../services/uc-export-import-service';
import { ExportData } from '../types';
import { localize } from '../localize/localize';

@customElement('uc-import-dialog')
export class UcImportDialog extends LitElement {
  @property({ attribute: false }) public hass: HomeAssistant | undefined;
  @property({ type: Boolean }) public open = false;

  @state() private _importText = '';
  @state() private _isProcessing = false;
  @state() private _error = '';
  @state() private _previewData: ExportData | null = null;
  @state() private _showAndroidTip = false;
  private _previouslyFocusedElement: HTMLElement | null = null;

  override updated(changedProperties: Map<string, unknown>): void {
    if (!changedProperties.has('open')) return;
    if (this.open) {
      this._previouslyFocusedElement = document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => this._focusInitialControl());
    } else if (this._previouslyFocusedElement) {
      this._previouslyFocusedElement.focus();
      this._previouslyFocusedElement = null;
    }
  }

  protected override render(): TemplateResult {
    if (!this.open) return html``;

    return html`
      <div class="dialog-overlay" @click=${this._handleOverlayClick}>
        <div
          class="dialog-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="uc-import-dialog-title"
          @keydown=${this._handleKeyDown}
          @click=${(e: Event) => e.stopPropagation()}
        >
          <div class="dialog-header">
            <h3 id="uc-import-dialog-title">
              ${this._t('editor.import_dialog.title', 'Import Ultra Card Configuration')}
            </h3>
            <button
              class="close-btn"
              type="button"
              aria-label="${this._t('editor.import_dialog.close', 'Close')}"
              @click=${this._close}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>

          <div class="dialog-body">
            <div class="import-methods">
              <h4>${this._t('editor.import_dialog.methods', 'Import Methods')}</h4>
              <div class="method-buttons">
                <button
                  class="method-btn method-btn--primary"
                  type="button"
                  @click=${this._importFromClipboard}
                >
                  <ha-icon icon="mdi:clipboard-text"></ha-icon>
                  <span>${this._t('editor.import_dialog.from_clipboard', 'From Clipboard')}</span>
                  <small class="method-btn__hint"
                    >${this._t('editor.import_dialog.recommended', 'Recommended')}</small
                  >
                </button>
                <button class="method-btn" type="button" @click=${this._triggerFileInput}>
                  <ha-icon icon="mdi:file-upload"></ha-icon>
                  <span>${this._t('editor.import_dialog.from_file', 'From File')}</span>
                </button>
              </div>
            </div>

            <div class="manual-input">
              <label>${this._t('editor.import_dialog.paste_label', 'Or paste shortcode manually:')}</label>
              <textarea
                .value=${this._importText}
                @input=${this._handleTextInput}
                @paste=${this._handlePaste}
                placeholder="${this._t('editor.import_dialog.paste_placeholder', 'Paste your Ultra Card shortcode here: [ultra_card]...[/ultra_card]')}"
                rows="6"
              ></textarea>
              ${this._showAndroidTip
                ? html`
                    <div class="android-tip" role="note">
                      <ha-icon icon="mdi:information-outline"></ha-icon>
                      <span>
                        ${this._t(
                          'editor.import_dialog.android_clipboard_tip',
                          'The pasted text appears incomplete. This is a known Android/mobile clipboard limitation. Use the From Clipboard button above for a reliable import.'
                        )}
                      </span>
                    </div>
                  `
                : ''}
            </div>

            ${this._error
              ? html`
                  <div class="error-message" role="alert">
                    <ha-icon icon="mdi:alert-circle"></ha-icon>
                    <span>${this._error}</span>
                  </div>
                `
              : ''}
            ${this._previewData
              ? html`
                  <div class="preview-section">
                    <h4>${this._t('editor.import_dialog.preview', 'Preview')}</h4>
                    <div class="preview-card">
                      <div class="preview-header">
                        <ha-icon icon="${this._getTypeIcon(this._previewData.type)}"></ha-icon>
                        <div class="preview-info">
                          <strong
                            >${this._previewData.metadata.name ||
                            this._t(
                              'editor.import_dialog.imported_configuration',
                              'Imported Configuration'
                            )}</strong
                          >
                          <small
                            >${this._t('editor.import_dialog.type', 'Type')}: ${this._formatType(
                              this._previewData.type
                            )}</small
                          >
                          <small
                            >${this._t('editor.import_dialog.version', 'Version')}: ${this
                              ._previewData.version}</small
                          >
                        </div>
                      </div>
                      ${this._previewData.metadata.description
                        ? html`
                            <p class="preview-description">
                              ${this._previewData.metadata.description}
                            </p>
                          `
                        : ''}
                    </div>
                  </div>
                `
              : ''}
          </div>

          <div class="dialog-footer">
            <button class="cancel-btn" type="button" @click=${this._close}>
              ${this._t('editor.common.cancel', 'Cancel')}
            </button>
            <button
              class="import-btn"
              type="button"
              @click=${this._confirmImport}
              ?disabled=${!this._previewData || this._isProcessing}
            >
              ${this._isProcessing
                ? this._t('editor.import_dialog.processing', 'Processing...')
                : this._t('editor.layout.import_card', 'Import')}
            </button>
          </div>

          <input
            type="file"
            accept=".ultracard,.json"
            @change=${this._handleFileSelect}
            style="display: none;"
            id="file-input"
          />
        </div>
      </div>
    `;
  }

  private _handleOverlayClick(e: Event): void {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }

  private _handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = this._getFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.shadowRoot?.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
      return;
    }
    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  private _close(): void {
    this.open = false;
    this._reset();
    this.dispatchEvent(new CustomEvent('close'));
  }

  private _reset(): void {
    this._importText = '';
    this._error = '';
    this._previewData = null;
    this._isProcessing = false;
    this._showAndroidTip = false;
  }

  private _handleTextInput(e: Event): void {
    this._importText = (e.target as HTMLTextAreaElement).value;
    this._error = '';
    this._previewData = null;
    this._showAndroidTip = false;

    if (this._importText.trim()) {
      this._processImportText();
    }
  }

  private async _handlePaste(e: ClipboardEvent): Promise<void> {
    // On Android WebView (HA companion app), e.preventDefault() + clipboardData.getData()
    // causes truncation of large strings. The fix is to NOT prevent default so the browser
    // completes the native paste into the textarea first, then read the full value on the
    // next microtask. The existing @input handler (_handleTextInput) will also fire and
    // process the text — this handler only adds the async clipboard API as a bonus attempt.

    // Attempt the modern clipboard API first (runs in parallel, doesn't block native paste)
    navigator.clipboard?.readText?.().then((clipboardText) => {
      if (!clipboardText) return;
      const textarea = e.target as HTMLTextAreaElement;
      textarea.value = clipboardText;
      this._importText = clipboardText;
      this._showAndroidTip = false;
      this._error = '';
      this._previewData = null;
      if (this._importText.trim()) {
        this._processImportText();
      }
    }).catch(() => {
      // Clipboard API unavailable or denied — native paste already handled by the browser.
      // Read the textarea value on the next tick to get the fully pasted content.
      requestAnimationFrame(() => {
        const textarea = e.target as HTMLTextAreaElement;
        const pastedText = textarea.value;
        if (!pastedText) return;

        this._importText = pastedText;
        this._error = '';
        this._previewData = null;

        // Detect truncation: a valid shortcode always ends with [/ultra_card]
        const looksLikeShortcode = pastedText.includes('[ultra_card]');
        const isTruncated = looksLikeShortcode && !pastedText.includes('[/ultra_card]');
        this._showAndroidTip = isTruncated;

        if (this._importText.trim()) {
          this._processImportText();
        }
      });
    });
  }

  private _processImportText(): void {
    try {
      const data = ucExportImportService.importFromShortcode(this._importText);
      if (data) {
        this._previewData = data;
        this._error = '';
      } else {
        this._error = this._t(
          'editor.import_dialog.invalid_shortcode',
          'Invalid shortcode format. Please check your input.'
        );
      }
    } catch (error) {
      this._error = `${this._t('editor.import_dialog.import_error', 'Import error')}: ${
        error instanceof Error ? error.message : this._t('editor.import_dialog.unknown_error', 'Unknown error')
      }`;
      this._previewData = null;
    }
  }

  private async _importFromClipboard(): Promise<void> {
    this._isProcessing = true;
    this._error = '';

    try {
      const data = await ucExportImportService.importFromClipboard();
      if (data) {
        this._previewData = data;
        this._importText = ''; // Clear manual input since we got from clipboard
      } else {
        this._error = this._t(
          'editor.import_dialog.no_valid_shortcode',
          'No valid Ultra Card shortcode found in clipboard.'
        );
      }
    } catch (error) {
      this._error = `${this._t('editor.import_dialog.clipboard_error', 'Clipboard error')}: ${
        error instanceof Error
          ? error.message
          : this._t('editor.import_dialog.clipboard_read_failed', 'Failed to read clipboard')
      }`;
    } finally {
      this._isProcessing = false;
    }
  }

  private _triggerFileInput(): void {
    const fileInput = this.shadowRoot?.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  }

  private async _handleFileSelect(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this._isProcessing = true;
    this._error = '';

    try {
      const data = await ucExportImportService.importFromFile(file);
      if (data) {
        this._previewData = data;
        this._importText = ''; // Clear manual input since we got from file
      } else {
        this._error = this._t(
          'editor.import_dialog.invalid_file',
          'Invalid file format. Please select a valid Ultra Card export file.'
        );
      }
    } catch (error) {
      this._error = `${this._t('editor.import_dialog.file_import_error', 'File import error')}: ${
        error instanceof Error
          ? error.message
          : this._t('editor.import_dialog.file_read_failed', 'Failed to read file')
      }`;
    } finally {
      this._isProcessing = false;
      input.value = ''; // Reset file input
    }
  }

  private _confirmImport(): void {
    if (!this._previewData) return;

    this.dispatchEvent(
      new CustomEvent('import', {
        detail: this._previewData,
      })
    );

    this._close();
  }

  private _getTypeIcon(type: ExportData['type']): string {
    switch (type) {
      case 'ultra-card-row':
        return 'mdi:table-row';
      case 'ultra-card-layout':
        return 'mdi:view-dashboard';
      case 'ultra-card-module':
        return 'mdi:puzzle';
      default:
        return 'mdi:file-import';
    }
  }

  private _formatType(type: ExportData['type']): string {
    switch (type) {
      case 'ultra-card-row':
        return 'Row';
      case 'ultra-card-layout':
        return 'Layout';
      case 'ultra-card-module':
        return 'Module';
      default:
        return 'Unknown';
    }
  }

  private _focusInitialControl(): void {
    const focusable = this._getFocusableElements();
    focusable[0]?.focus();
  }

  private _getFocusableElements(): HTMLElement[] {
    const root = this.shadowRoot;
    if (!root) return [];
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(el => {
      if (el.hasAttribute('disabled')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      if (el.tabIndex < 0) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return true;
    });
  }

  private _t(key: string, fallback: string): string {
    return localize(key, this.hass?.locale?.language || 'en', fallback);
  }

  static override styles = css`
    :host {
      display: contents;
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
      z-index: ${Z_INDEX.DIALOG_OVERLAY};
      padding: 20px;
    }

    .dialog-content {
      background: var(--card-background-color);
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--divider-color);
    }

    .dialog-header h3 {
      margin: 0;
      color: var(--primary-text-color);
      font-size: 18px;
      font-weight: 600;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      border-radius: 6px;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }

    .dialog-body {
      padding: 24px;
    }

    .import-methods {
      margin-bottom: 24px;
    }

    .import-methods h4 {
      margin: 0 0 12px 0;
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 600;
    }

    .method-buttons {
      display: flex;
      gap: 12px;
    }

    .method-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 12px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .method-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .method-btn--primary {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--primary-color-10, rgba(var(--rgb-primary-color, 3, 169, 244), 0.1));
    }

    .method-btn--primary:hover {
      background: var(--primary-color-20, rgba(var(--rgb-primary-color, 3, 169, 244), 0.2));
    }

    .method-btn__hint {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }

    .method-btn ha-icon {
      --mdc-icon-size: 24px;
    }

    .method-btn span {
      font-size: 12px;
      font-weight: 500;
    }

    .manual-input {
      margin-bottom: 20px;
    }

    .manual-input label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--primary-text-color);
      font-size: 14px;
    }

    .android-tip {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 10px;
      padding: 10px 12px;
      background: var(--warning-color-10, rgba(255, 152, 0, 0.1));
      border: 1px solid var(--warning-color, #ff9800);
      border-radius: 6px;
      color: var(--warning-color, #ff9800);
      font-size: 13px;
      line-height: 1.4;
    }

    .android-tip ha-icon {
      --mdc-icon-size: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .android-tip strong {
      font-weight: 600;
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-size: 13px;
      font-family: 'Courier New', monospace;
      resize: vertical;
      box-sizing: border-box;
      transition: border-color 0.2s ease;
    }

    textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: var(--error-color-10);
      border: 1px solid var(--error-color);
      border-radius: 6px;
      color: var(--error-color);
      font-size: 14px;
      margin-bottom: 20px;
    }

    .error-message ha-icon {
      --mdc-icon-size: 18px;
      flex-shrink: 0;
    }

    .preview-section {
      margin-bottom: 20px;
    }

    .preview-section h4 {
      margin: 0 0 12px 0;
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 600;
    }

    .preview-card {
      padding: 16px;
      background: var(--success-color-10);
      border: 1px solid var(--success-color);
      border-radius: 8px;
    }

    .preview-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .preview-header ha-icon {
      --mdc-icon-size: 20px;
      color: var(--success-color);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .preview-info {
      flex: 1;
    }

    .preview-info strong {
      display: block;
      color: var(--primary-text-color);
      font-size: 14px;
      margin-bottom: 4px;
    }

    .preview-info small {
      display: block;
      color: var(--secondary-text-color);
      font-size: 12px;
      margin-bottom: 2px;
    }

    .preview-description {
      margin: 8px 0 0 0;
      padding-top: 8px;
      border-top: 1px solid var(--success-color-20);
      color: var(--secondary-text-color);
      font-size: 13px;
      line-height: 1.4;
    }

    .dialog-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid var(--divider-color);
    }

    .cancel-btn,
    .import-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
    }

    .cancel-btn:hover {
      background: var(--divider-color);
      color: var(--primary-text-color);
    }

    .import-btn {
      background: var(--primary-color);
      color: white;
    }

    .import-btn:hover:not(:disabled) {
      background: var(--primary-color-dark);
    }

    .import-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 600px) {
      .dialog-content {
        margin: 0;
        border-radius: 0;
        height: 100vh;
        max-height: none;
      }

      .method-buttons {
        flex-direction: column;
      }

      .dialog-footer {
        flex-direction: column-reverse;
        gap: 8px;
      }

      .cancel-btn,
      .import-btn {
        width: 100%;
      }
    }
  `;
}
