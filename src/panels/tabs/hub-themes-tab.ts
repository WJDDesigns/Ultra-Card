import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { panelStyles } from '../panel-styles';
import { localize } from '../../localize/localize';
import { ucThemeService } from '../../services/uc-theme-service';
import {
  ucThemeDashboardService,
  type UcDashboardRef,
} from '../../services/uc-theme-dashboard-service';
import { ucConfirmService } from '../../services/uc-confirm-service';
import {
  ucThemesCatalogService,
  type UcCatalogTheme,
  type UcThemeCatalogSort,
} from '../../services/uc-themes-catalog-service';
import { ucThemeAuthorService, type AuthorTheme } from '../../services/uc-theme-author-service';
import { describeThemeRisks, scanThemeForRisks } from '../../services/uc-theme-trust-scanner';
import { ucCloudAuthService, type CloudUser } from '../../services/uc-cloud-auth-service';
import { copyTextToClipboard } from '../../utils/uc-clipboard';
import type { UcThemeDefinition, UcThemeSource } from '../../themes/uc-theme-types';
import { UC_THEME_HA_NATIVE } from '../../themes/uc-theme-types';
import { haThemeToUcTheme, listHaThemes, type HaThemeMode } from '../../themes/uc-ha-theme-import';
import '../../components/uc-theme-picker';
import '../../components/uc-theme-swatch';
import '../../components/uc-theme-editor-dialog';
import '../components/uc-hub-login-dialog';
import '../components/uc-hub-submit-theme-dialog';
import '../components/uc-hub-rate-dialog';

export type ThemesView = 'browse' | 'mine';

const THEME_BUILDER_URL = 'https://ultracard.io/theme-builder/';
const THEME_GALLERY_URL = 'https://ultracard.io/themes/';

function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function matches(q: string, ...fields: (string | string[] | undefined)[]): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return fields.some(f =>
    Array.isArray(f) ? f.some(x => x.toLowerCase().includes(needle)) : (f ?? '').toLowerCase().includes(needle)
  );
}

@customElement('hub-themes-tab')
export class HubThemesTab extends LitElement {
  @property({ attribute: false }) public hass: any;
  /** Sub-view to open with (deep links from the editor or website). */
  @property() initialView: ThemesView = 'browse';

  @state() private _tick = 0;
  @state() private _view: ThemesView = 'browse';
  @state() private _search = '';
  @state() private _toastMsg = '';
  @state() private _editor: { theme: UcThemeDefinition | null; asCopy: boolean } | null = null;
  @state() private _importOpen = false;
  @state() private _importText = '';
  @state() private _haImportOpen = false;
  @state() private _haImportName = '';
  @state() private _haImportMode: HaThemeMode = 'auto';
  @state() private _dashboards: UcDashboardRef[] = [];
  @state() private _applyDashboard = '';
  @state() private _applyTheme = '';
  @state() private _applying = false;

  // Catalog (ultracard.io)
  @state() private _catalog: UcCatalogTheme[] = [];
  @state() private _catalogLoading = false;
  @state() private _catalogError = '';
  @state() private _catalogSort: UcThemeCatalogSort = 'downloads';
  @state() private _installing = new Set<number>();
  @state() private _myRatings = new Map<number, number>();
  @state() private _rating: UcCatalogTheme | null = null;

  // Authoring
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _showLogin = false;
  @state() private _share: UcThemeDefinition | null = null;
  @state() private _editSubmission: AuthorTheme | null = null;
  @state() private _mine: AuthorTheme[] = [];
  @state() private _mineLoading = false;
  @state() private _mineError = '';
  @state() private _mineLoaded = false;

  private _unsub: (() => void) | null = null;
  private _authListener: ((user: CloudUser | null) => void) | null = null;
  private _toastTimer: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this._unsub = ucThemeService.subscribe(() => {
      this._tick++;
    });
    this._cloudUser = ucCloudAuthService.getCurrentUser();
    this._authListener = user => {
      this._cloudUser = user;
      if (user) {
        this._showLogin = false;
        void this._loadMyRatings();
        if (this._view === 'mine') void this._loadMine();
      } else {
        this._mine = [];
        this._mineError = '';
        this._mineLoaded = false;
        this._myRatings = new Map();
      }
    };
    ucCloudAuthService.addListener(this._authListener);
    void this._loadDashboards();
    void this._loadCatalog();
    void this._loadMyRatings();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._unsub = null;
    if (this._authListener) {
      ucCloudAuthService.removeListener(this._authListener);
      this._authListener = null;
    }
    if (this._toastTimer) clearTimeout(this._toastTimer);
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('hass') && this.hass && !this._dashboards.length) {
      void this._loadDashboards();
    }
    if (changed.has('initialView') && this.initialView === 'mine') {
      this._setView('mine');
      this.dispatchEvent(new CustomEvent('themes-view-applied', { bubbles: true, composed: true }));
    }
  }

  private get _lang(): string {
    return this.hass?.locale?.language || 'en';
  }

  private _t(key: string, fallback: string): string {
    return localize(`hub.themes.${key}`, this._lang, fallback);
  }

  private _toast(msg: string): void {
    this._toastMsg = msg;
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => (this._toastMsg = ''), 2500);
  }

  private _setView(view: ThemesView): void {
    this._view = view;
    this._importOpen = false;
    this._haImportOpen = false;
    if (view === 'mine' && this._cloudUser && !this._mineLoaded) void this._loadMine();
  }

  // ------------------------------------------------------------ dashboards

  private async _loadDashboards(): Promise<void> {
    if (!this.hass) return;
    try {
      this._dashboards = await ucThemeDashboardService.listDashboards(this.hass);
      if (!this._applyDashboard) {
        const current = ucThemeDashboardService.currentDashboard();
        this._applyDashboard = current ?? '__default__';
      }
    } catch {
      /* leave empty */
    }
  }

  private _selectedDashboard(): UcDashboardRef | undefined {
    if (this._applyDashboard === '__default__') return this._dashboards.find(d => d.urlPath === null);
    return this._dashboards.find(d => d.urlPath === this._applyDashboard);
  }

  private async _apply(): Promise<void> {
    const ref = this._selectedDashboard();
    if (!ref || !this.hass) return;
    const ok = await ucConfirmService.confirm(
      this._t('apply_confirm_title', 'Apply theme to dashboard?'),
      fmt(
        this._t('apply_confirm', 'This rewrites uc_theme on every Ultra Card in "{dashboard}". Continue?'),
        { dashboard: ref.title }
      ),
      { confirmText: this._t('apply_button', 'Apply to all Ultra Cards') }
    );
    if (!ok) return;
    this._applying = true;
    try {
      const result = await ucThemeDashboardService.applyTheme(
        this.hass,
        ref,
        this._applyTheme || undefined
      );
      this._toast(
        result.cardsUpdated
          ? fmt(this._t('apply_done', 'Updated {count} of {seen} Ultra Cards'), {
              count: result.cardsUpdated,
              seen: result.cardsSeen,
            })
          : this._t('apply_none', 'No Ultra Cards needed changing')
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._toast(`${this._t('apply_failed', 'Could not update dashboard')}: ${msg}`);
    } finally {
      this._applying = false;
    }
  }

  private async _undo(): Promise<void> {
    if (!this.hass) return;
    try {
      await ucThemeDashboardService.undo(this.hass);
      this._toast(this._t('undo_done', 'Restored previous dashboard configuration'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this._toast(`${this._t('apply_failed', 'Could not update dashboard')}: ${msg}`);
    }
  }

  // --------------------------------------------------------------- catalog

  private async _loadCatalog(force = false): Promise<void> {
    if (force) ucThemesCatalogService.clearCache();
    this._catalogLoading = true;
    this._catalogError = '';
    try {
      const page = await ucThemesCatalogService.fetchThemes({ orderby: 'downloads', per_page: 100 });
      this._catalog = page.themes;
    } catch (err) {
      this._catalog = [];
      this._catalogError = err instanceof Error ? err.message : String(err);
    } finally {
      this._catalogLoading = false;
    }
  }

  private async _loadMyRatings(): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) return;
    try {
      this._myRatings = await ucThemeAuthorService.myRatings();
    } catch {
      /* stars just show the average */
    }
  }

  private _sorted(list: UcCatalogTheme[]): UcCatalogTheme[] {
    const out = [...list];
    switch (this._catalogSort) {
      case 'rating':
        out.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount || b.downloads - a.downloads);
        break;
      case 'date':
        out.sort((a, b) => (b.created > a.created ? 1 : b.created < a.created ? -1 : 0));
        break;
      case 'title':
        out.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        out.sort((a, b) => b.downloads - a.downloads);
    }
    return out;
  }

  private _catalogBySource(source: 'official' | 'community'): UcCatalogTheme[] {
    const q = this._search.trim();
    return this._sorted(
      this._catalog.filter(
        t => t.source === source && matches(q, t.name, t.description, t.author, t.tags)
      )
    );
  }

  private async _install(entry: UcCatalogTheme): Promise<void> {
    if (this._installing.has(entry.id)) return;
    const risks = scanThemeForRisks(entry.definition);
    if (risks.hasAny || entry.warnings.length) {
      const lines = [...describeThemeRisks(risks), ...entry.warnings.map(w => `Dropped: ${w}`)];
      const ok = await ucConfirmService.confirm(
        fmt(this._t('install_confirm_title', 'Install "{name}"?'), { name: entry.name }),
        `${this._t('install_confirm', 'Before this theme lands on your cards, know that it:')}\n\n${lines.join('\n')}`,
        { confirmText: this._t('install', 'Install') }
      );
      if (!ok) return;
    }
    this._installing = new Set(this._installing).add(entry.id);
    try {
      const saved = ucThemesCatalogService.install(entry);
      if (saved) {
        this._catalog = this._catalog.map(t => (t.id === entry.id ? { ...t, downloads: t.downloads + 1 } : t));
      }
      this._toast(
        saved
          ? fmt(this._t('installed_done', 'Installed "{name}"'), { name: saved.name })
          : this._t('import_invalid', 'That does not look like a valid Ultra Card theme')
      );
    } finally {
      const next = new Set(this._installing);
      next.delete(entry.id);
      this._installing = next;
    }
  }

  private _openRate(entry: UcCatalogTheme): void {
    if (!ucCloudAuthService.isAuthenticated()) {
      this._showLogin = true;
      return;
    }
    if (this._cloudUser && entry.authorId && entry.authorId === this._cloudUser.id) {
      this._toast(this._t('rate_own', 'You cannot rate your own theme'));
      return;
    }
    this._rating = entry;
  }

  private async _submitRating(entry: UcCatalogTheme, stars: number): Promise<{ rating: number; count: number }> {
    const result = await ucThemeAuthorService.rate(entry.id, stars);
    this._myRatings = new Map(this._myRatings).set(entry.id, result.myRating);
    this._catalog = this._catalog.map(t =>
      t.id === entry.id
        ? { ...t, rating: result.rating, ratingCount: result.ratingCount, myRating: result.myRating }
        : t
    );
    return { rating: result.rating, count: result.ratingCount };
  }

  // -------------------------------------------------------------- authoring

  private _openShare(theme: UcThemeDefinition): void {
    if (!ucCloudAuthService.isAuthenticated()) {
      this._showLogin = true;
      return;
    }
    this._share = theme;
  }

  private async _loadMine(): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) return;
    this._mineLoading = true;
    this._mineError = '';
    try {
      this._mine = await ucThemeAuthorService.listMine();
      this._mineLoaded = true;
    } catch (err) {
      const status = (err as { status?: number })?.status;
      this._mineError =
        status === 403
          ? this._t(
              'mine_admin_only',
              'Theme authoring is available to Home Assistant administrators only. Sign in as an admin via Ultra Card Connect.'
            )
          : err instanceof Error
            ? err.message
            : String(err);
    } finally {
      this._mineLoading = false;
    }
  }

  private async _withdraw(item: AuthorTheme): Promise<void> {
    const ok = await ucConfirmService.confirm(
      this._t('withdraw_confirm_title', 'Withdraw submission?'),
      fmt(this._t('withdraw_confirm', '"{name}" is taken out of the review queue. You can edit and resubmit later.'), {
        name: item.name,
      }),
      { confirmText: this._t('withdraw', 'Withdraw') }
    );
    if (!ok) return;
    try {
      await ucThemeAuthorService.withdraw(item.id);
      this._toast(fmt(this._t('withdrawn', 'Withdrew "{name}"'), { name: item.name }));
      await this._loadMine();
    } catch (err) {
      this._toast(err instanceof Error ? err.message : String(err));
    }
  }

  private async _deleteSubmission(item: AuthorTheme): Promise<void> {
    const ok = await ucConfirmService.confirm(
      this._t('delete_submission_title', 'Delete from ultracard.io?'),
      fmt(this._t('delete_submission_confirm', '"{name}" is removed from the catalog for everyone. This cannot be undone.'), {
        name: item.name,
      }),
      { destructive: true, confirmText: this._t('delete', 'Delete') }
    );
    if (!ok) return;
    try {
      await ucThemeAuthorService.remove(item.id);
      this._toast(fmt(this._t('deleted', 'Deleted "{name}"'), { name: item.name }));
      await this._loadMine();
      void this._loadCatalog(true);
    } catch (err) {
      this._toast(err instanceof Error ? err.message : String(err));
    }
  }

  // --------------------------------------------------------------- library

  private _builtinThemes(): UcThemeDefinition[] {
    const q = this._search.trim();
    return ucThemeService
      .getAllThemes()
      .filter(t => (t.source ?? 'builtin') === 'builtin')
      .filter(t => matches(q, t.name, t.description, t.author));
  }

  private _libraryThemes(): UcThemeDefinition[] {
    return ucThemeService.getAllThemes().filter(t => (t.source ?? 'builtin') !== 'builtin');
  }

  private _setGlobal(id: string): void {
    ucThemeService.setGlobalDefault(id === UC_THEME_HA_NATIVE ? null : id);
    const name = ucThemeService.getTheme(id)?.name ?? id;
    this._toast(fmt(this._t('global_set', 'Global default: {name}'), { name }));
  }

  private async _delete(theme: UcThemeDefinition): Promise<void> {
    const ok = await ucConfirmService.confirm(
      this._t('delete_confirm_title', 'Delete theme?'),
      fmt(
        this._t(
          'delete_confirm',
          '"{name}" will be removed from this browser. Cards using it fall back to the global default.'
        ),
        { name: theme.name }
      ),
      { destructive: true, confirmText: this._t('delete', 'Delete') }
    );
    if (!ok) return;
    ucThemeService.removeFromLibrary(theme.id);
    this._toast(fmt(this._t('deleted', 'Deleted "{name}"'), { name: theme.name }));
  }

  private async _export(theme: UcThemeDefinition): Promise<void> {
    const json = ucThemeService.exportTheme(theme.id);
    if (!json) return;
    await copyTextToClipboard(json);
    this._toast(this._t('export_copied', 'Theme JSON copied to clipboard'));
  }

  private _onEditorSave(e: CustomEvent<{ theme: unknown; warnings: string[] }>): void {
    const editing = this._editor;
    const saved = ucThemeService.saveToLibrary(e.detail.theme, { source: 'local' });
    if (!saved) {
      this._toast(this._t('import_invalid', 'That does not look like a valid Ultra Card theme'));
      return;
    }
    // Editing an existing local theme under a new id leaves the old one behind.
    if (editing?.theme && !editing.asCopy && !ucThemeService.isBuiltin(editing.theme.id) && editing.theme.id !== saved.id) {
      ucThemeService.removeFromLibrary(editing.theme.id);
    }
    this._editor = null;
    if (this._view !== 'mine') this._setView('mine');
    this._toast(fmt(this._t('saved', 'Saved "{name}"'), { name: saved.name }));
  }

  private _import(): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(this._importText);
    } catch {
      this._toast(this._t('import_invalid', 'That does not look like a valid Ultra Card theme'));
      return;
    }
    const saved = ucThemeService.saveToLibrary(parsed, { source: 'local' });
    if (!saved) {
      this._toast(this._t('import_invalid', 'That does not look like a valid Ultra Card theme'));
      return;
    }
    this._importOpen = false;
    this._importText = '';
    this._toast(fmt(this._t('import_done', 'Imported "{name}"'), { name: saved.name }));
  }

  /**
   * Build a local theme from an installed HA theme and open it in the editor
   * so the user can add a surface and module presets before saving.
   */
  private _importFromHa(): void {
    const record = this.hass?.themes?.themes?.[this._haImportName];
    if (!record) return;
    const { theme, mapped } = haThemeToUcTheme(this._haImportName, record, {
      mode: this._haImportMode,
      darkMode: !!this.hass?.themes?.darkMode,
    });
    this._haImportOpen = false;
    this._editor = { theme, asCopy: false };
    this._toast(
      mapped.length
        ? fmt(this._t('ha_import_mapped', 'Mapped {count} values from "{name}"'), {
            count: mapped.length,
            name: this._haImportName,
          })
        : fmt(this._t('ha_import_nothing', '"{name}" sets no card variables; starting from defaults'), {
            name: this._haImportName,
          })
    );
  }

  // ---------------------------------------------------------------- render

  protected override render(): TemplateResult {
    return html`
      <div class="themes-view-switch" role="tablist" aria-label=${this._t('view_switch', 'Themes view')} data-tick=${this._tick}>
        <button
          class="themes-view-option ${this._view === 'browse' ? 'active' : ''}"
          role="tab"
          aria-selected=${this._view === 'browse' ? 'true' : 'false'}
          @click=${() => this._setView('browse')}
        >
          <ha-icon icon="mdi:palette-swatch"></ha-icon>
          ${this._t('view_browse', 'Themes')}
        </button>
        <button
          class="themes-view-option ${this._view === 'mine' ? 'active' : ''}"
          role="tab"
          aria-selected=${this._view === 'mine' ? 'true' : 'false'}
          @click=${() => this._setView('mine')}
        >
          <ha-icon icon="mdi:account-edit-outline"></ha-icon>
          ${this._t('view_mine', 'My Themes')}
        </button>
      </div>

      ${this._view === 'mine' ? this._renderMine() : this._renderBrowse()}

      ${this._editor
        ? html`<uc-theme-editor-dialog
            .hass=${this.hass}
            .theme=${this._editor.theme}
            .asCopy=${this._editor.asCopy}
            @theme-save=${this._onEditorSave}
            @theme-cancel=${() => (this._editor = null)}
          ></uc-theme-editor-dialog>`
        : nothing}
      ${this._showLogin
        ? html`<uc-hub-login-dialog @close=${() => (this._showLogin = false)}></uc-hub-login-dialog>`
        : nothing}
      ${this._share
        ? html`<uc-hub-submit-theme-dialog
            mode="create"
            .theme=${this._share}
            .language=${this._lang}
            @theme-submitted=${() => {
              this._setView('mine');
              void this._loadMine();
            }}
            @close=${() => (this._share = null)}
          ></uc-hub-submit-theme-dialog>`
        : nothing}
      ${this._editSubmission
        ? html`<uc-hub-submit-theme-dialog
            mode="edit"
            .existing=${this._editSubmission}
            .language=${this._lang}
            @theme-updated=${() => void this._loadMine()}
            @close=${() => (this._editSubmission = null)}
          ></uc-hub-submit-theme-dialog>`
        : nothing}
      ${this._rating
        ? html`<uc-hub-rate-dialog
            .presetId=${String(this._rating.id)}
            .presetName=${this._rating.name}
            .heading=${fmt(this._t('rate_title', 'Rate "{name}"'), { name: this._rating.name })}
            .existingRating=${this._myRatings.get(this._rating.id) ?? this._rating.myRating ?? 0}
            .submitRating=${(stars: number) => this._submitRating(this._rating!, stars)}
            @rating-submitted=${() => {
              this._rating = null;
              this._toast(this._t('rate_thanks', 'Thanks for rating!'));
            }}
            @close=${() => (this._rating = null)}
          ></uc-hub-rate-dialog>`
        : nothing}

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  // ------------------------------------------------------------ browse view

  private _renderBrowse(): TemplateResult {
    const globalId = ucThemeService.getGlobalDefaultId() ?? UC_THEME_HA_NATIVE;
    const builtin = this._builtinThemes();
    const official = this._catalogBySource('official');
    const community = this._catalogBySource('community');
    const q = this._search.trim();

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p>
          <strong>${this._t('view_browse', 'Themes')}</strong>
          ${this._t(
            'browse_blurb',
            'set the look of every Ultra Card at once: surface, corners, shadows, colours and each module\u2019s default style. Pick a global default, install more from the catalog, and override per card or per module whenever you like.'
          )}
        </p>
      </div>

      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:earth"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('global_title', 'Global default')}</h3>
            <p>${this._t('global_desc', 'Used by every Ultra Card that has no theme of its own.')}</p>
          </div>
        </div>
        <uc-theme-picker
          .hass=${this.hass}
          .value=${globalId}
          hide-follow-global
          hide-none
          compact
          @theme-picked=${(e: CustomEvent<{ value: string }>) => this._setGlobal(e.detail.value)}
        ></uc-theme-picker>
        <label class="paint-page">
          <ha-switch
            .checked=${ucThemeService.getPaintPage()}
            @change=${(e: Event) => ucThemeService.setPaintPage((e.target as HTMLInputElement).checked)}
          ></ha-switch>
          <span>
            <strong>${this._t('paint_page', 'Let themes paint the dashboard background')}</strong>
            <small
              >${this._t(
                'paint_page_desc',
                'Themes such as Neumorphic and Wood set the view behind their cards so shadows and materials read correctly. A background set on the view in the dashboard config still wins.'
              )}</small
            >
          </span>
        </label>
      </div>

      <div class="themes-toolbar">
        <div class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            placeholder=${this._t('search', 'Search themes\u2026')}
            .value=${this._search}
            @input=${(e: Event) => (this._search = (e.target as HTMLInputElement).value)}
          />
        </div>
        <select
          class="catalog-sort"
          .value=${this._catalogSort}
          @change=${(e: Event) => (this._catalogSort = (e.target as HTMLSelectElement).value as UcThemeCatalogSort)}
        >
          <option value="downloads" ?selected=${this._catalogSort === 'downloads'}>${this._t('sort_downloads', 'Most installed')}</option>
          <option value="rating" ?selected=${this._catalogSort === 'rating'}>${this._t('sort_rating', 'Top rated')}</option>
          <option value="date" ?selected=${this._catalogSort === 'date'}>${this._t('sort_date', 'Newest')}</option>
          <option value="title" ?selected=${this._catalogSort === 'title'}>${this._t('sort_title', 'Name')}</option>
        </select>
        <button class="btn ghost" ?disabled=${this._catalogLoading} @click=${() => void this._loadCatalog(true)}>
          <ha-icon icon=${this._catalogLoading ? 'mdi:loading' : 'mdi:refresh'} class=${this._catalogLoading ? 'spin' : ''}></ha-icon>
          ${this._t('catalog_refresh', 'Refresh')}
        </button>
      </div>

      ${this._catalogError
        ? html`<div class="catalog-error">
            <ha-icon icon="mdi:cloud-off-outline"></ha-icon>
            <span>${this._t('catalog_error', 'Could not reach ultracard.io')}: ${this._catalogError}</span>
          </div>`
        : nothing}

      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:check-decagram"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('default_title', 'Default themes')}</h3>
            <p>${this._t('default_desc', 'Built into Ultra Card and maintained by the Ultra Card team. Official catalog themes install into your library with one tap.')}</p>
          </div>
          <span class="section-count">${builtin.length + official.length}</span>
        </div>
        ${builtin.length || official.length
          ? html`<div class="theme-grid">
              ${builtin.map(t => this._renderThemeCard(t, t.id === globalId))}
              ${official.map(t => this._renderCatalogCard(t, globalId))}
            </div>`
          : html`<div class="section-empty">${fmt(this._t('search_empty', 'Nothing matches "{query}"'), { query: q })}</div>`}
      </div>

      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:account-group"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('community_title', 'Community themes')}</h3>
            <p>${this._t('community_desc', 'Made by Ultra Card members with the theme builder on ultracard.io. Rate the ones you install to help others find the good stuff.')}</p>
          </div>
          <span class="section-count">${community.length}</span>
        </div>
        ${this._catalogLoading && !this._catalog.length
          ? html`<div class="catalog-loading"><ha-icon icon="mdi:loading" class="spin"></ha-icon>${this._t('catalog_loading', 'Loading catalog\u2026')}</div>`
          : community.length
            ? html`<div class="theme-grid">${community.map(t => this._renderCatalogCard(t, globalId))}</div>`
            : q
              ? html`<div class="section-empty">${fmt(this._t('search_empty', 'Nothing matches "{query}"'), { query: q })}</div>`
              : this._catalogError
                ? nothing
                : html`
                    <div class="empty-state">
                      <div class="empty-state-icon"><ha-icon icon="mdi:palette-swatch-outline"></ha-icon></div>
                      <h3>${this._t('catalog_empty_title', 'No community themes yet')}</h3>
                      <p>${this._t('catalog_empty', 'Be the first: build a theme and share it with the catalog.')}</p>
                      <a class="btn primary" href=${THEME_BUILDER_URL} target="_blank" rel="noopener noreferrer">
                        <ha-icon icon="mdi:palette-advanced"></ha-icon>${this._t('open_builder', 'Open theme builder')}
                      </a>
                    </div>
                  `}
        <div class="builder-cta">
          <ha-icon icon="mdi:palette-advanced"></ha-icon>
          <span>${this._t('builder_hint', 'Want to make your own? The theme builder on ultracard.io has live previews for every control, and finished themes sync straight back here.')}</span>
          <a class="btn ghost" href=${THEME_BUILDER_URL} target="_blank" rel="noopener noreferrer">
            ${this._t('open_builder', 'Open theme builder')}<ha-icon icon="mdi:open-in-new"></ha-icon>
          </a>
        </div>
      </div>

      ${this._renderApply()}
    `;
  }

  private _renderStars(rating: number, size = 14): TemplateResult {
    const r = Math.round(rating);
    return html`<span class="star-rating" style="--star-size:${size}px">
      ${[1, 2, 3, 4, 5].map(
        i => html`<ha-icon icon=${i <= r ? 'mdi:star' : 'mdi:star-outline'} class=${i <= r ? '' : 'empty'}></ha-icon>`
      )}
    </span>`;
  }

  private _renderCatalogRating(entry: UcCatalogTheme): TemplateResult {
    const mine = this._myRatings.get(entry.id) ?? entry.myRating;
    const own = !!this._cloudUser && !!entry.authorId && entry.authorId === this._cloudUser.id;
    const title = own
      ? this._t('rate_own', 'You cannot rate your own theme')
      : mine
        ? fmt(this._t('rate_yours', 'You rated this {stars}/5. Tap to change.'), { stars: mine })
        : this._cloudUser
          ? this._t('rate_tap', 'Tap to rate')
          : this._t('rate_sign_in', 'Sign in to rate');
    return html`
      <button
        type="button"
        class="rating-btn ${own ? 'static' : ''} ${mine ? 'mine' : ''}"
        title=${title}
        ?disabled=${own}
        @click=${(e: Event) => {
          e.stopPropagation();
          this._openRate(entry);
        }}
      >
        ${this._renderStars(entry.rating)}
        <span class="rating-count">
          ${entry.ratingCount
            ? `${entry.rating.toFixed(1)} (${entry.ratingCount})`
            : this._t('rate_none', 'No ratings yet')}${mine
            ? ` \u00b7 ${fmt(this._t('rate_you', 'you: {stars}'), { stars: mine })}`
            : ''}
        </span>
      </button>
    `;
  }

  private _renderCatalogCard(entry: UcCatalogTheme, globalId: string): TemplateResult {
    const state = ucThemesCatalogService.installState(entry);
    const busy = this._installing.has(entry.id);
    const risks = scanThemeForRisks(entry.definition);
    const installed = state !== 'not_installed';
    const isGlobal = installed && entry.catalogId === globalId;
    return html`
      <div class="theme-card catalog-card ${isGlobal ? 'is-global' : ''}">
        ${entry.preview
          ? html`<img class="catalog-preview" src=${entry.preview} alt="" loading="lazy" />`
          : html`<uc-theme-swatch .theme=${entry.definition}></uc-theme-swatch>`}
        <div class="theme-meta">
          <div class="theme-title">
            <ha-icon icon=${entry.definition.icon ?? 'mdi:palette'}></ha-icon>
            <span class="name" title=${entry.name}>${entry.name}</span>
            <span class="badge ${entry.source}">${entry.source}</span>
          </div>
          ${entry.description ? html`<p class="desc">${entry.description}</p>` : nothing}
          <div class="theme-sub">
            <span class="author" title=${entry.author}>${entry.author}</span>
            <span title=${this._t('downloads', 'Installs')}><ha-icon icon="mdi:download"></ha-icon>${entry.downloads}</span>
            <span>v${entry.version}</span>
            ${risks.css
              ? html`<span class="risk-pill" title=${describeThemeRisks(risks).join('\n')}>
                  <ha-icon icon="mdi:code-braces"></ha-icon>CSS
                </span>`
              : nothing}
            ${isGlobal ? html`<span class="global-pill">${this._t('is_global', 'Global default')}</span>` : nothing}
          </div>
          ${this._renderCatalogRating(entry)}
          ${entry.tags.length
            ? html`<div class="tag-row">${entry.tags.slice(0, 4).map(t => html`<span class="tag">${t}</span>`)}</div>`
            : nothing}
        </div>
        <div class="theme-actions">
          ${state === 'installed'
            ? html`<button class="btn ghost installed" disabled>
                <ha-icon icon="mdi:check"></ha-icon>${this._t('installed', 'Installed')}
              </button>`
            : html`<button class="btn primary" ?disabled=${busy} @click=${() => this._install(entry)}>
                <ha-icon icon=${busy ? 'mdi:loading' : state === 'update_available' ? 'mdi:update' : 'mdi:download'} class=${busy ? 'spin' : ''}></ha-icon>
                ${state === 'update_available' ? this._t('update', 'Update') : this._t('install', 'Install')}
              </button>`}
          ${installed && !isGlobal
            ? html`<button class="action-btn" title=${this._t('set_global', 'Set as global default')} @click=${() => this._setGlobal(entry.catalogId)}>
                <ha-icon icon="mdi:earth"></ha-icon>
              </button>`
            : nothing}
          <a
            class="action-btn"
            title=${this._t('view_on_site', 'View on ultracard.io')}
            href=${`${THEME_GALLERY_URL}#theme-${entry.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ha-icon icon="mdi:open-in-new"></ha-icon>
          </a>
        </div>
      </div>
    `;
  }

  private _renderThemeCard(theme: UcThemeDefinition, isGlobal: boolean): TemplateResult {
    const builtin = ucThemeService.isBuiltin(theme.id);
    const source = (theme.source ?? 'builtin') as UcThemeSource;
    return html`
      <div class="theme-card ${isGlobal ? 'is-global' : ''}">
        <uc-theme-swatch .theme=${theme.id === UC_THEME_HA_NATIVE ? null : theme}></uc-theme-swatch>
        <div class="theme-meta">
          <div class="theme-title">
            <ha-icon icon=${theme.icon ?? 'mdi:palette'}></ha-icon>
            <span class="name">${theme.name}</span>
            <span class="badge ${source}">${this._sourceLabel(source)}</span>
          </div>
          ${theme.description ? html`<p class="desc">${theme.description}</p>` : nothing}
          <div class="theme-sub">
            ${theme.author ? html`<span class="author">${theme.author}</span>` : nothing}
            <span>v${theme.version}</span>
            ${isGlobal ? html`<span class="global-pill">${this._t('is_global', 'Global default')}</span>` : nothing}
          </div>
        </div>
        <div class="theme-actions">
          ${isGlobal
            ? nothing
            : html`<button class="action-btn" title=${this._t('set_global', 'Set as global default')} @click=${() => this._setGlobal(theme.id)}>
                <ha-icon icon="mdi:earth"></ha-icon>
              </button>`}
          ${builtin
            ? nothing
            : html`<button class="action-btn" title=${this._t('edit', 'Edit')} @click=${() => (this._editor = { theme, asCopy: false })}>
                <ha-icon icon="mdi:pencil"></ha-icon>
              </button>`}
          <button class="action-btn" title=${this._t('duplicate', 'Duplicate')} @click=${() => (this._editor = { theme, asCopy: true })}>
            <ha-icon icon="mdi:content-copy"></ha-icon>
          </button>
          <button class="action-btn" title=${this._t('export', 'Export')} @click=${() => this._export(theme)}>
            <ha-icon icon="mdi:export-variant"></ha-icon>
          </button>
          ${source === 'local'
            ? html`<button class="action-btn" title=${this._t('share', 'Share to catalog')} @click=${() => this._openShare(theme)}>
                <ha-icon icon="mdi:cloud-upload-outline"></ha-icon>
              </button>`
            : nothing}
          ${builtin
            ? nothing
            : html`<button class="action-btn delete" title=${this._t('delete', 'Delete')} @click=${() => this._delete(theme)}>
                <ha-icon icon="mdi:delete-outline"></ha-icon>
              </button>`}
        </div>
      </div>
    `;
  }

  private _sourceLabel(source: UcThemeSource): string {
    switch (source) {
      case 'builtin':
        return this._t('filter_builtin', 'Built-in');
      case 'local':
        return this._t('filter_local', 'Mine');
      case 'official':
        return this._t('filter_official', 'Official');
      default:
        return this._t('filter_community', 'Community');
    }
  }

  private _renderApply(): TemplateResult {
    const themes = ucThemeService.getAllThemes();
    const undoRef = ucThemeDashboardService.canUndo();
    const selected = this._selectedDashboard();
    const yaml = selected?.mode === 'yaml';
    return html`
      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:view-dashboard-edit"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('apply_title', 'Apply to a dashboard')}</h3>
            <p>${this._t('apply_desc', 'Write a theme onto every Ultra Card of a dashboard.')}</p>
          </div>
        </div>
        <div class="apply-row">
          <label class="field">
            <span>${this._t('apply_dashboard', 'Dashboard')}</span>
            <select
              .value=${this._applyDashboard}
              @change=${(e: Event) => (this._applyDashboard = (e.target as HTMLSelectElement).value)}
            >
              ${this._dashboards.map(
                d => html`<option value=${d.urlPath ?? '__default__'} ?selected=${(d.urlPath ?? '__default__') === this._applyDashboard}>
                  ${d.title}${d.mode === 'yaml' ? ` \u00b7 ${this._t('yaml_mode', 'YAML mode (read-only)')}` : ''}
                </option>`
              )}
            </select>
          </label>
          <label class="field">
            <span>${this._t('apply_theme', 'Theme')}</span>
            <select
              .value=${this._applyTheme}
              @change=${(e: Event) => (this._applyTheme = (e.target as HTMLSelectElement).value)}
            >
              <option value="" ?selected=${this._applyTheme === ''}>
                ${this._t('apply_follow_global', 'Follow global default (clear per-card theme)')}
              </option>
              ${themes.map(t => html`<option value=${t.id} ?selected=${t.id === this._applyTheme}>${t.name}</option>`)}
            </select>
          </label>
          <div class="apply-actions">
            <button class="btn primary" ?disabled=${this._applying || !selected || yaml} @click=${this._apply}>
              <ha-icon icon=${this._applying ? 'mdi:loading' : 'mdi:check-all'}></ha-icon>
              ${this._t('apply_button', 'Apply to all Ultra Cards')}
            </button>
            ${undoRef
              ? html`<button class="btn ghost" @click=${this._undo}>
                  <ha-icon icon="mdi:undo"></ha-icon>${this._t('undo', 'Undo last apply')} (${undoRef.title})
                </button>`
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------- my themes view

  private _renderMine(): TemplateResult {
    const globalId = ucThemeService.getGlobalDefaultId() ?? UC_THEME_HA_NATIVE;
    const library = this._libraryThemes();
    const haThemes = listHaThemes(this.hass);
    const haSelected = haThemes.find(t => t.name === this._haImportName);

    return html`
      <div class="hub-tab-blurb">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <p>
          <strong>${this._t('view_mine', 'My Themes')}</strong>
          ${this._t(
            'mine_blurb',
            'holds the themes you created, imported or installed in this browser, plus anything you shared with the catalog and where it is in review.'
          )}
        </p>
      </div>

      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:bookshelf"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('library_title', 'Your library')}</h3>
            <p>${this._t('library_desc', 'Themes you created, imported or installed. Edit and duplicate them here, or share one with the catalog.')}</p>
          </div>
          <div class="header-actions">
            ${haThemes.length
              ? html`<button
                  class="btn ghost"
                  @click=${() => {
                    this._haImportOpen = !this._haImportOpen;
                    this._importOpen = false;
                    if (!this._haImportName) {
                      this._haImportName = this.hass?.themes?.theme || haThemes[0].name;
                    }
                  }}
                >
                  <ha-icon icon="mdi:home-assistant"></ha-icon>${this._t('ha_import', 'From HA theme')}
                </button>`
              : nothing}
            <button
              class="btn ghost"
              @click=${() => {
                this._importOpen = !this._importOpen;
                this._haImportOpen = false;
              }}
            >
              <ha-icon icon="mdi:import"></ha-icon>${this._t('import', 'Import JSON')}
            </button>
            <a class="btn ghost" href=${THEME_BUILDER_URL} target="_blank" rel="noopener noreferrer" title=${this._t('builder_title', 'Full theme builder with live previews on ultracard.io')}>
              <ha-icon icon="mdi:palette-advanced"></ha-icon>${this._t('open_builder_short', 'Theme builder')}
            </a>
            <button class="btn primary" @click=${() => (this._editor = { theme: null, asCopy: false })}>
              <ha-icon icon="mdi:plus"></ha-icon>${this._t('new_theme', 'New theme')}
            </button>
          </div>
        </div>

        ${this._haImportOpen
          ? html`
              <div class="import-box">
                <h4>${this._t('ha_import_title', 'Import from a Home Assistant theme')}</h4>
                <p>${this._t('ha_import_desc', 'Reads the card colours, radius, shadow and font from an installed HA theme and opens the result in the editor. Add a surface and module presets, then save.')}</p>
                <div class="apply-row">
                  <label class="field">
                    <span>${this._t('ha_import_theme', 'HA theme')}</span>
                    <select
                      .value=${this._haImportName}
                      @change=${(e: Event) => (this._haImportName = (e.target as HTMLSelectElement).value)}
                    >
                      ${haThemes.map(
                        t => html`<option value=${t.name} ?selected=${t.name === this._haImportName}>${t.name}</option>`
                      )}
                    </select>
                  </label>
                  ${haSelected?.hasModes
                    ? html`<label class="field">
                        <span>${this._t('ha_import_mode', 'Mode')}</span>
                        <select
                          .value=${this._haImportMode}
                          @change=${(e: Event) => (this._haImportMode = (e.target as HTMLSelectElement).value as HaThemeMode)}
                        >
                          <option value="auto" ?selected=${this._haImportMode === 'auto'}>${this._t('ha_import_mode_auto', 'Current (follow HA dark mode)')}</option>
                          <option value="light" ?selected=${this._haImportMode === 'light'}>${this._t('ha_import_mode_light', 'Light')}</option>
                          <option value="dark" ?selected=${this._haImportMode === 'dark'}>${this._t('ha_import_mode_dark', 'Dark')}</option>
                        </select>
                      </label>`
                    : nothing}
                </div>
                <div class="row-end">
                  <button class="btn ghost" @click=${() => (this._haImportOpen = false)}>
                    ${this._t('editor_cancel', 'Cancel')}
                  </button>
                  <button class="btn primary" ?disabled=${!haSelected} @click=${this._importFromHa}>
                    <ha-icon icon="mdi:import"></ha-icon>${this._t('ha_import_button', 'Open in editor')}
                  </button>
                </div>
              </div>
            `
          : nothing}
        ${this._importOpen
          ? html`
              <div class="import-box">
                <h4>${this._t('import_title', 'Import theme')}</h4>
                <p>${this._t('import_desc', 'Paste a theme JSON exported from Ultra Card or downloaded from the theme gallery.')}</p>
                <textarea
                  rows="5"
                  spellcheck="false"
                  placeholder=${this._t('import_placeholder', '{ "id": "my-theme", ... }')}
                  .value=${this._importText}
                  @input=${(e: Event) => (this._importText = (e.target as HTMLTextAreaElement).value)}
                ></textarea>
                <div class="row-end">
                  <button class="btn ghost" @click=${() => (this._importOpen = false)}>
                    ${this._t('editor_cancel', 'Cancel')}
                  </button>
                  <button class="btn primary" ?disabled=${!this._importText.trim()} @click=${this._import}>
                    ${this._t('import_button', 'Import')}
                  </button>
                </div>
              </div>
            `
          : nothing}

        ${library.length
          ? html`<div class="theme-grid">${library.map(t => this._renderThemeCard(t, t.id === globalId))}</div>`
          : html`
              <div class="empty-state">
                <div class="empty-state-icon"><ha-icon icon="mdi:palette-swatch-outline"></ha-icon></div>
                <h3>${this._t('library_empty_title', 'No themes of your own yet')}</h3>
                <p>${this._t('library_empty', 'Create one here, import a JSON file, or install a theme from the catalog and it shows up in this list.')}</p>
                <div class="empty-actions">
                  <button class="btn primary" @click=${() => (this._editor = { theme: null, asCopy: false })}>
                    <ha-icon icon="mdi:plus"></ha-icon>${this._t('new_theme', 'New theme')}
                  </button>
                  <button class="btn ghost" @click=${() => this._setView('browse')}>
                    <ha-icon icon="mdi:palette-swatch"></ha-icon>${this._t('browse_catalog', 'Browse themes')}
                  </button>
                </div>
              </div>
            `}
      </div>

      ${this._renderSubmissions()}
    `;
  }

  private _renderSubmissions(): TemplateResult {
    const statusLabel = (item: AuthorTheme): { text: string; cls: string } => {
      if (item.has_pending_revision) return { text: this._t('status_revision', 'Update in review'), cls: 'pending' };
      switch (item.review_status) {
        case 'approved':
          return { text: this._t('status_approved', 'Published'), cls: 'approved' };
        case 'changes_requested':
          return { text: this._t('status_changes', 'Changes requested'), cls: 'changes' };
        case 'rejected':
          return { text: this._t('status_rejected', 'Rejected'), cls: 'rejected' };
        default:
          return { text: this._t('status_pending', 'In review'), cls: 'pending' };
      }
    };

    return html`
      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:cloud-upload-outline"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('mine_title', 'Shared with the catalog')}</h3>
            <p>${this._t('mine_desc', 'Themes you submitted to ultracard.io: review status, installs and ratings.')}</p>
          </div>
          ${this._cloudUser
            ? html`<div class="header-actions">
                <button class="btn ghost" ?disabled=${this._mineLoading} @click=${() => void this._loadMine()}>
                  <ha-icon icon=${this._mineLoading ? 'mdi:loading' : 'mdi:refresh'} class=${this._mineLoading ? 'spin' : ''}></ha-icon>
                  ${this._t('catalog_refresh', 'Refresh')}
                </button>
              </div>`
            : nothing}
        </div>
        ${!this._cloudUser
          ? html`
              <div class="empty-state">
                <div class="empty-state-icon"><ha-icon icon="mdi:account-lock-outline"></ha-icon></div>
                <h3>${this._t('mine_login_title', 'Sign in to manage your shared themes')}</h3>
                <p>${this._t('mine_login_desc', 'Sharing, rating and editing catalog themes goes through Ultra Card Connect.')}</p>
                <button class="btn primary" @click=${() => (this._showLogin = true)}>
                  <ha-icon icon="mdi:login"></ha-icon>${this._t('sign_in', 'Sign in')}
                </button>
              </div>
            `
          : this._mineLoading && !this._mine.length
            ? html`<div class="catalog-loading"><ha-icon icon="mdi:loading" class="spin"></ha-icon>${this._t('mine_loading', 'Loading your themes\u2026')}</div>`
            : this._mineError
              ? html`<div class="catalog-error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${this._mineError}</span></div>`
              : this._mine.length
                ? html`
                    <div class="mine-list">
                      ${this._mine.map(item => {
                        const status = statusLabel(item);
                        const live = item.review_status === 'approved';
                        return html`
                          <div class="mine-row">
                            <div class="mine-thumb">
                              ${item.preview
                                ? html`<img src=${item.preview} alt="" loading="lazy" />`
                                : item.definition
                                  ? html`<uc-theme-swatch .theme=${item.definition}></uc-theme-swatch>`
                                  : html`<ha-icon icon="mdi:palette"></ha-icon>`}
                            </div>
                            <div class="mine-meta">
                              <div class="theme-title">
                                <span class="name">${item.name}</span>
                                <span class="status-pill ${status.cls}">${status.text}</span>
                              </div>
                              <div class="theme-sub">
                                <span>v${item.version}</span>
                                ${live
                                  ? html`<span title=${this._t('downloads', 'Installs')}><ha-icon icon="mdi:download"></ha-icon>${item.downloads}</span>
                                      <span class="rating-inline" title=${this._t('rating', 'Rating')}>
                                        ${this._renderStars(item.rating, 12)}
                                        ${item.rating_count ? `${item.rating.toFixed(1)} (${item.rating_count})` : this._t('rate_none', 'No ratings yet')}
                                      </span>`
                                  : nothing}
                                ${item.submitted_at ? html`<span>${item.submitted_at.slice(0, 10)}</span>` : nothing}
                              </div>
                              ${item.moderator_note
                                ? html`<p class="mod-note"><ha-icon icon="mdi:message-text-outline"></ha-icon>${item.moderator_note}</p>`
                                : nothing}
                            </div>
                            <div class="theme-actions mine-actions">
                              <button class="action-btn" title=${this._t('edit', 'Edit')} @click=${() => (this._editSubmission = item)}>
                                <ha-icon icon="mdi:pencil"></ha-icon>
                              </button>
                              <a
                                class="action-btn"
                                title=${this._t('open_in_builder', 'Open in theme builder')}
                                href=${`${THEME_BUILDER_URL}?id=${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ha-icon icon="mdi:palette-advanced"></ha-icon>
                              </a>
                              ${item.review_status === 'pending' || item.has_pending_revision
                                ? html`<button class="action-btn" title=${this._t('withdraw', 'Withdraw')} @click=${() => this._withdraw(item)}>
                                    <ha-icon icon="mdi:undo-variant"></ha-icon>
                                  </button>`
                                : nothing}
                              <button class="action-btn delete" title=${this._t('delete', 'Delete')} @click=${() => this._deleteSubmission(item)}>
                                <ha-icon icon="mdi:delete-outline"></ha-icon>
                              </button>
                            </div>
                          </div>
                        `;
                      })}
                    </div>
                  `
                : html`
                    <div class="empty-state">
                      <div class="empty-state-icon"><ha-icon icon="mdi:palette-swatch-outline"></ha-icon></div>
                      <h3>${this._t('mine_empty_title', 'Nothing shared yet')}</h3>
                      <p>${this._t('mine_empty', 'Use the share button on one of your library themes, or build one on ultracard.io and submit it from there.')}</p>
                    </div>
                  `}
      </div>
    `;
  }

  static override styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }

      /* Themes | My Themes segmented control (matches Presets) */
      .themes-view-switch {
        display: flex;
        gap: 4px;
        padding: 4px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        border-radius: 14px;
        margin-bottom: 16px;
      }
      .themes-view-option {
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
      .themes-view-option ha-icon {
        --mdc-icon-size: 18px;
      }
      .themes-view-option:hover:not(.active) {
        color: var(--primary-text-color);
      }
      .themes-view-option.active {
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-color);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
      }

      .hub-tab-blurb p {
        margin: 0;
      }
      .section-header .header-actions {
        margin-left: auto;
        display: flex;
        gap: 8px;
        flex: none;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .section-header .header-content {
        min-width: 0;
      }
      .section-count {
        margin-left: auto;
        align-self: flex-start;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 9px;
        border-radius: 999px;
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
        color: var(--secondary-text-color);
      }
      .section-empty {
        padding: 18px 4px 6px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .paint-page {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        cursor: pointer;
      }
      .paint-page span {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .paint-page strong {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .paint-page small {
        font-size: 12px;
        line-height: 1.4;
        color: var(--secondary-text-color);
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 10px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        transition: all 0.2s ease;
      }
      .btn ha-icon {
        --mdc-icon-size: 18px;
      }
      .btn:hover:not(:disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      .btn.primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .btn.primary:hover:not(:disabled) {
        color: var(--text-primary-color, #fff);
        filter: brightness(1.1);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .import-box {
        border: 2px solid var(--primary-color);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .import-box h4 {
        margin: 0 0 4px;
        font-size: 15px;
      }
      .import-box p {
        margin: 0 0 10px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      textarea,
      .field select {
        width: 100%;
        box-sizing: border-box;
        font: inherit;
        font-size: 13px;
        color: var(--primary-text-color);
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px 10px;
        outline: none;
      }
      textarea {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        resize: vertical;
      }
      textarea:focus,
      .field select:focus {
        border-color: var(--primary-color);
      }
      .row-end {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 10px;
      }

      /* Toolbar */
      .themes-toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 16px;
      }
      .search-box {
        flex: 1 1 200px;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        background: var(--ha-card-background, var(--card-background-color));
      }
      .search-box ha-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        flex: none;
      }
      .search-box input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        font: inherit;
        font-size: 14px;
        color: var(--primary-text-color);
        padding: 10px 0;
      }
      .search-box:focus-within {
        border-color: var(--primary-color);
      }
      .catalog-sort {
        font: inherit;
        font-size: 13px;
        color: var(--primary-text-color);
        background: var(--ha-card-background, var(--card-background-color));
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 10px 10px;
        outline: none;
        flex: none;
      }
      .catalog-sort:focus {
        border-color: var(--primary-color);
      }
      .themes-toolbar .btn {
        flex: none;
        padding: 9px 14px;
      }

      /* Grid */
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
        margin-top: 16px;
      }
      .theme-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 14px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
        background: var(--ha-card-background, var(--card-background-color));
        transition: border-color 0.2s ease;
        min-width: 0;
      }
      .theme-card:hover {
        border-color: var(--primary-color);
      }
      .theme-card.is-global {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 1px var(--primary-color) inset;
      }
      .theme-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .theme-title {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .theme-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
        flex: none;
      }
      .theme-title .name {
        font-weight: 600;
        font-size: 15px;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .badge {
        flex: none;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
        color: var(--secondary-text-color);
      }
      .badge.official {
        background: rgba(76, 175, 80, 0.15);
        color: var(--success-color, #4caf50);
      }
      .badge.community {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        color: var(--primary-color);
      }
      .badge.local {
        background: rgba(255, 152, 0, 0.15);
        color: var(--warning-color, #ff9800);
      }
      .desc {
        margin: 0;
        font-size: 12px;
        color: var(--secondary-text-color);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .theme-sub {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 10px;
        align-items: center;
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .theme-sub .author {
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .theme-sub ha-icon {
        --mdc-icon-size: 13px;
        vertical-align: -2px;
        margin-right: 2px;
      }
      .global-pill {
        color: var(--primary-color);
        font-weight: 600;
      }
      .theme-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: auto;
        align-items: center;
      }
      a.action-btn {
        text-decoration: none;
      }
      .apply-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        align-items: end;
      }
      .apply-actions {
        grid-column: 1 / -1;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      /* Stars */
      .star-rating {
        display: inline-flex;
        gap: 1px;
        line-height: 0;
      }
      .star-rating ha-icon {
        --mdc-icon-size: var(--star-size, 14px);
        color: #ffb300;
        margin: 0;
      }
      .star-rating ha-icon.empty {
        opacity: 0.3;
      }
      .rating-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        margin-top: 2px;
        padding: 3px 6px 3px 2px;
        border: none;
        border-radius: 8px;
        background: transparent;
        font: inherit;
        font-size: 11px;
        color: var(--secondary-text-color);
        cursor: pointer;
        transition: background 0.15s ease;
      }
      .rating-btn:hover:not(:disabled) {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
      }
      .rating-btn.static {
        cursor: default;
      }
      .rating-btn.mine {
        color: var(--primary-color);
      }
      .rating-inline {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      /* Catalog */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .spin {
        animation: spin 0.9s linear infinite;
      }
      .catalog-loading,
      .catalog-error {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 18px 12px;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .catalog-error {
        color: var(--error-color, #db4437);
        margin-bottom: 8px;
      }
      .catalog-preview {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: 10px;
        background: var(--secondary-background-color);
      }
      .risk-pill {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 1px 6px;
        border-radius: 999px;
        background: rgba(255, 152, 0, 0.15);
        color: var(--warning-color, #ff9800);
        font-weight: 600;
        cursor: help;
      }
      .tag-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .tag {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
        color: var(--secondary-text-color);
      }
      .btn.installed {
        color: var(--success-color, #4caf50);
        border-color: transparent;
        opacity: 1;
        cursor: default;
      }
      .builder-cta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 18px;
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        font-size: 13px;
        color: var(--primary-text-color);
      }
      .builder-cta > ha-icon {
        --mdc-icon-size: 22px;
        color: var(--primary-color);
        flex: none;
      }
      .builder-cta span {
        flex: 1;
        min-width: 0;
        line-height: 1.4;
      }
      .builder-cta .btn {
        flex: none;
      }
      .empty-state .btn,
      .empty-actions {
        margin-top: 14px;
      }
      .empty-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .empty-actions .btn {
        margin-top: 0;
      }

      /* Shared with the catalog */
      .mine-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
      }
      .mine-row {
        display: grid;
        grid-template-columns: 140px minmax(0, 1fr) auto;
        gap: 14px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
        background: var(--ha-card-background, var(--card-background-color));
      }
      .mine-thumb {
        width: 140px;
        aspect-ratio: 16 / 10;
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
        color: var(--secondary-text-color);
      }
      .mine-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .mine-thumb uc-theme-swatch {
        width: 100%;
      }
      .mine-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .mine-actions {
        margin-top: 0;
        justify-content: flex-end;
      }
      .status-pill {
        flex: none;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 7px;
        border-radius: 999px;
        font-weight: 600;
      }
      .status-pill.pending {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
        color: var(--primary-color);
      }
      .status-pill.approved {
        background: rgba(76, 175, 80, 0.15);
        color: var(--success-color, #4caf50);
      }
      .status-pill.changes {
        background: rgba(255, 152, 0, 0.15);
        color: var(--warning-color, #ff9800);
      }
      .status-pill.rejected {
        background: rgba(219, 68, 55, 0.12);
        color: var(--error-color, #db4437);
      }
      .mod-note {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--secondary-text-color);
        display: flex;
        gap: 6px;
        align-items: flex-start;
      }
      .mod-note ha-icon {
        --mdc-icon-size: 14px;
        margin-top: 1px;
      }

      /* Mobile */
      @media (max-width: 700px) {
        .apply-row {
          grid-template-columns: 1fr;
        }
        .themes-toolbar {
          flex-wrap: wrap;
        }
        .search-box {
          flex: 1 1 100%;
        }
        .catalog-sort {
          flex: 1 1 auto;
        }
        .section-header {
          flex-wrap: wrap;
        }
        .section-header .header-actions {
          flex: 1 1 100%;
          margin-left: 0;
          justify-content: flex-start;
        }
        .section-header .header-actions .btn {
          flex: 1 1 auto;
          justify-content: center;
        }
        .builder-cta {
          flex-wrap: wrap;
        }
        .builder-cta span {
          flex: 1 1 100%;
        }
        .builder-cta .btn {
          flex: 1 1 100%;
          justify-content: center;
        }
      }
      @media (max-width: 600px) {
        .theme-grid {
          grid-template-columns: 1fr;
        }
        .mine-row {
          grid-template-columns: 96px minmax(0, 1fr);
          align-items: start;
        }
        .mine-thumb {
          width: 96px;
        }
        .mine-actions {
          grid-column: 1 / -1;
          justify-content: flex-start;
        }
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'hub-themes-tab': HubThemesTab;
  }
}
