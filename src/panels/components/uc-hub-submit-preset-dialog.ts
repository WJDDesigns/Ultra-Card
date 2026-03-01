/**
 * Ultra Card — Submit Preset Dialog
 * Form: title, description, category (dynamic from WP), tags, code, photos, integrations.
 * Source is always 'community' and not shown to the user.
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  ucCloudSyncService,
  SubmitPresetPayload,
} from '../../services/uc-cloud-sync-service';

export interface SubmitPresetDialogPayload {
  shortcode: string;
  card_settings?: Record<string, unknown>;
  custom_variables?: unknown[];
}

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 256 * 1024 * 1024; // 256 MB

type PhotoUploadState = {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  id?: number;
  error?: string;
};

export class UcHubSubmitPresetDialog extends LitElement {
  /** When provided, shortcode is pre-filled from the current card layout. */
  @property({ attribute: false }) payload: SubmitPresetDialogPayload | null = null;

  @state() private _title = '';
  @state() private _description = '';
  @state() private _category = '';
  @state() private _tags = '';
  @state() private _code = '';
  @state() private _integrations = '';
  @state() private _photos: File[] = [];
  @state() private _submitting = false;
  @state() private _submitted = false;
  @state() private _error = '';
  @state() private _categories: Array<{ value: string; label: string }> = [];
  @state() private _loadingCategories = true;
  @state() private _showValidation = false;
  /** Per-photo upload tracking — populated during submission */
  @state() private _photoStates: PhotoUploadState[] = [];
  /** Current submission step label for the button */
  @state() private _submitStep: '' | 'photos' | 'preset' = '';

  static styles = css`
    :host {
      display: contents;
    }

    ha-dialog {
      --mdc-dialog-min-width: 560px;
      --mdc-dialog-max-width: 680px;
    }

    .dialog-body {
      padding: 4px 0 8px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .dialog-subtitle {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 20px;
      line-height: 1.5;
    }

    /* Field group */
    .field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 16px;
    }

    .field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
      letter-spacing: 0.2px;
    }

    .required-star {
      color: var(--error-color, #db4437);
      margin-left: 2px;
    }

    .field input,
    .field select,
    .field textarea {
      width: 100%;
      padding: 9px 12px;
      border-radius: 7px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      background: var(--card-background-color, var(--ha-card-background));
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s ease;
    }

    .field input:focus,
    .field select:focus,
    .field textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .field textarea {
      min-height: 80px;
      resize: vertical;
      line-height: 1.4;
    }

    .field textarea.code-field {
      min-height: 100px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      line-height: 1.5;
    }

    .field select option[value=''] {
      color: var(--secondary-text-color);
    }

    /* Field hint */
    .field-hint {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.8;
      margin-top: 2px;
    }

    /* Two-column row */
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .field-row .field {
      margin-bottom: 0;
    }

    /* File upload */
    .upload-zone {
      border: 2px dashed var(--divider-color, rgba(0, 0, 0, 0.18));
      border-radius: 8px;
      padding: 14px 16px;
      cursor: pointer;
      transition: border-color 0.2s ease, background 0.2s ease;
      text-align: center;
    }

    .upload-zone:hover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.04);
    }

    .upload-zone input[type='file'] {
      display: none;
    }

    .upload-zone-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .upload-zone-label ha-icon {
      --mdc-icon-size: 28px;
      color: var(--primary-color);
      opacity: 0.7;
    }

    .upload-zone-label strong {
      color: var(--primary-color);
    }

    .upload-zone-label span {
      font-size: 11px;
    }

    /* File list table */
    .file-table {
      margin-top: 10px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
      border-radius: 7px;
      overflow: hidden;
    }

    .file-table-header {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      padding: 7px 12px;
      background: rgba(0, 0, 0, 0.03);
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    }

    .file-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      padding: 8px 12px;
      align-items: center;
      font-size: 13px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.05));
    }

    .file-row:last-child {
      border-bottom: none;
    }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--primary-text-color);
    }

    .file-size {
      color: var(--secondary-text-color);
      font-size: 12px;
      white-space: nowrap;
    }

    .file-remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      transition: color 0.15s;
    }

    .file-remove-btn:hover {
      color: var(--error-color, #db4437);
    }

    .file-remove-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .file-empty {
      padding: 12px;
      text-align: center;
      font-size: 12px;
      color: var(--secondary-text-color);
      opacity: 0.7;
    }

    .upload-meta {
      font-size: 11px;
      color: var(--secondary-text-color);
      margin-top: 6px;
      opacity: 0.8;
    }

    /* Error */
    .submit-error {
      font-size: 13px;
      color: var(--error-color, #db4437);
      padding: 10px 12px;
      background: rgba(219, 68, 55, 0.07);
      border-radius: 6px;
      margin-bottom: 8px;
    }

    /* Success */
    .submit-success {
      text-align: center;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .submit-success ha-icon {
      --mdc-icon-size: 48px;
      color: var(--success-color, #4caf50);
    }

    .submit-success h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .submit-success p {
      margin: 0;
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }

    /* Footer action buttons (slot-based) */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s ease, background 0.15s ease;
    }

    .btn ha-icon {
      --mdc-icon-size: 18px;
    }

    .btn-primary {
      background: var(--primary-color);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.88;
    }

    .btn-primary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.15));
    }

    .btn-secondary:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    /* Validation error on field */
    .field-error {
      font-size: 11px;
      color: var(--error-color, #db4437);
      margin-top: 2px;
    }

    .field input.invalid,
    .field select.invalid,
    .field textarea.invalid {
      border-color: var(--error-color, #db4437);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .spin {
      animation: spin 0.8s linear infinite;
    }

    /* Divider */
    .section-divider {
      height: 1px;
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
      margin: 4px 0 20px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--secondary-text-color);
      opacity: 0.7;
      margin-bottom: 14px;
    }

    /* Per-photo upload status icons in the file table */
    .upload-status-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-status-icon ha-icon {
      --mdc-icon-size: 16px;
    }

    .upload-status-icon.done ha-icon   { color: var(--success-color, #4caf50); }
    .upload-status-icon.error ha-icon  { color: var(--error-color, #db4437); }
    .upload-status-icon.uploading ha-icon { color: var(--primary-color); }
    .upload-status-icon.pending ha-icon { color: var(--secondary-text-color); opacity: 0.45; }

    /* Photo upload progress bar */
    .photo-upload-progress {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .photo-upload-progress-label {
      font-size: 12px;
      color: var(--secondary-text-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .photo-upload-progress-label span:last-child {
      font-variant-numeric: tabular-nums;
      color: var(--primary-color);
      font-weight: 600;
    }

    .photo-upload-progress-track {
      height: 5px;
      border-radius: 99px;
      background: var(--divider-color, rgba(0, 0, 0, 0.1));
      overflow: hidden;
      position: relative;
    }

    .photo-upload-progress-fill {
      height: 100%;
      border-radius: 99px;
      background: var(--primary-color);
      transition: width 0.3s ease;
      min-width: 6px;
    }

    /* Indeterminate shimmer when all files are pending (just started) */
    .photo-upload-progress-fill.indeterminate {
      width: 40% !important;
      animation: upload-shimmer 1.4s ease-in-out infinite;
    }

    @keyframes upload-shimmer {
      0%   { transform: translateX(-150%); }
      100% { transform: translateX(350%); }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.payload?.shortcode) {
      this._code = this.payload.shortcode;
    }
    // Fetch categories from WordPress
    ucCloudSyncService.fetchPresetCategories().then(cats => {
      this._categories = cats;
      this._loadingCategories = false;
    });
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('payload') && this.payload?.shortcode) {
      this._code = this.payload.shortcode;
    }
  }

  private _close() {
    this._reset();
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _reset() {
    this._title = '';
    this._description = '';
    this._category = '';
    this._tags = '';
    this._code = this.payload?.shortcode ?? '';
    this._integrations = '';
    this._photos = [];
    this._error = '';
    this._submitted = false;
    this._showValidation = false;
    this._photoStates = [];
    this._submitStep = '';
  }

  private get _titleValid(): boolean { return this._title.trim().length > 0; }
  private get _descriptionValid(): boolean { return this._description.trim().length > 0; }
  private get _categoryValid(): boolean { return this._category !== ''; }
  private get _codeValid(): boolean { return this._code.trim().length > 0; }

  private get _canSubmit(): boolean {
    return this._titleValid && this._descriptionValid && this._categoryValid && this._codeValid && !this._submitting;
  }

  private _trySubmit() {
    this._showValidation = true;
    if (this._canSubmit) {
      this._handleSubmit();
    }
  }

  private _formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private _handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const filtered = files.filter(f => f.size <= MAX_PHOTO_BYTES);
    const oversized = files.filter(f => f.size > MAX_PHOTO_BYTES);
    if (oversized.length) {
      this._error = `${oversized.length} file(s) exceed the 256 MB limit and were skipped.`;
    }
    const combined = [...this._photos, ...filtered];
    this._photos = combined.slice(0, MAX_PHOTOS);
    input.value = '';
  }

  private _removePhoto(index: number) {
    this._photos = this._photos.filter((_, i) => i !== index);
  }

  /** Fire an HA toast notification via the global event bus. */
  private _showHaToast(message: string): void {
    window.dispatchEvent(
      new CustomEvent('hass-notification', { detail: { message, duration: 4000 } })
    );
  }

  private async _handleSubmit() {
    if (!this._canSubmit) return;
    this._submitting = true;
    this._error = '';
    // Let Lit render the spinner before async work starts
    await this.updateComplete;

    const submitPayload: SubmitPresetPayload = {
      name: this._title.trim(),
      description: this._description.trim(),
      category: this._category,
      shortcode: this._code.trim(),
    };
    if (this._tags.trim()) {
      submitPayload.tags = this._tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (this._integrations.trim()) submitPayload.integrations = this._integrations.trim();
    submitPayload.source = 'community';

    if (this.payload?.card_settings && Object.keys(this.payload.card_settings).length > 0) {
      submitPayload.card_settings = this.payload.card_settings;
    }
    if (this.payload?.custom_variables && this.payload.custom_variables.length > 0) {
      submitPayload.custom_variables = this.payload.custom_variables;
    }

    try {
      // --- Step 1: upload photos one-by-one so we can report per-photo progress ---
      const photoIds: number[] = [];
      if (this._photos.length > 0) {
        this._submitStep = 'photos';
        this._photoStates = this._photos.map(file => ({ file, status: 'pending' as const }));
        await this.updateComplete;

        for (let i = 0; i < this._photos.length; i++) {
          const file = this._photos[i];

          // Mark this photo as uploading
          this._photoStates = this._photoStates.map((s, idx) =>
            idx === i ? { ...s, status: 'uploading' as const } : s
          );
          await this.updateComplete;

          try {
            const result = await ucCloudSyncService.uploadPresetPhoto(file);
            photoIds.push(result.id);
            this._photoStates = this._photoStates.map((s, idx) =>
              idx === i ? { ...s, status: 'done' as const, id: result.id } : s
            );
            this._showHaToast(
              `Photo ${i + 1} of ${this._photos.length} uploaded — "${file.name}"`
            );
            await this.updateComplete;
          } catch (photoErr) {
            this._photoStates = this._photoStates.map((s, idx) =>
              idx === i
                ? { ...s, status: 'error' as const, error: photoErr instanceof Error ? photoErr.message : 'Upload failed' }
                : s
            );
            await this.updateComplete;
            throw new Error(`Failed to upload photo "${file.name}". Please try again.`);
          }
        }
      }

      // --- Step 2: submit the preset with the collected attachment IDs ---
      this._submitStep = 'preset';
      await this.updateComplete;

      await ucCloudSyncService.submitPreset(
        submitPayload,
        undefined,
        photoIds.length ? photoIds : undefined
      );

      this._submitted = true;
      this.dispatchEvent(
        new CustomEvent('preset-submitted', { detail: { success: true }, bubbles: true, composed: true })
      );
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Failed to submit preset. Please try again.';
    } finally {
      this._submitting = false;
      this._submitStep = '';
    }
  }

  protected render(): TemplateResult {
    return html`
      <ha-dialog open @closed=${this._close} .heading=${'Share Preset on ultracard.io'}>
        <!-- X close button in dialog header slot -->
        <ha-icon-button
          slot="navigationIcon"
          .label=${'Close'}
          @click=${this._close}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>

        <div class="dialog-body">
          ${this._submitted
            ? this._renderSuccess()
            : this._renderForm()}
        </div>

        ${this._submitted ? '' : html`
          <!-- Footer action buttons -->
          <mwc-button
            slot="secondaryAction"
            @click=${this._close}
            ?disabled=${this._submitting}
          >Cancel</mwc-button>
          <mwc-button
            slot="primaryAction"
            raised
            ?disabled=${this._submitting}
            @click=${this._trySubmit}
          >
            ${this._submitting
              ? this._submitStep === 'photos'
                ? html`<ha-icon icon="mdi:loading" class="spin"></ha-icon>
                    Uploading photo
                    ${this._photoStates.filter(s => s.status !== 'pending').length}
                    of ${this._photos.length}…`
                : html`<ha-icon icon="mdi:loading" class="spin"></ha-icon> Submitting preset…`
              : html`<ha-icon icon="mdi:cloud-upload"></ha-icon> Submit for Review`}
          </mwc-button>
        `}
      </ha-dialog>
    `;
  }

  private _renderSuccess(): TemplateResult {
    return html`
      <div class="submit-success">
        <ha-icon icon="mdi:check-circle"></ha-icon>
        <h3>Preset Submitted!</h3>
        <p>
          Thank you for sharing! Your preset is now <strong>pending review</strong>.
        </p>
        <p>
          Once our team reviews and approves it, it will automatically appear in the
          <strong>Preset Gallery</strong> inside Ultra Card for everyone to use.
          We'll do our best to review it quickly — keep an eye on your email for updates.
        </p>
        <button class="btn btn-primary" @click=${this._close}>
          <ha-icon icon="mdi:check"></ha-icon>
          Got it, thanks!
        </button>
      </div>
    `;
  }

  private _renderForm(): TemplateResult {
    return html`
      <p class="dialog-subtitle">
        Share your layout with the Ultra Card community. Fill in the details below and
        submit — once our team reviews and approves it, it will appear in the
        <strong>Preset Gallery</strong> inside Ultra Card for everyone to use.
      </p>

      <!-- Title -->
      <div class="field">
        <label>Preset Title<span class="required-star">*</span></label>
        <input
          type="text"
          class=${this._showValidation && !this._titleValid ? 'invalid' : ''}
          .value=${this._title}
          @input=${(e: Event) => { this._title = (e.target as HTMLInputElement).value; this._error = ''; }}
          placeholder="My Awesome Preset"
          ?disabled=${this._submitting}
        />
        ${this._showValidation && !this._titleValid
          ? html`<span class="field-error">Title is required.</span>`
          : ''}
      </div>

      <!-- Description -->
      <div class="field">
        <label>Preset Description<span class="required-star">*</span></label>
        <textarea
          class=${this._showValidation && !this._descriptionValid ? 'invalid' : ''}
          .value=${this._description}
          @input=${(e: Event) => { this._description = (e.target as HTMLTextAreaElement).value; this._error = ''; }}
          placeholder="Describe what this preset does and when to use it…"
          ?disabled=${this._submitting}
        ></textarea>
        ${this._showValidation && !this._descriptionValid
          ? html`<span class="field-error">Description is required.</span>`
          : ''}
      </div>

      <!-- Category + Tags -->
      <div class="field-row">
        <div class="field">
          <label>Preset Category<span class="required-star">*</span></label>
          <select
            class=${this._showValidation && !this._categoryValid ? 'invalid' : ''}
            .value=${this._category}
            @change=${(e: Event) => { this._category = (e.target as HTMLSelectElement).value; }}
            ?disabled=${this._submitting || this._loadingCategories}
          >
            <option value="">— Select —</option>
            ${this._categories.map(
              c => html`<option value=${c.value} ?selected=${this._category === c.value}>${c.label}</option>`
            )}
          </select>
          ${this._loadingCategories
            ? html`<span class="field-hint">Loading categories…</span>`
            : this._showValidation && !this._categoryValid
              ? html`<span class="field-error">Please select a category.</span>`
              : ''}
        </div>
        <div class="field">
          <label>Preset Tags</label>
          <input
            type="text"
            .value=${this._tags}
            @input=${(e: Event) => { this._tags = (e.target as HTMLInputElement).value; }}
            placeholder="dashboard, minimal, ev"
            ?disabled=${this._submitting}
          />
          <span class="field-hint">Comma-separated</span>
        </div>
      </div>

      <!-- Preset Code -->
      <div class="field">
        <label>Preset Code<span class="required-star">*</span></label>
        <textarea
          class=${'code-field' + (this._showValidation && !this._codeValid ? ' invalid' : '')}
          .value=${this._code}
          @input=${(e: Event) => { this._code = (e.target as HTMLTextAreaElement).value; this._error = ''; }}
          placeholder="Please enter your Ultra Card Preset Code"
          ?disabled=${this._submitting}
        ></textarea>
        ${this._showValidation && !this._codeValid
          ? html`<span class="field-error">Preset code is required.</span>`
          : html`<span class="field-hint">
              ${this.payload?.shortcode
                ? 'Auto-filled from your current card layout. Edit if needed.'
                : 'Paste your Ultra Card layout JSON here.'}
            </span>`}
      </div>

      <!-- Photos -->
      <div class="field">
        <label>Preset Photos<span class="required-star">*</span></label>
        <label class="upload-zone" for="photo-upload">
          <span class="upload-zone-label">
            <ha-icon icon="mdi:image-plus"></ha-icon>
            <strong>Click to upload photos</strong>
            <span>PNG, JPG, WEBP</span>
          </span>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            @change=${this._handleFileInput}
            ?disabled=${this._submitting || this._photos.length >= MAX_PHOTOS}
          />
        </label>
        <div class="file-table">
          <div class="file-table-header">
            <span>File Name</span>
            <span>Size</span>
            <span></span>
          </div>
          ${this._photos.length === 0
            ? html`<div class="file-empty">No entries found</div>`
            : this._photos.map((f, i) => {
                const ps = this._photoStates[i];
                return html`
                  <div class="file-row">
                    <span class="file-name" title=${f.name}>${f.name}</span>
                    <span class="file-size">${this._formatBytes(f.size)}</span>
                    ${ps
                      ? html`<span class="upload-status-icon ${ps.status}">
                          ${ps.status === 'done'
                            ? html`<ha-icon icon="mdi:check-circle" title="Uploaded"></ha-icon>`
                            : ps.status === 'error'
                            ? html`<ha-icon icon="mdi:alert-circle" title=${ps.error ?? 'Error'}></ha-icon>`
                            : ps.status === 'uploading'
                            ? html`<ha-icon icon="mdi:loading" class="spin" title="Uploading…"></ha-icon>`
                            : html`<ha-icon icon="mdi:clock-outline" title="Waiting…"></ha-icon>`}
                        </span>`
                      : html`<button
                            class="file-remove-btn"
                            @click=${() => this._removePhoto(i)}
                            title="Remove"
                          >
                            <ha-icon icon="mdi:close"></ha-icon>
                          </button>`}
                  </div>
                `;
              })}
        </div>
        ${this._submitting && this._submitStep === 'photos' && this._photoStates.length > 0
          ? (() => {
              const total = this._photoStates.length;
              const done  = this._photoStates.filter(s => s.status === 'done').length;
              const pct   = Math.round((done / total) * 100);
              const allPending = this._photoStates.every(s => s.status === 'pending');
              return html`
                <div class="photo-upload-progress">
                  <div class="photo-upload-progress-label">
                    <span>Uploading image${total > 1 ? 's' : ''}…</span>
                    <span>${done} / ${total}</span>
                  </div>
                  <div class="photo-upload-progress-track">
                    <div
                      class="photo-upload-progress-fill ${allPending ? 'indeterminate' : ''}"
                      style="width: ${allPending ? '40' : pct}%"
                    ></div>
                  </div>
                </div>
              `;
            })()
          : ''}
        <span class="upload-meta">Max ${MAX_PHOTOS} files, max 256 MB per file.</span>
      </div>

      <!-- Integrations -->
      <div class="field">
        <label>Integrations</label>
        <input
          type="text"
          .value=${this._integrations}
          @input=${(e: Event) => { this._integrations = (e.target as HTMLInputElement).value; }}
          placeholder="e.g. Tesla, Hue, Google"
          ?disabled=${this._submitting}
        />
        <span class="field-hint">Comma-separated list of integrations this preset uses</span>
      </div>

      ${this._error ? html`<div class="submit-error">${this._error}</div>` : ''}
    `;
  }
}

// Guard against double-registration (shared between main card bundle and panel bundle)
if (!customElements.get('uc-hub-submit-preset-dialog')) {
  customElements.define('uc-hub-submit-preset-dialog', UcHubSubmitPresetDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-hub-submit-preset-dialog': UcHubSubmitPresetDialog;
  }
}
