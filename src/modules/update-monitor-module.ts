import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, UpdateMonitorModule, UltraCardConfig } from '../types';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

const SUPPORTS_INSTALL = 1; // UpdateEntityFeature.INSTALL

interface UpdateReading {
  entityId: string;
  name: string;
  picture?: string | undefined;
  hasUpdate: boolean;
  inProgress: boolean;
  installedVersion?: string | undefined;
  latestVersion?: string | undefined;
  canInstall: boolean;
}

export class UltraUpdateMonitorModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'update_monitor',
    title: 'Update Monitor',
    description: 'Auto-discover update entities and surface pending updates with install actions',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:update',
    category: 'data',
    tags: ['update', 'monitor', 'version', 'firmware', 'devices', 'maintenance', 'auto'],
  };

  createDefault(id?: string): UpdateMonitorModule {
    return {
      id: id || this.generateId('update_monitor'),
      type: 'update_monitor',
      title: 'Updates',
      show_title: true,
      show_up_to_date: false,
      show_version_info: true,
      show_install_button: true,
      show_entity_picture: true,
      max_items: 25,
      sort_direction: 'updates_first',
      exclude_patterns: [],
      hidden_entities: [],
      update_color: '',
      ok_color: '',
      text_color: '',
      secondary_text_color: '',
      card_background_color: '',
      tap_action: { action: 'more-info' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as UpdateMonitorModule, hass, updates =>
      updateModule(updates)
    );
  }

  override renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as UpdateMonitorModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const m = module as UpdateMonitorModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="module-general-settings">
        ${this.renderSettingsSection(
          localize('editor.update_monitor.section_display', lang, 'Display'),
          localize('editor.update_monitor.section_display_desc', lang, 'What the module shows.'),
          [
            {
              title: localize('editor.update_monitor.title', lang, 'Title'),
              description: localize('editor.update_monitor.title_desc', lang, 'Header above the list.'),
              hass,
              data: { title: m.title || 'Updates' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => {
                updateModule({ title: e.detail.value.title } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.update_monitor.show_title', lang, 'Show title'),
              description: localize('editor.update_monitor.show_title_desc', lang, 'Display the header.'),
              hass,
              data: { show_title: m.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value.show_title } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.update_monitor.show_up_to_date', lang, 'Show up-to-date entities'),
              description: localize(
                'editor.update_monitor.show_up_to_date_desc',
                lang,
                'Also list entities without a pending update.'
              ),
              hass,
              data: { show_up_to_date: !!m.show_up_to_date },
              schema: [this.booleanField('show_up_to_date')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_up_to_date: e.detail.value.show_up_to_date } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.update_monitor.show_version', lang, 'Show version info'),
              description: localize(
                'editor.update_monitor.show_version_desc',
                lang,
                'Installed and latest version under each name.'
              ),
              hass,
              data: { show_version_info: m.show_version_info !== false },
              schema: [this.booleanField('show_version_info')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_version_info: e.detail.value.show_version_info } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.update_monitor.show_install', lang, 'Show install button'),
              description: localize(
                'editor.update_monitor.show_install_desc',
                lang,
                'One-tap install when the integration supports it.'
              ),
              hass,
              data: { show_install_button: m.show_install_button !== false },
              schema: [this.booleanField('show_install_button')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_install_button: e.detail.value.show_install_button } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
            {
              title: localize('editor.update_monitor.show_picture', lang, 'Show entity picture'),
              description: localize(
                'editor.update_monitor.show_picture_desc',
                lang,
                'Use the integration logo when available.'
              ),
              hass,
              data: { show_entity_picture: m.show_entity_picture !== false },
              schema: [this.booleanField('show_entity_picture')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_entity_picture: e.detail.value.show_entity_picture } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              },
            },
          ]
        )}
        ${this.renderSliderField(
          localize('editor.update_monitor.max_items', lang, 'Max items'),
          localize('editor.update_monitor.max_items_desc', lang, 'Maximum entities to show.'),
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
        ${this.renderFieldSection(
          localize('editor.update_monitor.sort', lang, 'Sort'),
          localize('editor.update_monitor.sort_desc', lang, 'Order of entities.'),
          hass,
          { sort_direction: m.sort_direction || 'updates_first' },
          [
            this.selectField('sort_direction', [
              {
                value: 'updates_first',
                label: localize('editor.update_monitor.sort_updates', lang, 'Updates first'),
              },
              { value: 'name', label: localize('editor.update_monitor.sort_name', lang, 'Name A–Z') },
              { value: 'unchanged', label: localize('editor.update_monitor.sort_raw', lang, 'Unchanged') },
            ]),
          ],
          (e: CustomEvent) => {
            updateModule({ sort_direction: e.detail.value.sort_direction } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          }
        )}
        ${this.renderChipListField(
          localize('editor.update_monitor.exclude_patterns', lang, 'Exclude patterns'),
          localize(
            'editor.update_monitor.exclude_patterns_desc',
            lang,
            'Entity ids containing these substrings are ignored.'
          ),
          hass,
          m.exclude_patterns || [],
          (values: string[]) => {
            updateModule({ exclude_patterns: values } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          {
            mode: 'free-text',
            variant: 'exclude',
            placeholder: localize('editor.update_monitor.pattern_ph', lang, 'e.g. beta, test'),
          }
        )}
        ${this.renderChipListField(
          localize('editor.update_monitor.hidden_entities', lang, 'Hidden entities'),
          localize(
            'editor.update_monitor.hidden_entities_desc',
            lang,
            'Specific update entities to hide from the list.'
          ),
          hass,
          m.hidden_entities || [],
          (values: string[]) => {
            updateModule({ hidden_entities: values } as Partial<CardModule>);
            this.triggerPreviewUpdate();
          },
          {
            mode: 'entity',
            entityDomains: ['update'],
            placeholder: localize('editor.update_monitor.hidden_ph', lang, 'Pick an update entity'),
          }
        )}

        <div
          class="settings-section"
          style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
        >
          <div
            class="section-title"
            style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: var(--primary-color); margin-bottom: 16px; letter-spacing: 0.5px;"
          >
            ${localize('editor.update_monitor.section_colors', lang, 'Colors')}
          </div>
          ${(
            [
              ['update_color', 'editor.update_monitor.color_update', 'Update available', 'var(--warning-color)'],
              ['ok_color', 'editor.update_monitor.color_ok', 'Up to date', 'var(--success-color)'],
              ['text_color', 'editor.update_monitor.color_text', 'Text', 'var(--primary-text-color)'],
              [
                'secondary_text_color',
                'editor.update_monitor.color_secondary',
                'Secondary text',
                'var(--secondary-text-color)',
              ],
              [
                'card_background_color',
                'editor.update_monitor.color_card_bg',
                'Card background',
                'var(--card-background-color)',
              ],
            ] as const
          ).map(([key, locKey, fb, def]) =>
            this.renderColorField(
              localize(locKey, lang, fb),
              '',
              hass,
              (m as unknown as Record<string, string | undefined>)[key] || '',
              def,
              (value: string) => {
                updateModule({ [key]: value } as Partial<CardModule>);
                this.triggerPreviewUpdate();
              }
            )
          )}
        </div>
      </div>
    `;
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const m = module as UpdateMonitorModule;
    const lang = hass?.locale?.language || 'en';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    if (!hass?.states) {
      return this.renderGradientErrorState(
        localize('editor.update_monitor.err_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.update_monitor.err_ha_desc', lang, 'Connecting to entity states…'),
        'mdi:loading'
      );
    }

    const readings = this._collectReadings(m, hass);
    const pending = readings.filter(r => r.hasUpdate).length;

    if (readings.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.update_monitor.err_empty', lang, 'No update entities found'),
        localize(
          'editor.update_monitor.err_empty_desc',
          lang,
          'Enable "Show up-to-date entities" or adjust exclude filters in the General tab.'
        ),
        'mdi:update'
      );
    }

    const cUpd = m.update_color || 'var(--warning-color)';
    const cOk = m.ok_color || 'var(--success-color)';
    const text = m.text_color || 'var(--primary-text-color)';
    const secondary = m.secondary_text_color || 'var(--secondary-text-color)';
    const cardBg = m.card_background_color || 'var(--card-background-color)';

    return html`
      <div class="um-root ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(
          html`
            ${m.show_title !== false
              ? html`
                  <div
                    style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;"
                  >
                    <span style="color:${text};font-weight:700;">
                      ${m.title || localize('editor.update_monitor.default_title', lang, 'Updates')}
                    </span>
                    <span
                      style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:10px;background:${pending > 0 ? cUpd : cOk}22;color:${pending > 0 ? cUpd : cOk};"
                    >
                      ${pending > 0
                        ? `${pending} ${localize('editor.update_monitor.pending', lang, 'pending')}`
                        : localize('editor.update_monitor.all_ok', lang, 'All up to date')}
                    </span>
                  </div>
                `
              : nothing}
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${readings.map(r => this._renderRow(m, r, hass, config, { cUpd, cOk, text, secondary, cardBg, lang }))}
            </div>
          `,
          module,
          hass
        )}
      </div>
    `;
  }

  private _renderRow(
    m: UpdateMonitorModule,
    r: UpdateReading,
    hass: HomeAssistant,
    config: UltraCardConfig | undefined,
    o: { cUpd: string; cOk: string; text: string; secondary: string; cardBg: string; lang: string }
  ): TemplateResult {
    const col = r.hasUpdate ? o.cUpd : o.cOk;
    const g = this.createGestureHandlers(
      `${m.id}-${r.entityId}`,
      {
        tap_action: m.tap_action?.action
          ? { ...m.tap_action, entity: r.entityId }
          : { action: 'more-info', entity: r.entityId },
        hold_action: m.hold_action,
        double_tap_action: m.double_tap_action,
        entity: r.entityId,
        module: m,
      },
      hass,
      config,
      ['.um-install-btn']
    );

    const versionLine = r.hasUpdate
      ? `${r.installedVersion || '?'} → ${r.latestVersion || '?'}`
      : r.installedVersion || r.latestVersion || '';

    return html`
      <div
        style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:${o.cardBg};border:1px solid var(--divider-color);"
        @pointerdown=${g.onPointerDown}
        @pointermove=${g.onPointerMove}
        @pointerup=${g.onPointerUp}
        @pointerleave=${g.onPointerLeave}
        @pointercancel=${g.onPointerCancel}
      >
        ${m.show_entity_picture !== false && r.picture
          ? html`<img
              src="${r.picture}"
              style="width:28px;height:28px;border-radius:6px;object-fit:contain;flex-shrink:0;"
            />`
          : html`<ha-icon
              icon=${r.hasUpdate ? 'mdi:package-up' : 'mdi:check-circle-outline'}
              style="color:${col};--mdc-icon-size:26px;flex-shrink:0;"
            ></ha-icon>`}
        <div style="flex:1;min-width:0;">
          <div
            style="color:${o.text};font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
          >
            ${r.name}
          </div>
          ${m.show_version_info !== false && versionLine
            ? html`<div style="color:${o.secondary};font-size:12px;margin-top:2px;">
                ${versionLine}
              </div>`
            : nothing}
        </div>
        ${r.inProgress
          ? html`<ha-circular-progress indeterminate size="small"></ha-circular-progress>`
          : r.hasUpdate && m.show_install_button !== false && r.canInstall
            ? html`
                <button
                  class="um-install-btn"
                  style="flex-shrink:0;padding:6px 12px;border:none;border-radius:8px;background:${col};color:var(--text-primary-color,#fff);font-weight:600;font-size:12px;cursor:pointer;"
                  @click=${(ev: Event) => {
                    ev.stopPropagation();
                    hass.callService('update', 'install', { entity_id: r.entityId });
                  }}
                >
                  ${localize('editor.update_monitor.install', o.lang, 'Install')}
                </button>
              `
            : nothing}
      </div>
    `;
  }

  private _collectReadings(m: UpdateMonitorModule, hass: HomeAssistant): UpdateReading[] {
    const hidden = new Set((m.hidden_entities || []).map(x => x.trim()).filter(Boolean));
    const patterns = (m.exclude_patterns || []).map(p => p.toLowerCase());

    const list: UpdateReading[] = [];
    for (const [id, st] of Object.entries(hass.states)) {
      if (!id.startsWith('update.')) continue;
      if (hidden.has(id)) continue;
      if (patterns.some(p => id.toLowerCase().includes(p))) continue;
      if (st.state === 'unavailable' || st.state === 'unknown') continue;

      const hasUpdate = st.state === 'on';
      if (!hasUpdate && !m.show_up_to_date) continue;

      const a = st.attributes || {};
      list.push({
        entityId: id,
        name: (a.friendly_name as string) || id,
        picture: a.entity_picture as string | undefined,
        hasUpdate,
        inProgress: a.in_progress === true || typeof a.in_progress === 'number',
        installedVersion: a.installed_version as string | undefined,
        latestVersion: a.latest_version as string | undefined,
        canInstall: ((a.supported_features as number) & SUPPORTS_INSTALL) === SUPPORTS_INSTALL,
      });
    }

    const mode = m.sort_direction || 'updates_first';
    if (mode === 'updates_first') {
      list.sort(
        (a, b) => Number(b.hasUpdate) - Number(a.hasUpdate) || a.name.localeCompare(b.name)
      );
    } else if (mode === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    return list.slice(0, m.max_items ?? 25);
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type) errors.push('Module type is required');
    return { valid: errors.length === 0, errors };
  }

  getStyles(): string {
    return `
      .um-root { box-sizing: border-box; }
      ${BaseUltraModule.getSliderStyles()}
    `;
  }
}
