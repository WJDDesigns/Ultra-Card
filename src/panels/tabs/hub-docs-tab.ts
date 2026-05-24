/**
 * Ultra Card Hub – Documentation tab (bundled wiki from Ultra Card Connect).
 */
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { panelStyles } from '../panel-styles';
import { sanitizeMarkdownHtml } from '../../utils/html-sanitizer';

const DOCS_BASE = '/ultra_card_pro_cloud_panel/docs';
const WIKI_URL = 'https://github.com/WJDDesigns/Ultra-Card/wiki';
const LAST_SLUG_KEY = 'ultra_card_hub_docs_slug';

interface DocsIndexPage {
  slug: string;
  title: string;
  file: string;
}

interface DocsSection {
  title: string;
  slugs: string[];
  subsections?: { title: string; slugs: string[] }[];
}

interface DocsIndex {
  synced_at: string;
  wiki_last_commit_at?: string;
  source: string;
  pages: DocsIndexPage[];
  sections?: DocsSection[];
}

interface SearchIndexEntry {
  slug: string;
  title: string;
  excerpt: string;
  headings: string[];
}

marked.setOptions({ gfm: true, breaks: true });

@customElement('hub-docs-tab')
export class HubDocsTab extends LitElement {
  @property({ type: String }) public initialSlug = '';

  @state() private _index: DocsIndex | null = null;
  @state() private _searchIndex: SearchIndexEntry[] = [];
  @state() private _selectedSlug = 'home';
  @state() private _pageHtml = '';
  @state() private _pageToc: { id: string; text: string; level: number }[] = [];
  @state() private _loading = true;
  @state() private _error: string | null = null;
  @state() private _search = '';
  @state() private _openSections = new Set<string>();

  static override styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      .docs-layout {
        display: grid;
        grid-template-columns: minmax(220px, 300px) 1fr;
        gap: 20px;
        min-height: 420px;
      }

      @media (max-width: 900px) {
        .docs-layout {
          grid-template-columns: 1fr;
        }
      }

      .docs-sidebar {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 16px;
        max-height: 70vh;
        overflow: auto;
      }

      .docs-sidebar h2 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 700;
      }

      .docs-search {
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 12px;
        padding: 8px 12px;
        border-radius: 8px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--primary-background-color);
        color: var(--primary-text-color);
        font-size: 13px;
      }

      .docs-section {
        margin-bottom: 8px;
      }

      .docs-section summary {
        cursor: pointer;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--secondary-text-color);
        padding: 6px 4px;
        list-style: none;
      }

      .docs-section summary::-webkit-details-marker {
        display: none;
      }

      .docs-section[open] summary {
        color: var(--primary-color);
      }

      .docs-subsection-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--secondary-text-color);
        padding: 8px 10px 4px;
        margin: 0;
      }

      .docs-nav button {
        display: block;
        width: 100%;
        text-align: left;
        padding: 7px 10px;
        margin-bottom: 2px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--primary-text-color);
        font-size: 13px;
        cursor: pointer;
      }

      .docs-nav button:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }

      .docs-nav button.active {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
        color: var(--primary-color);
        font-weight: 600;
      }

      .search-hit {
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        margin-bottom: 4px;
      }

      .search-hit:hover {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }

      .search-hit-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .search-hit-excerpt {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 2px;
        line-height: 1.4;
      }

      .docs-meta {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        font-size: 11px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .docs-meta a {
        color: var(--primary-color);
      }

      .docs-main {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }

      .docs-toc {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 0 4px;
      }

      .docs-toc button {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 16px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--secondary-text-color);
        cursor: pointer;
      }

      .docs-toc button:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      .docs-content {
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
        border-radius: 14px;
        padding: 24px 28px;
        max-height: 70vh;
        overflow: auto;
      }

      .docs-content :is(h1, h2, h3, h4) {
        color: var(--primary-text-color);
        margin-top: 1.2em;
        margin-bottom: 0.5em;
        scroll-margin-top: 12px;
      }

      .docs-content h1:first-child {
        margin-top: 0;
      }

      .docs-content p,
      .docs-content li {
        color: var(--primary-text-color);
        line-height: 1.65;
        font-size: 14px;
      }

      .docs-content a {
        color: var(--primary-color);
        cursor: pointer;
      }

      .docs-content pre {
        background: var(--code-editor-background-color, rgba(0, 0, 0, 0.06));
        padding: 12px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 13px;
      }

      .docs-toolbar {
        display: flex;
        justify-content: flex-end;
      }

      .docs-toolbar button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 20px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--secondary-text-color);
        cursor: pointer;
        font-size: 12px;
      }

      .docs-empty,
      .docs-error {
        padding: 32px;
        text-align: center;
        color: var(--secondary-text-color);
      }

      .docs-error {
        color: var(--error-color, #f44336);
      }

      .docs-stale-banner {
        margin-bottom: 12px;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 13px;
        line-height: 1.45;
        background: rgba(255, 152, 0, 0.1);
        border: 1px solid rgba(255, 152, 0, 0.25);
        color: var(--primary-text-color);
      }

      .docs-search-hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin: 4px 0 8px;
      }
    `,
  ];

  private _keydownHandler = (e: KeyboardEvent): void => {
    if (e.key !== '/') return;
    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
      return;
    }
    e.preventDefault();
    const input = this.renderRoot?.querySelector('.docs-search') as HTMLInputElement | null;
    input?.focus();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('keydown', this._keydownHandler);
    const stored = localStorage.getItem(LAST_SLUG_KEY);
    if (this.initialSlug) {
      this._selectedSlug = this.initialSlug;
    } else if (stored) {
      this._selectedSlug = stored;
    }
    void this.reload();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('initialSlug') && this.initialSlug) {
      void this.openSlug(this.initialSlug);
    }
  }

  override disconnectedCallback(): void {
    document.removeEventListener('keydown', this._keydownHandler);
    super.disconnectedCallback();
  }

  reload(): void {
    void this._loadIndex(true);
  }

  private _docsBundleStale(): boolean {
    const synced = this._index?.synced_at;
    const wiki = this._index?.wiki_last_commit_at;
    if (!synced || !wiki) return false;
    const syncTime = new Date(synced).getTime();
    const wikiTime = new Date(wiki).getTime();
    return !Number.isNaN(syncTime) && !Number.isNaN(wikiTime) && wikiTime > syncTime + 60_000;
  }

  async openSlug(slug: string): Promise<void> {
    if (!this._index) {
      this._selectedSlug = slug;
      return;
    }
    await this._loadPage(slug);
  }

  private _cacheBust(): string {
    return `t=${Date.now()}`;
  }

  private async _loadIndex(force = false): Promise<void> {
    this._loading = true;
    this._error = null;
    try {
      const bust = force ? this._cacheBust() : 'v=1';
      const [indexRes, searchRes] = await Promise.all([
        fetch(`${DOCS_BASE}/index.json?${bust}`),
        fetch(`${DOCS_BASE}/search-index.json?${bust}`),
      ]);
      if (!indexRes.ok) {
        throw new Error(`Documentation index not found (${indexRes.status})`);
      }
      const data = (await indexRes.json()) as DocsIndex;
      this._index = data;
      if (searchRes.ok) {
        this._searchIndex = (await searchRes.json()) as SearchIndexEntry[];
      }
      this._initOpenSections(data.sections);
      const slug =
        this.initialSlug ||
        (data.pages.some(p => p.slug === this._selectedSlug)
          ? this._selectedSlug
          : data.pages.find(p => p.slug === 'home')?.slug ?? data.pages[0]?.slug ?? 'home');
      await this._loadPage(slug);
    } catch (err) {
      this._error = err instanceof Error ? err.message : String(err);
      this._loading = false;
    }
  }

  private _initOpenSections(sections?: DocsSection[]): void {
    const open = new Set<string>();
    sections?.forEach((s, i) => {
      if (i < 3) open.add(s.title);
    });
    this._openSections = open;
  }

  private _pageBySlug(slug: string): DocsIndexPage | undefined {
    return this._index?.pages.find(p => p.slug === slug);
  }

  private _titleForSlug(slug: string): string {
    return this._pageBySlug(slug)?.title ?? slug;
  }

  private async _loadPage(slug: string): Promise<void> {
    const page = this._pageBySlug(slug);
    if (!page) {
      this._pageHtml = '';
      this._pageToc = [];
      this._loading = false;
      return;
    }
    this._loading = true;
    this._selectedSlug = slug;
    localStorage.setItem(LAST_SLUG_KEY, slug);
    try {
      const res = await fetch(`${DOCS_BASE}/${page.file}?${this._cacheBust()}`);
      if (!res.ok) {
        throw new Error(`Failed to load ${page.title}`);
      }
      const markdown = await res.text();
      const rawHtml = marked.parse(markdown) as string;
      const doc = new DOMParser().parseFromString(rawHtml, 'text/html');
      this._pageToc = this._buildTocFromDoc(doc);
      const html = doc.body.innerHTML;
      this._pageHtml = sanitizeMarkdownHtml(html, true);
      this._error = null;
    } catch (err) {
      this._error = err instanceof Error ? err.message : String(err);
      this._pageHtml = '';
      this._pageToc = [];
    } finally {
      this._loading = false;
    }
  }

  private _buildTocFromDoc(doc: Document): { id: string; text: string; level: number }[] {
    const items: { id: string; text: string; level: number }[] = [];
    doc.querySelectorAll('h2, h3').forEach((el, i) => {
      const text = el.textContent?.trim() || '';
      if (!text) return;
      const id = `uc-toc-${i}`;
      el.id = id;
      items.push({ id, text, level: el.tagName === 'H2' ? 2 : 3 });
    });
    return items;
  }

  private _onContentClick(e: Event): void {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    const match = href.match(/^#uc-doc-(.+)$/);
    if (match) {
      e.preventDefault();
      void this._loadPage(match[1]);
    }
  }

  private _scrollToToc(id: string): void {
    const root = this.renderRoot?.querySelector('.docs-content');
    const el = root?.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private _searchResults(): SearchIndexEntry[] {
    const q = this._search.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return this._searchIndex
      .filter(entry => {
        const hay = `${entry.title} ${entry.excerpt} ${entry.headings.join(' ')}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 12);
  }

  private _toggleSection(title: string, open: boolean): void {
    const next = new Set(this._openSections);
    if (open) next.add(title);
    else next.delete(title);
    this._openSections = next;
  }

  private _renderNavSections(): unknown {
    const sections = this._index?.sections;
    if (!sections?.length) {
      return (this._index?.pages ?? []).map(page => this._renderNavButton(page.slug));
    }

    return sections.map(
      section => html`
        <details
          class="docs-section"
          ?open=${this._openSections.has(section.title)}
          @toggle=${(e: Event) => {
            const el = e.target as HTMLDetailsElement;
            this._toggleSection(section.title, el.open);
          }}
        >
          <summary>${section.title}</summary>
          <div class="docs-nav">
            ${section.slugs.map(slug => this._renderNavButton(slug))}
            ${section.subsections?.map(
              sub => html`
                <p class="docs-subsection-label">${sub.title}</p>
                ${sub.slugs.map(slug => this._renderNavButton(slug))}
              `
            )}
          </div>
        </details>
      `
    );
  }

  private _renderNavButton(slug: string): unknown {
    return html`
      <button
        class=${this._selectedSlug === slug ? 'active' : ''}
        @click=${() => void this._loadPage(slug)}
      >
        ${this._titleForSlug(slug)}
      </button>
    `;
  }

  private _formatSyncedAt(iso: string | undefined): string {
    if (!iso) return 'unknown';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso ?? 'unknown';
    }
  }

  override render() {
    if (this._error && !this._index) {
      return html`
        <div class="docs-error">
          <p>${this._error}</p>
          <p><a href=${WIKI_URL} target="_blank" rel="noopener">View docs on GitHub Wiki</a></p>
        </div>
      `;
    }

    const searchHits = this._searchResults();
    const showSearchResults = this._search.trim().length >= 2;

    return html`
      <div class="docs-toolbar">
        <button ?disabled=${this._loading} @click=${() => this.reload()}>
          <ha-icon icon="mdi:refresh"></ha-icon>
          Refresh
        </button>
      </div>

      ${this._docsBundleStale()
        ? html`
            <div class="docs-stale-banner" role="status">
              The GitHub wiki has newer edits than this bundled copy (wiki
              ${this._formatSyncedAt(this._index?.wiki_last_commit_at)}, bundle
              ${this._formatSyncedAt(this._index?.synced_at)}). Content is still usable; a
              future Connect release will refresh the bundle.
            </div>
          `
        : nothing}

      <div class="docs-layout">
        <aside class="docs-sidebar">
          <h2>Documentation</h2>
          <div class="docs-search-hint">Press <kbd>/</kbd> to focus search</div>
          <input
            class="docs-search"
            type="search"
            placeholder="Search docs…"
            .value=${this._search}
            @input=${(e: Event) => {
              this._search = (e.target as HTMLInputElement).value;
            }}
          />
          ${showSearchResults
            ? html`
                ${searchHits.map(
                  hit => html`
                    <div
                      class="search-hit"
                      @click=${() => {
                        this._search = '';
                        void this._loadPage(hit.slug);
                      }}
                    >
                      <div class="search-hit-title">${hit.title}</div>
                      <div class="search-hit-excerpt">${hit.excerpt}</div>
                    </div>
                  `
                )}
                ${searchHits.length === 0
                  ? html`<div class="docs-empty">No matches</div>`
                  : nothing}
              `
            : html`<nav aria-label="Documentation pages">${this._renderNavSections()}</nav>`}
          <div class="docs-meta">
            Synced from
            <a href=${WIKI_URL} target="_blank" rel="noopener">Ultra Card Wiki</a><br />
            Last sync: ${this._formatSyncedAt(this._index?.synced_at)}
            ${this._index?.wiki_last_commit_at
              ? html` · Wiki commit: ${this._formatSyncedAt(this._index.wiki_last_commit_at)}`
              : nothing}<br />
            <a href=${WIKI_URL} target="_blank" rel="noopener">Edit on GitHub</a>
          </div>
        </aside>

        <div class="docs-main">
          ${this._pageToc.length > 0
            ? html`
                <div class="docs-toc">
                  ${this._pageToc.map(
                    item => html`
                      <button @click=${() => this._scrollToToc(item.id)}>
                        ${item.text}
                      </button>
                    `
                  )}
                </div>
              `
            : nothing}
          <article class="docs-content" aria-live="polite" @click=${this._onContentClick}>
            ${this._loading
              ? html`<div class="docs-empty">Loading…</div>`
              : this._error
                ? html`<div class="docs-error">${this._error}</div>`
                : html`<div class="docs-markdown">${unsafeHTML(this._pageHtml)}</div>`}
          </article>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hub-docs-tab': HubDocsTab;
  }
}
