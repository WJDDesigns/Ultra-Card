/**
 * Free RSS Feed module — headlines from one or more RSS, Atom or JSON feeds.
 *
 * Feeds are fetched through Ultra Card Connect (so sites that block
 * cross-site requests still work) and fall back to the browser. Several feeds
 * are merged newest first, with keyword filters, an age limit, and list,
 * compact or card layouts. Tapping a headline opens the article.
 */

import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import type { CardModule, RssFeedLayout, RssFeedModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import '../components/ultra-color-picker';
import {
  clearFeedCache,
  getFeedState,
  mergeFeedItems,
  relativeTime,
  safeUrl,
  type FeedItem,
  type FeedLoadError,
  type FeedState,
} from '../services/uc-rss-feed-service';

type UpdateFn = (updates: Partial<CardModule>) => void;

const DEFAULT_MAX_ITEMS = 6;
const DEFAULT_REFRESH_MINUTES = 30;
const DEFAULT_SUMMARY_LINES = 2;

export class UltraRssFeedModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'rss_feed',
    title: 'RSS Feed',
    description: 'Latest headlines from RSS, Atom or JSON feeds, merged newest first',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:rss',
    category: 'content',
    tags: ['rss', 'atom', 'feed', 'news', 'headlines', 'blog', 'podcast', 'content'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): RssFeedModule {
    return {
      id: id || this.generateId('rss_feed'),
      type: 'rss_feed',
      title: '',
      show_title: true,
      feeds: [],
      max_items: DEFAULT_MAX_ITEMS,
      refresh_minutes: DEFAULT_REFRESH_MINUTES,
      layout: 'list',
      show_image: true,
      show_summary: true,
      summary_lines: DEFAULT_SUMMARY_LINES,
      show_date: true,
      show_source: true,
      open_in: 'new_tab',
      include_keywords: [],
      exclude_keywords: [],
      max_age_days: 0,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  /** Lenient: no feeds yet renders the empty state instead of an error. */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  // ── General tab ──────────────────────────────────────────────────────────

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    _config: UltraCardConfig,
    updateModule: UpdateFn
  ): TemplateResult {
    const m = module as RssFeedModule;
    const lang = hass?.locale?.language || 'en';
    const t = (key: string, fallback: string) => localize(`editor.rss_feed.${key}`, lang, fallback);
    const update = (patch: Partial<RssFeedModule>) => {
      updateModule(patch as Partial<CardModule>);
      this.triggerPreviewUpdate();
    };
    const layout = m.layout || 'list';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        <div class="settings-section">
          <div class="section-title">${t('feeds_section', 'Feeds')}</div>
          ${this.renderChipListField(
            t('feeds', 'Feed addresses'),
            t(
              'feeds_desc',
              'Paste an RSS, Atom or JSON Feed link and press Enter. Add several to merge them, newest first.'
            ),
            hass,
            m.feeds || [],
            (values: string[]) => {
              const clean = values.map(v => v.trim()).filter(Boolean);
              update({ feeds: clean });
            },
            { mode: 'free-text', placeholder: 'https://example.com/feed.xml' }
          )}
          ${this.renderSliderField(
            t('max_items', 'Number of items'),
            t('max_items_desc', 'How many headlines to show.'),
            m.max_items ?? DEFAULT_MAX_ITEMS,
            DEFAULT_MAX_ITEMS,
            1,
            30,
            1,
            (v: number) => update({ max_items: v }),
            ''
          )}
          ${this.renderSliderField(
            t('refresh_minutes', 'Refresh every'),
            t('refresh_minutes_desc', 'How often to check the feeds for new items.'),
            m.refresh_minutes ?? DEFAULT_REFRESH_MINUTES,
            DEFAULT_REFRESH_MINUTES,
            5,
            240,
            5,
            (v: number) => update({ refresh_minutes: v }),
            localize('editor.irrigation.unit_min', lang, ' min')
          )}
          <button
            type="button"
            class="uc-rss-ed-btn"
            @click=${() => {
              for (const url of m.feeds || []) clearFeedCache(url);
              this.triggerPreviewUpdate(true);
            }}
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
            ${t('refresh_now', 'Refresh now')}
          </button>
        </div>

        <div class="settings-section">
          <div class="section-title">${t('display_section', 'Display')}</div>
          ${this.renderFieldSection(
            t('title', 'Title'),
            t('title_desc', 'Leave empty to use the feed name.'),
            hass,
            { title: m.title || '' },
            [this.textField('title')],
            (e: CustomEvent) => update({ title: e.detail.value.title })
          )}
          ${this.renderFieldSection(
            t('show_title', 'Show title'),
            '',
            hass,
            { show_title: m.show_title !== false },
            [this.booleanField('show_title')],
            (e: CustomEvent) => update({ show_title: e.detail.value.show_title })
          )}
          ${this.renderSegmentedField(
            t('layout', 'Layout'),
            t('layout_desc', 'List with thumbnails, compact headlines only, or large image cards.'),
            layout,
            [
              { value: 'list', label: t('layout_list', 'List'), icon: 'mdi:view-list' },
              {
                value: 'compact',
                label: t('layout_compact', 'Compact'),
                icon: 'mdi:format-list-bulleted',
              },
              { value: 'cards', label: t('layout_cards', 'Cards'), icon: 'mdi:view-grid' },
            ],
            (v: string) => update({ layout: v as RssFeedLayout })
          )}
          ${this.renderFieldSection(
            t('show_image', 'Show images'),
            t('show_image_desc', 'The picture the feed gives for each item, when it has one.'),
            hass,
            { show_image: m.show_image !== false },
            [this.booleanField('show_image')],
            (e: CustomEvent) => update({ show_image: e.detail.value.show_image })
          )}
          ${this.renderFieldSection(
            t('show_summary', 'Show summary'),
            '',
            hass,
            { show_summary: m.show_summary !== false },
            [this.booleanField('show_summary')],
            (e: CustomEvent) => update({ show_summary: e.detail.value.show_summary })
          )}
          ${m.show_summary !== false && layout !== 'compact'
            ? this.renderSliderField(
                t('summary_lines', 'Summary lines'),
                t('summary_lines_desc', 'Longer summaries are cut off after this many lines.'),
                m.summary_lines ?? DEFAULT_SUMMARY_LINES,
                DEFAULT_SUMMARY_LINES,
                1,
                8,
                1,
                (v: number) => update({ summary_lines: v }),
                ''
              )
            : nothing}
          ${this.renderFieldSection(
            t('show_date', 'Show time'),
            t('show_date_desc', 'How long ago each item was published.'),
            hass,
            { show_date: m.show_date !== false },
            [this.booleanField('show_date')],
            (e: CustomEvent) => update({ show_date: e.detail.value.show_date })
          )}
          ${this.renderFieldSection(
            t('show_source', 'Show feed name'),
            t('show_source_desc', 'Useful when you merge several feeds.'),
            hass,
            { show_source: m.show_source !== false },
            [this.booleanField('show_source')],
            (e: CustomEvent) => update({ show_source: e.detail.value.show_source })
          )}
          ${this.renderSegmentedField(
            t('open_in', 'Tapping a headline'),
            '',
            m.open_in || 'new_tab',
            [
              { value: 'new_tab', label: t('open_new_tab', 'Opens a new tab') },
              { value: 'same_tab', label: t('open_same_tab', 'Opens here') },
              { value: 'none', label: t('open_none', 'Does nothing') },
            ],
            (v: string) => update({ open_in: v as RssFeedModule['open_in'] })
          )}
          ${this.renderColorField(
            t('accent_color', 'Accent color'),
            t('accent_color_desc', 'Used for the icon and the feed name.'),
            hass,
            m.accent_color || '',
            '',
            (v: string) => update({ accent_color: v })
          )}
        </div>

        <div class="settings-section">
          <div class="section-title">${t('filter_section', 'Filter')}</div>
          ${this.renderChipListField(
            t('include_keywords', 'Only show items with'),
            t('include_keywords_desc', 'Leave empty to show everything. Matches the title and summary.'),
            hass,
            m.include_keywords || [],
            (values: string[]) => update({ include_keywords: values }),
            { mode: 'free-text' }
          )}
          ${this.renderChipListField(
            t('exclude_keywords', 'Hide items with'),
            t('exclude_keywords_desc', 'Items that mention any of these words are hidden.'),
            hass,
            m.exclude_keywords || [],
            (values: string[]) => update({ exclude_keywords: values }),
            { mode: 'free-text', variant: 'exclude' }
          )}
          ${this.renderSliderField(
            t('max_age_days', 'Hide items older than'),
            t('max_age_days_desc', '0 shows items of any age.'),
            m.max_age_days ?? 0,
            0,
            0,
            60,
            1,
            (v: number) => update({ max_age_days: v }),
            t('unit_days', ' days')
          )}
        </div>
      </div>
      <style>
        .uc-rss-ed-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 36px;
          padding: 0 14px;
          border: 1px solid var(--divider-color);
          border-radius: 8px;
          background: transparent;
          color: var(--primary-text-color);
          font: inherit;
          cursor: pointer;
        }
        .uc-rss-ed-btn ha-icon {
          --mdc-icon-size: 18px;
        }
        ${BaseUltraModule.getSliderStyles()}
      </style>
    `;
  }

  // ── Preview ──────────────────────────────────────────────────────────────

  private _errorText(error: FeedLoadError | undefined, detail: string | undefined, lang: string): string {
    switch (error) {
      case 'cors':
        return localize(
          'editor.rss_feed.error_cors',
          lang,
          'This site does not let the browser read its feed. Update Ultra Card Connect so it can load the feed for you.'
        );
      case 'blocked':
        return localize(
          'editor.rss_feed.error_blocked',
          lang,
          'Ultra Card Connect would not load this address. Only public http and https feeds work.'
        );
      case 'http':
        return localize(
          'editor.rss_feed.error_http',
          lang,
          'The site answered with an error ({status}).'
        ).replace('{status}', detail || '?');
      case 'parse':
        return localize(
          'editor.rss_feed.error_parse',
          lang,
          'That address is not an RSS, Atom or JSON feed.'
        );
      default:
        return localize('editor.rss_feed.error_network', lang, 'The feed could not be loaded.');
    }
  }

  private _open(e: Event, m: RssFeedModule, item: FeedItem): void {
    const mode = m.open_in || 'new_tab';
    if (mode === 'none' || !item.link) return;
    e.stopPropagation();
    e.preventDefault();
    if (mode === 'same_tab') window.location.assign(item.link);
    else window.open(item.link, '_blank', 'noopener');
  }

  private _renderItem(
    m: RssFeedModule,
    item: FeedItem,
    layout: RssFeedLayout,
    lang: string,
    now: number
  ): TemplateResult {
    const showImage = m.show_image !== false && layout !== 'compact' && !!item.image;
    const showSummary = m.show_summary !== false && layout !== 'compact' && !!item.summary;
    const lines = Math.max(1, Math.min(8, m.summary_lines ?? DEFAULT_SUMMARY_LINES));
    const when = m.show_date !== false ? relativeTime(item.published, lang, now) : '';
    const source = m.show_source !== false ? item.source : '';
    const clickable = (m.open_in || 'new_tab') !== 'none' && !!item.link;
    return html`
      <a
        class="uc-rss-item ${clickable ? 'clickable' : ''}"
        href=${clickable ? item.link : nothing}
        target=${clickable && (m.open_in || 'new_tab') === 'new_tab' ? '_blank' : nothing}
        rel="noopener noreferrer"
        @click=${(e: Event) => (clickable ? this._open(e, m, item) : e.preventDefault())}
      >
        ${showImage
          ? html`<img
              class="uc-rss-img"
              src=${item.image}
              alt=""
              loading="lazy"
              referrerpolicy="no-referrer"
              @error=${(e: Event) => ((e.target as HTMLElement).style.display = 'none')}
            />`
          : nothing}
        <div class="uc-rss-body">
          <div class="uc-rss-headline">${item.title || item.link}</div>
          ${showSummary
            ? html`<div class="uc-rss-summary" style="-webkit-line-clamp:${lines};line-clamp:${lines}">
                ${item.summary}
              </div>`
            : nothing}
          ${source || when
            ? html`<div class="uc-rss-meta">
                ${source ? html`<span class="uc-rss-source">${source}</span>` : nothing}
                ${source && when ? html`<span aria-hidden="true">·</span>` : nothing}
                ${when ? html`<span>${when}</span>` : nothing}
              </div>`
            : nothing}
        </div>
      </a>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    _config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as RssFeedModule;
    const lang = hass?.locale?.language || 'en';
    const feeds = (m.feeds || []).map(u => u.trim()).filter(u => !!safeUrl(u));

    if (!feeds.length) {
      return html`
        <div class="uc-rss-empty">
          ${this.renderGradientErrorState(
            localize('editor.rss_feed.empty_title', lang, 'Add a feed'),
            localize(
              'editor.rss_feed.empty_desc',
              lang,
              'Paste an RSS or Atom feed link in the General tab.'
            ),
            'mdi:rss'
          )}
        </div>
      `;
    }

    const refreshMs = Math.max(5, m.refresh_minutes ?? DEFAULT_REFRESH_MINUTES) * 60_000;
    const states: FeedState[] = feeds.map(url => getFeedState(hass, url, refreshMs));
    const now = Date.now();
    const items = mergeFeedItems(
      states.map(s => ({ feed: s.feed })),
      {
        maxItems: m.max_items ?? DEFAULT_MAX_ITEMS,
        include: m.include_keywords,
        exclude: m.exclude_keywords,
        maxAgeDays: m.max_age_days,
      },
      now
    );
    const loading = states.some(s => s.loading);
    const firstError = states.find(s => s.error && !s.feed);
    const layout = m.layout || 'list';
    const accent = m.accent_color ? `--uc-rss-accent:${m.accent_color};` : '';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);
    const feedTitle = feeds.length === 1 ? states[0]?.feed?.title : '';
    const title =
      m.title?.trim() || feedTitle || localize('editor.rss_feed.default_title', lang, 'News');

    let body: TemplateResult;
    if (items.length) {
      body = html`<div class="uc-rss-items ${layout}">
        ${items.map(item => this._renderItem(m, item, layout, lang, now))}
      </div>`;
    } else if (loading) {
      body = html`<div class="uc-rss-status">
        <ha-icon icon="mdi:loading" class="spin"></ha-icon>
        ${localize('editor.rss_feed.loading', lang, 'Loading feed…')}
      </div>`;
    } else if (firstError) {
      body = html`<div class="uc-rss-status error">
        <ha-icon icon="mdi:rss-off"></ha-icon>
        <span>${this._errorText(firstError.error, firstError.errorDetail, lang)}</span>
      </div>`;
    } else {
      body = html`<div class="uc-rss-status">
        ${localize('editor.rss_feed.no_items', lang, 'No items match right now.')}
      </div>`;
    }

    return html`
      <div class="uc-rss ${hoverClass}" data-uc-role="pane" style="${accent}${designStyles}">
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false
              ? html`<div class="uc-rss-head">
                  <ha-icon icon="mdi:rss"></ha-icon>
                  <span>${title}</span>
                </div>`
              : nothing}
            ${body}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  getStyles(): string {
    return `
      .uc-rss {
        --uc-rss-accent-resolved: var(--uc-rss-accent, var(--primary-color));
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        border-radius: var(--uc-r-12, 12px);
        background: var(--uc-pane-bg, var(--card-background-color));
        color: var(--primary-text-color);
        min-width: 0;
      }
      .uc-rss-head { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 16px; min-width: 0; }
      .uc-rss-head ha-icon { color: var(--uc-rss-accent-resolved); --mdc-icon-size: 22px; flex-shrink: 0; }
      .uc-rss-head span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .uc-rss-items { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .uc-rss-items.cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
        gap: 10px;
      }
      .uc-rss-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 8px;
        margin: 0 -8px;
        border-radius: 10px;
        color: inherit;
        text-decoration: none;
        min-width: 0;
      }
      .uc-rss-item.clickable { cursor: pointer; }
      .uc-rss-item.clickable:hover { background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
      .uc-rss-item:focus-visible { outline: 2px solid var(--uc-rss-accent-resolved); outline-offset: 1px; }
      .uc-rss-img {
        width: 72px;
        height: 72px;
        object-fit: cover;
        border-radius: 8px;
        flex-shrink: 0;
        background: var(--secondary-background-color);
      }
      .uc-rss-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
      .uc-rss-headline { font-weight: 600; font-size: 14px; line-height: 1.35; overflow-wrap: anywhere; }
      .uc-rss-summary {
        font-size: 13px;
        line-height: 1.4;
        color: var(--secondary-text-color);
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .uc-rss-meta { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; color: var(--secondary-text-color); }
      .uc-rss-source { color: var(--uc-rss-accent-resolved); font-weight: 500; }
      .uc-rss-items.compact .uc-rss-item { padding: 6px 8px; }
      .uc-rss-items.compact .uc-rss-body { flex-direction: row; align-items: baseline; justify-content: space-between; gap: 10px; }
      .uc-rss-items.compact .uc-rss-headline { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
      .uc-rss-items.compact .uc-rss-meta { flex-shrink: 0; flex-wrap: nowrap; }
      .uc-rss-items.compact .uc-rss-source { display: none; }
      .uc-rss-items.cards .uc-rss-item {
        flex-direction: column;
        gap: 8px;
        margin: 0;
        padding: 0 0 10px;
        background: var(--secondary-background-color);
        overflow: hidden;
      }
      .uc-rss-items.cards .uc-rss-img { width: 100%; height: auto; aspect-ratio: 16 / 9; border-radius: 0; }
      .uc-rss-items.cards .uc-rss-body { padding: 0 10px; }
      .uc-rss-items.cards .uc-rss-item:not(:has(.uc-rss-img)) .uc-rss-body { padding-top: 10px; }
      .uc-rss-status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--secondary-text-color); padding: 6px 0; }
      .uc-rss-status.error ha-icon { color: var(--warning-color, #ffa600); flex-shrink: 0; }
      .uc-rss-status .spin { animation: uc-rss-spin 1s linear infinite; }
      @keyframes uc-rss-spin { to { transform: rotate(360deg); } }
    `;
  }
}
