/**
 * Ultra Card — Submit Theme Dialog
 * Share a local theme with the ultracard.io catalog, or edit one you already
 * submitted. Form: title, description, tags, theme JSON, optional preview image.
 */

import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { localize } from '../../localize/localize';
import { ucCloudSyncService } from '../../services/uc-cloud-sync-service';
import {
  ucThemeAuthorService,
  type AuthorTheme,
  type SubmitThemePayload,
  type UpdateThemePayload,
} from '../../services/uc-theme-author-service';
import { describeThemeRisks, scanThemeForRisks } from '../../services/uc-theme-trust-scanner';
import { sanitizeThemeDefinition } from '../../themes/uc-theme-validate';
import type { UcThemeDefinition } from '../../themes/uc-theme-types';
import { SUPPORTED_IMAGE_ACCEPT } from '../../utils/image-upload';
import '../../components/uc-theme-swatch';

const MAX_PREVIEW_BYTES = 16 * 1024 * 1024;

function definitionToJson(theme: UcThemeDefinition | null): string {
  if (!theme) return '';
  const { source: _source, ...rest } = theme;
  return JSON.stringify(rest, null, 2);
}

export class UcHubSubmitThemeDialog extends LitElement {
  /** Local theme to share (create mode). */
  @property({ attribute: false }) theme: UcThemeDefinition | null = null;
  @property() mode: 'create' | 'edit' = 'create';
  @property({ attribute: false }) existing: AuthorTheme | null = null;
  @property() language = 'en';

  @state() private _title = '';
  @state() private _description = '';
  @state() private _tags = '';
  @state() private _json = '';
  @state() private _previewFile: File | null = null;
  @state() private _keptPreview = '';
  @state() private _submitting = false;
  @state() private _submitted = false;
  @state() private _submitStep: '' | 'preview' | 'theme' = '';
  @state() private _error = '';
  @state() private _showValidation = false;
  private _prefilledExistingId: number | null = null;

  static override styles = css`
    :host {
      display: contents;
    }
    ha-dialog {
      --ha-dialog-width-lg: min(720px, calc(100vw - 16px));
      --ha-dialog-max-width: min(720px, calc(100vw - 16px));
      --mdc-dialog-min-width: min(560px, calc(100vw - 32px));
      --mdc-dialog-max-width: min(720px, calc(100vw - 16px));
      --dialog-content-padding: var(--ha-space-4) var(--ha-space-6) var(--ha-space-6) var(--ha-space-6);
      --mdc-dialog-z-index: 8000;
      --dialog-z-index: 8000;
    }
    @media (max-width: 600px) {
      ha-dialog {
        --ha-dialog-width-lg: calc(100vw - 16px);
        --ha-dialog-max-width: calc(100vw - 16px);
        --mdc-dialog-min-width: calc(100vw - 32px);
        --mdc-dialog-max-width: calc(100vw - 16px);
        --mdc-dialog-max-height: calc(100dvh - 32px);
      }
    }
    .header-nav-placeholder {
      display: inline-block;
      width: 0;
      height: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .dialog-subtitle {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 20px;
      line-height: 1.5;
    }
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
    }
    .field input:focus,
    .field textarea:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .field input.invalid,
    .field textarea.invalid {
      border-color: var(--error-color, #db4437);
    }
    .field textarea {
      min-height: 80px;
      resize: vertical;
      line-height: 1.4;
    }
    .field textarea.code-field {
      min-height: 180px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      line-height: 1.5;
    }
    .field-hint {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.8;
    }
    .field-error {
      font-size: 11px;
      color: var(--error-color, #db4437);
    }
    .json-row {
      display: grid;
      grid-template-columns: 1fr 220px;
      gap: 14px;
      align-items: start;
    }
    .json-row uc-theme-swatch {
      width: 100%;
    }
    @media (max-width: 600px) {
      .json-row {
        grid-template-columns: 1fr;
      }
    }
    .risk-box {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      font-size: 12px;
      line-height: 1.5;
      color: var(--primary-text-color);
    }
    .risk-box ha-icon {
      flex: 0 0 auto;
      --mdc-icon-size: 18px;
      color: var(--primary-color);
    }
    .risk-box ul {
      margin: 4px 0 0;
      padding-left: 18px;
    }
    .upload-zone {
      border: 2px dashed var(--divider-color, rgba(0, 0, 0, 0.18));
      border-radius: 8px;
      padding: 14px 16px;
      cursor: pointer;
      text-align: center;
      display: block;
    }
    .upload-zone:hover {
      border-color: var(--primary-color);
    }
    .upload-zone input[type='file'] {
      display: none;
    }
    .upload-zone-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
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
    .preview-img {
      width: 100%;
      max-width: 280px;
      height: 160px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid var(--divider-color);
      display: block;
      margin-bottom: 8px;
    }
    .file-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      font-size: 12px;
      margin-bottom: 8px;
    }
    .submit-error {
      font-size: 13px;
      color: var(--error-color, #db4437);
      padding: 10px 12px;
      background: rgba(219, 68, 55, 0.07);
      border-radius: 6px;
      margin-bottom: 8px;
    }
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
    }
    .submit-success p {
      margin: 0;
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }
    .dialog-footer-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;
      gap: var(--ha-space-3);
      width: 100%;
      box-sizing: border-box;
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 120px;
      padding: 10px 20px;
      border-radius: 10px;
      border: none;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn ha-icon {
      --mdc-icon-size: 18px;
    }
    .btn-primary {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
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
    .btn-small {
      min-width: 0;
      padding: 6px 12px;
      font-size: 12px;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .spin {
      animation: spin 0.8s linear infinite;
    }
  `;

  private _t(key: string, fallback: string): string {
    return localize(`hub.submit_theme.${key}`, this.language, fallback);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.mode === 'edit' && this.existing) this._prefillFromExisting(this.existing);
    else if (this.theme) this._prefillFromTheme(this.theme);
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('theme') && this.theme && this.mode === 'create' && !this._json) {
      this._prefillFromTheme(this.theme);
    }
    if (
      (changed.has('existing') || changed.has('mode')) &&
      this.mode === 'edit' &&
      this.existing &&
      this.existing.id !== this._prefilledExistingId
    ) {
      this._prefillFromExisting(this.existing);
    }
  }

  private _prefillFromTheme(theme: UcThemeDefinition): void {
    this._title = theme.name;
    this._description = theme.description ?? '';
    this._json = definitionToJson(theme);
  }

  private _prefillFromExisting(existing: AuthorTheme): void {
    this._prefilledExistingId = existing.id;
    this._title = existing.name;
    this._description = existing.description;
    this._tags = existing.tags.join(', ');
    this._json = definitionToJson(existing.definition);
    this._keptPreview = existing.preview ?? '';
    this._previewFile = null;
    this._error = '';
    this._submitted = false;
    this._showValidation = false;
  }

  private _close(): void {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  /** Parsed + sanitised draft, or null with the reason in `error`. */
  private _parsedDefinition(): { theme: UcThemeDefinition | null; warnings: string[]; error: string } {
    if (!this._json.trim()) return { theme: null, warnings: [], error: this._t('json_required', 'Theme JSON is required.') };
    let raw: unknown;
    try {
      raw = JSON.parse(this._json);
    } catch {
      return { theme: null, warnings: [], error: this._t('json_invalid', 'Theme JSON is not valid JSON.') };
    }
    const { theme, warnings } = sanitizeThemeDefinition(raw);
    if (!theme) {
      return {
        theme: null,
        warnings,
        error: `${this._t('json_rejected', 'Not a valid Ultra Card theme')}: ${warnings.join('; ')}`,
      };
    }
    return { theme, warnings, error: '' };
  }

  private get _titleValid(): boolean {
    return this._title.trim().length > 0;
  }
  private get _descriptionValid(): boolean {
    return this._description.trim().length > 0;
  }

  private get _canSubmit(): boolean {
    return this._titleValid && this._descriptionValid && !this._parsedDefinition().error && !this._submitting;
  }

  private _handlePreviewInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > MAX_PREVIEW_BYTES) {
      this._error = this._t('preview_too_large', 'Preview image exceeds the 16 MB limit.');
      input.value = '';
      return;
    }
    this._previewFile = file;
    this._keptPreview = '';
    this._error = '';
    input.value = '';
  }

  private async _handleSubmit(): Promise<void> {
    this._showValidation = true;
    if (!this._canSubmit) return;
    const parsed = this._parsedDefinition();
    if (!parsed.theme) return;

    this._submitting = true;
    this._error = '';
    try {
      let previewId: number | undefined;
      if (this._previewFile) {
        this._submitStep = 'preview';
        const uploaded = await ucCloudSyncService.uploadPresetPhoto(this._previewFile);
        previewId = uploaded.id;
      }
      this._submitStep = 'theme';

      const tags = this._tags.trim()
        ? this._tags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined;
      const definition: UcThemeDefinition = {
        ...parsed.theme,
        name: this._title.trim(),
        description: this._description.trim(),
      };

      if (this.mode === 'edit' && this.existing) {
        const payload: UpdateThemePayload = {
          name: definition.name,
          description: definition.description ?? '',
          definition,
        };
        if (tags) payload.tags = tags;
        if (previewId) payload.preview_image_id = previewId;
        await ucThemeAuthorService.update(this.existing.id, payload);
        this._submitted = true;
        this.dispatchEvent(
          new CustomEvent('theme-updated', {
            detail: { id: this.existing.id },
            bubbles: true,
            composed: true,
          })
        );
      } else {
        const payload: SubmitThemePayload = {
          name: definition.name,
          description: definition.description ?? '',
          definition,
        };
        if (tags) payload.tags = tags;
        if (previewId) payload.preview_image_id = previewId;
        const result = await ucThemeAuthorService.submit(payload);
        this._submitted = true;
        this.dispatchEvent(
          new CustomEvent('theme-submitted', { detail: { id: result.id }, bubbles: true, composed: true })
        );
      }
    } catch (err) {
      this._error =
        err instanceof Error
          ? err.message
          : this._t('submit_failed', 'Failed to submit theme. Please try again.');
    } finally {
      this._submitting = false;
      this._submitStep = '';
    }
  }

  protected override render(): TemplateResult {
    const isEdit = this.mode === 'edit';
    return html`
      <ha-dialog
        open
        width="large"
        header-title=${isEdit ? this._t('edit_title', 'Edit your theme') : this._t('create_title', 'Share your theme')}
        header-subtitle=${isEdit ? this._t('edit_subtitle', 'Update on ultracard.io') : this._t('create_subtitle', 'Submit to ultracard.io')}
        @closed=${this._close}
      >
        <span slot="headerNavigationIcon" class="header-nav-placeholder"></span>
        <ha-icon-button slot="headerActionItems" .label=${'Close'} @click=${this._close}>
          <ha-icon icon="mdi:close"></ha-icon>
        </ha-icon-button>

        ${this._submitted ? this._renderSuccess() : this._renderForm()}

        ${this._submitted
          ? nothing
          : html`
              <div slot="footer" class="dialog-footer-actions">
                <button type="button" class="btn btn-secondary" @click=${this._close} ?disabled=${this._submitting}>
                  ${this._t('cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  ?disabled=${this._submitting || (this._showValidation && !this._canSubmit)}
                  @click=${this._handleSubmit}
                >
                  ${this._submitting
                    ? html`<ha-icon icon="mdi:loading" class="spin"></ha-icon>
                        ${this._submitStep === 'preview'
                          ? this._t('uploading_preview', 'Uploading preview…')
                          : isEdit
                            ? this._t('saving', 'Saving…')
                            : this._t('sending', 'Sending…')}`
                    : isEdit
                      ? html`<ha-icon icon="mdi:content-save"></ha-icon>${this._t('save', 'Save')}`
                      : html`<ha-icon icon="mdi:send"></ha-icon>${this._t('send', 'Send')}`}
                </button>
              </div>
            `}
      </ha-dialog>
    `;
  }

  private _renderSuccess(): TemplateResult {
    const isEdit = this.mode === 'edit';
    const wasPublished = this.existing?.status === 'publish';
    return html`
      <div class="submit-success">
        <ha-icon icon="mdi:check-circle"></ha-icon>
        <h3>${isEdit ? this._t('success_edit_title', 'Theme updated') : this._t('success_create_title', 'Theme submitted')}</h3>
        <p>
          ${isEdit
            ? wasPublished
              ? this._t(
                  'success_edit_review',
                  'Update submitted for review. Your live theme stays online until the update is approved.'
                )
              : this._t('success_edit_saved', 'Saved.')
            : this._t(
                'success_create_body',
                'Thank you for sharing. Your theme is pending review and will appear in the catalog once approved.'
              )}
        </p>
        <button class="btn btn-primary" @click=${this._close}>
          <ha-icon icon="mdi:check"></ha-icon>${this._t('got_it', 'Got it')}
        </button>
      </div>
    `;
  }

  private _renderForm(): TemplateResult {
    const isEdit = this.mode === 'edit';
    const parsed = this._parsedDefinition();
    const risks = parsed.theme ? describeThemeRisks(scanThemeForRisks(parsed.theme)) : [];
    return html`
      <p class="dialog-subtitle">
        ${isEdit
          ? this._t(
              'edit_blurb',
              'Update the details below. Changes to a live theme are queued for review while the current version stays online.'
            )
          : this._t(
              'create_blurb',
              'Share your theme with the Ultra Card community. Once reviewed and approved it appears in the Themes catalog for everyone to install.'
            )}
      </p>

      <div class="field">
        <label>${this._t('field_title', 'Theme name')}<span class="required-star">*</span></label>
        <input
          type="text"
          class=${this._showValidation && !this._titleValid ? 'invalid' : ''}
          .value=${this._title}
          @input=${(e: Event) => {
            this._title = (e.target as HTMLInputElement).value;
            this._error = '';
          }}
          placeholder="Frosted Glass"
          ?disabled=${this._submitting}
        />
        ${this._showValidation && !this._titleValid
          ? html`<span class="field-error">${this._t('title_required', 'Name is required.')}</span>`
          : nothing}
      </div>

      <div class="field">
        <label>${this._t('field_description', 'Description')}<span class="required-star">*</span></label>
        <textarea
          class=${this._showValidation && !this._descriptionValid ? 'invalid' : ''}
          .value=${this._description}
          @input=${(e: Event) => {
            this._description = (e.target as HTMLTextAreaElement).value;
            this._error = '';
          }}
          placeholder=${this._t('description_placeholder', 'What does this theme look like, and which HA themes does it pair with?')}
          ?disabled=${this._submitting}
        ></textarea>
        ${this._showValidation && !this._descriptionValid
          ? html`<span class="field-error">${this._t('description_required', 'Description is required.')}</span>`
          : nothing}
      </div>

      <div class="field">
        <label>${this._t('field_tags', 'Tags')}</label>
        <input
          type="text"
          .value=${this._tags}
          @input=${(e: Event) => (this._tags = (e.target as HTMLInputElement).value)}
          placeholder="glass, dark, minimal"
          ?disabled=${this._submitting}
        />
        <span class="field-hint">${this._t('tags_hint', 'Comma-separated')}</span>
      </div>

      <div class="field">
        <label>${this._t('field_json', 'Theme JSON')}<span class="required-star">*</span></label>
        <div class="json-row">
          <textarea
            class=${'code-field' + (this._showValidation && parsed.error ? ' invalid' : '')}
            spellcheck="false"
            .value=${this._json}
            @input=${(e: Event) => {
              this._json = (e.target as HTMLTextAreaElement).value;
              this._error = '';
            }}
            ?disabled=${this._submitting}
          ></textarea>
          <uc-theme-swatch .theme=${parsed.theme} large></uc-theme-swatch>
        </div>
        ${parsed.error
          ? html`<span class="field-error">${parsed.error}</span>`
          : parsed.warnings.length
            ? html`<span class="field-hint">${this._t('json_warnings', 'Dropped before publishing')}: ${parsed.warnings.join('; ')}</span>`
            : html`<span class="field-hint">${this._t('json_hint', 'Exported from the Hub theme editor. Colours may reference HA variables.')}</span>`}
        ${risks.length
          ? html`
              <div class="risk-box">
                <ha-icon icon="mdi:shield-check-outline"></ha-icon>
                <div>
                  <strong>${this._t('risk_title', 'Installers will be told this theme:')}</strong>
                  <ul>
                    ${risks.map(line => html`<li>${line}</li>`)}
                  </ul>
                </div>
              </div>
            `
          : nothing}
      </div>

      <div class="field">
        <label>${this._t('field_preview', 'Preview image')} <span style="font-weight:500;opacity:0.7">${this._t('optional', '(optional)')}</span></label>
        ${this._keptPreview
          ? html`<img class="preview-img" src=${this._keptPreview} alt="" />`
          : this._previewFile
            ? html`<span class="file-chip"><ha-icon icon="mdi:image"></ha-icon>${this._previewFile.name}</span>`
            : nothing}
        ${this._keptPreview || this._previewFile
          ? html`<button
              type="button"
              class="btn btn-secondary btn-small"
              style="align-self:flex-start"
              ?disabled=${this._submitting}
              @click=${() => {
                this._previewFile = null;
                this._keptPreview = '';
              }}
            >
              <ha-icon icon="mdi:close"></ha-icon>${this._t('replace_preview', 'Remove / replace')}
            </button>`
          : html`
              <label class="upload-zone" for="theme-preview-upload">
                <span class="upload-zone-label">
                  <ha-icon icon="mdi:image-outline"></ha-icon>
                  <strong>${this._t('upload_preview', 'Click to upload a screenshot')}</strong>
                  <span>${this._t('preview_hint', 'Shown in the catalog instead of the generated swatch')}</span>
                </span>
                <input
                  id="theme-preview-upload"
                  type="file"
                  accept=${SUPPORTED_IMAGE_ACCEPT}
                  @change=${this._handlePreviewInput}
                  ?disabled=${this._submitting}
                />
              </label>
            `}
      </div>

      ${this._error ? html`<div class="submit-error">${this._error}</div>` : nothing}
    `;
  }
}

if (!customElements.get('uc-hub-submit-theme-dialog')) {
  customElements.define('uc-hub-submit-theme-dialog', UcHubSubmitThemeDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-hub-submit-theme-dialog': UcHubSubmitThemeDialog;
  }
}
