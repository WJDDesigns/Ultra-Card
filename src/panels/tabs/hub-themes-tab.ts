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
import { copyTextToClipboard } from '../../utils/uc-clipboard';
import type { UcThemeDefinition, UcThemeSource } from '../../themes/uc-theme-types';
import { UC_THEME_HA_NATIVE } from '../../themes/uc-theme-types';
import '../../components/uc-theme-picker';
import '../../components/uc-theme-swatch';
import '../../components/uc-theme-editor-dialog';

type LibraryFilter = 'all' | 'builtin' | 'local' | 'official' | 'community';

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
  @state() private _dashboards: UcDashboardRef[] = [];
  @state() private _applyDashboard = '';
  @state() private _applyTheme = '';
  @state() private _applying = false;

  private _unsub: (() => void) | null = null;
  private _toastTimer: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this._unsub = ucThemeService.subscribe(() => {
      this._tick++;
    });
    void this._loadDashboards();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._unsub = null;
    if (this._toastTimer) clearTimeout(this._toastTimer);
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
      </div>

      ${this._renderLibrary(globalId)}
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

      <div class="toast ${this._toastMsg ? 'show' : ''}">${this._toastMsg}</div>
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

    return html`
      <div class="hub-section">
        <div class="section-header">
          <div class="header-icon"><ha-icon icon="mdi:palette-swatch"></ha-icon></div>
          <div class="header-content">
            <h3>${this._t('library_title', 'Theme library')}</h3>
            <p>${this._t('library_desc', 'Built-in themes plus the ones you created, imported or installed.')}</p>
          </div>
          <div class="header-actions">
            <button class="btn ghost" @click=${() => (this._importOpen = !this._importOpen)}>
              <ha-icon icon="mdi:import"></ha-icon>${this._t('import', 'Import JSON')}
            </button>
            <button class="btn primary" @click=${() => (this._editor = { theme: null, asCopy: false })}>
              <ha-icon icon="mdi:plus"></ha-icon>${this._t('new_theme', 'New theme')}
            </button>
          </div>
        </div>

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
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    'hub-themes-tab': HubThemesTab;
  }
}
