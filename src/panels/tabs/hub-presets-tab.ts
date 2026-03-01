import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { PresetDefinition } from '../../types';
import { ucPresetsService } from '../../services/uc-presets-service';
import { ucCloudAuthService } from '../../services/uc-cloud-auth-service';
import { ucCloudSyncService } from '../../services/uc-cloud-sync-service';
import type { CloudUser } from '../../services/uc-cloud-auth-service';
import { panelStyles } from '../panel-styles';
import '../components/uc-hub-login-dialog';
import '../components/uc-hub-rate-dialog';

type PresetCategory = 'all' | PresetDefinition['category'];

@customElement('hub-presets-tab')
export class HubPresetsTab extends LitElement {
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
  private _unsub?: () => void;
  private _statusUnsub?: () => void;
  private _authListener?: (user: CloudUser | null) => void;
  private _toastTimer?: ReturnType<typeof setTimeout>;

  static styles = [
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
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = (user: CloudUser | null) => {
      this._cloudUser = user;
      if (user) ucCloudSyncService.loadUserReviewsFromServer().then(() => this.requestUpdate());
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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._statusUnsub?.();
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = undefined;
    }
    if (this._toastTimer) clearTimeout(this._toastTimer);
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
    ucPresetsService.refreshWordPressPresets();
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
      await navigator.clipboard.writeText(text);
      this._showToast(`Copied "${preset.name}" config`);
    } catch (err) {
      console.warn('Clipboard write failed, using fallback:', err);
      this._fallbackCopy(JSON.stringify(this._buildPresetConfig(preset), null, 2));
      this._showToast(`Copied "${preset.name}" config`);
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
      await navigator.clipboard.writeText(text);
      this._showToast(`Copied layout for "${preset.name}"`);
    } catch (err) {
      console.warn('Clipboard write failed, using fallback:', err);
      if (preset.layout) {
        this._fallbackCopy(JSON.stringify(preset.layout, null, 2));
        this._showToast(`Copied layout for "${preset.name}"`);
      }
    }
    ucPresetsService.trackPresetDownload(preset.id).catch(() => {});
  }

  private _fallbackCopy(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
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

  private _handleLoginSuccess(e: CustomEvent<{ user: CloudUser }>): void {
    this._cloudUser = e.detail.user;
    this._showLoginDialog = false;
    ucCloudSyncService.loadUserReviewsFromServer().then(() => this.requestUpdate());
    if (this._pendingRateAfterLogin) {
      this._ratingPreset = { ...this._pendingRateAfterLogin };
      this._pendingRateAfterLogin = null;
    }
  }

  private _handleRatingSubmitted(e: CustomEvent<{ presetId: string; rating: number }>): void {
    const { presetId, rating } = e.detail;
    this._userReviews = new Map(this._userReviews).set(presetId, rating);
    this._ratingPreset = null;
    this._showToast('Thanks for your rating!');
  }

  render() {
    const filtered = this._getFilteredPresets();
    const categories: { key: PresetCategory; label: string; icon: string }[] = [
      { key: 'all', label: 'All', icon: 'mdi:view-grid' },
      { key: 'badges', label: 'Badges', icon: 'mdi:shield-star' },
      { key: 'layouts', label: 'Layouts', icon: 'mdi:view-dashboard' },
      { key: 'widgets', label: 'Widgets', icon: 'mdi:widgets' },
      { key: 'custom', label: 'Custom', icon: 'mdi:tune-variant' },
    ];

    return html`
      ${this._showLoginDialog
        ? html`
            <uc-hub-login-dialog
              @auth-success=${this._handleLoginSuccess}
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
              @close=${() => (this._ratingPreset = null)}
            ></uc-hub-rate-dialog>
          `
        : ''}
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p><strong>Presets</strong> are ready-made layouts and widgets you can add to any card. Browse by category, search, or add a preset from the card editor to get started quickly.</p>
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

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
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
                  unsafeHTML(this._readMoreId === preset.id
                    ? ((preset as any).description_full || preset.description)
                    : preset.description)
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
