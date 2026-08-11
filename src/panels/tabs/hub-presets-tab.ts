import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { PresetDefinition } from '../../types';
import { ucPresetsService } from '../../services/uc-presets-service';
import { ucCloudAuthService } from '../../services/uc-cloud-auth-service';
import { ucCloudSyncService } from '../../services/uc-cloud-sync-service';
import {
  ucPresetAuthorService,
  type AuthorPreset,
} from '../../services/uc-preset-author-service';
import type { CloudUser } from '../../services/uc-cloud-auth-service';
import { panelStyles } from '../panel-styles';
import { copyTextToClipboard } from '../../utils/uc-clipboard';
import { sanitizePresetHtml } from '../../utils/html-sanitizer';
import { localize } from '../../localize/localize';
import '../components/uc-hub-login-dialog';
import '../components/uc-hub-rate-dialog';
import '../components/uc-hub-submit-preset-dialog';

type PresetCategory = 'all' | PresetDefinition['category'];
type PresetsView = 'browse' | 'mine';

@customElement('hub-presets-tab')
export class HubPresetsTab extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  /** Initial sub-view when navigated from dashboard prompt. */
  @property() initialView: PresetsView = 'browse';

  @state() private _view: PresetsView = 'browse';
  @state() private _presets: PresetDefinition[] = [];
  @state() private _category: PresetCategory = 'all';
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _search = '';
  @state() private _toastMsg = '';
  @state() private _expandedId: string | null = null;
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _showLoginDialog = false;
  @state() private _ratingPreset: { id: string; name: string } | null = null;
  @state() private _pendingRateAfterLogin: { id: string; name: string } | null = null;
  @state() private _userReviews: Map<string, number> = new Map();
  @state() private _readMoreId: string | null = null;

  @state() private _myPresets: AuthorPreset[] = [];
  @state() private _myLoading = false;
  @state() private _myError: string | null = null;
  @state() private _myForbidden = false;
  @state() private _editingPreset: AuthorPreset | null = null;
  @state() private _actionBusyId: number | null = null;

  private _unsub: (() => void) | undefined;
  private _statusUnsub: (() => void) | undefined;
  private _authListener: ((user: CloudUser | null) => void) | undefined;
  private _toastTimer: ReturnType<typeof setTimeout> | undefined;

  private _lang(): string {
    return this.hass?.locale?.language ?? 'en';
  }

  private _t(key: string, fallback: string): string {
    return localize(key, this._lang(), fallback);
  }

  private _getSanitizedPresetDescription(preset: PresetDefinition): string {
    const rawDescription =
      this._readMoreId === preset.id
        ? ((preset as any).description_full || preset.description)
        : preset.description;
    return sanitizePresetHtml(rawDescription || '');
  }

  static override styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Toolbar */
      .presets-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        margin-bottom: 20px;
      }

      .search-box {
        flex: 1;
        min-width: 180px;
        position: relative;
      }

      .search-box input {
        width: 100%;
        padding: 10px 16px 10px 40px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 10px;
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .search-box input:focus {
        border-color: var(--primary-color);
      }

      .search-box ha-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }

      .refresh-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        border-radius: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 12px;
        font-weight: 500;
      }

      .refresh-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .refresh-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .refresh-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .spinning {
        animation: spin 1s linear infinite;
      }

      /* Preset grid */
      .presets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      @media (max-width: 600px) {
        .presets-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Preset card */
      .preset-card {
        display: flex;
        flex-direction: column;
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      }

      .preset-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
        border-color: var(--primary-color);
      }

      /* Card header */
      .preset-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
        border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        gap: 12px;
      }

      .preset-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }

      .preset-title-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
      }

      .preset-header-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .preset-header-author {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-style: italic;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .origin-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
      }

      .origin-badge.community {
        background: rgba(255, 152, 0, 0.9);
        color: white;
      }

      .origin-badge.default,
      .origin-badge.standard {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.9);
        color: white;
      }

      .origin-badge.builtin {
        background: rgba(var(--rgb-secondary-text-color, 128, 128, 128), 0.7);
        color: white;
      }

      .new-badge {
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        flex-shrink: 0;
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }

      /* Preview area */
      .preset-preview {
        width: 100%;
        height: 160px;
        background: var(--secondary-background-color, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        padding: 8px;
        box-sizing: border-box;
      }

      .preset-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 6px;
        transition: transform 0.3s ease;
      }

      .preset-card:hover .preset-preview img {
        transform: scale(1.05);
      }

      .preset-icon-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 72px;
        height: 72px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 50%;
      }

      .preset-icon-placeholder ha-icon {
        --mdc-icon-size: 36px;
        color: var(--primary-color);
        opacity: 0.4;
      }

      /* Content section */
      .preset-content {
        padding: 14px 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .preset-description {
        margin: 0;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        overflow: hidden;
        max-height: 4.2em; /* ~3 lines */
      }

      .preset-description.expanded {
        max-height: none;
        overflow: visible;
      }

      .read-more-link {
        background: none;
        border: none;
        padding: 2px 0;
        font-size: 12px;
        color: var(--primary-color);
        cursor: pointer;
        font-weight: 500;
        display: block;
        margin-top: 4px;
      }

      /* Scoped styles for WordPress HTML in descriptions */
      .preset-description p,
      .preset-description li {
        margin: 0 0 4px;
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }

      .preset-description a {
        color: var(--primary-color);
        text-decoration: underline;
      }

      .preset-description h1,
      .preset-description h2,
      .preset-description h3 {
        font-size: 13px;
        font-weight: 600;
        margin: 6px 0 2px;
        color: var(--primary-text-color);
      }

      .preset-description ul,
      .preset-description ol {
        padding-left: 16px;
        margin: 2px 0;
      }

      .preset-description img {
        max-width: 100%;
        border-radius: 6px;
      }

      /* Stats row */
      .preset-stats {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 12px;
        color: var(--secondary-text-color);
        padding-top: 4px;
      }

      .preset-stats .stat {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .preset-stats ha-icon {
        --mdc-icon-size: 14px;
        opacity: 0.6;
      }

      /* Rating stars */
      .star-rating {
        display: flex;
        gap: 2px;
      }

      .star-rating ha-icon {
        --mdc-icon-size: 14px;
        color: #ffb300;
        opacity: 1;
      }

      .star-rating ha-icon.empty {
        opacity: 0.25;
      }

      .preset-rating-interactive {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        user-select: none;
      }

      .preset-rating-interactive .rating-count {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-left: 2px;
      }

      .preset-rating-hint {
        font-size: 12px;
        color: var(--primary-color);
        opacity: 0.9;
      }

      /* Action bar at card bottom */
      .preset-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
      }

      .preset-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        flex: 1;
        padding: 5px 10px;
        border-radius: 6px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--secondary-text-color);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      .preset-action-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
      }

      .preset-action-btn.primary {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }

      .preset-action-btn.primary:hover {
        filter: brightness(1.1);
        color: white;
      }

      .preset-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      /* Hint banner above presets grid */
      .presets-hint {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        margin-bottom: 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        border-radius: 10px;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      .presets-hint ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
        flex-shrink: 0;
      }

      .presets-hint strong {
        color: var(--primary-text-color);
      }

      /* Details panel */
      .preset-details {
        padding: 12px 16px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.02);
        animation: fadeSlideIn 0.2s ease-out;
      }

      .detail-info {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 12px;
        font-size: 12px;
        margin-bottom: 10px;
      }

      .detail-info dt {
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .detail-info dd {
        margin: 0;
        color: var(--primary-text-color);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .detail-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }

      .detail-tag {
        display: inline-block;
        padding: 2px 8px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        border-radius: 4px;
        font-size: 11px;
        color: var(--primary-color);
        font-weight: 500;
      }

      /* Status bar */
      .status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 10px 14px;
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: 10px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.06));
      }

      .status-bar .count {
        font-size: 13px;
        color: var(--secondary-text-color);
        font-weight: 500;
      }

      .status-bar .count strong {
        color: var(--primary-text-color);
      }

      /* Loading */
      .loading-state {
        text-align: center;
        padding: 40px;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .loading-state ha-icon {
        --mdc-icon-size: 32px;
        color: var(--primary-color);
        margin-bottom: 12px;
        display: block;
      }

      /* Error */
      .error-state {
        text-align: center;
        padding: 32px;
        color: var(--error-color, #f44336);
        font-size: 14px;
      }

      /* Browse | My Presets segmented control */
      .presets-view-switch {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        border-radius: 14px;
        margin-bottom: 16px;
      }

      .presets-view-option {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 14px;
        border: none;
        border-radius: 10px;
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
      }

      .presets-view-option ha-icon {
        --mdc-icon-size: 18px;
      }

      .presets-view-option:hover:not(.active) {
        color: var(--primary-text-color);
      }

      .presets-view-option.active {
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
      }

      /* My Presets list */
      .my-presets-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .my-preset-row {
        display: grid;
        grid-template-columns: 72px 1fr auto;
        gap: 14px;
        align-items: start;
        padding: 14px;
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 12px;
      }

      @media (max-width: 600px) {
        .my-preset-row {
          grid-template-columns: 56px 1fr;
        }
        .my-preset-actions {
          grid-column: 1 / -1;
        }
      }

      .my-preset-thumb {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        object-fit: cover;
        background: var(--secondary-background-color);
      }

      .my-preset-thumb-placeholder {
        width: 72px;
        height: 72px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--secondary-text-color);
      }

      .my-preset-thumb-placeholder ha-icon {
        --mdc-icon-size: 28px;
      }

      .my-preset-info h4 {
        margin: 0 0 6px;
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .my-preset-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        margin-bottom: 6px;
      }

      .status-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.2px;
      }

      .status-chip.pending {
        background: rgba(255, 152, 0, 0.15);
        color: #ef6c00;
      }

      .status-chip.live {
        background: rgba(76, 175, 80, 0.15);
        color: #2e7d32;
      }

      .status-chip.changes_requested {
        background: rgba(33, 150, 243, 0.15);
        color: #1565c0;
      }

      .status-chip.rejected {
        background: rgba(244, 67, 54, 0.12);
        color: #c62828;
      }

      .status-chip.draft {
        background: rgba(158, 158, 158, 0.18);
        color: var(--secondary-text-color);
      }

      .revision-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        color: var(--primary-color);
      }

      .revision-badge ha-icon {
        --mdc-icon-size: 14px;
      }

      .moderator-note {
        margin: 6px 0 0;
        padding: 8px 10px;
        border-radius: 8px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
        font-size: 12px;
        line-height: 1.45;
        color: var(--primary-text-color);
      }

      .moderator-note strong {
        color: var(--secondary-text-color);
        font-weight: 600;
      }

      .my-preset-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: flex-end;
      }

      .my-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: transparent;
        color: var(--secondary-text-color);
        font-size: 12px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        text-decoration: none;
        box-sizing: border-box;
      }

      .my-action-btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .my-action-btn.danger:hover:not(:disabled) {
        border-color: var(--error-color, #f44336);
        color: var(--error-color, #f44336);
      }

      .my-action-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      .my-action-btn ha-icon {
        --mdc-icon-size: 14px;
      }

      .my-login-cta,
      .my-admin-only {
        text-align: center;
        padding: 36px 20px;
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
      }

      .my-login-cta ha-icon,
      .my-admin-only ha-icon {
        --mdc-icon-size: 40px;
        color: var(--primary-color);
        margin-bottom: 12px;
      }

      .my-login-cta h3,
      .my-admin-only h3 {
        margin: 0 0 8px;
        font-size: 18px;
      }

      .my-login-cta p,
      .my-admin-only p {
        margin: 0 0 16px;
        color: var(--secondary-text-color);
        font-size: 14px;
        line-height: 1.5;
      }

      .my-login-cta button,
      .my-admin-only button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border: none;
        border-radius: 10px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 14px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
      }
    `,
  ];

  /** Reload presets from ultracard.io (clears API cache). Called when the Hub Presets tab is opened. */
  refresh(): void {
    ucPresetsService.ensureWordPressLoaded();
    void ucPresetsService.refreshWordPressPresets();
    if (this._view === 'mine' && this._cloudUser) {
      void this._loadMyPresets();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    ucPresetsService.ensureWordPressLoaded();
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
      if (user) {
        this._showLoginDialog = false;
        ucCloudSyncService.loadUserReviewsFromServer().then(() => this.requestUpdate());
        if (this._view === 'mine') void this._loadMyPresets();
      } else {
        this._myPresets = [];
        this._myError = null;
        this._myForbidden = false;
      }
    };
    ucCloudAuthService.addListener(this._authListener);
    if (this._cloudUser) {
      ucCloudSyncService.loadUserReviewsFromServer().then(() => this.requestUpdate());
    }
    this._presets = ucPresetsService.getAllPresets();
    this._unsub = ucPresetsService.subscribe(list => {
      this._presets = list;
    });
    const status = ucPresetsService.getWordPressStatus();
    this._loading = status.loading;
    this._error = status.error;
    this._statusUnsub = ucPresetsService.subscribeToStatus(s => {
      this._loading = s.loading;
      this._error = s.error;
    });
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('initialView') && this.initialView === 'mine') {
      this._setView('mine');
      this.dispatchEvent(
        new CustomEvent('presets-view-applied', { bubbles: true, composed: true })
      );
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._statusUnsub?.();
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = undefined;
    }
    if (this._toastTimer) clearTimeout(this._toastTimer);
  }

  private _setView(view: PresetsView): void {
    this._view = view;
    if (view === 'mine' && this._cloudUser) {
      void this._loadMyPresets();
    }
  }

  private async _loadMyPresets(): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) return;
    this._myLoading = true;
    this._myError = null;
    this._myForbidden = false;
    try {
      this._myPresets = await ucPresetAuthorService.listMine();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 403) {
        this._myForbidden = true;
        this._myError = this._t(
          'hub.my_presets.admin_only_message',
          'Preset authoring is available to Home Assistant administrators only. Sign in as an admin (via Ultra Card Connect) to manage your submissions.'
        );
      } else {
        this._myError =
          err instanceof Error
            ? err.message
            : this._t('hub.my_presets.load_error', 'Could not load your presets.');
      }
      this._myPresets = [];
    } finally {
      this._myLoading = false;
    }
  }

  private _statusChip(preset: AuthorPreset): { key: string; label: string; className: string } {
    if (preset.review_status === 'changes_requested') {
      return {
        key: 'changes_requested',
        label: this._t('hub.my_presets.status.changes_requested', 'Changes requested'),
        className: 'changes_requested',
      };
    }
    if (preset.review_status === 'rejected' || preset.status === 'rejected') {
      return {
        key: 'rejected',
        label: this._t('hub.my_presets.status.rejected', 'Rejected'),
        className: 'rejected',
      };
    }
    if (preset.status === 'publish' && preset.review_status === 'approved') {
      return {
        key: 'live',
        label: this._t('hub.my_presets.status.live', 'Live'),
        className: 'live',
      };
    }
    if (preset.status === 'draft') {
      return {
        key: 'draft',
        label: this._t('hub.my_presets.status.draft', 'Draft'),
        className: 'draft',
      };
    }
    if (preset.status === 'publish') {
      return {
        key: 'live',
        label: this._t('hub.my_presets.status.live', 'Live'),
        className: 'live',
      };
    }
    return {
      key: 'pending',
      label: this._t('hub.my_presets.status.pending', 'Pending review'),
      className: 'pending',
    };
  }

  private _openEdit(preset: AuthorPreset): void {
    this._editingPreset = preset;
  }

  private async _withdraw(preset: AuthorPreset): Promise<void> {
    const ok = window.confirm(
      this._t(
        'hub.my_presets.confirm_withdraw',
        'Withdraw this pending submission or revision?'
      )
    );
    if (!ok) return;
    this._actionBusyId = preset.id;
    try {
      await ucPresetAuthorService.withdraw(preset.id);
      this._showToast(this._t('hub.my_presets.withdrawn', 'Submission withdrawn'));
      await this._loadMyPresets();
    } catch (err) {
      this._showToast(err instanceof Error ? err.message : 'Withdraw failed');
    } finally {
      this._actionBusyId = null;
    }
  }

  private async _delete(preset: AuthorPreset): Promise<void> {
    const ok = window.confirm(
      this._t(
        'hub.my_presets.confirm_delete',
        'Delete this preset? This cannot be undone.'
      )
    );
    if (!ok) return;
    this._actionBusyId = preset.id;
    try {
      await ucPresetAuthorService.remove(preset.id);
      this._showToast(this._t('hub.my_presets.deleted', 'Preset deleted'));
      await this._loadMyPresets();
    } catch (err) {
      this._showToast(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      this._actionBusyId = null;
    }
  }

  private _showToast(msg: string): void {
    this._toastMsg = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (this._toastMsg = ''), 2500);
  }

  private _getFilteredPresets(): PresetDefinition[] {
    let list = this._presets;
    if (this._category !== 'all') {
      list = list.filter(p => p.category === this._category);
    }
    if (this._search.trim()) {
      const q = this._search.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.author || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  private _refreshPresets(): void {
    this.refresh();
  }

  private _getOriginLabel(preset: PresetDefinition): string {
    if ((preset as any).source === 'wordpress' || (preset as any).origin === 'community') return 'community';
    if ((preset as any).origin === 'default' || (preset as any).source === 'default') return 'default';
    if ((preset as any).origin === 'builtin' || (preset as any).source === 'builtin') return 'builtin';
    return 'community';
  }

  private _isNewPreset(preset: PresetDefinition): boolean {
    const dateStr = (preset as any).metadata?.created || (preset as any).metadata?.date;
    if (!dateStr) return false;
    const created = new Date(dateStr);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return created > thirtyDaysAgo;
  }

  private _buildPresetConfig(preset: PresetDefinition): Record<string, any> {
    const config: Record<string, any> = {};
    if (preset.layout) {
      config.layout = preset.layout;
    }
    if (preset.cardSettings) {
      Object.entries(preset.cardSettings).forEach(([k, v]) => {
        if (v !== undefined && v !== null) config[k] = v;
      });
    }
    if (preset.customVariables && preset.customVariables.length > 0) {
      config._customVariables = preset.customVariables;
    }
    return config;
  }

  private async _copyPresetConfig(preset: PresetDefinition): Promise<void> {
    try {
      const config = this._buildPresetConfig(preset);
      if (Object.keys(config).length === 0) {
        this._showToast('No config data in this preset');
        return;
      }
      const text = JSON.stringify(config, null, 2);
      const copied = await copyTextToClipboard(text);
      this._showToast(
        copied
          ? `Copied "${preset.name}" config`
          : 'Could not copy — your browser blocked clipboard access'
      );
    } catch (err) {
      console.warn('Copy preset config failed:', err);
      this._showToast('Could not copy this preset');
    }
    ucPresetsService.trackPresetDownload(preset.id).catch(() => {});
  }

  private async _copyPresetLayout(preset: PresetDefinition): Promise<void> {
    try {
      if (!preset.layout) {
        this._showToast('No layout data in this preset');
        return;
      }
      const text = JSON.stringify(preset.layout, null, 2);
      const copied = await copyTextToClipboard(text);
      this._showToast(
        copied
          ? `Copied layout for "${preset.name}"`
          : 'Could not copy — your browser blocked clipboard access'
      );
    } catch (err) {
      console.warn('Copy preset layout failed:', err);
      this._showToast('Could not copy this layout');
    }
    ucPresetsService.trackPresetDownload(preset.id).catch(() => {});
  }

  private _toggleDetails(id: string): void {
    this._expandedId = this._expandedId === id ? null : id;
  }

  private _renderStars(rating: number): unknown {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        html`<ha-icon
          icon=${i <= Math.round(rating) ? 'mdi:star' : 'mdi:star-outline'}
          class=${i <= Math.round(rating) ? '' : 'empty'}
        ></ha-icon>`
      );
    }
    return html`<div class="star-rating">${stars}</div>`;
  }

  private _getUserRatingForPreset(presetId: string): number | null {
    const fromMap = this._userReviews.get(presetId);
    if (fromMap != null) return fromMap;
    const review = ucCloudSyncService.getUserReview(presetId);
    return review?.rating ?? null;
  }

  private _renderInteractiveStars(preset: PresetDefinition, meta: Record<string, unknown>): unknown {
    const userRating = this._getUserRatingForPreset(preset.id);
    const displayRating = userRating ?? (meta.rating as number) ?? 0;
    if (displayRating <= 0 && !this._cloudUser) {
      return html`<span class="preset-rating-hint" title="Sign in to rate">Rate it</span>`;
    }
    const stars = [];
    const r = Math.round(displayRating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        html`<ha-icon
          icon=${i <= r ? 'mdi:star' : 'mdi:star-outline'}
          class=${i <= r ? '' : 'empty'}
        ></ha-icon>`
      );
    }
    return html`<span class="star-rating">${stars}</span>`;
  }

  private _handleStarClick(preset: PresetDefinition, e: Event): void {
    e.stopPropagation();
    if (!this._cloudUser) {
      this._pendingRateAfterLogin = { id: preset.id, name: preset.name };
      this._showLoginDialog = true;
      return;
    }
    this._ratingPreset = { id: preset.id, name: preset.name };
  }

  private _handleRatingSubmitted(
    e: CustomEvent<{
      presetId: string;
      rating: number;
      presetRating?: number;
      presetRatingCount?: number;
    }>
  ): void {
    const { presetId, rating, presetRating, presetRatingCount } = e.detail;
    this._userReviews = new Map(this._userReviews).set(presetId, rating);
    this._applyAggregateRating(presetId, presetRating, presetRatingCount);
    this._ratingPreset = null;
    this._showToast('Thanks for your rating!');
  }

  /**
   * Fold the server's recalculated average back into the loaded catalog so the
   * count next to the stars matches the vote that was just cast.
   */
  private _applyAggregateRating(
    presetId: string,
    rating: number | undefined,
    count: number | undefined
  ): void {
    if (rating == null) return;
    const preset = this._presets.find(p => p.id === presetId);
    if (!preset) return;

    preset.metadata = {
      ...preset.metadata,
      rating,
      ...(count != null ? { rating_count: count } : {}),
    };
    this._presets = [...this._presets];
  }

  override render() {
    return html`
      ${this._showLoginDialog
        ? html`
            <uc-hub-login-dialog
              @close=${() => {
                this._showLoginDialog = false;
                this._pendingRateAfterLogin = null;
              }}
            ></uc-hub-login-dialog>
          `
        : ''}
      ${this._ratingPreset
        ? html`
            <uc-hub-rate-dialog
              .presetId=${this._ratingPreset.id}
              .presetName=${this._ratingPreset.name}
              .existingRating=${this._userReviews.get(this._ratingPreset.id) ?? ucCloudSyncService.getUserReview(this._ratingPreset.id)?.rating ?? 0}
              @rating-submitted=${this._handleRatingSubmitted}
              @close=${(): void => {
                this._ratingPreset = null;
              }}
            ></uc-hub-rate-dialog>
          `
        : ''}
      ${this._editingPreset
        ? html`
            <uc-hub-submit-preset-dialog
              mode="edit"
              .existing=${this._editingPreset}
              .language=${this._lang()}
              @preset-updated=${() => {
                this._editingPreset = null;
                this._showToast(
                  this._t('hub.my_presets.updated', 'Preset update saved')
                );
                void this._loadMyPresets();
              }}
              @close=${() => {
                this._editingPreset = null;
              }}
            ></uc-hub-submit-preset-dialog>
          `
        : ''}

      <div class="presets-view-switch" role="tablist" aria-label=${this._t('hub.my_presets.view_switch', 'Presets view')}>
        <button
          class="presets-view-option ${this._view === 'browse' ? 'active' : ''}"
          role="tab"
          aria-selected=${this._view === 'browse' ? 'true' : 'false'}
          @click=${() => this._setView('browse')}
        >
          <ha-icon icon="mdi:view-grid-outline"></ha-icon>
          ${this._t('hub.my_presets.browse', 'Browse')}
        </button>
        <button
          class="presets-view-option ${this._view === 'mine' ? 'active' : ''}"
          role="tab"
          aria-selected=${this._view === 'mine' ? 'true' : 'false'}
          @click=${() => this._setView('mine')}
        >
          <ha-icon icon="mdi:account-edit-outline"></ha-icon>
          ${this._t('hub.my_presets.mine', 'My Presets')}
        </button>
      </div>

      ${this._view === 'mine' ? this._renderMyPresets() : this._renderBrowse()}

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  private _renderBrowse() {
    const filtered = this._getFilteredPresets();
    const categories: { key: PresetCategory; label: string; icon: string }[] = [
      { key: 'all', label: 'All', icon: 'mdi:view-grid' },
      { key: 'layout', label: 'Layout', icon: 'mdi:view-dashboard-outline' },
      { key: 'content', label: 'Content', icon: 'mdi:text-box-outline' },
      { key: 'data', label: 'Data', icon: 'mdi:chart-box-outline' },
      { key: 'interactive', label: 'Controls', icon: 'mdi:gesture-tap' },
      { key: 'input', label: 'Inputs', icon: 'mdi:form-textbox' },
      { key: 'media', label: 'Media', icon: 'mdi:image-multiple-outline' },
    ];

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Presets</strong> are ready-made layouts you can add to any card. Browse by the same categories as modules, search, or add a preset from the card editor to get started quickly.</p>
      </div>
      <!-- Toolbar -->
      <div class="presets-toolbar">
        <div class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="text"
            placeholder="Search presets…"
            .value=${this._search}
            @input=${(e: InputEvent) => (this._search = (e.target as HTMLInputElement).value)}
          />
        </div>
        <button class="refresh-btn" ?disabled=${this._loading} @click=${this._refreshPresets}>
          <ha-icon icon="mdi:refresh" class=${this._loading ? 'spinning' : ''}></ha-icon>
          Refresh
        </button>
      </div>

      <!-- Filter chips -->
      <div class="filter-row" style="margin-bottom: 16px;">
        ${categories.map(
          cat => html`
            <button
              class="filter-chip ${this._category === cat.key ? 'active' : ''}"
              @click=${() => (this._category = cat.key)}
            >
              <ha-icon icon=${cat.icon}></ha-icon>
              ${cat.label}
            </button>
          `
        )}
      </div>

      <!-- Status bar -->
      <div class="status-bar">
        <span class="count">
          Showing <strong>${filtered.length}</strong> of ${this._presets.length} presets
        </span>
      </div>

      <!-- States -->
      ${this._loading
        ? html`
            <div class="loading-state">
              <ha-icon icon="mdi:loading" class="spinning"></ha-icon>
              Loading presets…
            </div>
          `
        : ''}
      ${this._error
        ? html`<div class="error-state">${this._error}</div>`
        : ''}

      <!-- Grid -->
      ${!this._loading && filtered.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">
                <ha-icon icon="mdi:package-variant"></ha-icon>
              </div>
              <h3>No Presets Found</h3>
              <p>
                ${this._search
                  ? `No presets match "${this._search}". Try a different search.`
                  : 'No presets in this category. Use the card editor to browse and add presets.'}
              </p>
            </div>
          `
        : html`
            ${filtered.length > 0
              ? html`
                  <div class="presets-hint">
                    <ha-icon icon="mdi:information-outline"></ha-icon>
                    <span>
                      <strong>Copy Config</strong> copies the full preset (layout + settings + variables) as JSON — paste into your card's raw YAML editor.
                      <strong>Copy Layout</strong> copies only the row/column structure without card styling.
                    </span>
                  </div>
                `
              : ''}
            <div class="presets-grid">
              ${filtered.map(preset => this._renderPresetCard(preset))}
            </div>
          `}
    `;
  }

  private _renderMyPresets() {
    if (!this._cloudUser) {
      return html`
        <div class="my-login-cta">
          <ha-icon icon="mdi:account-lock-outline"></ha-icon>
          <h3>${this._t('hub.my_presets.login_title', 'Sign in to manage your presets')}</h3>
          <p>
            ${this._t(
              'hub.my_presets.login_message',
              'View submission status, moderator feedback, and update your presets from here.'
            )}
          </p>
          <button type="button" @click=${() => (this._showLoginDialog = true)}>
            <ha-icon icon="mdi:login"></ha-icon>
            ${this._t('hub.my_presets.login_button', 'Sign in')}
          </button>
        </div>
      `;
    }

    if (this._myForbidden) {
      return html`
        <div class="my-admin-only">
          <ha-icon icon="mdi:shield-account-outline"></ha-icon>
          <h3>${this._t('hub.my_presets.admin_only_title', 'Admin access required')}</h3>
          <p>${this._myError}</p>
        </div>
      `;
    }

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p>
          ${this._t(
            'hub.my_presets.blurb',
            'Track your submissions, respond to moderator feedback, and update presets without leaving Home Assistant.'
          )}
        </p>
      </div>
      <div class="presets-toolbar">
        <button class="refresh-btn" ?disabled=${this._myLoading} @click=${() => this._loadMyPresets()}>
          <ha-icon icon="mdi:refresh" class=${this._myLoading ? 'spinning' : ''}></ha-icon>
          ${this._t('hub.my_presets.refresh', 'Refresh')}
        </button>
      </div>

      ${this._myLoading
        ? html`
            <div class="loading-state">
              <ha-icon icon="mdi:loading" class="spinning"></ha-icon>
              ${this._t('hub.my_presets.loading', 'Loading your presets…')}
            </div>
          `
        : nothing}
      ${this._myError && !this._myForbidden
        ? html`<div class="error-state">${this._myError}</div>`
        : nothing}
      ${!this._myLoading && !this._myError && this._myPresets.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">
                <ha-icon icon="mdi:upload-outline"></ha-icon>
              </div>
              <h3>${this._t('hub.my_presets.empty_title', 'No submissions yet')}</h3>
              <p>
                ${this._t(
                  'hub.my_presets.empty_message',
                  'Share a layout from the card editor to submit your first preset.'
                )}
              </p>
            </div>
          `
        : html`
            <div class="my-presets-list">
              ${this._myPresets.map(p => this._renderMyPresetRow(p))}
            </div>
          `}
    `;
  }

  private _renderMyPresetRow(preset: AuthorPreset) {
    const chip = this._statusChip(preset);
    const thumb = preset.gallery?.[0];
    const busy = this._actionBusyId === preset.id;
    const canWithdraw =
      preset.review_status === 'pending' ||
      preset.has_pending_revision ||
      preset.status === 'pending';

    return html`
      <div class="my-preset-row">
        ${thumb
          ? html`<img class="my-preset-thumb" src=${thumb} alt="" loading="lazy" />`
          : html`
              <div class="my-preset-thumb-placeholder">
                <ha-icon icon="mdi:card-text-outline"></ha-icon>
              </div>
            `}
        <div class="my-preset-info">
          <h4>${preset.name}</h4>
          <div class="my-preset-meta">
            <span class="status-chip ${chip.className}">${chip.label}</span>
            ${preset.has_pending_revision
              ? html`
                  <span class="revision-badge">
                    <ha-icon icon="mdi:clock-outline"></ha-icon>
                    ${this._t('hub.my_presets.pending_revision', 'Update awaiting review')}
                  </span>
                `
              : nothing}
          </div>
          ${preset.moderator_note
            ? html`
                <div class="moderator-note">
                  <strong>${this._t('hub.my_presets.moderator_note', 'Moderator note')}:</strong>
                  ${preset.moderator_note}
                </div>
              `
            : nothing}
        </div>
        <div class="my-preset-actions">
          <button
            type="button"
            class="my-action-btn"
            ?disabled=${busy}
            @click=${() => this._openEdit(preset)}
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
            ${this._t('hub.my_presets.edit', 'Edit')}
          </button>
          ${canWithdraw
            ? html`
                <button
                  type="button"
                  class="my-action-btn"
                  ?disabled=${busy}
                  @click=${() => this._withdraw(preset)}
                >
                  <ha-icon icon="mdi:undo"></ha-icon>
                  ${this._t('hub.my_presets.withdraw', 'Withdraw')}
                </button>
              `
            : nothing}
          <button
            type="button"
            class="my-action-btn danger"
            ?disabled=${busy}
            @click=${() => this._delete(preset)}
          >
            <ha-icon icon="mdi:delete-outline"></ha-icon>
            ${this._t('hub.my_presets.delete', 'Delete')}
          </button>
          ${preset.preset_url
            ? html`
                <a
                  class="my-action-btn"
                  href=${preset.preset_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ha-icon icon="mdi:open-in-new"></ha-icon>
                  ${this._t('hub.my_presets.view_on_site', 'View on site')}
                </a>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderPresetCard(preset: PresetDefinition) {
    const origin = this._getOriginLabel(preset);
    const meta = (preset as any).metadata || {};
    const hasImage = !!(preset as any).thumbnail || !!(preset as any).image || !!(preset as any).preview_url;
    const imageUrl = (preset as any).thumbnail || (preset as any).image || (preset as any).preview_url;
    const isExpanded = this._expandedId === preset.id;

    return html`
      <div class="preset-card">
        <div class="preset-header">
          <div class="preset-header-left">
            <div class="preset-title-info">
              <h4 class="preset-header-title">${preset.name}</h4>
              ${preset.author ? html`<span class="preset-header-author">by ${preset.author}</span>` : nothing}
            </div>
          </div>
          <span class="origin-badge ${origin}">${origin}</span>
          ${this._isNewPreset(preset) ? html`<span class="new-badge">New</span>` : nothing}
        </div>

        ${hasImage
          ? html`
              <div class="preset-preview">
                <img src="${imageUrl}" alt="${preset.name}" loading="lazy" />
              </div>
            `
          : html`
              <div class="preset-preview">
                <div class="preset-icon-placeholder">
                  <ha-icon icon="mdi:card-text-outline"></ha-icon>
                </div>
              </div>
            `}

        <div class="preset-content">
          ${preset.description
            ? html`
                <div class="preset-description ${this._readMoreId === preset.id ? 'expanded' : ''}">${
                  unsafeHTML(this._getSanitizedPresetDescription(preset))
                }</div>
                ${(preset as any).description_full && (preset as any).description_full !== preset.description
                  ? html`<button class="read-more-link" @click=${(e: Event) => {
                      e.stopPropagation();
                      this._readMoreId = this._readMoreId === preset.id ? null : preset.id;
                    }}>${this._readMoreId === preset.id ? 'Read Less ↑' : 'Read More ↓'}</button>`
                  : nothing}
              `
            : nothing}

          <div class="preset-stats">
            <span class="stat">
              <ha-icon icon="mdi:download"></ha-icon>
              ${meta.downloads ?? (preset as any).downloads ?? 0}
            </span>
            <div
              class="preset-rating-interactive"
              @click=${(ev: Event) => this._handleStarClick(preset, ev)}
              title=${this._cloudUser ? 'Rate this preset' : 'Sign in to rate'}
            >
              ${this._renderInteractiveStars(preset, meta)}
              <span class="rating-count">(${meta.rating_count ?? meta.reviews_count ?? (preset as any).rating_count ?? (preset as any).reviews_count ?? 0})</span>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="preset-actions">
          <button
            class="preset-action-btn primary"
            title="Copy preset code — paste into your card via Import"
            @click=${() => this._copyPresetConfig(preset)}
          >
            <ha-icon icon="mdi:content-copy"></ha-icon>
            Copy Code
          </button>
          <button
            class="preset-action-btn"
            @click=${() => this._toggleDetails(preset.id)}
          >
            <ha-icon icon=${isExpanded ? 'mdi:chevron-up' : 'mdi:information-outline'}></ha-icon>
            ${isExpanded ? 'Less' : 'Details'}
          </button>
        </div>

        ${isExpanded ? this._renderDetails(preset) : nothing}
      </div>
    `;
  }

  private _renderDetails(preset: PresetDefinition) {
    const rowCount = preset.layout?.rows?.length ?? 0;
    const varCount = preset.customVariables?.length ?? 0;
    const hasCardSettings = !!(preset.cardSettings && Object.keys(preset.cardSettings).length > 0);

    return html`
      <div class="preset-details">
        <dl class="detail-info">
          <dt>Category</dt>
          <dd>${preset.category}</dd>
          <dt>Version</dt>
          <dd>${preset.version || '—'}</dd>
          <dt>Rows</dt>
          <dd>${rowCount}</dd>
          ${varCount > 0 ? html`<dt>Variables</dt><dd>${varCount}</dd>` : nothing}
          ${hasCardSettings ? html`<dt>Card settings</dt><dd>Included</dd>` : nothing}
          ${preset.integrations && preset.integrations.length > 0
            ? html`<dt>Requires</dt><dd>${preset.integrations.join(', ')}</dd>`
            : nothing}
        </dl>
        ${preset.tags && preset.tags.length > 0
          ? html`
              <div class="detail-tags">
                ${preset.tags.map(t => html`<span class="detail-tag">${t}</span>`)}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
