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

type LibraryFilter = 'all' | 'builtin' | 'local' | 'official' | 'community';
type CatalogFilter = 'all' | 'official' | 'community';

function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

@customElement('hub-themes-tab')
export class HubThemesTab extends LitElement {
  @property({ attribute: false }) public hass: any;

  @state() private _tick = 0;
  @state() private _filter: LibraryFilter = 'all';
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
  @state() private _catalogFilter: CatalogFilter = 'all';
  @state() private _catalogSearch = '';
  @state() private _catalogSort: UcThemeCatalogSort = 'downloads';
  @state() private _installing = new Set<number>();

  // Authoring
  @state() private _cloudUser: CloudUser | null = null;
  @state() private _showLogin = false;
  @state() private _share: UcThemeDefinition | null = null;
  @state() private _editSubmission: AuthorTheme | null = null;
  @state() private _mine: AuthorTheme[] = [];
  @state() private _mineLoading = false;
  @state() private _mineError = '';
  @state() private _mineOpen = false;

  private _unsub: (() => void) | null = null;
  private _authListener: ((user: CloudUser | null) => void) | null = null;
  private _toastTimer: ReturnType<typeof setTimeout> | undefined;
  private _searchTimer: ReturnType<typeof setTimeout> | undefined;

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
        if (this._mineOpen) void this._loadMine();
      } else {
        this._mine = [];
        this._mineError = '';
      }
    };
    ucCloudAuthService.addListener(this._authListener);
    void this._loadDashboards();
    void this._loadCatalog();
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
    if (this._searchTimer) clearTimeout(this._searchTimer);
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('hass') && this.hass && !this._dashboards.length) {
      void this._loadDashboards();
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
      const page = await ucThemesCatalogService.fetchThemes({
        search: this._catalogSearch.trim() || undefined,
        orderby: this._catalogSort,
        per_page: 60,
      });
      this._catalog = page.themes;
    } catch (err) {
      this._catalog = [];
      this._catalogError = err instanceof Error ? err.message : String(err);
    } finally {
      this._catalogLoading = false;
    }
  }

  private _onCatalogSearch(value: string): void {
    this._catalogSearch = value;
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => void this._loadCatalog(), 350);
  }

  private _visibleCatalog(): UcCatalogTheme[] {
    if (this._catalogFilter === 'all') return this._catalog;
    return this._catalog.filter(t => t.source === this._catalogFilter);
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

  // -------------------------------------------------------------- authoring

  private _openShare(theme: UcThemeDefinition): void {
    if (!ucCloudAuthService.isAuthenticated()) {
      this._showLogin = true;
      return;
    }
    this._share = theme;
  }

  private async _toggleMine(): Promise<void> {
    this._mineOpen = !this._mineOpen;
    if (this._mineOpen) {
      if (!ucCloudAuthService.isAuthenticated()) {
        this._showLogin = true;
        return;
      }
      await this._loadMine();
    }
  }

  private async _loadMine(): Promise<void> {
    if (!ucCloudAuthService.isAuthenticated()) return;
    this._mineLoading = true;
    this._mineError = '';
    try {
      this._mine = await ucThemeAuthorService.listMine();
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

  private _visibleThemes(): UcThemeDefinition[] {
    const all = ucThemeService.getAllThemes();
    if (this._filter === 'all') return all;
    return all.filter(t => (t.source ?? 'builtin') === this._filter);
  }

  private _filterCounts(): Record<LibraryFilter, number> {
    const counts: Record<LibraryFilter, number> = { all: 0, builtin: 0, local: 0, official: 0, community: 0 };
    for (const t of ucThemeService.getAllThemes()) {
      counts.all++;
      counts[(t.source ?? 'builtin') as UcThemeSource]++;
    }
    return counts;
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
    const globalId = ucThemeService.getGlobalDefaultId() ?? UC_THEME_HA_NATIVE;
    return html`
      <div class="hub-tab-blurb" data-tick=${this._tick}>
        <ha-icon icon="mdi:palette-swatch"></ha-icon>
        <span>${this._t('blurb', 'Themes set the look of every Ultra Card at once.')}</span>
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

      ${this._renderLibrary(globalId)}
      ${this._renderCatalog()}
      ${this._renderMine()}
      ${this._renderApply()}

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
              this._mineOpen = true;
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

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
    `;
  }

  private _renderCatalog(): TemplateResult {
    const filters: { key: CatalogFilter; label: string; icon: string }[] = [
      { key: 'all', label: this._t('filter_all', 'All'), icon: 'mdi:view-grid' },
      { key: 'official', label: this._t('filter_official', 'Official'), icon: 'mdi:check-decagram' },
      { key: 'community', label: this._t('filter_community', 'Community'), icon: 'mdi:account-group' },
    ];
    const counts: Record<CatalogFilter, number> = {
      all: this._catalog.length,
      official: this._catalog.filter(t => t.source === 'official').length,
      community: this._catalog.filter(t => t.source === 'community').length,
    };
    const visible = this._visibleCatalog();

    return html`
      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:cloud-download-outline"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('catalog_title', 'Theme catalog')}</h3>
            <p>${this._t('catalog_desc', 'Official and community themes from ultracard.io. Installing copies a theme into your library; nothing changes until you pick it.')}</p>
          </div>
          <div class="header-actions">
            <button class="btn ghost" ?disabled=${this._catalogLoading} @click=${() => void this._loadCatalog(true)}>
              <ha-icon icon=${this._catalogLoading ? 'mdi:loading' : 'mdi:refresh'} class=${this._catalogLoading ? 'spin' : ''}></ha-icon>
              ${this._t('catalog_refresh', 'Refresh')}
            </button>
          </div>
        </div>

        <div class="catalog-toolbar">
          <div class="filter-row">
            ${filters.map(
              f => html`
                <button
                  class="filter-chip ${this._catalogFilter === f.key ? 'active' : ''}"
                  @click=${() => (this._catalogFilter = f.key)}
                >
                  <ha-icon icon=${f.icon}></ha-icon>${f.label}
                  <span class="chip-count">${counts[f.key]}</span>
                </button>
              `
            )}
          </div>
          <div class="catalog-controls">
            <input
              type="search"
              class="catalog-search"
              placeholder=${this._t('catalog_search', 'Search themes…')}
              .value=${this._catalogSearch}
              @input=${(e: Event) => this._onCatalogSearch((e.target as HTMLInputElement).value)}
            />
            <select
              class="catalog-sort"
              .value=${this._catalogSort}
              @change=${(e: Event) => {
                this._catalogSort = (e.target as HTMLSelectElement).value as UcThemeCatalogSort;
                void this._loadCatalog();
              }}
            >
              <option value="downloads" ?selected=${this._catalogSort === 'downloads'}>${this._t('sort_downloads', 'Most installed')}</option>
              <option value="date" ?selected=${this._catalogSort === 'date'}>${this._t('sort_date', 'Newest')}</option>
              <option value="title" ?selected=${this._catalogSort === 'title'}>${this._t('sort_title', 'Name')}</option>
            </select>
          </div>
        </div>

        ${this._catalogError
          ? html`<div class="catalog-error">
              <ha-icon icon="mdi:cloud-off-outline"></ha-icon>
              <span>${this._t('catalog_error', 'Could not reach ultracard.io')}: ${this._catalogError}</span>
            </div>`
          : nothing}
        ${this._catalogLoading && !this._catalog.length
          ? html`<div class="catalog-loading"><ha-icon icon="mdi:loading" class="spin"></ha-icon>${this._t('catalog_loading', 'Loading catalog…')}</div>`
          : visible.length
            ? html`<div class="theme-grid">${visible.map(t => this._renderCatalogCard(t))}</div>`
            : !this._catalogError
              ? html`
                  <div class="empty-state">
                    <div class="empty-state-icon"><ha-icon icon="mdi:palette-swatch-outline"></ha-icon></div>
                    <h3>${this._t('catalog_empty_title', 'No themes yet')}</h3>
                    <p>${this._t('catalog_empty', 'Be the first: create a theme in your library and share it.')}</p>
                  </div>
                `
              : nothing}
      </div>
    `;
  }

  private _renderCatalogCard(entry: UcCatalogTheme): TemplateResult {
    const state = ucThemesCatalogService.installState(entry);
    const busy = this._installing.has(entry.id);
    const risks = scanThemeForRisks(entry.definition);
    return html`
      <div class="theme-card catalog-card">
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
            <span>${entry.author}</span>
            <span title=${this._t('downloads', 'Installs')}><ha-icon icon="mdi:download"></ha-icon>${entry.downloads}</span>
            <span>v${entry.version}</span>
            ${risks.css
              ? html`<span class="risk-pill" title=${describeThemeRisks(risks).join('\n')}>
                  <ha-icon icon="mdi:code-braces"></ha-icon>CSS
                </span>`
              : nothing}
          </div>
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
        </div>
      </div>
    `;
  }

  private _renderMine(): TemplateResult {
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
        <div class="section-header clickable" @click=${this._toggleMine}>
          <div class="header-icon"><ha-icon icon="mdi:account-edit-outline"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('mine_title', 'My submissions')}</h3>
            <p>${this._t('mine_desc', 'Themes you shared with the catalog, and where they are in review.')}</p>
          </div>
          <div class="header-actions">
            <ha-icon icon=${this._mineOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}></ha-icon>
          </div>
        </div>
        ${!this._mineOpen
          ? nothing
          : !this._cloudUser
            ? html`
                <div class="empty-state">
                  <div class="empty-state-icon"><ha-icon icon="mdi:account-lock-outline"></ha-icon></div>
                  <h3>${this._t('mine_login_title', 'Sign in to manage your themes')}</h3>
                  <p>${this._t('mine_login_desc', 'Sharing and editing catalog themes goes through Ultra Card Connect.')}</p>
                  <button class="btn primary" @click=${() => (this._showLogin = true)}>
                    <ha-icon icon="mdi:login"></ha-icon>${this._t('sign_in', 'Sign in')}
                  </button>
                </div>
              `
            : this._mineLoading
              ? html`<div class="catalog-loading"><ha-icon icon="mdi:loading" class="spin"></ha-icon>${this._t('mine_loading', 'Loading your themes…')}</div>`
              : this._mineError
                ? html`<div class="catalog-error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${this._mineError}</span></div>`
                : this._mine.length
                  ? html`
                      <div class="mine-list">
                        ${this._mine.map(item => {
                          const status = statusLabel(item);
                          return html`
                            <div class="mine-row">
                              <uc-theme-swatch .theme=${item.definition}></uc-theme-swatch>
                              <div class="mine-meta">
                                <div class="theme-title">
                                  <span class="name">${item.name}</span>
                                  <span class="status-pill ${status.cls}">${status.text}</span>
                                </div>
                                <div class="theme-sub">
                                  <span><ha-icon icon="mdi:download"></ha-icon>${item.downloads}</span>
                                  <span>v${item.version}</span>
                                  ${item.submitted_at ? html`<span>${item.submitted_at.slice(0, 10)}</span>` : nothing}
                                </div>
                                ${item.moderator_note
                                  ? html`<p class="mod-note"><ha-icon icon="mdi:message-text-outline"></ha-icon>${item.moderator_note}</p>`
                                  : nothing}
                              </div>
                              <div class="theme-actions">
                                <button class="action-btn" title=${this._t('edit', 'Edit')} @click=${() => (this._editSubmission = item)}>
                                  <ha-icon icon="mdi:pencil"></ha-icon>
                                </button>
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
                        <p>${this._t('mine_empty', 'Use the share button on one of your library themes to submit it.')}</p>
                      </div>
                    `}
      </div>
    `;
  }

  private _renderLibrary(globalId: string): TemplateResult {
    const counts = this._filterCounts();
    const filters: { key: LibraryFilter; label: string; icon: string }[] = [
      { key: 'all', label: this._t('filter_all', 'All'), icon: 'mdi:view-grid' },
      { key: 'builtin', label: this._t('filter_builtin', 'Built-in'), icon: 'mdi:package-variant' },
      { key: 'local', label: this._t('filter_local', 'Mine'), icon: 'mdi:account' },
      { key: 'official', label: this._t('filter_official', 'Official'), icon: 'mdi:check-decagram' },
      { key: 'community', label: this._t('filter_community', 'Community'), icon: 'mdi:account-group' },
    ];
    const themes = this._visibleThemes();
    const haThemes = listHaThemes(this.hass);
    const haSelected = haThemes.find(t => t.name === this._haImportName);

    return html`
      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:palette-swatch"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('library_title', 'Theme library')}</h3>
            <p>${this._t('library_desc', 'Built-in themes plus the ones you created, imported or installed.')}</p>
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
                <p>${this._t('import_desc', 'Paste a theme JSON exported from Ultra Card or shared by the community.')}</p>
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

        <div class="filter-row">
          ${filters
            .filter(f => f.key === 'all' || f.key === 'builtin' || f.key === 'local' || counts[f.key] > 0)
            .map(
              f => html`
                <button
                  class="filter-chip ${this._filter === f.key ? 'active' : ''}"
                  @click=${() => (this._filter = f.key)}
                >
                  <ha-icon icon=${f.icon}></ha-icon>${f.label}
                  <span class="chip-count">${counts[f.key]}</span>
                </button>
              `
            )}
        </div>

        ${themes.length
          ? html`<div class="theme-grid">${themes.map(t => this._renderThemeCard(t, t.id === globalId))}</div>`
          : html`
              <div class="empty-state">
                <div class="empty-state-icon"><ha-icon icon="mdi:palette-swatch-outline"></ha-icon></div>
                <h3>${this._t('filter_local', 'Mine')}</h3>
                <p>${this._t('library_desc', '')}</p>
              </div>
            `}
      </div>
    `;
  }

  private _renderThemeCard(theme: UcThemeDefinition, isGlobal: boolean): TemplateResult {
    const builtin = ucThemeService.isBuiltin(theme.id);
    const source = theme.source ?? 'builtin';
    return html`
      <div class="theme-card ${isGlobal ? 'is-global' : ''}">
        <uc-theme-swatch .theme=${theme.id === UC_THEME_HA_NATIVE ? null : theme}></uc-theme-swatch>
        <div class="theme-meta">
          <div class="theme-title">
            <ha-icon icon=${theme.icon ?? 'mdi:palette'}></ha-icon>
            <span class="name">${theme.name}</span>
            <span class="badge ${source}">${source}</span>
          </div>
          ${theme.description ? html`<p class="desc">${theme.description}</p>` : nothing}
          <div class="theme-sub">
            ${theme.author ? html`<span>${theme.author}</span>` : nothing}
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
                  ${d.title}${d.mode === 'yaml' ? ` · ${this._t('yaml_mode', 'YAML mode (read-only)')}` : ''}
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

  static override styles = [
    panelStyles,
    css`
      :host {
        display: block;
        animation: fadeSlideIn 0.3s ease-out;
      }
      .header-actions {
        margin-left: auto;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: flex-end;
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
      .chip-count {
        opacity: 0.7;
        font-size: 11px;
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
      }
      .theme-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--primary-color);
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
      }
      .theme-sub {
        display: flex;
        gap: 10px;
        align-items: center;
        font-size: 11px;
        color: var(--secondary-text-color);
      }
      .global-pill {
        color: var(--primary-color);
        font-weight: 600;
      }
      .theme-actions {
        display: flex;
        gap: 6px;
        margin-top: auto;
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
      @media (max-width: 700px) {
        .apply-row {
          grid-template-columns: 1fr;
        }
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
      .catalog-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 16px;
        align-items: center;
        justify-content: space-between;
      }
      .catalog-controls {
        display: flex;
        gap: 8px;
        flex: 1 1 260px;
        justify-content: flex-end;
      }
      .catalog-search,
      .catalog-sort {
        font: inherit;
        font-size: 13px;
        color: var(--primary-text-color);
        background: var(--primary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 8px 10px;
        outline: none;
      }
      .catalog-search {
        flex: 1 1 160px;
        min-width: 0;
      }
      .catalog-search:focus,
      .catalog-sort:focus {
        border-color: var(--primary-color);
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
      }
      .catalog-preview {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: 10px;
        background: var(--secondary-background-color);
      }
      .theme-sub ha-icon {
        --mdc-icon-size: 13px;
        vertical-align: -2px;
        margin-right: 2px;
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

      /* My submissions */
      .section-header.clickable {
        cursor: pointer;
        user-select: none;
      }
      .section-header.clickable .header-actions ha-icon {
        color: var(--secondary-text-color);
      }
      .mine-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
      }
      .mine-row {
        display: grid;
        grid-template-columns: 140px 1fr auto;
        gap: 14px;
        align-items: center;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.1));
        background: var(--ha-card-background, var(--card-background-color));
      }
      .mine-row uc-theme-swatch {
        width: 140px;
      }
      .mine-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .mine-row .theme-actions {
        margin-top: 0;
      }
      .status-pill {
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
      @media (max-width: 600px) {
        .mine-row {
          grid-template-columns: 1fr;
        }
        .mine-row uc-theme-swatch {
          width: 100%;
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
