import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TodoListModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

const FEATURE_CREATE_ITEM = 1; // TodoListEntityFeature.CREATE_TODO_ITEM
const FEATURE_UPDATE_ITEM = 4; // TodoListEntityFeature.UPDATE_TODO_ITEM

interface TodoItem {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
  due?: string | undefined;
}

interface TodoCacheEntry {
  items: TodoItem[];
  /** Entity state + last_updated fingerprint used to invalidate the cache */
  fingerprint: string;
  fetching: boolean;
}

export class UltraTodoListModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'todo_list',
    title: 'To-Do List',
    description: 'Show, check off, and add items on Home Assistant to-do lists',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:checkbox-marked-outline',
    category: 'data',
    tags: ['todo', 'tasks', 'shopping', 'list', 'checklist', 'interactive'],
  };

  private _cache: Map<string, TodoCacheEntry> = new Map();

  createDefault(id?: string): TodoListModule {
    return {
      id: id || this.generateId('todo_list'),
      type: 'todo_list',
      entity: '',
      title: '',
      show_title: true,
      show_completed: false,
      show_due_date: true,
      enable_add_item: true,
      max_items: 25,
      accent_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as TodoListModule, hass, updates => updateModule(updates));
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as TodoListModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.todo_list.entity_section', lang, 'List'),
          localize('editor.todo_list.entity_section_desc', lang, 'Choose the to-do list to display.'),
          [
            {
              title: localize('editor.todo_list.entity', lang, 'To-do entity'),
              description: localize(
                'editor.todo_list.entity_desc',
                lang,
                'Any todo entity — shopping lists, tasks, etc.'
              ),
              hass,
              data: { entity: m.entity || '' },
              schema: [{ name: 'entity', selector: { entity: { domain: 'todo' } } }],
              onChange: (e: CustomEvent) => {
                updateModule({ entity: e.detail.value?.entity ?? '' } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.todo_list.title', lang, 'Title override'),
              description: localize(
                'editor.todo_list.title_desc',
                lang,
                'Leave blank to use the list name.'
              ),
              hass,
              data: { title: m.title || '' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value.title } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSettingsSection(
          localize('editor.todo_list.display_section', lang, 'Display'),
          localize('editor.todo_list.display_section_desc', lang, 'Choose what to show.'),
          [
            {
              title: localize('editor.todo_list.show_title', lang, 'Show title'),
              description: '',
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value.show_title } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.todo_list.show_completed', lang, 'Show completed items'),
              description: localize(
                'editor.todo_list.show_completed_desc',
                lang,
                'Completed items appear crossed out below active ones.'
              ),
              hass,
              data: { show_completed: !!m.show_completed },
              schema: [this.booleanField('show_completed')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_completed: e.detail.value.show_completed } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.todo_list.show_due', lang, 'Show due dates'),
              description: '',
              hass,
              data: { show_due_date: m.show_due_date !== false },
              schema: [this.booleanField('show_due_date')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_due_date: e.detail.value.show_due_date } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.todo_list.enable_add', lang, 'Enable adding items'),
              description: localize(
                'editor.todo_list.enable_add_desc',
                lang,
                'Input field at the bottom when the list supports it.'
              ),
              hass,
              data: { enable_add_item: m.enable_add_item !== false },
              schema: [this.booleanField('enable_add_item')],
              onChange: (e: CustomEvent) => {
                updateModule({ enable_add_item: e.detail.value.enable_add_item } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSliderField(
          localize('editor.todo_list.max_items', lang, 'Max items'),
          localize('editor.todo_list.max_items_desc', lang, 'Maximum items to show.'),
          m.max_items ?? 25,
          25,
          1,
          100,
          1,
          (value: number) => {
            updateModule({ max_items: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          ''
        )}
        ${this.renderColorField(
          localize('editor.todo_list.accent_color', lang, 'Accent color'),
          localize('editor.todo_list.accent_color_desc', lang, 'Checkboxes and the add button.'),
          hass,
          m.accent_color || '',
          'var(--primary-color)',
          (value: string) => {
            updateModule({ accent_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.todo_list.text_color', lang, 'Text color'),
          '',
          hass,
          m.text_color || '',
          'var(--primary-text-color)',
          (value: string) => {
            updateModule({ text_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderColorField(
          localize('editor.todo_list.card_bg', lang, 'Card background'),
          '',
          hass,
          m.card_background_color || '',
          'var(--card-background-color)',
          (value: string) => {
            updateModule({ card_background_color: value } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as TodoListModule;
    const lang = hass?.locale?.language || 'en';
    const entityId = this.resolveEntity(m.entity, config) || m.entity;

    if (!entityId || !hass?.states[entityId]) {
      return this.renderGradientErrorState(
        localize('editor.todo_list.config_needed', lang, 'Select a to-do list'),
        localize('editor.todo_list.config_needed_desc', lang, 'Choose a todo entity in the General tab'),
        'mdi:checkbox-marked-outline'
      );
    }

    const st = hass.states[entityId];
    const a = st.attributes || {};
    const supported = (a.supported_features as number) || 0;
    const canUpdate = (supported & FEATURE_UPDATE_ITEM) === FEATURE_UPDATE_ITEM;
    const canCreate = (supported & FEATURE_CREATE_ITEM) === FEATURE_CREATE_ITEM;

    const items = this._getItems(m, entityId, hass);
    const active = items.filter(i => i.status !== 'completed');
    const completed = m.show_completed ? items.filter(i => i.status === 'completed') : [];
    const maxItems = m.max_items ?? 25;
    const visible = [...active, ...completed].slice(0, maxItems);

    const accent = m.accent_color || 'var(--primary-color)';
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';
    const title = m.title?.trim() || (a.friendly_name as string) || entityId;

    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      <div
        class="uc-todo-wrapper ${hoverClass}"
        style="padding:16px;border-radius:12px;background:${cardBg};${designStyles}"
      >
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false
              ? html`
                  <div
                    style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;"
                  >
                    <span style="color:${text};font-weight:700;">${title}</span>
                    <span style="color:${secondary};font-size:12px;font-weight:600;">
                      ${active.length}
                      ${localize('editor.todo_list.items_left', lang, 'left')}
                    </span>
                  </div>
                `
              : nothing}
            ${visible.length === 0
              ? html`<div
                  style="color:${secondary};font-size:13px;text-align:center;padding:12px 0;"
                >
                  ${localize('editor.todo_list.empty', lang, 'Nothing to do — list is empty')}
                </div>`
              : html`
                  <div style="display:flex;flex-direction:column;gap:4px;">
                    ${visible.map(item =>
                      this._renderItem(m, item, entityId, hass, canUpdate, {
                        accent,
                        text,
                        secondary,
                        lang,
                      })
                    )}
                  </div>
                `}
            ${m.enable_add_item !== false && canCreate
              ? html`
                  <div style="display:flex;gap:8px;margin-top:12px;">
                    <input
                      type="text"
                      class="uc-todo-add-input"
                      style="flex:1;padding:8px 12px;border:1px solid var(--divider-color);border-radius:8px;background:transparent;color:${text};font-size:13px;outline:none;"
                      placeholder=${localize('editor.todo_list.add_ph', lang, 'Add item…')}
                      @keydown=${(ev: KeyboardEvent) => {
                        if (ev.key === 'Enter') {
                          this._addItem(ev.target as HTMLInputElement, entityId, hass);
                        }
                      }}
                    />
                    <button
                      style="flex-shrink:0;width:36px;height:36px;border:none;border-radius:8px;background:${accent};color:var(--text-primary-color,#fff);cursor:pointer;display:flex;align-items:center;justify-content:center;"
                      title=${localize('editor.todo_list.add', lang, 'Add')}
                      @click=${(ev: Event) => {
                        const input = (ev.currentTarget as HTMLElement)
                          .closest('div')
                          ?.querySelector('input') as HTMLInputElement | null;
                        if (input) this._addItem(input, entityId, hass);
                      }}
                    >
                      <ha-icon icon="mdi:plus" style="--mdc-icon-size:18px;"></ha-icon>
                    </button>
                  </div>
                `
              : nothing}
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  private _renderItem(
    m: TodoListModule,
    item: TodoItem,
    entityId: string,
    hass: HomeAssistant,
    canUpdate: boolean,
    o: { accent: string; text: string; secondary: string; lang: string }
  ): TemplateResult {
    const done = item.status === 'completed';
    return html`
      <div style="display:flex;align-items:center;gap:10px;padding:6px 2px;">
        <button
          style="flex-shrink:0;width:20px;height:20px;border-radius:6px;border:2px solid ${done ? o.accent : 'var(--divider-color)'};background:${done ? o.accent : 'transparent'};cursor:${canUpdate ? 'pointer' : 'default'};display:flex;align-items:center;justify-content:center;padding:0;"
          ?disabled=${!canUpdate}
          @click=${() => {
            if (!canUpdate) return;
            hass.callService('todo', 'update_item', {
              entity_id: entityId,
              item: item.uid,
              status: done ? 'needs_action' : 'completed',
            });
            // Optimistic flip so the UI feels instant
            item.status = done ? 'needs_action' : 'completed';
            this._invalidateSoon(m.id, entityId);
            this.triggerPreviewUpdate(true);
          }}
        >
          ${done
            ? html`<ha-icon
                icon="mdi:check"
                style="--mdc-icon-size:14px;color:var(--text-primary-color,#fff);"
              ></ha-icon>`
            : nothing}
        </button>
        <div style="flex:1;min-width:0;">
          <div
            style="color:${done ? o.secondary : o.text};font-size:14px;${done ? 'text-decoration:line-through;opacity:0.7;' : ''}white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          >
            ${item.summary}
          </div>
          ${m.show_due_date !== false && item.due
            ? html`<div style="color:${o.secondary};font-size:11px;margin-top:1px;">
                ${this._formatDue(item.due, o.lang)}
              </div>`
            : nothing}
        </div>
      </div>
    `;
  }

  private _formatDue(due: string, lang: string): string {
    try {
      const d = new Date(due.includes('T') ? due : `${due}T00:00:00`);
      return new Intl.DateTimeFormat(lang, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...(due.includes('T') ? { hour: 'numeric', minute: '2-digit' } : {}),
      }).format(d);
    } catch {
      return due;
    }
  }

  private _addItem(input: HTMLInputElement, entityId: string, hass: HomeAssistant): void {
    const value = input.value.trim();
    if (!value) return;
    hass.callService('todo', 'add_item', { entity_id: entityId, item: value });
    input.value = '';
    const key = `${entityId}`;
    this._invalidateSoon(key, entityId);
  }

  /** Drop the cached items shortly after a mutation so the next render refetches. */
  private _invalidateSoon(_key: string, entityId: string): void {
    setTimeout(() => {
      this._cache.delete(entityId);
      this.triggerPreviewUpdate(true);
    }, 500);
  }

  /** Returns cached items and refetches via WebSocket whenever the entity changes. */
  private _getItems(m: TodoListModule, entityId: string, hass: HomeAssistant): TodoItem[] {
    const st = hass.states[entityId];
    const fingerprint = `${st.state}|${(st as unknown as { last_updated?: string }).last_updated || ''}`;
    const cached = this._cache.get(entityId);

    if (cached && cached.fingerprint === fingerprint) {
      return cached.items;
    }

    if (!cached?.fetching) {
      const entry: TodoCacheEntry = {
        items: cached?.items || [],
        fingerprint,
        fetching: true,
      };
      this._cache.set(entityId, entry);

      hass
        .callWS<{ response?: Record<string, { items?: TodoItem[] }> }>({
          type: 'call_service',
          domain: 'todo',
          service: 'get_items',
          target: { entity_id: entityId },
          return_response: true,
        })
        .then(resp => {
          const items = resp?.response?.[entityId]?.items || [];
          this._cache.set(entityId, { items, fingerprint, fetching: false });
          this.triggerPreviewUpdate();
        })
        .catch(() => {
          this._cache.set(entityId, { items: entry.items, fingerprint, fetching: false });
        });
    }

    return cached?.items || [];
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const m = module as TodoListModule;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    if (!m.entity) errors.push('Select a todo entity');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .uc-todo-wrapper { box-sizing: border-box; }
      .uc-todo-add-input::placeholder { color: var(--secondary-text-color); opacity: 0.7; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
