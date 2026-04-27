import { TemplateResult, html, nothing } from 'lit';
import { localize } from '../localize/localize';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, LockModule as LockModuleConfig, UltraCardConfig } from '../types';

/** Home Assistant LockEntityFeature.OPEN */
const LOCK_FEATURE_OPEN = 1;

type LockPendingAction = 'lock' | 'unlock' | 'open';

function lockSupportedFeatures(attrs: Record<string, unknown>): number {
  const v = attrs.supported_features;
  return typeof v === 'number' ? v : 0;
}

function lockHasOpen(sup: number): boolean {
  return (sup & LOCK_FEATURE_OPEN) !== 0;
}

/** Hero circle diameter (px) — align with `.uc-lock-circle` in getStyles */
const LOCK_HERO_CIRCLE_PX = 140;

/**
 * Lock Module — control Home Assistant lock entities (lock / unlock / open when supported).
 */
export class UltraLockModule extends BaseUltraModule {
  /** Optimistic action until HA state reflects the transition */
  private _lockPending = new Map<string, LockPendingAction>();

  override handlesOwnDesignStyles = true;

  metadata: ModuleMetadata = {
    type: 'lock',
    title: 'Lock Control',
    description: 'Modern lock control with lock, unlock, and open when supported',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:lock',
    category: 'interactive',
    tags: ['lock', 'security', 'door', 'interactive'],
  };

  createDefault(id?: string, _hass?: HomeAssistant): LockModuleConfig {
    return {
      id: id || this.generateId('lock'),
      type: 'lock',
      entity: '',
      name: '',
      icon: '',
      layout: 'standard',
      alignment: 'center',
      show_title: true,
      show_icon: true,
      show_state: true,
      show_open_button: true,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  override validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const lock = module as LockModuleConfig;
    if (!module.id) errors.push('Module ID is required');
    if (!module.type || module.type !== 'lock') errors.push('Module type must be lock');
    if (!lock.entity?.trim()) errors.push(localize('editor.lock.error_entity', 'en', 'Select a lock entity'));
    return { valid: errors.length === 0, errors };
  }

  private getLayoutOptions(
    lang: string
  ): Array<{ value: NonNullable<LockModuleConfig['layout']>; label: string }> {
    return [
      { value: 'hero', label: localize('editor.lock.layout_hero', lang, 'Hero') },
      { value: 'standard', label: localize('editor.lock.layout_standard', lang, 'Standard') },
      { value: 'compact', label: localize('editor.lock.layout_compact', lang, 'Compact') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const lock = module as LockModuleConfig;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        ${this.renderSettingsSection(
          localize('editor.lock.entity_section', lang, 'Entity'),
          localize('editor.lock.entity_section_desc', lang, 'Select the lock to control.'),
          []
        )}
        <div style="margin-bottom: 24px;">
          ${this.renderEntityPickerWithVariables(
            hass, config, 'entity', lock.entity || '',
            (value: string) => {
              updateModule({ entity: value });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
            ['lock'],
            localize('editor.lock.entity', lang, 'Lock entity')
          )}
        </div>
        ${this.renderSettingsSection('', '', [
            {
              title: localize('editor.lock.icon_override', lang, 'Icon override'),
              description: localize(
                'editor.lock.icon_override_desc',
                lang,
                'Optional mdi: icon; leave empty for default lock icons'
              ),
              hass,
              data: { icon: lock.icon || '' },
              schema: [this.textField('icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ icon: (e.detail.value?.icon as string) ?? '' }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.lock.display_section', lang, 'Display'),
          localize('editor.lock.display_desc', lang, 'Choose what to show on the card.'),
          [
            {
              title: localize('editor.lock.show_title', lang, 'Show title'),
              description: localize('editor.lock.show_title_desc', lang, 'Display the lock name'),
              hass,
              data: { show_title: lock.show_title !== false },
              schema: [this.booleanField('show_title')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_title: e.detail.value?.show_title ?? true }),
            },
            {
              title: localize('editor.lock.show_icon', lang, 'Show icon'),
              description: localize('editor.lock.show_icon_desc', lang, 'Show lock icon (standard / compact / hero)'),
              hass,
              data: { show_icon: lock.show_icon !== false },
              schema: [this.booleanField('show_icon')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_icon: e.detail.value?.show_icon ?? true }),
            },
            {
              title: localize('editor.lock.show_state', lang, 'Show state'),
              description: localize('editor.lock.show_state_desc', lang, 'Display locked / unlocked text'),
              hass,
              data: { show_state: lock.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_state: e.detail.value?.show_state ?? true }),
            },
            {
              title: localize('editor.lock.show_open_button', lang, 'Show open button'),
              description: localize(
                'editor.lock.show_open_button_desc',
                lang,
                'Show Open when the lock supports unlatch (OPEN feature)'
              ),
              hass,
              data: { show_open_button: lock.show_open_button !== false },
              schema: [this.booleanField('show_open_button')],
              onChange: (e: CustomEvent) =>
                updateModule({ show_open_button: e.detail.value?.show_open_button ?? true }),
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.lock.layout_section', lang, 'Layout'),
          localize('editor.lock.layout_desc', lang, 'Visual style of the lock control.'),
          [
            {
              title: localize('editor.lock.layout', lang, 'Layout'),
              description: localize('editor.lock.layout_style_desc', lang, 'Hero, standard, or compact'),
              hass,
              data: { layout: lock.layout || 'standard' },
              schema: [this.selectField('layout', this.getLayoutOptions(lang))],
              onChange: (e: CustomEvent) => {
                updateModule({ layout: e.detail.value?.layout || 'standard' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}
      </div>
    `;
  }

  private injectLockStyles(): TemplateResult {
    return html`<style>
      ${this.getStyles()}
    </style>`;
  }

  /** Clear optimistic pending when HA state reflects the action */
  private syncLockPending(entityId: string, stateStr: string): void {
    const p = this._lockPending.get(entityId);
    if (!p) return;
    if (p === 'lock' && (stateStr === 'locked' || stateStr === 'locking')) {
      this._lockPending.delete(entityId);
    } else if (p === 'unlock' && (stateStr === 'unlocked' || stateStr === 'unlocking')) {
      this._lockPending.delete(entityId);
    } else if (p === 'open' && (stateStr === 'unlocked' || stateStr === 'unlocking')) {
      this._lockPending.delete(entityId);
    }
  }

  renderPreview(
    module: CardModule,
    hass: HomeAssistant,
    config?: UltraCardConfig,
    _previewContext?: 'live' | 'ha-preview' | 'dashboard'
  ): TemplateResult {
    const lockCfg = module as LockModuleConfig;
    const entityId = this.resolveEntity(lockCfg.entity, config) || lockCfg.entity;
    const lang = hass?.locale?.language || 'en';

    if (!entityId || !hass?.states?.[entityId]) {
      return html`
        ${this.injectLockStyles()}
        <div class="uc-lock-wrapper" style="border-radius: 16px; overflow: hidden;">
          ${this.renderGradientErrorState(
            localize('editor.lock.config_needed', lang, 'Select a lock'),
            localize('editor.lock.config_needed_desc', lang, 'Choose a lock entity in the General tab'),
            'mdi:lock'
          )}
        </div>
      `;
    }

    const stateObj = hass.states[entityId];
    const attrs = (stateObj.attributes || {}) as Record<string, unknown>;
    const stateStr = String(stateObj.state).toLowerCase();
    this.syncLockPending(entityId, stateStr);

    const sup = lockSupportedFeatures(attrs);
    const hasOpen = lockHasOpen(sup);
    const showOpen = lockCfg.show_open_button !== false && hasOpen;

    const isUnavailable = stateStr === 'unavailable' || stateStr === 'unknown';
    const isBusy = stateStr === 'locking' || stateStr === 'unlocking';
    const isJammed = stateStr === 'jammed';
    const isLocked = stateStr === 'locked';
    const isUnlocked = stateStr === 'unlocked';

    const layout = lockCfg.layout || 'standard';
    const showTitle = lockCfg.show_title !== false;
    const showIcon = lockCfg.show_icon !== false;
    const showState = lockCfg.show_state !== false;
    const iconOverride = lockCfg.icon?.trim();

    const name =
      lockCfg.name?.trim() ||
      (typeof attrs.friendly_name === 'string' ? attrs.friendly_name : '') ||
      entityId.split('.').pop()?.replace(/_/g, ' ') ||
      'Lock';

    const stateLabel = (() => {
      if (isUnavailable) return localize('editor.lock.unavailable', lang, 'Unavailable');
      if (isJammed) return localize('editor.lock.jammed', lang, 'Jammed');
      if (stateStr === 'locking') return localize('editor.lock.locking', lang, 'Locking…');
      if (stateStr === 'unlocking') return localize('editor.lock.unlocking', lang, 'Unlocking…');
      if (isLocked) return localize('editor.lock.locked', lang, 'Locked');
      if (isUnlocked) return localize('editor.lock.unlocked', lang, 'Unlocked');
      return stateStr.replace(/_/g, ' ');
    })();

    const defaultIcon = isLocked ? 'mdi:lock' : 'mdi:lock-open-variant';
    const iconName = iconOverride || defaultIcon;

    const call = (service: 'lock' | 'unlock' | 'open') => {
      hass.callService('lock', service, { entity_id: entityId });
    };

    const setPending = (action: LockPendingAction) => {
      this._lockPending.set(entityId, action);
      this.triggerPreviewUpdate(true);
    };

    const onLock = () => {
      setPending('lock');
      call('lock');
    };
    const onUnlock = () => {
      setPending('unlock');
      call('unlock');
    };
    const onOpen = () => {
      setPending('open');
      call('open');
    };

    const controlsDisabled = isUnavailable || isBusy;

    const lockedVisual = isLocked || stateStr === 'locking';

    const lockIconEl = (px: number) => html`
      <ha-icon
        class="uc-lock-ha-icon ${lockedVisual ? 'uc-lock-ha-icon--locked' : ''}"
        style="--mdc-icon-size: ${px}px; color: var(--primary-color);"
        icon="${iconName}"
      ></ha-icon>
    `;

    const actionBtns = () => html`
      <button
        type="button"
        class="uc-lock-btn ${isLocked ? 'uc-lock-btn--active' : ''}"
        @click=${onLock}
        ?disabled=${controlsDisabled}
      >
        <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:lock"></ha-icon>
        ${localize('editor.lock.action_lock', lang, 'Lock')}
      </button>
      <button
        type="button"
        class="uc-lock-btn ${isUnlocked ? 'uc-lock-btn--active' : ''}"
        @click=${onUnlock}
        ?disabled=${controlsDisabled}
      >
        <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:lock-open-variant"></ha-icon>
        ${localize('editor.lock.action_unlock', lang, 'Unlock')}
      </button>
      ${showOpen
        ? html`<button
            type="button"
            class="uc-lock-btn uc-lock-btn--ghost"
            @click=${onOpen}
            ?disabled=${controlsDisabled}
          >
            <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:door-open"></ha-icon>
            ${localize('editor.lock.action_open', lang, 'Open')}
          </button>`
        : nothing}
    `;

    let content: TemplateResult;

    if (layout === 'hero') {
      content = html`
        <div class="uc-lock uc-lock--hero">
          <div class="uc-lock__visual">
            <div class="uc-lock__glow ${lockedVisual ? 'uc-lock__glow--on' : ''}"></div>
            <div class="uc-lock-circle ${lockedVisual ? 'uc-lock-circle--locked' : ''} ${isJammed ? 'uc-lock-circle--jammed' : ''}">
              ${showIcon ? lockIconEl(56) : nothing}
            </div>
          </div>
          <div class="uc-lock__identity">
            ${showTitle ? html`<h2 class="uc-lock-title">${name}</h2>` : nothing}
            ${showState
              ? html`<span class="uc-lock-badge ${lockedVisual ? 'uc-lock-badge--locked' : ''} ${isJammed ? 'uc-lock-badge--jammed' : ''} ${isUnavailable ? 'uc-lock-badge--unavail' : ''}">
                  ${lockedVisual && !isUnavailable ? html`<span class="uc-lock-status-dot"></span>` : nothing}
                  ${stateLabel}
                </span>`
              : nothing}
          </div>
          ${isJammed ? html`<p class="uc-lock-warn">${localize('editor.lock.jammed_hint', lang, 'Check the lock hardware.')}</p>` : nothing}
          <div class="uc-lock__actions" role="group">${actionBtns()}</div>
        </div>
      `;
    } else if (layout === 'compact') {
      content = html`
        <div class="uc-lock uc-lock--compact">
          <div class="uc-lock-compact__row">
            ${showIcon
              ? html`<div class="uc-lock-icon-well ${lockedVisual ? 'uc-lock-icon-well--locked' : ''} ${isJammed ? 'uc-lock-icon-well--jammed' : ''}">
                  ${lockIconEl(18)}
                </div>`
              : nothing}
            <span class="uc-lock-chip-label">${showTitle ? name : stateLabel}</span>
            <button
              type="button"
              class="uc-lock-chip-btn ${lockedVisual ? '' : 'uc-lock-chip-btn--active'}"
              @click=${isLocked ? onUnlock : onLock}
              ?disabled=${controlsDisabled}
            >
              ${isLocked
                ? localize('editor.lock.action_unlock', lang, 'Unlock')
                : localize('editor.lock.action_lock', lang, 'Lock')}
            </button>
          </div>
        </div>
      `;
    } else {
      content = html`
        <div class="uc-lock uc-lock--standard">
          <div class="uc-lock-std__row">
            ${showIcon
              ? html`<div class="uc-lock-icon-well uc-lock-icon-well--std ${lockedVisual ? 'uc-lock-icon-well--locked' : ''} ${isJammed ? 'uc-lock-icon-well--jammed' : ''}">
                  ${lockIconEl(28)}
                </div>`
              : nothing}
            <div class="uc-lock-std__meta">
              ${showTitle ? html`<h2 class="uc-lock-title uc-lock-title--std">${name}</h2>` : nothing}
              ${showState ? html`<p class="uc-lock-subtitle">${stateLabel}</p>` : nothing}
            </div>
            <div class="uc-lock-std__actions" role="group">${actionBtns()}</div>
          </div>
          ${isJammed ? html`<p class="uc-lock-warn">${localize('editor.lock.jammed_hint', lang, 'Check the lock hardware.')}</p>` : nothing}
        </div>
      `;
    }

    const styles = this.buildDesignStyles(module, hass);
    const styleStr = Object.entries(styles)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`)
      .join('; ');
    const hoverClass = this.getHoverEffectClass(module);

    return html`
      ${this.injectLockStyles()}
      <div
        class="uc-lock-wrapper ${hoverClass} ${isJammed ? 'uc-lock-wrapper--jammed' : ''}"
        style="background: var(--card-background-color, var(--ha-card-background)); border-radius: 18px; overflow: hidden; ${styleStr}"
      >
        ${this.wrapWithAnimation(content, module, hass)}
      </div>
    `;
  }

  getStyles(): string {
    return `
      .uc-lock-wrapper { box-sizing: border-box; }
      .uc-lock { box-sizing: border-box; color: var(--primary-text-color); }

      /* ═══ HERO ═══════════════════════════════════ */
      .uc-lock--hero {
        padding: 28px 20px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .uc-lock__visual {
        position: relative;
        width: ${LOCK_HERO_CIRCLE_PX}px;
        height: ${LOCK_HERO_CIRCLE_PX}px;
        flex-shrink: 0;
      }
      .uc-lock__glow {
        position: absolute;
        inset: -14px;
        border-radius: 50%;
        background: radial-gradient(circle, color-mix(in srgb, var(--primary-color) 12%, transparent) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      .uc-lock__glow--on { opacity: 1; }
      .uc-lock-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(
          circle at 38% 32%,
          color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background))) 0%,
          color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 92%, var(--primary-color)) 100%
        );
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 40%, transparent);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 16px rgba(0,0,0,0.12);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        z-index: 1;
      }
      .uc-lock-circle--locked {
        border-color: color-mix(in srgb, var(--primary-color) 35%, transparent);
        box-shadow: inset 0 2px 16px rgba(0,0,0,0.14), 0 0 40px color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
      .uc-lock-circle--jammed {
        border-color: color-mix(in srgb, var(--error-color, #db4437) 45%, transparent);
      }
      .uc-lock__identity {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
      }
      .uc-lock--hero .uc-lock__actions {
        display: flex;
        gap: 8px;
        width: 100%;
        max-width: 340px;
      }

      /* ═══ STANDARD (single row) ══════════════════ */
      .uc-lock--standard { padding: 14px 16px; }
      .uc-lock-std__row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .uc-lock-std__meta { flex: 1; min-width: 0; overflow: hidden; }
      .uc-lock-std__actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .uc-lock-std__actions .uc-lock-btn {
        padding: 7px 14px;
        font-size: 0.8125rem;
        border-radius: 999px;
      }
      .uc-lock-icon-well--std { width: 40px; height: 40px; }
      .uc-lock-title--std { font-size: 0.9375rem; font-weight: 700; }
      .uc-lock-subtitle {
        margin: 3px 0 0;
        font-size: 0.8125rem;
        line-height: 1.35;
        color: var(--secondary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ═══ COMPACT (chip) ═════════════════════════ */
      .uc-lock--compact { padding: 6px 10px; }
      .uc-lock-compact__row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .uc-lock-chip-label {
        flex: 1;
        min-width: 0;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lock-chip-btn {
        flex-shrink: 0;
        font: inherit;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 999px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 75%, transparent);
        background: color-mix(in srgb, var(--divider-color) 8%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-text-color);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
      }
      .uc-lock-chip-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .uc-lock-chip-btn--active {
        border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);
        background: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-color);
      }

      /* ═══ SHARED ═════════════════════════════════ */
      .uc-lock-icon-well {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background)));
        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .uc-lock--compact .uc-lock-icon-well {
        width: 28px; height: 28px;
        background: transparent;
        border: none;
      }
      .uc-lock-icon-well--locked {
        border-color: color-mix(in srgb, var(--primary-color) 38%, transparent);
        box-shadow: 0 2px 14px color-mix(in srgb, var(--primary-color) 12%, transparent);
      }
      .uc-lock-icon-well--jammed {
        border-color: color-mix(in srgb, var(--error-color, #db4437) 40%, transparent);
      }
      .uc-lock-ha-icon { line-height: 1; transition: transform 0.28s ease; }
      .uc-lock-ha-icon--locked { transform: scale(1.05); }
      @media (prefers-reduced-motion: reduce) {
        .uc-lock-ha-icon { transition: none; }
        .uc-lock-ha-icon--locked { transform: none; }
      }

      .uc-lock-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.25;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lock-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 14px;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        background: color-mix(in srgb, var(--divider-color) 15%, var(--card-background-color, var(--ha-card-background)));
        color: var(--secondary-text-color);
        border: 1px solid color-mix(in srgb, var(--divider-color) 35%, transparent);
      }
      .uc-lock-badge--locked {
        background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-color);
        border-color: color-mix(in srgb, var(--primary-color) 25%, transparent);
      }
      .uc-lock-badge--jammed {
        background: color-mix(in srgb, var(--error-color, #db4437) 12%, var(--card-background-color, var(--ha-card-background)));
        color: var(--error-color, #db4437);
        border-color: color-mix(in srgb, var(--error-color, #db4437) 25%, transparent);
      }
      .uc-lock-badge--unavail { opacity: 0.6; }
      .uc-lock-status-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--primary-color);
        box-shadow: 0 0 6px color-mix(in srgb, var(--primary-color) 60%, transparent);
        flex-shrink: 0;
      }
      .uc-lock-warn {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--error-color, #db4437);
        font-weight: 600;
      }
      .uc-lock-wrapper--jammed .uc-lock-badge {
        color: color-mix(in srgb, var(--error-color, #db4437) 70%, var(--secondary-text-color));
      }

      .uc-lock-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 14px;
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        background: color-mix(in srgb, var(--divider-color) 6%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-text-color);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
      }
      .uc-lock-btn:active:not(:disabled) { transform: scale(0.97); }
      .uc-lock-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .uc-lock-btn--active {
        border-color: color-mix(in srgb, var(--primary-color) 50%, transparent);
        background: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, var(--ha-card-background)));
        color: var(--primary-color);
      }
      .uc-lock-btn:hover:not(:disabled) {
        border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--primary-color) 10%, transparent);
      }
      .uc-lock-btn--ghost {
        font-weight: 600;
        color: var(--secondary-text-color);
        background: transparent;
        border-color: color-mix(in srgb, var(--divider-color) 40%, transparent);
      }
    `;
  }
}
