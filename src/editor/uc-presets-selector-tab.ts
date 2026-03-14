/**
 * Presets tab body for the module selector.
 * Add-preset mutations stay in the parent (layout-tab); this component emits preset-selected and refresh.
 * Calls ucPresetsService.ensureWordPressLoaded() when connected so WordPress presets load only when this tab is used.
 */
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { HomeAssistant } from 'custom-card-helpers';
import type { PresetDefinition } from '../types';
import { ucPresetsService } from '../services/uc-presets-service';
import { ucCloudSyncService } from '../services/uc-cloud-sync-service';

@customElement('uc-presets-selector-tab')
export class UcPresetsSelectorTab extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public isCloudAuthenticated = false;
  @property({ attribute: false }) public builderUserReviews: Map<string, number> = new Map();

  @state() private _presetSearchQuery = '';
  @state() private _selectedPresetSource: 'all' | 'standard' | 'community' = 'all';
  @state() private _presetSortBy: 'name' | 'date' | 'rating' = 'date';
  @state() private _presetSortDirection: 'asc' | 'desc' = 'desc';
  @state() private _builderExpandedId: string | null = null;
  @state() private _builderReadMoreId: string | null = null;

  private _presetsUnsub?: () => void;
  private _statusUnsub?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    ucPresetsService.ensureWordPressLoaded();
    this._presetsUnsub = ucPresetsService.subscribe(() => this.requestUpdate());
    this._statusUnsub = ucPresetsService.subscribeToStatus(() => this.requestUpdate());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._presetsUnsub?.();
    this._statusUnsub?.();
  }

  public focusSearchInput(): void {
    requestAnimationFrame(() => {
      const input = this.shadowRoot?.getElementById('preset-search-input') as HTMLInputElement;
      if (input) input.focus();
    });
  }

  private _filterPresetsBySearch(presets: PresetDefinition[], query: string): PresetDefinition[] {
    if (!query?.trim()) return presets;
    const searchLower = query.toLowerCase().trim();
    return presets.filter(
      p =>
        (p.name?.toLowerCase() || '').includes(searchLower) ||
        (p.description?.toLowerCase() || '').includes(searchLower) ||
        (p.author?.toLowerCase() || '').includes(searchLower) ||
        (p.category?.toLowerCase() || '').includes(searchLower)
    );
  }

  private _sortPresets(
    presets: PresetDefinition[],
    sortBy: 'name' | 'date' | 'rating',
    direction: 'asc' | 'desc'
  ): PresetDefinition[] {
    return [...presets].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const na = (a.name?.toLowerCase() || '').localeCompare(b.name?.toLowerCase() || '');
          return direction === 'asc' ? na : -na;
        case 'date':
          const da = (a as any).metadata?.date ? new Date((a as any).metadata.date).getTime() : 0;
          const db = (b as any).metadata?.date ? new Date((b as any).metadata.date).getTime() : 0;
          return direction === 'asc' ? da - db : db - da;
        case 'rating':
          const ra = (a as any).metadata?.rating || 0;
          const ca = (a as any).metadata?.rating_count || 0;
          const rb = (b as any).metadata?.rating || 0;
          const cb = (b as any).metadata?.rating_count || 0;
          if (ra !== rb) return direction === 'asc' ? ra - rb : rb - ra;
          return direction === 'asc' ? ca - cb : cb - ca;
        default:
          return 0;
      }
    });
  }

  private _isNewPreset(preset: PresetDefinition): boolean {
    const dateStr = (preset as any).metadata?.created || (preset as any).metadata?.date;
    if (!dateStr) return false;
    return new Date(dateStr) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  private _emitPresetSelected(preset: PresetDefinition): void {
    this.dispatchEvent(
      new CustomEvent('preset-selected', { detail: { preset }, bubbles: true, composed: true })
    );
  }

  private _emitRefresh(): void {
    this.dispatchEvent(new CustomEvent('refresh', { bubbles: true, composed: true }));
  }

  private _emitOpenImage(url: string, title: string): void {
    this.dispatchEvent(
      new CustomEvent('open-image', {
        detail: { url, title },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _emitRequestRate(presetId: string, presetName: string): void {
    this.dispatchEvent(
      new CustomEvent('request-rate', {
        detail: { presetId, presetName },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _renderPresetImages(preset: PresetDefinition, wpPreset: any): TemplateResult {
    const images: string[] = [];
    const featured =
      (preset as any).featured_image ||
      (preset as any).thumbnail ||
      (preset as any).metadata?.featured_image ||
      wpPreset?.featured_image;
    if (featured && typeof featured === 'string') images.push(featured);
    const gallery =
      (preset as any).gallery || wpPreset?.gallery || (preset as any).metadata?.gallery;
    if (Array.isArray(gallery)) {
      gallery.forEach((img: string) => {
        if (img && typeof img === 'string' && !images.includes(img)) images.push(img);
      });
    }
    if (images.length === 0) {
      return html`
        <div class="preset-icon-large">
          <ha-icon icon="${(preset as any).icon || 'mdi:palette'}"></ha-icon>
        </div>
      `;
    }
    if (images.length === 1) {
      return html`
        <div
          class="preset-thumbnail"
          @click=${(e: Event) => {
            e.stopPropagation();
            this._emitOpenImage(images[0], preset.name);
          }}
          style="cursor: pointer;"
        >
          <img src="${images[0]}" alt="${preset.name}" />
        </div>
      `;
    }
    const sliderId = `slider-${preset.id}`;
    return html`
      <div class="preset-image-slider" id="${sliderId}">
        <div class="preset-slider-container" style="transform: translateX(0%)">
          ${images.map(
            (img, i) => html`
              <div
                class="preset-slider-image"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._emitOpenImage(img, preset.name);
                }}
                style="cursor: pointer;"
              >
                <img src="${img}" alt="${preset.name} ${i + 1}" />
              </div>
            `
          )}
        </div>
        <button
          class="preset-slider-nav prev"
          @click=${(e: Event) => {
            e.stopPropagation();
            this._navigateSlider(sliderId, -1, images.length);
          }}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>
        </button>
        <button
          class="preset-slider-nav next"
          @click=${(e: Event) => {
            e.stopPropagation();
            this._navigateSlider(sliderId, 1, images.length);
          }}
        >
          <ha-icon icon="mdi:chevron-right"></ha-icon>
        </button>
        <div class="preset-slider-dots">
          ${images.map(
            (_, i) => html`
              <div
                class="preset-slider-dot ${i === 0 ? 'active' : ''}"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  this._goToSlide(sliderId, i, images.length);
                }}
              ></div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _navigateSlider(sliderId: string, direction: number, total: number): void {
    const slider = this.shadowRoot?.querySelector(`#${sliderId}`);
    if (!slider) return;
    const container = slider.querySelector('.preset-slider-container') as HTMLElement;
    const dots = slider.querySelectorAll('.preset-slider-dot');
    if (!container || !dots.length) return;
    const t = container.style.transform || 'translateX(0%)';
    const idx = Math.abs(parseInt(t.match(/-?\d+/)?.[0] || '0', 10) / 100);
    let next = idx + direction;
    if (next < 0) next = total - 1;
    if (next >= total) next = 0;
    container.style.transform = `translateX(-${next * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === next));
  }

  private _goToSlide(sliderId: string, target: number, _total: number): void {
    const slider = this.shadowRoot?.querySelector(`#${sliderId}`);
    if (!slider) return;
    const container = slider.querySelector('.preset-slider-container') as HTMLElement;
    const dots = slider.querySelectorAll('.preset-slider-dot');
    if (!container || !dots.length) return;
    container.style.transform = `translateX(-${target * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === target));
  }

  static styles = css`
    .presets-container {
      padding: 16px;
    }
    .search-bar-container {
      margin-bottom: 16px;
    }
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }
    .search-bar input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .clear-search-btn {
      padding: 4px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
    }
    .preset-categories {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .category-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      color: var(--secondary-text-color);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 12px;
    }
    .category-btn.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }
    .presets-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
      align-items: center;
    }
    .presets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }
    .preset-card {
      display: flex;
      flex-direction: column;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .preset-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    .preset-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(var(--rgb-primary-color), 0.02);
      border-bottom: 1px solid var(--divider-color);
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
    }
    .origin-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .origin-badge.community {
      background: rgba(var(--rgb-secondary-color, 255, 152, 0), 0.9);
      color: white;
    }
    .origin-badge.default {
      background: rgba(var(--rgb-primary-color), 0.9);
      color: white;
    }
    .origin-badge.builtin {
      background: rgba(var(--rgb-secondary-text-color), 0.8);
      color: white;
    }
    .new-badge {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(76, 175, 80, 0.9);
      color: white;
    }
    .preset-preview {
      position: relative;
      width: 100%;
      height: 200px;
      background: var(--secondary-background-color);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 8px;
      box-sizing: border-box;
    }
    .preset-thumbnail,
    .preset-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 8px;
    }
    .preset-image-slider {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
    }
    .preset-slider-container {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
    }
    .preset-slider-image {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preset-slider-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .preset-slider-dots {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 2;
    }
    .preset-slider-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .preset-slider-dot.active {
      background: rgba(255, 255, 255, 0.9);
      transform: scale(1.2);
    }
    .preset-slider-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
    }
    .preset-slider-nav.prev {
      left: 8px;
    }
    .preset-slider-nav.next {
      right: 8px;
    }
    .preset-icon-large {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 50%;
      color: var(--primary-color);
    }
    .preset-icon-large ha-icon {
      font-size: 40px;
    }
    .preset-content {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .preset-description {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      color: var(--secondary-text-color);
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .preset-actions {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--divider-color);
      background: var(--card-background-color);
    }
    .preset-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
      justify-content: center;
      min-height: 40px;
      border: none;
    }
    .add-preset-btn.primary {
      background: var(--primary-color);
      color: white;
    }
    .read-more-btn.secondary {
      background: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }
    .preset-card.community-preset {
      border-left: 3px solid rgba(var(--rgb-secondary-color, 255, 152, 0), 1);
    }
    .preset-card.default-preset {
      border-left: 3px solid var(--primary-color);
    }
    .preset-card.builtin-preset {
      border-left: 3px solid var(--divider-color);
    }
    .preset-stats {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .preset-stats .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--secondary-text-color);
      padding: 3px 8px;
      border-radius: 6px;
    }
    .preset-rating-stars {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px 8px;
      border-radius: 6px;
      background: rgba(255, 193, 7, 0.1);
      cursor: pointer;
    }
    .preset-details {
      padding: 12px 16px;
      border-top: 1px solid var(--divider-color);
      background: rgba(var(--rgb-primary-color), 0.02);
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
    }
    .preset-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .tag {
      padding: 2px 6px;
      background: var(--secondary-background-color);
      border-radius: 10px;
      font-size: 10px;
      color: var(--secondary-text-color);
    }
    .integration-chip {
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 12px;
      background: rgba(var(--rgb-primary-color), 0.1);
      color: var(--primary-color);
    }
    .read-more-link {
      background: none;
      border: none;
      padding: 2px 0;
      font-size: 12px;
      color: var(--primary-color);
      cursor: pointer;
      font-weight: 500;
    }
    .preset-footer {
      display: flex;
      justify-content: center;
      padding: 16px 0;
      border-top: 1px solid var(--divider-color);
      margin-top: 16px;
    }
    .reload-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }
    .reload-btn:hover:not(:disabled) {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .reload-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .reload-btn ha-icon.spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .wordpress-status {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
    }
    .status-item.error {
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
      color: var(--error-color, #f44336);
    }
    .retry-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      margin-left: 8px;
    }
    .search-results-header {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }
    .search-results-empty {
      padding: 24px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .clear-search-btn-large {
      margin-top: 12px;
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--secondary-text-color);
    }
    .empty-state ha-icon {
      --mdc-icon-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }
    .empty-state p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
    .empty-hint {
      font-size: 12px;
      opacity: 0.8;
    }
    .error-details {
      margin-top: 16px;
      padding: 16px;
      background: rgba(var(--rgb-error-color, 244, 67, 54), 0.1);
      border-radius: 8px;
      text-align: left;
    }
    .error-hint {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
    }
  `;

  protected render(): TemplateResult {
    const sources = ['all', 'standard', 'community'] as const;
    let allPresets = ucPresetsService.getPresetsByCategory('all');
    const wpStatus = ucPresetsService.getWordPressStatus();

    if (this._selectedPresetSource === 'standard') {
      allPresets = allPresets.filter(p => {
        const isWp = p.id.startsWith('wp-');
        return !isWp || p.author === 'WJD Designs';
      });
    } else if (this._selectedPresetSource === 'community') {
      allPresets = allPresets.filter(p => {
        const isWp = p.id.startsWith('wp-');
        return isWp && p.author !== 'WJD Designs';
      });
    }

    const hasSearchQuery = this._presetSearchQuery.trim() !== '';
    let presets = hasSearchQuery
      ? this._filterPresetsBySearch(allPresets, this._presetSearchQuery)
      : allPresets;
    presets = this._sortPresets(presets, this._presetSortBy, this._presetSortDirection);

    return html`
      <div class="presets-container">
        <div class="search-bar-container">
          <div class="search-bar">
            <ha-icon icon="mdi:magnify"></ha-icon>
            <input
              id="preset-search-input"
              type="text"
              placeholder="Search presets..."
              .value=${this._presetSearchQuery}
              @input=${(e: Event) => {
                const t = e.target as HTMLInputElement;
                this._presetSearchQuery = t.value;
              }}
            />
            ${this._presetSearchQuery
              ? html`
                  <button
                    class="clear-search-btn"
                    @click=${() => {
                      this._presetSearchQuery = '';
                      this.focusSearchInput();
                    }}
                    title="Clear search"
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                `
              : ''}
          </div>
        </div>

        ${!hasSearchQuery
          ? html`
              <div class="presets-header">
                <div class="preset-categories">
                  ${sources.map(
                    src => html`
                      <button
                        class="category-btn ${this._selectedPresetSource === src ? 'active' : ''}"
                        @click=${() => (this._selectedPresetSource = src)}
                      >
                        <ha-icon
                          icon="${src === 'all'
                            ? 'mdi:view-grid'
                            : src === 'standard'
                              ? 'mdi:shield-check'
                              : 'mdi:account-group'}"
                        ></ha-icon>
                        <span>${src.charAt(0).toUpperCase() + src.slice(1)}</span>
                      </button>
                    `
                  )}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px;">
                  <span style="font-size: 12px; color: var(--secondary-text-color);">Sort by:</span>
                  <select
                    .value=${this._presetSortBy}
                    @change=${(e: Event) => {
                      this._presetSortBy = (e.target as HTMLSelectElement).value as
                        | 'name'
                        | 'date'
                        | 'rating';
                    }}
                    style="padding: 6px 8px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font-size: 12px;"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <button
                    @click=${() =>
                      (this._presetSortDirection =
                        this._presetSortDirection === 'asc' ? 'desc' : 'asc')}
                    style="padding: 6px 8px; border-radius: 4px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font-size: 12px; cursor: pointer;"
                  >
                    ${this._presetSortDirection === 'asc' ? 'A→Z' : 'Z→A'}
                  </button>
                </div>
                ${wpStatus.error
                  ? html`
                      <div class="wordpress-status">
                        <div class="status-item error">
                          <ha-icon icon="mdi:alert-circle"></ha-icon>
                          <span>Failed to load presets</span>
                          <button
                            class="retry-btn"
                            @click=${() => this._emitRefresh()}
                            title="Retry"
                          >
                            <ha-icon icon="mdi:refresh"></ha-icon>
                          </button>
                        </div>
                      </div>
                    `
                  : ''}
              </div>
            `
          : html`
              <div class="search-results-header">
                <span>${presets.length} preset${presets.length !== 1 ? 's' : ''} found</span>
              </div>
            `}

        <div class="presets-grid">
          ${presets.length > 0
            ? presets.map(preset => {
                const isWpPreset = preset.id.startsWith('wp-');
                const isWjdDesigns = preset.author === 'WJD Designs';
                const isCommunity = isWpPreset && !isWjdDesigns;
                const isDefault = isWpPreset && isWjdDesigns;
                const wpPreset = preset as any;
                const userRating =
                  this.builderUserReviews.get(preset.id) ??
                  ucCloudSyncService.getUserReview(preset.id)?.rating ??
                  0;
                const rating = userRating > 0 ? userRating : (preset.metadata?.rating as number) || 0;

                return html`
                  <div
                    class="preset-card ${isWpPreset
                      ? isCommunity
                        ? 'community-preset'
                        : 'default-preset'
                      : 'builtin-preset'}"
                    @click=${() => {
                      this._emitPresetSelected(preset);
                      if (isWpPreset) ucPresetsService.trackPresetDownload(preset.id);
                    }}
                  >
                    <div class="preset-header">
                      <div class="preset-header-left">
                        <div
                          class="origin-badge ${isCommunity
                            ? 'community'
                            : isDefault
                              ? 'default'
                              : 'builtin'}"
                        >
                          ${isCommunity ? 'Community' : isDefault ? 'Default' : 'Built-in'}
                        </div>
                        ${this._isNewPreset(preset) ? html`<span class="new-badge">New</span>` : ''}
                        <div class="preset-title-info">
                          <h4 class="preset-header-title">${preset.name}</h4>
                          ${!isWjdDesigns
                            ? html`<span class="preset-header-author">by ${preset.author}</span>`
                            : ''}
                        </div>
                      </div>
                      <div class="preset-stats">
                        ${preset.metadata?.downloads
                          ? html`
                              <span class="stat">
                                <ha-icon icon="mdi:download"></ha-icon>${(preset.metadata as any)
                                  .downloads}
                              </span>
                            `
                          : ''}
                        ${isWpPreset
                          ? html`
                              <div
                                class="preset-rating-stars"
                                @click=${(e: Event) => {
                                  e.stopPropagation();
                                  this._emitRequestRate(preset.id, preset.name);
                                }}
                                title=${this.isCloudAuthenticated
                                  ? `Rate: ${(preset.metadata?.rating || 0).toFixed(1)}/5`
                                  : 'Sign in to rate'}
                              >
                                ${[1, 2, 3, 4, 5].map(starNum => {
                                  const filled = starNum <= Math.floor(rating);
                                  const half =
                                    !filled &&
                                    starNum - 0.5 <= rating &&
                                    rating > 0;
                                  return html`
                                    <ha-icon
                                      icon="mdi:star${filled ? '' : half ? '-half-full' : '-outline'}"
                                      style="color: ${filled || half ? '#ffc107' : '#666'}; --mdc-icon-size: 14px;"
                                    ></ha-icon>
                                  `;
                                })}
                                <span style="font-size: 11px; color: var(--secondary-text-color); margin-left: 2px;">(${wpPreset.rating_count || 0})</span>
                              </div>
                            `
                          : ''}
                      </div>
                    </div>
                    <div class="preset-preview">${this._renderPresetImages(preset, wpPreset)}</div>
                    <div class="preset-content">
                      <div class="preset-description">${unsafeHTML(preset.description)}</div>
                      ${wpPreset.description_full && wpPreset.description_full !== preset.description
                        ? html`
                            <button
                              class="read-more-link"
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                this._builderReadMoreId =
                                  this._builderReadMoreId === preset.id ? null : preset.id;
                              }}
                            >
                              ${this._builderReadMoreId === preset.id ? 'Read Less ↑' : 'Read More ↓'}
                            </button>
                          `
                        : ''}
                      ${preset.tags?.filter(
                          t => !['community', 'wordpress', 'standard'].includes(t)
                        ).length || (Array.isArray(wpPreset.integrations) && wpPreset.integrations.length)
                        ? html`
                            <div class="preset-tags">
                              ${(preset.tags || [])
                                .filter(
                                  (t: string) =>
                                    !['community', 'wordpress', 'standard'].includes(t)
                                )
                                .slice(0, 3)
                                .map((tag: string) => html`<span class="tag">${tag}</span>`)}
                              ${Array.isArray(wpPreset.integrations)
                                ? wpPreset.integrations
                                    .slice(0, 2)
                                    .map(
                                      (i: string) =>
                                        html`<span class="integration-chip">${i}</span>`
                                    )
                                : ''}
                            </div>
                          `
                        : ''}
                    </div>
                    <div class="preset-actions">
                      <button
                        class="add-preset-btn primary"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._emitPresetSelected(preset);
                          if (isWpPreset) ucPresetsService.trackPresetDownload(preset.id);
                        }}
                        title="Add this preset to your card"
                      >
                        <ha-icon icon="mdi:plus"></ha-icon>
                        <span>Add</span>
                      </button>
                      ${isWpPreset
                        ? html`
                            <button
                              class="read-more-btn secondary"
                              @click=${(e: Event) => {
                                e.stopPropagation();
                                this._builderExpandedId =
                                  this._builderExpandedId === preset.id ? null : preset.id;
                              }}
                              title="View preset details"
                            >
                              <ha-icon
                                icon=${this._builderExpandedId === preset.id
                                  ? 'mdi:chevron-up'
                                  : 'mdi:information-outline'}
                              ></ha-icon>
                              <span
                                >${this._builderExpandedId === preset.id ? 'Less' : 'Details'}</span
                              >
                            </button>
                          `
                        : ''}
                    </div>
                    ${this._builderExpandedId === preset.id
                      ? html`
                          <div class="preset-details">
                            <dl class="detail-info">
                              <dt>Category</dt>
                              <dd>${preset.category}</dd>
                              <dt>Version</dt>
                              <dd>${preset.version || '—'}</dd>
                              <dt>Rows</dt>
                              <dd>${preset.layout?.rows?.length ?? 0}</dd>
                              ${preset.customVariables?.length
                                ? html`<dt>Variables</dt><dd>${preset.customVariables.length}</dd>`
                                : ''}
                              ${preset.cardSettings && Object.keys(preset.cardSettings).length
                                ? html`<dt>Card settings</dt><dd>Included</dd>`
                                : ''}
                              ${(preset as any).integrations?.length
                                ? html`<dt>Requires</dt><dd>${(preset as any).integrations.join(', ')}</dd>`
                                : ''}
                            </dl>
                          </div>
                        `
                      : ''}
                    ${this._builderReadMoreId === preset.id && wpPreset.description_full
                      ? html`
                          <div class="preset-details">
                            ${unsafeHTML(wpPreset.description_full)}
                          </div>
                        `
                      : ''}
                  </div>
                `;
              })
            : hasSearchQuery
              ? html`
                  <div class="search-results-empty">
                    <ha-icon icon="mdi:magnify-close"></ha-icon>
                    <p>No presets found matching "${this._presetSearchQuery}"</p>
                    <button
                      class="clear-search-btn-large"
                      @click=${() => {
                        this._presetSearchQuery = '';
                        this.focusSearchInput();
                      }}
                    >
                      Clear Search
                    </button>
                  </div>
                `
              : html`
                  <div class="empty-state">
                    <ha-icon icon="mdi:palette-outline"></ha-icon>
                    <p>No presets available in this category</p>
                    ${wpStatus.error
                      ? html`<div class="error-details"><p class="error-hint">${wpStatus.error}</p></div>`
                      : ''}
                  </div>
                `}
        </div>
        <div class="preset-footer">
          <button
            class="reload-btn ${wpStatus.loading ? 'loading' : ''}"
            @click=${() => this._emitRefresh()}
            title="Refresh presets from server"
            ?disabled=${wpStatus.loading}
          >
            <ha-icon icon="mdi:refresh" class="${wpStatus.loading ? 'spinning' : ''}"></ha-icon>
            <span>Reload</span>
          </button>
        </div>
      </div>
    `;
  }
}
