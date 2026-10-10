import { TemplateResult, html, nothing } from 'lit';
import type { HomeAssistant } from '../ha/types';
import type { ModuleMetadata } from './base-module';
import { UltraVerticalModule } from './vertical-module';
import type { CardModule, LinkedRowModule, UltraCardConfig, VerticalModule } from '../types';
import { getModuleRegistry } from './module-registry';
import { localize } from '../localize/localize';
import { hasProAccess, renderProLockUI } from '../utils/uc-pro-access';
import { collectConfigEntityIds } from '../utils/uc-config-entity-ids';
import { forEachNestedChildModules } from '../utils/uc-layout-module-types';
import {
  LINKED_ROWS_MIN_CONNECT_VERSION,
  linkedModulesKey,
  newLinkedRowId,
  resolveLinkedRowModules,
  ucLinkedRowService,
  type LinkedRowRecord,
  type LinkedRowSummary,
} from '../services/uc-linked-row-service';

const PATCH_EVENT = 'uc-module-patch-by-id';

type PreviewContext = 'live' | 'ha-preview' | 'dashboard' | undefined;

interface LinkedRowEditorState {
  library: LinkedRowSummary[] | null;
  libraryLoading: boolean;
  newName: string;
  busy: boolean;
  error: string;
}

/**
 * Linked Row (Pro): a vertical container whose modules are shared through
 * Ultra Card Connect. Edit it once and every dashboard, device and user that
 * shows the same shared row updates.
 *
 * The card config keeps a local copy of the modules plus the shared row's id
 * and the revision that copy was synced at. Dashboards render the shared copy
 * when it is at a later revision and the local copy otherwise, so a missing,
 * old or offline Connect never leaves the row blank. Saved edits are shared by
 * the dashboard render that follows the save (admins only); a save based on an
 * old revision is refused by Connect and offered as "load the newer copy" in
 * the editor.
 */
export class UltraLinkedRowModule extends UltraVerticalModule {
  override metadata: ModuleMetadata = {
    type: 'linked_row',
    title: 'Linked Row',
    description: 'A shared block of modules: edit it once and it updates on every dashboard',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:link-box-variant-outline',
    category: 'layout',
    tags: ['pro', 'premium', 'layout', 'container', 'shared', 'linked', 'sync', 'reuse'],
  };

  private _editorState = new Map<string, LinkedRowEditorState>();
  private _adopted = new Set<string>();
  private _unsubscribe: (() => void) | null = null;

  // Typed as the parent's return type (TypeScript cannot narrow an override's
  // literal `type`); the object is a LinkedRowModule.
  override createDefault(id?: string, hass?: HomeAssistant): VerticalModule {
    const base = super.createDefault(id, hass);
    const linked: LinkedRowModule = {
      ...base,
      id: id || this.generateId('linked_row'),
      type: 'linked_row',
      linked_id: '',
      linked_name: '',
    };
    return linked as unknown as VerticalModule;
  }

  /** Lenient: an unlinked or empty row is a valid (if empty) container. */
  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  /** Entities of a shared copy are not in this card's config; report them. */
  override getRuntimeEntityIds(module: CardModule): string[] {
    const m = module as LinkedRowModule;
    const resolved = resolveLinkedRowModules(m, ucLinkedRowService.getCached(m.linked_id));
    if (resolved.source !== 'shared') return [];
    const { ids } = collectConfigEntityIds({
      type: 'custom:ultra-card',
      layout: { rows: [{ id: 'linked', columns: [{ id: 'linked', modules: resolved.modules }] }] },
    } as unknown as UltraCardConfig);
    return [...ids];
  }

  private _subscribe(): void {
    if (this._unsubscribe) return;
    this._unsubscribe = ucLinkedRowService.subscribe(() => this.triggerPreviewUpdate());
  }

  private _state(id: string): LinkedRowEditorState {
    let s = this._editorState.get(id);
    if (!s) {
      s = { library: null, libraryLoading: false, newName: '', busy: false, error: '' };
      this._editorState.set(id, s);
    }
    return s;
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  override renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    previewContext?: PreviewContext
  ): TemplateResult {
    const m = module as LinkedRowModule;
    const lang = hass?.locale?.language || 'en';
    const isEditor =
      previewContext === 'live' ||
      previewContext === 'ha-preview' ||
      !!(config as { __ucIsEditorPreview?: boolean } | undefined)?.__ucIsEditorPreview;

    let modules = Array.isArray(m.modules) ? m.modules : [];
    let banner: TemplateResult | typeof nothing = nothing;

    if (m.linked_id && hasProAccess(hass)) {
      this._subscribe();
      ucLinkedRowService.ensureFresh(hass, m.linked_id);
      const shared = ucLinkedRowService.getCached(m.linked_id);
      const resolved = resolveLinkedRowModules(m, shared, { editor: isEditor });
      modules = resolved.modules;

      if (isEditor && shared) {
        const sameContent = linkedModulesKey(m.modules) === linkedModulesKey(shared.modules);
        if (resolved.sharedIsNewer && sameContent) {
          // Our own saved edit was shared after the save; catch the config up.
          this._adoptRevision(m, shared);
        } else if (
          (resolved.sharedIsNewer && !sameContent) ||
          ucLinkedRowService.getConflict(m.linked_id)
        ) {
          banner = this._renderBanner(
            localize(
              'editor.linked_row.preview_newer',
              lang,
              'This shared row was changed somewhere else. Open its General tab to load the newer copy.'
            )
          );
        }
      } else if (!isEditor) {
        ucLinkedRowService.autoPush(hass, m);
      }

      if (resolved.source === 'shared') this._ensureTypesLoaded(modules);
    }

    if (modules.length === 0) {
      return this._renderEmptyHint(m, lang);
    }

    const content = super.renderPreview(
      { ...m, modules } as CardModule,
      hass,
      config,
      previewContext
    );
    return banner === nothing ? content : html`${banner}${content}`;
  }

  private _adoptRevision(m: LinkedRowModule, shared: LinkedRowRecord): void {
    const key = `${m.id}:${shared.id}:${shared.revision}`;
    if (this._adopted.has(key)) return;
    this._adopted.add(key);
    this._patch(m.id, {
      linked_revision: shared.revision,
      linked_updated_at: shared.updated_at,
      linked_name: shared.name,
    });
  }

  private _patch(moduleId: string, updates: Partial<LinkedRowModule>): void {
    if (typeof window === 'undefined') return;
    queueMicrotask(() => {
      window.dispatchEvent(
        new CustomEvent(PATCH_EVENT, {
          bubbles: true,
          composed: true,
          detail: { moduleId, updates },
        })
      );
    });
  }

  /** A shared copy can contain module types this card has not loaded yet. */
  private _ensureTypesLoaded(modules: CardModule[]): void {
    const registry = getModuleRegistry();
    const visit = (list: CardModule[]): void => {
      for (const child of list) {
        if (!child?.type) continue;
        if (!registry.isModuleLoaded(child.type) && registry.canLoadModule(child.type)) {
          registry
            .ensureModuleLoaded(child.type)
            .then(() => this.triggerPreviewUpdate())
            .catch(() => undefined);
        }
        forEachNestedChildModules(child, visit);
      }
    };
    visit(modules);
  }

  private _renderBanner(text: string): TemplateResult {
    return html`
      <div
        role="status"
        style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; margin-bottom: 8px; border-radius: 8px; font-size: 12px; color: var(--primary-text-color); background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15);"
      >
        <ha-icon icon="mdi:sync-alert" style="--mdc-icon-size: 18px; color: var(--warning-color, #ff9800);"></ha-icon>
        <span>${text}</span>
      </div>
    `;
  }

  private _renderEmptyHint(m: LinkedRowModule, lang: string): TemplateResult {
    const title = m.linked_id
      ? localize('editor.linked_row.empty_linked_title', lang, 'This shared row is empty')
      : localize('editor.linked_row.empty_title', lang, 'Linked Row');
    const desc = localize(
      'editor.linked_row.empty_desc',
      lang,
      'Add modules to this container, then share it from the General tab, or pick a shared row there.'
    );
    return html`
      <div
        class="uc-linked-row-empty"
        style="display: flex; align-items: center; gap: 12px; padding: 16px; border: 1px dashed var(--divider-color); border-radius: 12px; background: var(--secondary-background-color, transparent);"
      >
        <ha-icon
          icon="mdi:link-box-variant-outline"
          style="--mdc-icon-size: 28px; color: var(--primary-color); flex-shrink: 0;"
        ></ha-icon>
        <div style="min-width: 0;">
          <div style="font-weight: 600; color: var(--primary-text-color);">${title}</div>
          <div style="font-size: 12px; color: var(--secondary-text-color); line-height: 1.4;">
            ${desc}
          </div>
        </div>
      </div>
    `;
  }

  // ── General tab ────────────────────────────────────────────────────────────

  override renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as LinkedRowModule;
    const lang = hass?.locale?.language || 'en';

    if (!hasProAccess(hass)) {
      return renderProLockUI(
        lang,
        localize(
          'editor.linked_row.pro_description',
          lang,
          'Linked Row is a Pro feature: build a row of modules once, show it on any dashboard, and edit it in one place to update every copy.'
        ),
        hass
      );
    }

    this._subscribe();
    return html`
      ${this.injectUcFormStyles()}
      <style>
        ${this._editorStyles()}
      </style>
      <div class="module-general-settings">
        ${this._renderLinkSection(m, hass, updateModule, lang)}
      </div>
      ${super.renderGeneralTab(module, hass, config, updateModule)}
    `;
  }

  private _renderLinkSection(
    m: LinkedRowModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const availability = ucLinkedRowService.availability(hass);
    const title = localize('editor.linked_row.section_title', lang, 'Linked Row');

    if (availability !== 'available') {
      const note =
        availability === 'missing'
          ? localize(
              'editor.linked_row.connect_missing',
              lang,
              'Shared rows are stored by Ultra Card Connect. Install Connect {version} or newer to share this row. Until then it works like a normal container.'
            )
          : localize(
              'editor.linked_row.connect_outdated',
              lang,
              'Update Ultra Card Connect to {version} or newer to share this row. Until then it shows the copy saved in this card.'
            );
      return html`
        <div class="settings-section">
          <div class="section-title">${title}</div>
          <div class="uc-lr-note warn">
            ${note.replace('{version}', LINKED_ROWS_MIN_CONNECT_VERSION)}
          </div>
        </div>
      `;
    }

    return m.linked_id
      ? this._renderLinked(m, hass, updateModule, lang, title)
      : this._renderUnlinked(m, hass, updateModule, lang, title);
  }

  private _renderUnlinked(
    m: LinkedRowModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    title: string
  ): TemplateResult {
    const state = this._state(m.id);
    if (state.library === null && !state.libraryLoading) {
      state.libraryLoading = true;
      void ucLinkedRowService.listRows(hass).then(rows => {
        state.library = rows ?? [];
        state.libraryLoading = false;
        this.triggerPreviewUpdate();
      });
    }
    const library = state.library ?? [];
    const hasLocal = (m.modules || []).length > 0;

    return html`
      <div class="settings-section">
        <div class="section-title">${title}</div>
        <div class="uc-lr-note">
          ${localize(
            'editor.linked_row.intro',
            lang,
            'Build a row once and show it on any dashboard. Edit it in one place and every copy updates.'
          )}
        </div>

        ${library.length > 0
          ? this.renderFieldSection(
              localize('editor.linked_row.pick_existing', lang, 'Use a shared row'),
              hasLocal
                ? localize(
                    'editor.linked_row.pick_existing_replace',
                    lang,
                    'Replaces the modules in this container with the shared ones.'
                  )
                : localize(
                    'editor.linked_row.pick_existing_desc',
                    lang,
                    'Pick a row you already shared from another card.'
                  ),
              hass,
              { linked_pick: '' },
              [
                this.selectField('linked_pick', [
                  {
                    value: '',
                    label: localize('editor.linked_row.pick_placeholder', lang, 'Choose a shared row'),
                  },
                  ...library.map(row => ({
                    value: row.id,
                    label: `${row.name} (${row.module_count})`,
                  })),
                ]),
              ],
              (e: CustomEvent) => {
                const id = e.detail.value?.linked_pick;
                if (typeof id === 'string' && id) void this._linkExisting(m, id, hass, updateModule);
              }
            )
          : html`<div class="uc-lr-note subtle">
              ${state.libraryLoading
                ? localize('editor.linked_row.library_loading', lang, 'Loading shared rows…')
                : localize(
                    'editor.linked_row.library_empty',
                    lang,
                    'No shared rows yet. Create the first one below.'
                  )}
            </div>`}

        ${this.renderFieldSection(
          localize('editor.linked_row.create_title', lang, 'Create a shared row from these modules'),
          localize(
            'editor.linked_row.create_desc',
            lang,
            'Give it a name you will recognize when adding it to another card.'
          ),
          hass,
          { linked_new_name: state.newName },
          [this.textField('linked_new_name')],
          (e: CustomEvent) => {
            state.newName = String(e.detail.value?.linked_new_name ?? '');
          }
        )}
        <button
          class="uc-lr-btn primary"
          type="button"
          ?disabled=${state.busy}
          @click=${() => void this._createShared(m, hass, updateModule, lang)}
        >
          <ha-icon icon="mdi:link-plus"></ha-icon>
          ${localize('editor.linked_row.create_button', lang, 'Create shared row')}
        </button>
        ${state.error ? html`<div class="uc-lr-note warn">${state.error}</div>` : nothing}
      </div>
    `;
  }

  private _renderLinked(
    m: LinkedRowModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    title: string
  ): TemplateResult {
    const id = m.linked_id || '';
    const state = this._state(m.id);
    ucLinkedRowService.ensureFresh(hass, id);
    const shared = ucLinkedRowService.getCached(id);
    const conflict = ucLinkedRowService.getConflict(id);
    const absent = ucLinkedRowService.isAbsent(id);
    const resolved = resolveLinkedRowModules(m, shared, { editor: true });
    const sameContent = !!shared && linkedModulesKey(m.modules) === linkedModulesKey(shared.modules);
    const newer = conflict ?? (resolved.sharedIsNewer && !sameContent ? shared : undefined);

    const name = m.linked_name || shared?.name || id;
    const revision = shared && sameContent ? shared.revision : (m.linked_revision ?? 0);
    const updatedAt = (shared && sameContent ? shared.updated_at : m.linked_updated_at) || '';

    let status: TemplateResult;
    if (absent) {
      status = html`
        <div class="uc-lr-note warn">
          ${localize(
            'editor.linked_row.absent',
            lang,
            'This shared row is no longer in the library. Share it again, or unlink to keep it as a normal container.'
          )}
        </div>
        <button
          class="uc-lr-btn primary"
          type="button"
          ?disabled=${state.busy}
          @click=${() => void this._share(m, hass, updateModule, lang, false)}
        >
          <ha-icon icon="mdi:cloud-upload-outline"></ha-icon>
          ${localize('editor.linked_row.share_again', lang, 'Share it again')}
        </button>
      `;
    } else if (newer) {
      status = html`
        <div class="uc-lr-note warn">
          ${localize(
            'editor.linked_row.conflict',
            lang,
            'This shared row was changed somewhere else (revision {revision}). Load the newer copy, or keep yours and overwrite it.'
          ).replace('{revision}', String(newer.revision))}
        </div>
        <div class="uc-lr-actions">
          <button
            class="uc-lr-btn primary"
            type="button"
            ?disabled=${state.busy}
            @click=${() => this._loadShared(m, newer, updateModule)}
          >
            <ha-icon icon="mdi:cloud-download-outline"></ha-icon>
            ${localize('editor.linked_row.load_newer', lang, 'Load the newer copy')}
          </button>
          <button
            class="uc-lr-btn"
            type="button"
            ?disabled=${state.busy}
            @click=${() => void this._share(m, hass, updateModule, lang, true)}
          >
            <ha-icon icon="mdi:cloud-upload-outline"></ha-icon>
            ${localize('editor.linked_row.overwrite', lang, 'Keep mine and overwrite')}
          </button>
        </div>
      `;
    } else if (!shared) {
      status = html`
        <div class="uc-lr-note subtle">
          ${localize(
            'editor.linked_row.checking',
            lang,
            'Checking the shared copy… If Ultra Card Connect is offline, this card keeps showing its saved copy.'
          )}
        </div>
      `;
    } else if (resolved.localIsAhead) {
      status = html`
        <div class="uc-lr-note">
          ${localize(
            'editor.linked_row.local_ahead',
            lang,
            'You changed this row. Saving the card shares the change with every card that uses it.'
          )}
        </div>
        <button
          class="uc-lr-btn"
          type="button"
          ?disabled=${state.busy}
          @click=${() => void this._share(m, hass, updateModule, lang, false)}
        >
          <ha-icon icon="mdi:cloud-upload-outline"></ha-icon>
          ${localize('editor.linked_row.share_now', lang, 'Share now')}
        </button>
      `;
    } else {
      status = html`
        <div class="uc-lr-note ok">
          ${localize(
            'editor.linked_row.in_sync',
            lang,
            'Up to date. Edits you save here update every card that uses this row.'
          )}
        </div>
      `;
    }

    return html`
      <div class="settings-section">
        <div class="section-title">${title}</div>
        <div class="uc-lr-linked" data-uc-role="pane">
          <ha-icon icon="mdi:link-variant"></ha-icon>
          <div class="uc-lr-linked-text">
            <div class="uc-lr-linked-name">${name}</div>
            <div class="uc-lr-linked-meta">
              ${localize('editor.linked_row.revision', lang, 'Revision {revision}').replace(
                '{revision}',
                String(revision)
              )}${updatedAt ? html` · ${this._formatDate(updatedAt, lang)}` : nothing}
            </div>
          </div>
        </div>
        ${status}
        ${state.error ? html`<div class="uc-lr-note warn">${state.error}</div>` : nothing}
        <button
          class="uc-lr-btn subtle"
          type="button"
          ?disabled=${state.busy}
          @click=${() => this._unlink(m, updateModule)}
        >
          <ha-icon icon="mdi:link-off"></ha-icon>
          ${localize('editor.linked_row.unlink', lang, 'Unlink (keep a normal copy)')}
        </button>
      </div>
    `;
  }

  // ── Editor actions ─────────────────────────────────────────────────────────

  private async _linkExisting(
    m: LinkedRowModule,
    id: string,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): Promise<void> {
    const state = this._state(m.id);
    state.busy = true;
    state.error = '';
    this.triggerPreviewUpdate();
    const row = await ucLinkedRowService.fetchRow(hass, id);
    state.busy = false;
    if (row) {
      this._loadShared(m, row, updateModule);
    } else {
      state.error = localize(
        'editor.linked_row.load_failed',
        hass?.locale?.language || 'en',
        'Could not load that shared row. Check that Ultra Card Connect is running.'
      );
    }
    this.triggerPreviewUpdate();
  }

  private _loadShared(
    m: LinkedRowModule,
    row: LinkedRowRecord,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    ucLinkedRowService.clearConflict(row.id);
    updateModule({
      linked_id: row.id,
      linked_name: row.name,
      linked_revision: row.revision,
      linked_updated_at: row.updated_at,
      modules: row.modules,
    } as Partial<CardModule>);
    this._state(m.id).error = '';
    this.triggerPreviewUpdate();
  }

  private async _createShared(
    m: LinkedRowModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): Promise<void> {
    const state = this._state(m.id);
    const name =
      state.newName.trim() || localize('editor.linked_row.default_name', lang, 'Linked row');
    state.busy = true;
    state.error = '';
    this.triggerPreviewUpdate();
    const result = await ucLinkedRowService.save(hass, {
      id: newLinkedRowId(),
      name,
      modules: m.modules || [],
      baseRevision: 0,
    });
    state.busy = false;
    if (result.ok) {
      state.newName = '';
      state.library = null;
      updateModule({
        linked_id: result.row.id,
        linked_name: result.row.name,
        linked_revision: result.row.revision,
        linked_updated_at: result.row.updated_at,
      } as Partial<CardModule>);
    } else {
      state.error = this._saveError(result, lang);
    }
    this.triggerPreviewUpdate();
  }

  private async _share(
    m: LinkedRowModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string,
    force: boolean
  ): Promise<void> {
    const id = m.linked_id;
    if (!id) return;
    const state = this._state(m.id);
    state.busy = true;
    state.error = '';
    this.triggerPreviewUpdate();
    const shared = ucLinkedRowService.getCached(id);
    const result = await ucLinkedRowService.save(hass, {
      id,
      name: m.linked_name || shared?.name || undefined,
      modules: m.modules || [],
      baseRevision: m.linked_revision ?? 0,
      force,
    });
    state.busy = false;
    if (result.ok) {
      updateModule({
        linked_name: result.row.name,
        linked_revision: result.row.revision,
        linked_updated_at: result.row.updated_at,
      } as Partial<CardModule>);
    } else if (!('conflict' in result)) {
      state.error = this._saveError(result, lang);
    }
    this.triggerPreviewUpdate();
  }

  private _unlink(
    m: LinkedRowModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): void {
    if (m.linked_id) ucLinkedRowService.clearConflict(m.linked_id);
    updateModule({
      linked_id: '',
      linked_name: '',
      linked_revision: undefined,
      linked_updated_at: undefined,
    } as Partial<CardModule>);
    this.triggerPreviewUpdate();
  }

  private _saveError(
    result: { ok: false; error?: string; status?: number | undefined },
    lang: string
  ): string {
    if (result.status === 403) {
      return localize(
        'editor.linked_row.admin_only',
        lang,
        'Only Home Assistant admins can change shared rows.'
      );
    }
    return localize(
      'editor.linked_row.save_failed',
      lang,
      'Could not save the shared row: {error}'
    ).replace('{error}', result.error || '');
  }

  private _formatDate(iso: string, lang: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    try {
      return d.toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return d.toISOString();
    }
  }

  private _editorStyles(): string {
    return `
      .uc-lr-note {
        font-size: 13px;
        line-height: 1.5;
        color: var(--primary-text-color);
        padding: 10px 12px;
        margin: 8px 0 12px;
        border-radius: 8px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      }
      .uc-lr-note.subtle { background: transparent; padding: 4px 0; color: var(--secondary-text-color); }
      .uc-lr-note.warn { background: rgba(var(--rgb-warning-color, 255, 152, 0), 0.15); }
      .uc-lr-note.ok { background: rgba(var(--rgb-success-color, 76, 175, 80), 0.15); }
      .uc-lr-actions { display: flex; flex-wrap: wrap; gap: 8px; }
      .uc-lr-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 44px;
        padding: 0 16px;
        margin: 4px 0;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: var(--uc-pane-bg, var(--card-background-color));
        color: var(--primary-text-color);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
      }
      .uc-lr-btn.primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .uc-lr-btn.subtle { color: var(--secondary-text-color); }
      .uc-lr-btn[disabled] { opacity: 0.5; cursor: default; }
      .uc-lr-btn ha-icon { --mdc-icon-size: 18px; }
      .uc-lr-linked {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: var(--uc-pane-bg, var(--card-background-color));
        border: 1px solid var(--divider-color);
      }
      .uc-lr-linked ha-icon { color: var(--primary-color); }
      .uc-lr-linked-text { min-width: 0; }
      .uc-lr-linked-name { font-weight: 600; color: var(--primary-text-color); overflow-wrap: anywhere; }
      .uc-lr-linked-meta { font-size: 12px; color: var(--secondary-text-color); }
    `;
  }
}
