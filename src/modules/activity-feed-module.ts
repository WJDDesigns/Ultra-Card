import { TemplateResult, html, nothing } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import {
  CardModule,
  ActivityFeedModule,
  ActivityFeedEntity,
  UltraCardConfig,
} from '../types';
import { UcFormUtils } from '../utils/uc-form-utils';
import { localize } from '../localize/localize';
import { GlobalActionsTab } from '../tabs/global-actions-tab';
import { GlobalLogicTab } from '../tabs/global-logic-tab';
import '../components/ultra-color-picker';

interface FeedEvent {
  entityId: string;
  entityName: string;
  icon: string;
  color: string;
  domain: string;
  newState: string;
  oldState?: string;
  timestamp: Date;
  relativeTime: string;
  absoluteTime: string;
  dateLabel: string;
}

export class UltraActivityFeedModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'activity_feed',
    title: 'Activity Feed',
    description: 'Real-time home activity feed with timeline and social views',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:timeline-text',
    category: 'data',
    tags: ['activity', 'feed', 'timeline', 'history', 'events', 'pro', 'premium'],
  };

  private _expandedEntities: Set<string> = new Set();

  createDefault(id?: string): ActivityFeedModule {
    return {
      id: id || this.generateId('activity_feed'),
      type: 'activity_feed',

      entities: [],

      enable_auto_filter: true,
      include_domains: ['light', 'switch', 'binary_sensor', 'lock', 'cover'],
      exclude_domains: [],
      exclude_patterns: [],

      view_mode: 'feed',

      title: 'Activity Feed',
      show_title: true,
      max_items: 25,
      show_entity_icon: true,
      show_relative_time: true,
      show_absolute_time: false,
      show_state_change: true,
      group_by_time: true,

      timeline_line_color: 'var(--primary-color)',
      timeline_dot_color: 'var(--primary-color)',
      timeline_dot_size: 12,

      feed_card_style: 'elevated',
      show_avatar: true,
      avatar_style: 'circle',

      sort_direction: 'newest_first',

      accent_color: '',
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

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const baseValidation = super.validate(module);
    const feedModule = module as ActivityFeedModule;
    const errors = [...baseValidation.errors];

    if (
      !feedModule.enable_auto_filter &&
      (!feedModule.entities || feedModule.entities.length === 0)
    ) {
      errors.push(
        'At least one entity must be configured, or auto-filter must be enabled'
      );
    }

    return { valid: errors.length === 0, errors };
  }

  renderActionsTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalActionsTab.render(module as ActivityFeedModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderOtherTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return GlobalLogicTab.render(module as ActivityFeedModule, hass, updates =>
      updateModule(updates)
    );
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const feedModule = module as ActivityFeedModule;
    return html`
      ${this.injectUcFormStyles()}
      <style>
        .settings-section {
          background: var(--secondary-background-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--primary-color);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--primary-color);
          letter-spacing: 0.5px;
        }
        .view-mode-switcher {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .view-mode-btn {
          flex: 1;
          padding: 16px 12px;
          border: 2px solid var(--divider-color);
          border-radius: 12px;
          background: var(--card-background-color);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .view-mode-btn:hover {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.05);
        }
        .view-mode-btn.active {
          border-color: var(--primary-color);
          background: rgba(var(--rgb-primary-color), 0.1);
        }
        .view-mode-btn ha-icon {
          display: block;
          margin: 0 auto 8px;
          color: var(--primary-color);
          --mdc-icon-size: 28px;
        }
        .view-mode-btn .mode-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .view-mode-btn .mode-desc {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
        .domain-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
          min-height: 32px;
        }
        .domain-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-radius: 16px;
          font-size: 13px;
          transition: all 0.2s ease;
          position: relative;
        }
        .domain-chip.exclude {
          background: var(--error-color);
        }
        .domain-chip:hover {
          opacity: 0.9;
          padding-right: 32px;
        }
        .domain-chip .chip-remove {
          cursor: pointer;
          font-size: 16px;
          opacity: 0;
          position: absolute;
          right: 8px;
          transition: opacity 0.2s ease;
        }
        .domain-chip:hover .chip-remove {
          opacity: 1;
        }
        .domain-input-row {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .domain-input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 14px;
        }
        .add-btn {
          padding: 8px 16px;
          background: var(--primary-color);
          color: var(--text-primary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .add-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .add-btn.full-width {
          width: 100%;
          justify-content: center;
          padding: 12px;
        }
        .entity-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: var(--card-background-color);
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid var(--divider-color);
          transition: all 0.2s ease;
        }
        .entity-row:hover {
          background: var(--primary-color);
          opacity: 0.9;
        }
        .entity-info {
          flex: 1;
          font-size: 14px;
          color: var(--primary-text-color);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .entity-info.empty {
          color: var(--secondary-text-color);
          font-style: italic;
        }
        .expand-icon {
          cursor: pointer;
          color: var(--primary-color);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .expand-icon.expanded {
          transform: rotate(180deg);
        }
        .delete-icon {
          cursor: pointer;
          color: var(--error-color);
          flex-shrink: 0;
        }
        .entity-settings {
          padding: 16px;
          background: rgba(var(--rgb-primary-color), 0.05);
          border-left: 3px solid var(--primary-color);
          border-radius: 0 8px 8px 0;
          margin-bottom: 8px;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="module-settings">
        <!-- View Mode -->
        <div class="settings-section">
          <div class="section-title">VIEW MODE</div>
          <div class="view-mode-switcher">
            <div
              class="view-mode-btn ${feedModule.view_mode === 'timeline' ? 'active' : ''}"
              @click=${() => updateModule({ view_mode: 'timeline' } as any)}
            >
              <ha-icon icon="mdi:timeline"></ha-icon>
              <div class="mode-title">Timeline</div>
              <div class="mode-desc">Vertical timeline with dots and lines</div>
            </div>
            <div
              class="view-mode-btn ${feedModule.view_mode === 'feed' ? 'active' : ''}"
              @click=${() => updateModule({ view_mode: 'feed' } as any)}
            >
              <ha-icon icon="mdi:card-text-outline"></ha-icon>
              <div class="mode-title">Social Feed</div>
              <div class="mode-desc">Card-based like a social media feed</div>
            </div>
          </div>
        </div>

        <!-- Title & Display -->
        <div class="settings-section">
          <div class="section-title">DISPLAY</div>
          ${UcFormUtils.renderFieldSection(
            'Title',
            'Title to display at the top of the feed.',
            hass,
            { title: feedModule.title || 'Activity Feed' },
            [UcFormUtils.text('title')],
            (e: CustomEvent) => updateModule({ title: e.detail.value.title } as any)
          )}
          ${this.renderSettingsSection('', '', [
            {
              title: 'Show Title',
              description: 'Display the title at the top.',
              hass,
              data: { show_title: feedModule.show_title },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_title: e.detail.value.show_title } as any),
            },
            {
              title: 'Show Entity Icon',
              description: 'Display icons for each event.',
              hass,
              data: { show_entity_icon: feedModule.show_entity_icon },
              schema: [this.booleanField('show_entity_icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_entity_icon: e.detail.value.show_entity_icon } as any),
            },
            {
              title: 'Show Relative Time',
              description: 'Show "2 minutes ago" style timestamps.',
              hass,
              data: { show_relative_time: feedModule.show_relative_time },
              schema: [this.booleanField('show_relative_time')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_relative_time: e.detail.value.show_relative_time } as any),
            },
            {
              title: 'Show Absolute Time',
              description: 'Show exact time (e.g. 3:45 PM).',
              hass,
              data: { show_absolute_time: feedModule.show_absolute_time },
              schema: [this.booleanField('show_absolute_time')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_absolute_time: e.detail.value.show_absolute_time } as any),
            },
            {
              title: 'Show State Change',
              description: 'Show "off → on" state transitions.',
              hass,
              data: { show_state_change: feedModule.show_state_change },
              schema: [this.booleanField('show_state_change')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_state_change: e.detail.value.show_state_change } as any),
            },
            {
              title: 'Group by Time',
              description: 'Group events by today, yesterday, etc.',
              hass,
              data: { group_by_time: feedModule.group_by_time },
              schema: [this.booleanField('group_by_time')],
              onChange: (e: CustomEvent) =>
                updateModule({ group_by_time: e.detail.value.group_by_time } as any),
            },
          ])}
          ${this.renderSliderField(
            'Max Items',
            'Maximum number of events to show.',
            feedModule.max_items || 25,
            25,
            5,
            100,
            1,
            (value: number) => updateModule({ max_items: value } as any),
            ''
          )}
          ${this.renderFieldSection(
            'Sort Direction',
            'Order of events in the feed.',
            hass,
            { sort_direction: feedModule.sort_direction || 'newest_first' },
            [
              this.selectField('sort_direction', [
                { value: 'newest_first', label: 'Newest First' },
                { value: 'oldest_first', label: 'Oldest First' },
              ]),
            ],
            (e: CustomEvent) =>
              updateModule({ sort_direction: e.detail.value.sort_direction } as any)
          )}
        </div>

        <!-- View-specific settings -->
        ${feedModule.view_mode === 'timeline'
          ? this._renderTimelineSettings(feedModule, hass, updateModule)
          : this._renderFeedSettings(feedModule, hass, updateModule)}

        <!-- Entity Source -->
        <div class="settings-section">
          <div class="section-title">ENTITY SOURCE</div>
          ${this.renderSettingsSection('', '', [
            {
              title: 'Auto Filter by Domain',
              description:
                'Automatically include entities based on domain filters.',
              hass,
              data: { enable_auto_filter: feedModule.enable_auto_filter },
              schema: [this.booleanField('enable_auto_filter')],
              onChange: (e: CustomEvent) =>
                updateModule({ enable_auto_filter: e.detail.value.enable_auto_filter } as any),
            },
          ])}
          ${feedModule.enable_auto_filter
            ? this._renderDomainFilters(feedModule, updateModule)
            : ''}

          <div style="margin-top: 16px; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
            Manual Entities
          </div>
          <div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 12px;">
            Add specific entities to always include in the feed.
          </div>
          ${(feedModule.entities || []).map((entity, index) =>
            this._renderEntityRow(entity, index, feedModule, hass, updateModule)
          )}
          <button
            class="add-btn full-width"
            @click=${() => {
              const entities = [...(feedModule.entities || [])];
              const newEntity: ActivityFeedEntity = {
                id: this.generateId('af_entity'),
                entity: '',
              };
              entities.push(newEntity);
              updateModule({ entities } as any);
              this._expandedEntities.add(newEntity.id);
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Entity
          </button>
        </div>

        <!-- Colors -->
        <div class="settings-section">
          <div class="section-title">COLORS</div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Accent Color'}
              .value=${feedModule.accent_color || ''}
              .defaultValue=${'var(--primary-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ accent_color: e.detail.value } as any)}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Text Color'}
              .value=${feedModule.text_color || ''}
              .defaultValue=${'var(--primary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ text_color: e.detail.value } as any)}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Secondary Text Color'}
              .value=${feedModule.secondary_text_color || ''}
              .defaultValue=${'var(--secondary-text-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ secondary_text_color: e.detail.value } as any)}
            ></ultra-color-picker>
          </div>
          <div style="margin-bottom: 16px;">
            <ultra-color-picker
              .label=${'Card Background (Feed mode)'}
              .value=${feedModule.card_background_color || ''}
              .defaultValue=${'var(--card-background-color)'}
              .hass=${hass}
              @value-changed=${(e: CustomEvent) =>
                updateModule({ card_background_color: e.detail.value } as any)}
            ></ultra-color-picker>
          </div>
        </div>
      </div>
    `;
  }

  private _renderTimelineSettings(
    feedModule: ActivityFeedModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">TIMELINE SETTINGS</div>
        <div style="margin-bottom: 16px;">
          <ultra-color-picker
            .label=${'Line Color'}
            .value=${feedModule.timeline_line_color || ''}
            .defaultValue=${'var(--primary-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              updateModule({ timeline_line_color: e.detail.value } as any)}
          ></ultra-color-picker>
        </div>
        <div style="margin-bottom: 16px;">
          <ultra-color-picker
            .label=${'Dot Color'}
            .value=${feedModule.timeline_dot_color || ''}
            .defaultValue=${'var(--primary-color)'}
            .hass=${hass}
            @value-changed=${(e: CustomEvent) =>
              updateModule({ timeline_dot_color: e.detail.value } as any)}
          ></ultra-color-picker>
        </div>
        ${this.renderSliderField(
          'Dot Size',
          'Size of the timeline dots in pixels.',
          feedModule.timeline_dot_size || 12,
          12,
          6,
          24,
          1,
          (value: number) => updateModule({ timeline_dot_size: value } as any),
          'px'
        )}
      </div>
    `;
  }

  private _renderFeedSettings(
    feedModule: ActivityFeedModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div class="settings-section">
        <div class="section-title">FEED SETTINGS</div>
        ${this.renderFieldSection(
          'Card Style',
          'Visual style for each feed card.',
          hass,
          { feed_card_style: feedModule.feed_card_style || 'elevated' },
          [
            this.selectField('feed_card_style', [
              { value: 'flat', label: 'Flat' },
              { value: 'elevated', label: 'Elevated (Shadow)' },
              { value: 'outlined', label: 'Outlined (Border)' },
            ]),
          ],
          (e: CustomEvent) =>
            updateModule({ feed_card_style: e.detail.value.feed_card_style } as any)
        )}
        ${this.renderSettingsSection('', '', [
          {
            title: 'Show Avatar',
            description: 'Show entity icon as an avatar on each card.',
            hass,
            data: { show_avatar: feedModule.show_avatar },
            schema: [this.booleanField('show_avatar')],
            onChange: (e: CustomEvent) =>
              updateModule({ show_avatar: e.detail.value.show_avatar } as any),
          },
        ])}
        ${feedModule.show_avatar
          ? this.renderFieldSection(
              'Avatar Style',
              'Shape of the avatar.',
              hass,
              { avatar_style: feedModule.avatar_style || 'circle' },
              [
                this.selectField('avatar_style', [
                  { value: 'circle', label: 'Circle' },
                  { value: 'rounded', label: 'Rounded Square' },
                  { value: 'square', label: 'Square' },
                ]),
              ],
              (e: CustomEvent) =>
                updateModule({ avatar_style: e.detail.value.avatar_style } as any)
            )
          : ''}
      </div>
    `;
  }

  private _renderDomainFilters(
    feedModule: ActivityFeedModule,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    return html`
      <div style="margin-top: 16px;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
          Include Domains
        </div>
        <div
          style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
        >
          Only show events from these domains. Common: light, switch, binary_sensor,
          lock, cover, climate, fan, media_player
        </div>
        <div class="domain-chips">
          ${(feedModule.include_domains || []).map(
            domain => html`
              <span class="domain-chip">
                ${domain}
                <ha-icon
                  icon="mdi:close"
                  class="chip-remove"
                  @click=${() => {
                    const domains = (feedModule.include_domains || []).filter(
                      d => d !== domain
                    );
                    updateModule({ include_domains: domains } as any);
                  }}
                ></ha-icon>
              </span>
            `
          )}
        </div>
        <div class="domain-input-row">
          <input
            type="text"
            class="domain-input"
            placeholder="e.g., light, sensor, person"
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                const val = input.value.trim().toLowerCase();
                if (val && !(feedModule.include_domains || []).includes(val)) {
                  updateModule({
                    include_domains: [...(feedModule.include_domains || []), val],
                  } as any);
                  input.value = '';
                }
              }
            }}
          />
          <button
            class="add-btn"
            @click=${(e: Event) => {
              const row = (e.target as HTMLElement).closest('.domain-input-row');
              const input = row?.querySelector('input') as HTMLInputElement;
              const val = input?.value.trim().toLowerCase();
              if (val && !(feedModule.include_domains || []).includes(val)) {
                updateModule({
                  include_domains: [...(feedModule.include_domains || []), val],
                } as any);
                input.value = '';
              }
            }}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
        </div>

        <div style="margin-top: 24px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">
            Exclude Domains
          </div>
          <div
            style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;"
          >
            Hide events from these domains.
          </div>
          <div class="domain-chips">
            ${(feedModule.exclude_domains || []).map(
              domain => html`
                <span class="domain-chip exclude">
                  ${domain}
                  <ha-icon
                    icon="mdi:close"
                    class="chip-remove"
                    @click=${() => {
                      const domains = (feedModule.exclude_domains || []).filter(
                        d => d !== domain
                      );
                      updateModule({ exclude_domains: domains } as any);
                    }}
                  ></ha-icon>
                </span>
              `
            )}
          </div>
          <div class="domain-input-row">
            <input
              type="text"
              class="domain-input"
              placeholder="e.g., automation, update"
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  const val = input.value.trim().toLowerCase();
                  if (val && !(feedModule.exclude_domains || []).includes(val)) {
                    updateModule({
                      exclude_domains: [...(feedModule.exclude_domains || []), val],
                    } as any);
                    input.value = '';
                  }
                }
              }}
            />
            <button
              class="add-btn"
              @click=${(e: Event) => {
                const row = (e.target as HTMLElement).closest('.domain-input-row');
                const input = row?.querySelector('input') as HTMLInputElement;
                const val = input?.value.trim().toLowerCase();
                if (val && !(feedModule.exclude_domains || []).includes(val)) {
                  updateModule({
                    exclude_domains: [...(feedModule.exclude_domains || []), val],
                  } as any);
                  input.value = '';
                }
              }}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderEntityRow(
    entity: ActivityFeedEntity,
    index: number,
    feedModule: ActivityFeedModule,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const isExpanded = this._expandedEntities.has(entity.id);

    return html`
      <div class="entity-row">
        <div class="entity-info ${!entity.entity ? 'empty' : ''}">
          ${entity.entity || 'No entity selected'}
        </div>
        <ha-icon
          icon="mdi:chevron-down"
          class="expand-icon ${isExpanded ? 'expanded' : ''}"
          @click=${() => {
            if (this._expandedEntities.has(entity.id)) {
              this._expandedEntities.delete(entity.id);
            } else {
              this._expandedEntities.add(entity.id);
            }
            this.triggerPreviewUpdate();
          }}
        ></ha-icon>
        <ha-icon
          icon="mdi:delete"
          class="delete-icon"
          @click=${() => {
            const entities = [...(feedModule.entities || [])];
            entities.splice(index, 1);
            this._expandedEntities.delete(entity.id);
            updateModule({ entities } as any);
          }}
        ></ha-icon>
      </div>
      ${isExpanded
        ? html`
            <div class="entity-settings">
              ${UcFormUtils.renderFieldSection(
                'Entity',
                'The entity to track.',
                hass,
                { entity: entity.entity || '' },
                [UcFormUtils.entity('entity')],
                (e: CustomEvent) => {
                  const entities = [...(feedModule.entities || [])];
                  entities[index] = { ...entities[index], entity: e.detail.value.entity };
                  updateModule({ entities } as any);
                }
              )}
              ${UcFormUtils.renderFieldSection(
                'Label Override',
                'Custom name to display instead of entity name.',
                hass,
                { label: entity.label || '' },
                [UcFormUtils.text('label')],
                (e: CustomEvent) => {
                  const entities = [...(feedModule.entities || [])];
                  entities[index] = { ...entities[index], label: e.detail.value.label };
                  updateModule({ entities } as any);
                }
              )}
              ${UcFormUtils.renderFieldSection(
                'Icon Override',
                'Custom icon to display.',
                hass,
                { icon: entity.icon || '' },
                [UcFormUtils.icon('icon')],
                (e: CustomEvent) => {
                  const entities = [...(feedModule.entities || [])];
                  entities[index] = { ...entities[index], icon: e.detail.value.icon };
                  updateModule({ entities } as any);
                }
              )}
            </div>
          `
        : ''}
    `;
  }

  // =============================================
  // PREVIEW RENDERING
  // =============================================

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig
  ): TemplateResult {
    const feedModule = module as ActivityFeedModule;
    const lang = hass?.locale?.language || 'en';
    const designStyles = this.buildStyleString(this.buildDesignStyles(module, hass));
    const hoverClass = this.getHoverEffectClass(module);

    if (!hass || !hass.states) {
      return this.renderGradientErrorState(
        localize('editor.activity_feed.error_waiting_ha', lang, 'Waiting for Home Assistant'),
        localize('editor.activity_feed.error_waiting_ha_desc', lang, 'Connecting to entity states...'),
        'mdi:loading'
      );
    }

    const events = this._buildEvents(feedModule, hass);

    if (events.length === 0) {
      return this.renderGradientErrorState(
        localize('editor.activity_feed.error_no_activity', lang, 'No Activity'),
        localize('editor.activity_feed.error_no_activity_desc', lang, 'Configure entities or domains in the General tab'),
        'mdi:timeline-text'
      );
    }

    const accentColor = feedModule.accent_color || 'var(--primary-color)';
    const textColor = feedModule.text_color || 'var(--primary-text-color)';
    const secondaryColor = feedModule.secondary_text_color || 'var(--secondary-text-color)';

    const content =
      feedModule.view_mode === 'timeline'
        ? this._renderTimeline(events, feedModule, accentColor, textColor, secondaryColor)
        : this._renderFeed(events, feedModule, accentColor, textColor, secondaryColor);

    return html`
      <style>
        ${this._getPreviewStyles(feedModule)}
      </style>
      <div class="af-container ${hoverClass}" style="${designStyles}">
        ${this.wrapWithAnimation(html`
          ${feedModule.show_title
            ? html`<div class="af-title" style="color: ${textColor};">
                ${feedModule.title || localize('editor.activity_feed.preview.title_fallback', lang, 'Activity Feed')}
              </div>`
            : nothing}
          ${content}
        `, module, hass)}
      </div>
    `;
  }

  private _buildEvents(
    feedModule: ActivityFeedModule,
    hass: HomeAssistant
  ): FeedEvent[] {
    const entityIds = new Set<string>();

    // Manual entities
    for (const e of feedModule.entities || []) {
      if (e.entity && hass.states[e.entity]) entityIds.add(e.entity);
    }

    // Auto-filtered entities
    if (feedModule.enable_auto_filter) {
      const includeDomains = feedModule.include_domains || [];
      const excludeDomains = feedModule.exclude_domains || [];
      const excludePatterns = feedModule.exclude_patterns || [];

      for (const entityId of Object.keys(hass.states)) {
        const domain = entityId.split('.')[0];

        if (includeDomains.length > 0 && !includeDomains.includes(domain)) continue;
        if (excludeDomains.includes(domain)) continue;
        if (excludePatterns.some(p => entityId.toLowerCase().includes(p.toLowerCase())))
          continue;

        entityIds.add(entityId);
      }
    }

    const events: FeedEvent[] = [];
    const manualMap = new Map<string, ActivityFeedEntity>();
    for (const e of feedModule.entities || []) {
      if (e.entity) manualMap.set(e.entity, e);
    }

    for (const entityId of entityIds) {
      const stateObj = hass.states[entityId];
      if (!stateObj) continue;

      const manual = manualMap.get(entityId);
      const domain = entityId.split('.')[0];
      const timestamp = new Date(stateObj.last_changed);

      events.push({
        entityId,
        entityName:
          manual?.label ||
          stateObj.attributes.friendly_name ||
          entityId,
        icon:
          manual?.icon ||
          stateObj.attributes.icon ||
          this._domainIcon(domain),
        color: manual?.color || this._domainColor(domain),
        domain,
        newState: stateObj.state,
        oldState: undefined,
        timestamp,
        relativeTime: this._relativeTime(timestamp),
        absoluteTime: this._absoluteTime(timestamp),
        dateLabel: this._dateLabel(timestamp),
      });
    }

    events.sort((a, b) =>
      feedModule.sort_direction === 'oldest_first'
        ? a.timestamp.getTime() - b.timestamp.getTime()
        : b.timestamp.getTime() - a.timestamp.getTime()
    );

    const maxItems = feedModule.max_items || 25;
    return events.slice(0, maxItems);
  }

  // =============================================
  // TIMELINE VIEW
  // =============================================

  private _renderTimeline(
    events: FeedEvent[],
    feedModule: ActivityFeedModule,
    accentColor: string,
    textColor: string,
    secondaryColor: string
  ): TemplateResult {
    const lineColor = feedModule.timeline_line_color || accentColor;
    const dotColor = feedModule.timeline_dot_color || accentColor;
    const dotSize = feedModule.timeline_dot_size || 12;
    const grouped = feedModule.group_by_time ? this._groupByDate(events) : null;

    if (grouped) {
      return html`
        <div class="af-timeline" style="--tl-line: ${lineColor}; --tl-dot: ${dotColor}; --tl-dot-size: ${dotSize}px;">
          ${grouped.map(
            group => html`
              <div class="af-tl-group-label" style="color: ${accentColor};">
                ${group.label}
              </div>
              ${group.events.map(event => this._renderTimelineItem(event, feedModule, textColor, secondaryColor))}
            `
          )}
        </div>
      `;
    }

    return html`
      <div class="af-timeline" style="--tl-line: ${lineColor}; --tl-dot: ${dotColor}; --tl-dot-size: ${dotSize}px;">
        ${events.map(event => this._renderTimelineItem(event, feedModule, textColor, secondaryColor))}
      </div>
    `;
  }

  private _renderTimelineItem(
    event: FeedEvent,
    feedModule: ActivityFeedModule,
    textColor: string,
    secondaryColor: string
  ): TemplateResult {
    return html`
      <div class="af-tl-item">
        <div class="af-tl-dot-wrap">
          <div class="af-tl-dot" style="background: ${event.color};"></div>
        </div>
        <div class="af-tl-content">
          <div class="af-tl-header">
            ${feedModule.show_entity_icon
              ? html`<ha-icon icon="${event.icon}" style="color: ${event.color}; --mdc-icon-size: 18px;"></ha-icon>`
              : nothing}
            <span class="af-tl-name" style="color: ${textColor};">${event.entityName}</span>
          </div>
          <div class="af-tl-detail" style="color: ${secondaryColor};">
            ${feedModule.show_state_change
              ? html`<span class="af-tl-state">${this._formatState(event.newState)}</span>`
              : nothing}
            ${feedModule.show_relative_time
              ? html`<span class="af-tl-time">${event.relativeTime}</span>`
              : nothing}
            ${feedModule.show_absolute_time
              ? html`<span class="af-tl-time">${event.absoluteTime}</span>`
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  // =============================================
  // SOCIAL FEED VIEW
  // =============================================

  private _renderFeed(
    events: FeedEvent[],
    feedModule: ActivityFeedModule,
    accentColor: string,
    textColor: string,
    secondaryColor: string
  ): TemplateResult {
    const cardBg = feedModule.card_background_color || 'var(--card-background-color)';
    const style = feedModule.feed_card_style || 'elevated';
    const grouped = feedModule.group_by_time ? this._groupByDate(events) : null;

    if (grouped) {
      return html`
        <div class="af-feed">
          ${grouped.map(
            group => html`
              <div class="af-feed-group-label" style="color: ${accentColor};">
                <span>${group.label}</span>
                <span class="af-feed-group-count">${group.events.length}</span>
              </div>
              ${group.events.map(event =>
                this._renderFeedCard(event, feedModule, cardBg, style, accentColor, textColor, secondaryColor)
              )}
            `
          )}
        </div>
      `;
    }

    return html`
      <div class="af-feed">
        ${events.map(event =>
          this._renderFeedCard(event, feedModule, cardBg, style, accentColor, textColor, secondaryColor)
        )}
      </div>
    `;
  }

  private _renderFeedCard(
    event: FeedEvent,
    feedModule: ActivityFeedModule,
    cardBg: string,
    style: string,
    accentColor: string,
    textColor: string,
    secondaryColor: string
  ): TemplateResult {
    const avatarRadius =
      feedModule.avatar_style === 'circle'
        ? '50%'
        : feedModule.avatar_style === 'rounded'
          ? '8px'
          : '2px';

    return html`
      <div class="af-feed-card af-feed-card--${style}" style="background: ${cardBg};">
        <div class="af-feed-card-body">
          ${feedModule.show_avatar
            ? html`
                <div
                  class="af-feed-avatar"
                  style="background: ${event.color}20; border-radius: ${avatarRadius};"
                >
                  <ha-icon
                    icon="${event.icon}"
                    style="color: ${event.color}; --mdc-icon-size: 20px;"
                  ></ha-icon>
                </div>
              `
            : nothing}
          <div class="af-feed-card-text">
            <div class="af-feed-card-header">
              <span class="af-feed-card-name" style="color: ${textColor};">
                ${event.entityName}
              </span>
              <span class="af-feed-card-time" style="color: ${secondaryColor};">
                ${feedModule.show_relative_time ? event.relativeTime : ''}
                ${feedModule.show_absolute_time ? event.absoluteTime : ''}
              </span>
            </div>
            <div class="af-feed-card-desc" style="color: ${secondaryColor};">
              ${feedModule.show_state_change
                ? html`
                    <span class="af-feed-state-badge" style="background: ${event.color}18; color: ${event.color};">
                      ${this._formatState(event.newState)}
                    </span>
                  `
                : nothing}
              <span>${this._eventDescription(event)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =============================================
  // HELPERS
  // =============================================

  private _groupByDate(
    events: FeedEvent[]
  ): { label: string; events: FeedEvent[] }[] {
    const groups = new Map<string, FeedEvent[]>();
    for (const event of events) {
      const label = event.dateLabel;
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(event);
    }
    return Array.from(groups.entries()).map(([label, events]) => ({
      label,
      events,
    }));
  }

  private _relativeTime(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private _absoluteTime(date: Date): string {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  }

  private _dateLabel(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const diffDays = Math.floor(
      (today.getTime() - eventDay.getTime()) / 86400000
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  private _formatState(state: string): string {
    return state.charAt(0).toUpperCase() + state.slice(1).replace(/_/g, ' ');
  }

  private _eventDescription(event: FeedEvent): string {
    const domainDescriptions: Record<string, (s: string) => string> = {
      light: s => (s === 'on' ? 'turned on' : s === 'off' ? 'turned off' : `changed to ${s}`),
      switch: s => (s === 'on' ? 'turned on' : s === 'off' ? 'turned off' : `changed to ${s}`),
      binary_sensor: s => (s === 'on' ? 'detected' : s === 'off' ? 'cleared' : `changed to ${s}`),
      lock: s => (s === 'locked' ? 'was locked' : s === 'unlocked' ? 'was unlocked' : `changed to ${s}`),
      cover: s => (s === 'open' ? 'was opened' : s === 'closed' ? 'was closed' : `changed to ${s}`),
      climate: s => `set to ${s}`,
      fan: s => (s === 'on' ? 'turned on' : s === 'off' ? 'turned off' : `changed to ${s}`),
      media_player: s => (s === 'playing' ? 'started playing' : s === 'paused' ? 'was paused' : s === 'idle' ? 'went idle' : `changed to ${s}`),
      person: s => `is ${s}`,
      device_tracker: s => `is ${s}`,
    };

    const fn = domainDescriptions[event.domain];
    return fn ? fn(event.newState) : `changed to ${event.newState}`;
  }

  private _domainIcon(domain: string): string {
    const icons: Record<string, string> = {
      light: 'mdi:lightbulb',
      switch: 'mdi:light-switch',
      binary_sensor: 'mdi:radiobox-marked',
      sensor: 'mdi:eye',
      climate: 'mdi:thermostat',
      cover: 'mdi:window-shutter',
      fan: 'mdi:fan',
      lock: 'mdi:lock',
      media_player: 'mdi:cast',
      person: 'mdi:account',
      device_tracker: 'mdi:map-marker',
      automation: 'mdi:robot',
      scene: 'mdi:palette',
      script: 'mdi:script-text',
      input_boolean: 'mdi:toggle-switch',
      input_number: 'mdi:ray-vertex',
      input_select: 'mdi:form-dropdown',
      camera: 'mdi:camera',
      vacuum: 'mdi:robot-vacuum',
      alarm_control_panel: 'mdi:shield-home',
    };
    return icons[domain] || 'mdi:help-circle-outline';
  }

  private _domainColor(domain: string): string {
    const colors: Record<string, string> = {
      light: '#FFB300',
      switch: '#43A047',
      binary_sensor: '#1E88E5',
      sensor: '#8E24AA',
      climate: '#E53935',
      cover: '#6D4C41',
      fan: '#00ACC1',
      lock: '#F4511E',
      media_player: '#7B1FA2',
      person: '#3949AB',
      device_tracker: '#00897B',
      automation: '#546E7A',
      scene: '#D81B60',
      camera: '#5E35B1',
      vacuum: '#00BFA5',
      alarm_control_panel: '#FF6F00',
    };
    return colors[domain] || 'var(--primary-color)';
  }

  // =============================================
  // STYLES
  // =============================================

  private _getPreviewStyles(feedModule: ActivityFeedModule): string {
    return `
      .af-container {
        width: 100%;
        box-sizing: border-box;
        padding: 8px;
        font-family: inherit;
      }

      .af-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 16px;
        text-align: center;
      }

      /* ====== TIMELINE VIEW ====== */

      .af-timeline {
        position: relative;
        padding-left: 28px;
      }

      .af-timeline::before {
        content: '';
        position: absolute;
        left: calc(var(--tl-dot-size) / 2 - 1px);
        top: 4px;
        bottom: 4px;
        width: 2px;
        background: var(--tl-line);
        opacity: 0.3;
        border-radius: 1px;
      }

      .af-tl-group-label {
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        padding: 12px 0 8px;
        margin-left: -28px;
        padding-left: 28px;
      }

      .af-tl-item {
        position: relative;
        display: flex;
        gap: 12px;
        padding: 8px 0;
        align-items: flex-start;
      }

      .af-tl-dot-wrap {
        position: absolute;
        left: -28px;
        top: 12px;
        width: var(--tl-dot-size);
        height: var(--tl-dot-size);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .af-tl-dot {
        width: var(--tl-dot-size);
        height: var(--tl-dot-size);
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(var(--rgb-primary-color), 0.15);
        transition: transform 0.2s ease;
      }

      .af-tl-item:hover .af-tl-dot {
        transform: scale(1.3);
      }

      .af-tl-content {
        flex: 1;
        min-width: 0;
      }

      .af-tl-header {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .af-tl-name {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .af-tl-detail {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 2px;
        font-size: 12px;
      }

      .af-tl-state {
        font-weight: 500;
      }

      .af-tl-time {
        opacity: 0.7;
      }

      .af-tl-time::before {
        content: '·';
        margin-right: 8px;
      }

      /* ====== SOCIAL FEED VIEW ====== */

      .af-feed {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .af-feed-group-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        padding: 12px 0 4px;
      }

      .af-feed-group-count {
        font-size: 10px;
        font-weight: 600;
        background: rgba(var(--rgb-primary-color), 0.15);
        padding: 2px 8px;
        border-radius: 10px;
      }

      .af-feed-card {
        border-radius: 12px;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        overflow: hidden;
      }

      .af-feed-card:hover {
        transform: translateY(-1px);
      }

      .af-feed-card--flat {
        background: transparent;
      }

      .af-feed-card--elevated {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      .af-feed-card--elevated:hover {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .af-feed-card--outlined {
        border: 1px solid var(--divider-color);
      }

      .af-feed-card-body {
        display: flex;
        gap: 12px;
        padding: 12px;
        align-items: center;
      }

      .af-feed-avatar {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .af-feed-card-text {
        flex: 1;
        min-width: 0;
      }

      .af-feed-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .af-feed-card-name {
        font-size: 14px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .af-feed-card-time {
        font-size: 11px;
        flex-shrink: 0;
        opacity: 0.7;
      }

      .af-feed-card-desc {
        font-size: 13px;
        margin-top: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .af-feed-state-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 6px;
        flex-shrink: 0;
      }
    `;
  }

  getStyles(): string {
    return `${BaseUltraModule.getSliderStyles()}`;
  }
}
