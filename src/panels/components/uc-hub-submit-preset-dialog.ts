/**
 * Ultra Card — Submit Preset Dialog
 * Form: title, description, category, tags, code, featured image, photos, integrations.
 * Source is always 'community' and not shown to the user.
 */

import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  ucCloudSyncService,
  SubmitPresetPayload,
} from '../../services/uc-cloud-sync-service';
import {
  ucPresetAuthorService,
  type AuthorPreset,
  type UpdateAuthorPresetPayload,
} from '../../services/uc-preset-author-service';
import { SUPPORTED_IMAGE_ACCEPT } from '../../utils/image-upload';
import { localize } from '../../localize/localize';

export interface SubmitPresetDialogPayload {
  shortcode: string;
  card_settings?: Record<string, unknown> | undefined;
  custom_variables?: unknown[] | undefined;
  /** What the privacy sanitizer replaced before this became publishable. */
  redactions?: Array<{ description: string; count: number }> | undefined;
}

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 256 * 1024 * 1024; // 256 MB

type PhotoUploadState = {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  id?: number | undefined;
  error?: string | undefined;
};

type KeptPhoto = {
  id?: number | undefined;
  url: string;
};

export class UcHubSubmitPresetDialog extends LitElement {
  /** When provided, shortcode is pre-filled from the current card layout. */
  @property({ attribute: false }) payload: SubmitPresetDialogPayload | null = null;
  /** Create (submit new) or edit an existing author preset. */
  @property() mode: 'create' | 'edit' = 'create';
  /** Existing preset to edit when mode is 'edit'. */
  @property({ attribute: false }) existing: AuthorPreset | null = null;
  /** HA language code for localized strings. */
  @property() language = 'en';

  @state() private _title = '';
  @state() private _description = '';
  @state() private _category = '';
  @state() private _tags = '';
  @state() private _code = '';
  @state() private _integrations = '';
  @state() private _photos: File[] = [];
  /** Already-uploaded gallery photos kept from the existing preset (edit mode). */
  @state() private _keptPhotos: KeptPhoto[] = [];
  /** Featured image — required for create; kept or new file in edit. */
  @state() private _featuredFile: File | null = null;
  @state() private _keptFeatured: KeptPhoto | null = null;
  @state() private _featuredUploadState: PhotoUploadState | null = null;
  @state() private _submitting = false;
  @state() private _submitted = false;
  @state() private _error = '';
  @state() private _categories: Array<{ value: string; label: string }> = [];
  @state() private _loadingCategories = true;
  @state() private _showValidation = false;
  /** Per-photo upload tracking — populated during submission */
  @state() private _photoStates: PhotoUploadState[] = [];
  /** Current submission step label for the button */
  @state() private _submitStep: '' | 'featured' | 'photos' | 'preset' = '';
  private _prefilledExistingId: number | null = null;

  static override styles = css`
    :host {
      display: contents;
    }

    ha-dialog {
      /* New ha-dialog (wa-dialog) width + legacy fallbacks */
      --ha-dialog-width-lg: min(680px, calc(100vw - 16px));
      --ha-dialog-max-width: min(680px, calc(100vw - 16px));
      --mdc-dialog-min-width: min(560px, calc(100vw - 32px));
      --mdc-dialog-max-width: min(680px, calc(100vw - 16px));
      /* Comfortable body padding (HA default is 0 top — header carries the title) */
      --dialog-content-padding: var(--ha-space-4) var(--ha-space-6) var(--ha-space-6)
        var(--ha-space-6);
      /* Boost above ALL editor overlays (context menus at 5005, popups at 1002, etc.) */
      --mdc-dialog-z-index: 8000;
      --dialog-z-index: 8000;
    }

    @media (max-width: 600px) {
      ha-dialog {
        --ha-dialog-width-lg: calc(100vw - 16px);
        --ha-dialog-max-width: calc(100vw - 16px);
        --mdc-dialog-min-width: calc(100vw - 32px);
        --mdc-dialog-max-width: calc(100vw - 16px);
        /* Full-screen-ish on mobile: anchor to bottom of viewport */
        --mdc-dialog-max-height: calc(100dvh - 32px);
      }
    }

    .dialog-body {
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Footer bar: ha-dialog assigns slot="footer"; border separates from scrollable body */
    /* Suppress default leading close button content (close is in headerActionItems). */
    .header-nav-placeholder {
      display: inline-block;
      width: 0;
      height: 0;
      overflow: hidden;
      pointer-events: none;
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

    .cat-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cat-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      background: transparent;
      color: var(--secondary-text-color, #9aa3b2);
      font: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .cat-chip ha-icon {
      --mdc-icon-size: 16px;
    }
    .cat-chip:hover {
      color: var(--primary-text-color, #fff);
      border-color: var(--primary-color, #29b6f6);
    }
    .cat-chip.active {
      color: var(--primary-text-color, #fff);
      border-color: var(--primary-color, #29b6f6);
      background: color-mix(in srgb, var(--primary-color, #29b6f6) 16%, transparent);
    }
    .cat-chips.invalid {
      outline: 1px solid var(--error-color, #f87171);
      outline-offset: 2px;
      border-radius: 12px;
    }

    /* Field hint */
    .field-hint {
      font-size: 11px;
      color: var(--secondary-text-color);
      opacity: 0.8;
      margin-top: 2px;
    }

    /* Privacy disclosure under the preset code */
    .privacy-notice {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-top: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color);
      font-size: 12px;
      line-height: 1.5;
      color: var(--primary-text-color);
    }
    .privacy-notice ha-icon {
      flex: 0 0 auto;
      --mdc-icon-size: 18px;
      color: var(--primary-color);
    }
    .privacy-notice ul {
      margin: 4px 0 0;
      padding-left: 18px;
    }
    .privacy-notice-foot {
      margin-top: 6px;
      color: var(--secondary-text-color);
    }

    /* Two-column row — collapses to single column on mobile */
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .field-row .field {
      margin-bottom: 0;
    }

    @media (max-width: 480px) {
      .field-row {
        grid-template-columns: 1fr;
        gap: 0;
      }
      .field-row .field {
        margin-bottom: 16px;
      }
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

    /* Footer button sizing — slightly larger than default inline buttons */
    .footer-btn {
      min-width: 120px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.2px;
      border-radius: 10px;
      cursor: pointer;
      user-select: none;
      transition: opacity 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
    }

    .footer-btn.btn-primary {
      box-shadow: 0 2px 8px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
    }

    .footer-btn.btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      box-shadow: 0 4px 14px rgba(var(--rgb-primary-color, 3, 169, 244), 0.45);
    }

    .footer-btn.btn-primary:active:not(:disabled) {
      opacity: 1;
      box-shadow: none;
      transform: scale(0.98);
    }

    .footer-btn.btn-secondary:hover:not(:disabled) {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .footer-btn.btn-secondary:active:not(:disabled) {
      transform: scale(0.98);
    }

    @media (max-width: 480px) {
      .footer-btn {
        min-width: 0;
        flex: 1;
        justify-content: center;
      }
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

    @media (max-width: 480px) {
      ha-dialog {
        --dialog-content-padding: var(--ha-space-3) var(--ha-space-4) var(--ha-space-4)
          var(--ha-space-4);
      }
      .dialog-subtitle {
        font-size: 12px;
        margin-bottom: 16px;
      }
      .field input,
      .field select,
      .field textarea {
        font-size: 16px; /* prevents iOS auto-zoom on focus */
      }
      .file-table-header,
      .file-row {
        grid-template-columns: 1fr auto auto;
        padding: 6px 10px;
        font-size: 12px;
      }
      .file-size {
        font-size: 11px;
      }
      .upload-zone {
        padding: 12px;
      }
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

    .kept-photo-thumb {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: cover;
      background: var(--secondary-background-color);
    }

    .featured-preview {
      width: 100%;
      max-width: 280px;
      height: 160px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid var(--divider-color);
      display: block;
      margin-bottom: 8px;
    }

    .kept-photo-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .update-code-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 8px;
      padding: 6px 12px;
      border-radius: 7px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.15));
      background: transparent;
      color: var(--primary-color);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    .update-code-btn:hover:not(:disabled) {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
    }

    .update-code-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .update-code-btn ha-icon {
      --mdc-icon-size: 16px;
    }
  `;

  private _t(key: string, fallback: string): string {
    return localize(key, this.language, fallback);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.mode === 'edit' && this.existing) {
      this._prefillFromExisting(this.existing);
    } else if (this.payload?.shortcode) {
      this._code = this.payload.shortcode;
    }
    // Fetch categories from WordPress
    ucCloudSyncService.fetchPresetCategories().then(cats => {
      this._categories = cats;
      this._loadingCategories = false;
    });
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('payload') && this.payload?.shortcode && this.mode === 'create') {
      this._code = this.payload.shortcode;
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

  private _prefillFromExisting(preset: AuthorPreset): void {
    this._prefilledExistingId = preset.id;
    this._title = preset.name || '';
    this._description = preset.description || '';
    this._category = preset.category || '';
    this._tags = Array.isArray(preset.tags) ? preset.tags.join(', ') : '';
    this._code = preset.shortcode || '';
    this._integrations = preset.integrations || '';
    this._photos = [];
    this._photoStates = [];
    this._featuredFile = null;
    this._keptFeatured = null;
    this._featuredUploadState = null;
    this._submitted = false;
    this._error = '';
    this._showValidation = false;

    const ids = preset.photo_ids ?? [];
    const gallery = preset.gallery ?? [];
    const featuredId = preset.featured_image_id || ids[0] || 0;
    const featuredUrl = preset.featured_image || gallery[0] || '';
    this._keptFeatured =
      featuredId || featuredUrl
        ? { id: featuredId || undefined, url: featuredUrl }
        : null;

    if (ids.length > 0) {
      this._keptPhotos = ids
        .map((id, i) => ({
          id,
          url: gallery[i] || '',
        }))
        .filter((p, i) => {
          if (featuredId && p.id === featuredId) return false;
          if (!preset.featured_image_id && i === 0) return false;
          return true;
        });
    } else if (gallery.length > 1) {
      this._keptPhotos = gallery.slice(1).map(url => ({ url }));
    } else {
      this._keptPhotos = [];
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
    this._keptPhotos = [];
    this._featuredFile = null;
    this._keptFeatured = null;
    this._featuredUploadState = null;
    this._prefilledExistingId = null;
    this._error = '';
    this._submitted = false;
    this._showValidation = false;
    this._photoStates = [];
    this._submitStep = '';
  }

  private _updateCodeFromLayout(): void {
    if (this.payload?.shortcode) {
      this._code = this.payload.shortcode;
      this._error = '';
    }
  }

  private _removeKeptPhoto(index: number): void {
    this._keptPhotos = this._keptPhotos.filter((_, i) => i !== index);
  }

  private get _totalPhotoCount(): number {
    return this._keptPhotos.length + this._photos.length;
  }

  private get _hasFeatured(): boolean {
    return !!(this._keptFeatured || this._featuredFile);
  }

  private get _titleValid(): boolean { return this._title.trim().length > 0; }
  private get _descriptionValid(): boolean { return this._description.trim().length > 0; }
  private get _categoryValid(): boolean { return this._category !== ''; }

  private _categoryIcon(value: string): string {
    const icons: Record<string, string> = {
      layout: 'mdi:view-dashboard-outline',
      content: 'mdi:text-box-outline',
      data: 'mdi:chart-box-outline',
      interactive: 'mdi:gesture-tap',
      input: 'mdi:form-textbox',
      media: 'mdi:image-multiple-outline',
      // Legacy fallbacks
      badges: 'mdi:text-box-outline',
      layouts: 'mdi:view-dashboard-outline',
      widgets: 'mdi:chart-box-outline',
    };
    return icons[value] || 'mdi:tag-outline';
  }
  private get _codeValid(): boolean { return this._code.trim().length > 0; }

  private get _canSubmit(): boolean {
    return (
      this._titleValid &&
      this._descriptionValid &&
      this._categoryValid &&
      this._codeValid &&
      this._hasFeatured &&
      !this._submitting
    );
  }

  private _trySubmit() {
    this._showValidation = true;
    if (this._canSubmit) {
      this._handleSubmit();
    }
  }

  /**
   * State what the sanitizer replaced before this code became publishable, and
   * that entity IDs still go public either way. Sharing a preset sends your own
   * dashboard to a public marketplace, so it should not be the one step that
   * tells you nothing about what leaves your system.
   */
  private _renderPrivacyNotice() {
    if (!this.payload?.shortcode) return nothing;

    const redactions = this.payload.redactions ?? [];
    return html`
      <div class="privacy-notice">
        <ha-icon icon="mdi:shield-check-outline"></ha-icon>
        <div>
          ${redactions.length
            ? html`
                <strong>Replaced before sharing:</strong>
                <ul>
                  ${redactions.map(
                    item => html`<li>${item.description} (${item.count})</li>`
                  )}
                </ul>
              `
            : html`<strong>No IP addresses or personal names were detected.</strong>`}
          <div class="privacy-notice-foot">
            Your entity IDs and friendly names are still part of the preset code above.
            Review it before submitting.
          </div>
        </div>
      </div>
    `;
  }

  private _formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private _handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    // Guard against double-firing (both 'change' and 'input' can fire on file inputs).
    if (files.length === 0) return;
    const filtered = files.filter(f => f.size <= MAX_PHOTO_BYTES);
    const oversized = files.filter(f => f.size > MAX_PHOTO_BYTES);
    if (oversized.length) {
      this._error = `${oversized.length} file(s) exceed the 256 MB limit and were skipped.`;
    }
    const slotsLeft = Math.max(0, MAX_PHOTOS - this._keptPhotos.length);
    const combined = [...this._photos, ...filtered];
    this._photos = combined.slice(0, slotsLeft);
    input.value = '';
  }

  private _handleFeaturedInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      this._error = 'Featured image exceeds the 256 MB limit.';
      input.value = '';
      return;
    }
    this._featuredFile = file;
    this._keptFeatured = null;
    this._error = '';
    input.value = '';
  }

  private _removeFeatured() {
    this._featuredFile = null;
    this._keptFeatured = null;
    this._featuredUploadState = null;
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

  private async _uploadFeatured(): Promise<number | undefined> {
    if (this._featuredFile) {
      this._submitStep = 'featured';
      this._featuredUploadState = { file: this._featuredFile, status: 'uploading' };
      await this.updateComplete;
      try {
        const result = await ucCloudSyncService.uploadPresetPhoto(this._featuredFile);
        this._featuredUploadState = {
          file: this._featuredFile,
          status: 'done',
          id: result.id,
        };
        this._showHaToast(`Featured image uploaded — "${this._featuredFile.name}"`);
        return result.id;
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'Upload failed';
        this._featuredUploadState = {
          file: this._featuredFile,
          status: 'error',
          error: detail,
        };
        throw err instanceof Error ? err : new Error(String(err));
      }
    }
    if (this._keptFeatured?.id && this._keptFeatured.id > 0) {
      return this._keptFeatured.id;
    }
    // Edit mode with URL-only kept featured — leave server thumbnail unchanged.
    if (this.mode === 'edit' && this._keptFeatured) {
      return undefined;
    }
    throw new Error('Featured image is required.');
  }

  private async _uploadNewPhotos(): Promise<number[]> {
    const photoIds: number[] = [];
    if (this._photos.length === 0) return photoIds;

    this._submitStep = 'photos';
    this._photoStates = this._photos.map(file => ({ file, status: 'pending' as const }));
    await this.updateComplete;

    for (let i = 0; i < this._photos.length; i++) {
      const file = this._photos[i];

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
        const detail = photoErr instanceof Error ? photoErr.message : 'Upload failed';
        this._photoStates = this._photoStates.map((s, idx) =>
          idx === i ? { ...s, status: 'error' as const, error: detail } : s
        );
        await this.updateComplete;
        if (photoErr instanceof Error) throw photoErr;
        throw new Error(String(photoErr));
      }
    }
    return photoIds;
  }

  private async _handleSubmit() {
    if (!this._canSubmit) return;
    this._submitting = true;
    this._error = '';
    await this.updateComplete;

    const tags = this._tags.trim()
      ? this._tags.split(',').map(t => t.trim()).filter(Boolean)
      : undefined;
    const integrations = this._integrations.trim() || undefined;

    try {
      const featuredId = await this._uploadFeatured();
      const keptIds = this._keptPhotos
        .map(p => p.id)
        .filter((id): id is number => typeof id === 'number' && id > 0);
      const uploadedIds = await this._uploadNewPhotos();
      const photoIds = [...keptIds, ...uploadedIds].filter(id => id !== featuredId);

      this._submitStep = 'preset';
      await this.updateComplete;

      if (this.mode === 'edit' && this.existing) {
        const updatePayload: UpdateAuthorPresetPayload = {
          name: this._title.trim(),
          description: this._description.trim(),
          category: this._category,
          shortcode: this._code.trim(),
          photo_ids: photoIds,
        };
        if (featuredId && featuredId > 0) {
          updatePayload.featured_image_id = featuredId;
        }
        if (tags) updatePayload.tags = tags;
        if (integrations !== undefined) updatePayload.integrations = integrations;

        await ucPresetAuthorService.update(this.existing.id, updatePayload);
        this._submitted = true;
        this.dispatchEvent(
          new CustomEvent('preset-updated', {
            detail: { success: true, id: this.existing.id },
            bubbles: true,
            composed: true,
          })
        );
      } else {
        const submitPayload: SubmitPresetPayload = {
          name: this._title.trim(),
          description: this._description.trim(),
          category: this._category,
          shortcode: this._code.trim(),
          source: 'community',
        };
        if (tags) submitPayload.tags = tags;
        if (integrations) submitPayload.integrations = integrations;

        if (this.payload?.card_settings && Object.keys(this.payload.card_settings).length > 0) {
          submitPayload.card_settings = this.payload.card_settings;
        }
        if (this.payload?.custom_variables && this.payload.custom_variables.length > 0) {
          submitPayload.custom_variables = this.payload.custom_variables;
        }

        await ucCloudSyncService.submitPreset(
          submitPayload,
          undefined,
          photoIds.length ? photoIds : undefined,
          featuredId && featuredId > 0 ? featuredId : undefined
        );

        this._submitted = true;
        this.dispatchEvent(
          new CustomEvent('preset-submitted', {
            detail: { success: true },
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (err) {
      this._error =
        err instanceof Error
          ? err.message
          : this.mode === 'edit'
            ? 'Failed to update preset. Please try again.'
            : 'Failed to submit preset. Please try again.';
    } finally {
      this._submitting = false;
      this._submitStep = '';
    }
  }

  protected override render(): TemplateResult {
    const isEdit = this.mode === 'edit';
    const headerTitle = isEdit
      ? this._t('hub.submit_preset.edit_title', 'Edit your preset')
      : this._t('hub.submit_preset.create_title', 'Share your layout');
    const headerSubtitle = isEdit
      ? this._t('hub.submit_preset.edit_subtitle', 'Update on ultracard.io')
      : this._t('hub.submit_preset.create_subtitle', 'Submit to ultracard.io');

    return html`
      <ha-dialog
        open
        width="large"
        header-title=${headerTitle}
        header-subtitle=${headerSubtitle}
        @closed=${this._close}
      >
        <!-- Replace default leading close; close control lives in headerActionItems (right). -->
        <span slot="headerNavigationIcon" class="header-nav-placeholder"></span>
        <ha-icon-button
          slot="headerActionItems"
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

        ${this._submitted
          ? ''
          : html`
              <div slot="footer" class="dialog-footer-actions">
                <button
                  type="button"
                  class="btn btn-secondary footer-btn"
                  @click=${this._close}
                  ?disabled=${this._submitting}
                >
                  ${this._t('hub.submit_preset.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  class="btn btn-primary footer-btn"
                  ?disabled=${!this._canSubmit || this._submitting}
                  @click=${this._trySubmit}
                >
                  ${this._submitting
                    ? this._submitStep === 'featured'
                      ? html`<ha-icon icon="mdi:loading" class="spin"></ha-icon>
                          ${this._t('hub.submit_preset.uploading_featured', 'Uploading featured image…')}`
                      : this._submitStep === 'photos'
                      ? html`<ha-icon icon="mdi:loading" class="spin"></ha-icon>
                          ${this._t('hub.submit_preset.uploading_photo', 'Uploading photo')}
                          ${this._photoStates.filter(s => s.status !== 'pending').length}
                          of ${this._photos.length}…`
                      : html`<ha-icon icon="mdi:loading" class="spin"></ha-icon>
                          ${isEdit
                            ? this._t('hub.submit_preset.saving', 'Saving…')
                            : this._t('hub.submit_preset.sending', 'Sending…')}`
                    : isEdit
                      ? html`<ha-icon icon="mdi:content-save"></ha-icon>
                          ${this._t('hub.submit_preset.save', 'Save')}`
                      : html`<ha-icon icon="mdi:send"></ha-icon>
                          ${this._t('hub.submit_preset.send', 'Send')}`}
                </button>
              </div>
            `}
      </ha-dialog>
    `;
  }

  private _renderSuccess(): TemplateResult {
    const isEdit = this.mode === 'edit';
    const wasPublished = this.existing?.status === 'publish';
    const title = isEdit
      ? this._t('hub.submit_preset.success_edit_title', 'Preset updated')
      : this._t('hub.submit_preset.success_create_title', 'Preset Submitted!');
    const body = isEdit
      ? wasPublished
        ? this._t(
            'hub.submit_preset.success_edit_review',
            'Update submitted for review. Your live preset stays online until the update is approved.'
          )
        : this._t('hub.submit_preset.success_edit_saved', 'Saved.')
      : this._t(
          'hub.submit_preset.success_create_body',
          'Thank you for sharing! Your preset is now pending review. Once our team reviews and approves it, it will appear in the Preset Gallery.'
        );

    return html`
      <div class="submit-success">
        <ha-icon icon="mdi:check-circle"></ha-icon>
        <h3>${title}</h3>
        <p>${body}</p>
        <button class="btn btn-primary" @click=${this._close}>
          <ha-icon icon="mdi:check"></ha-icon>
          ${this._t('hub.submit_preset.got_it', 'Got it, thanks!')}
        </button>
      </div>
    `;
  }

  private _renderForm(): TemplateResult {
    const isEdit = this.mode === 'edit';
    return html`
      <p class="dialog-subtitle">
        ${isEdit
          ? this._t(
              'hub.submit_preset.edit_blurb',
              'Update the details below. Changes to a live preset are queued for review while the current version stays online.'
            )
          : this._t(
              'hub.submit_preset.create_blurb',
              'Share your layout with the Ultra Card community. Fill in the details below and submit — once our team reviews and approves it, it will appear in the Preset Gallery.'
            )}
      </p>

      <!-- Title -->
      <div class="field">
        <label>${this._t('hub.submit_preset.field_title', 'Preset Title')}<span class="required-star">*</span></label>
        <input
          type="text"
          class=${this._showValidation && !this._titleValid ? 'invalid' : ''}
          .value=${this._title}
          @input=${(e: Event) => { this._title = (e.target as HTMLInputElement).value; this._error = ''; }}
          placeholder="My Awesome Preset"
          ?disabled=${this._submitting}
        />
        ${this._showValidation && !this._titleValid
          ? html`<span class="field-error">${this._t('hub.submit_preset.title_required', 'Title is required.')}</span>`
          : ''}
      </div>

      <!-- Description -->
      <div class="field">
        <label>${this._t('hub.submit_preset.field_description', 'Preset Description')}<span class="required-star">*</span></label>
        <textarea
          class=${this._showValidation && !this._descriptionValid ? 'invalid' : ''}
          .value=${this._description}
          @input=${(e: Event) => { this._description = (e.target as HTMLTextAreaElement).value; this._error = ''; }}
          placeholder="Describe what this preset does and when to use it…"
          ?disabled=${this._submitting}
        ></textarea>
        ${this._showValidation && !this._descriptionValid
          ? html`<span class="field-error">${this._t('hub.submit_preset.description_required', 'Description is required.')}</span>`
          : ''}
      </div>

      <!-- Category + Tags -->
      <div class="field-row">
        <div class="field">
          <label>${this._t('hub.submit_preset.field_category', 'Preset Category')}<span class="required-star">*</span></label>
          <div
            class=${'cat-chips' + (this._showValidation && !this._categoryValid ? ' invalid' : '')}
            role="group"
            aria-label=${this._t('hub.submit_preset.field_category', 'Preset Category')}
          >
            ${this._categories.map(c => {
              const icon = this._categoryIcon(c.value);
              return html`
                <button
                  type="button"
                  class="cat-chip ${this._category === c.value ? 'active' : ''}"
                  ?disabled=${this._submitting || this._loadingCategories}
                  @click=${() => {
                    this._category = c.value;
                  }}
                >
                  <ha-icon icon=${icon}></ha-icon>
                  ${c.label}
                </button>
              `;
            })}
          </div>
          ${this._loadingCategories
            ? html`<span class="field-hint">${this._t('hub.submit_preset.loading_categories', 'Loading categories…')}</span>`
            : this._showValidation && !this._categoryValid
              ? html`<span class="field-error">${this._t('hub.submit_preset.category_required', 'Please select a category.')}</span>`
              : ''}
        </div>
        <div class="field">
          <label>${this._t('hub.submit_preset.field_tags', 'Preset Tags')}</label>
          <input
            type="text"
            .value=${this._tags}
            @input=${(e: Event) => { this._tags = (e.target as HTMLInputElement).value; }}
            placeholder="dashboard, minimal, ev"
            ?disabled=${this._submitting}
          />
          <span class="field-hint">${this._t('hub.submit_preset.tags_hint', 'Comma-separated')}</span>
        </div>
      </div>

      <!-- Preset Code -->
      <div class="field">
        <label>${this._t('hub.submit_preset.field_code', 'Preset Code')}<span class="required-star">*</span></label>
        <textarea
          class=${'code-field' + (this._showValidation && !this._codeValid ? ' invalid' : '')}
          .value=${this._code}
          @input=${(e: Event) => { this._code = (e.target as HTMLTextAreaElement).value; this._error = ''; }}
          placeholder="Please enter your Ultra Card Preset Code"
          ?disabled=${this._submitting}
        ></textarea>
        ${this._showValidation && !this._codeValid
          ? html`<span class="field-error">${this._t('hub.submit_preset.code_required', 'Preset code is required.')}</span>`
          : html`<span class="field-hint">
              ${this.payload?.shortcode
                ? this._t(
                    'hub.submit_preset.code_hint_layout',
                    'Auto-filled from your current card layout. Edit if needed.'
                  )
                : this._t(
                    'hub.submit_preset.code_hint_paste',
                    'Paste your Ultra Card layout JSON here.'
                  )}
            </span>`}
        ${isEdit && this.payload?.shortcode
          ? html`
              <button
                type="button"
                class="update-code-btn"
                ?disabled=${this._submitting}
                @click=${this._updateCodeFromLayout}
              >
                <ha-icon icon="mdi:refresh"></ha-icon>
                ${this._t(
                  'hub.submit_preset.update_code_from_layout',
                  'Update code from current layout'
                )}
              </button>
            `
          : nothing}
        ${this._renderPrivacyNotice()}
      </div>

      <!-- Featured image (required) -->
      <div class="field">
        <label>
          ${this._t('hub.submit_preset.field_featured', 'Featured Image')}
          <span class="required-star">*</span>
        </label>
        ${this._keptFeatured || this._featuredFile
          ? html`
              ${this._keptFeatured?.url
                ? html`<img class="featured-preview" src=${this._keptFeatured.url} alt="" />`
                : this._featuredFile
                  ? html`<div class="file-table" style="margin-bottom: 8px;">
                      <div class="file-row">
                        <span class="file-name">${this._featuredFile.name}</span>
                        <span class="file-size">${this._formatBytes(this._featuredFile.size)}</span>
                        <span></span>
                      </div>
                    </div>`
                  : nothing}
              <button
                type="button"
                class="btn btn-secondary"
                style="margin-bottom: 8px;"
                @click=${this._removeFeatured}
                ?disabled=${this._submitting}
              >
                <ha-icon icon="mdi:close"></ha-icon>
                ${this._t('hub.submit_preset.replace_featured', 'Remove / replace')}
              </button>
            `
          : html`
              <label class="upload-zone" for="featured-upload">
                <span class="upload-zone-label">
                  <ha-icon icon="mdi:image-outline"></ha-icon>
                  <strong>${this._t('hub.submit_preset.upload_featured', 'Click to upload featured image')}</strong>
                  <span>${this._t('hub.submit_preset.featured_hint', 'Required · Used as the gallery thumbnail')}</span>
                </span>
                <input
                  id="featured-upload"
                  type="file"
                  accept=${SUPPORTED_IMAGE_ACCEPT}
                  @change=${this._handleFeaturedInput}
                  @input=${this._handleFeaturedInput}
                  ?disabled=${this._submitting}
                />
              </label>
            `}
        ${this._showValidation && !this._hasFeatured
          ? html`<span class="field-error">${this._t('hub.submit_preset.featured_required', 'Featured image is required.')}</span>`
          : nothing}
      </div>

      <!-- Additional photos (optional) -->
      <div class="field">
        <label>
          ${this._t('hub.submit_preset.field_photos', 'Preset Photos')}
          <span style="font-weight: 500; opacity: 0.7; margin-left: 4px;">
            ${this._t('hub.submit_preset.optional', '(optional)')}
          </span>
        </label>
        ${this._keptPhotos.length > 0
          ? html`
              <div class="file-table" style="margin-bottom: 10px;">
                <div class="file-table-header">
                  <span>${this._t('hub.submit_preset.existing_photos', 'Existing photos')}</span>
                  <span></span>
                  <span></span>
                </div>
                ${this._keptPhotos.map(
                  (photo, i) => html`
                    <div class="file-row">
                      ${photo.url
                        ? html`<img class="kept-photo-thumb" src=${photo.url} alt="" />`
                        : html`<span class="kept-photo-label">#${photo.id ?? i + 1}</span>`}
                      <span class="file-name kept-photo-label">
                        ${photo.id
                          ? this._t('hub.submit_preset.kept_photo', 'Uploaded photo')
                          : this._t('hub.submit_preset.gallery_photo', 'Gallery photo')}
                      </span>
                      <button
                        class="file-remove-btn"
                        @click=${() => this._removeKeptPhoto(i)}
                        title="Remove"
                        ?disabled=${this._submitting}
                      >
                        <ha-icon icon="mdi:close"></ha-icon>
                      </button>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}
        <label class="upload-zone" for="photo-upload">
          <span class="upload-zone-label">
            <ha-icon icon="mdi:image-multiple-outline"></ha-icon>
            <strong>${this._t('hub.submit_preset.upload_photos', 'Click to upload additional photos')}</strong>
            <span>PNG, JPG, GIF, WebP, AVIF, SVG… · ${this._t('hub.submit_preset.photos_hint', 'Up to 5')}</span>
          </span>
          <input
            id="photo-upload"
            type="file"
            accept=${SUPPORTED_IMAGE_ACCEPT}
            multiple
            @change=${this._handleFileInput}
            @input=${this._handleFileInput}
            ?disabled=${this._submitting || this._totalPhotoCount >= MAX_PHOTOS}
          />
        </label>
        <div class="file-table">
          <div class="file-table-header">
            <span>File Name</span>
            <span>Size</span>
            <span></span>
          </div>
          ${this._photos.length === 0
            ? html`<div class="file-empty">${this._t('hub.submit_preset.no_new_photos', 'No additional photos')}</div>`
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
                    <span>${allPending ? '…' : `${done}/${total}`}</span>
                  </div>
                  <div class="photo-upload-progress-track">
                    <div
                      class="photo-upload-progress-fill ${allPending ? 'indeterminate' : ''}"
                      style=${allPending ? '' : `width:${pct}%`}
                    ></div>
                  </div>
                </div>
              `;
            })()
          : nothing}
      </div>

      <!-- Integrations -->
      <div class="field">
        <label>${this._t('hub.submit_preset.field_integrations', 'Integrations')}</label>
        <input
          type="text"
          .value=${this._integrations}
          @input=${(e: Event) => { this._integrations = (e.target as HTMLInputElement).value; }}
          placeholder="e.g. Tesla, Hue, Google"
          ?disabled=${this._submitting}
        />
        <span class="field-hint">${this._t('hub.submit_preset.integrations_hint', 'Comma-separated list of integrations this preset uses')}</span>
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
