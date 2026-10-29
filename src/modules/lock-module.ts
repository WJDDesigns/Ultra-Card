import { TemplateResult, html, nothing } from 'lit';
import { localize } from '../localize/localize';
import type { HomeAssistant } from '../ha/types';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, LockModule as LockModuleConfig, UltraCardConfig } from '../types';
import { ucActionConfirmationService } from '../services/uc-action-confirmation-service';
import { promptForCode } from '../services/uc-code-prompt-service';
import '../components/uc-slide-confirm';
import '../components/uc-pattern-pad';
import { promptForPattern } from '../services/uc-pattern-prompt-service';

/** Home Assistant LockEntityFeature.OPEN */
const LOCK_FEATURE_OPEN = 1;

type LockPendingAction = 'lock' | 'unlock' | 'open';

/** Design tab text and background fields the lock reads (root or `design`, design wins). */
interface LockDesignText {
  color?: string;
  text_align?: string;
  font_size?: string | number;
  font_weight?: string | number;
  font_family?: string;
  background_color?: string;
}
type LockWithDesign = LockModuleConfig & LockDesignText & { design?: LockDesignText };

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
      show_lock_buttons: true,
      require_confirmation: true,
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
    // No hass/lang available in validate() — plain English matches other modules' validators
    if (!lock.entity?.trim()) errors.push('Select a lock entity');
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
    const styled = lock as LockWithDesign;
    const lang = hass?.locale?.language || 'en';
    const lockState = lock.entity ? hass?.states?.[lock.entity] : undefined;
    // No entity yet (or not loaded): leave the toggle usable
    const canOpen =
      !lockState ||
      lockHasOpen(lockSupportedFeatures((lockState.attributes || {}) as Record<string, unknown>));

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
              title: localize('editor.lock.name', lang, 'Name'),
              description: localize(
                'editor.lock.name_desc',
                lang,
                "Shown instead of the lock's name from Home Assistant. Leave empty to use that name."
              ),
              hass,
              data: { name: lock.name || '' },
              schema: [this.textField('name')],
              onChange: (e: CustomEvent) => {
                updateModule({ name: (e.detail.value?.name as string) ?? '' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}
        ${this.renderIconField(
          localize('editor.lock.icon_override', lang, 'Icon'),
          localize(
            'editor.lock.icon_override_desc',
            lang,
            'Search for an icon, or leave empty for the default lock icons. Used in every state unless you set an unlocked icon below.'
          ),
          hass,
          lock.icon || '',
          next => updateModule({ icon: next })
        )}
        ${this.renderIconField(
          localize('editor.lock.icon_unlocked', lang, 'Unlocked icon'),
          localize(
            'editor.lock.icon_unlocked_desc',
            lang,
            'Optional icon while the lock is unlocked or open'
          ),
          hass,
          lock.icon_unlocked || '',
          next => updateModule({ icon_unlocked: next })
        )}

        ${this.renderSettingsSection(
          localize('editor.lock.colors_section', lang, 'Colors'),
          localize(
            'editor.lock.colors_desc',
            lang,
            'Colour the icon, ring, active button and status by state. Leave empty to use the theme colour.'
          ),
          []
        )}
        ${this.renderColorField(
          localize('editor.lock.locked_color', lang, 'Locked colour'),
          '',
          hass,
          lock.locked_color || '',
          '',
          next => updateModule({ locked_color: next })
        )}
        ${this.renderColorField(
          localize('editor.lock.unlocked_color', lang, 'Unlocked colour'),
          '',
          hass,
          lock.unlocked_color || '',
          '',
          next => updateModule({ unlocked_color: next })
        )}
        ${this.renderColorField(
          localize('editor.lock.card_color', lang, 'Card colour'),
          localize(
            'editor.lock.card_color_desc',
            lang,
            'Background of the lock card. Same setting as Background colour in the Design tab.'
          ),
          hass,
          styled.design?.background_color || styled.background_color || '',
          '',
          next =>
            updateModule({
              background_color: next,
              ...(styled.design ? { design: { ...styled.design, background_color: next } } : {}),
            } as Partial<CardModule>)
        )}
        <div style="margin-bottom: 24px;"></div>

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
              onChange: (e: CustomEvent) => {
                updateModule({ show_title: e.detail.value?.show_title ?? true });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.lock.show_icon', lang, 'Show icon'),
              description: localize('editor.lock.show_icon_desc', lang, 'Show lock icon (standard / compact / hero)'),
              hass,
              data: { show_icon: lock.show_icon !== false },
              schema: [this.booleanField('show_icon')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_icon: e.detail.value?.show_icon ?? true });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.lock.show_state', lang, 'Show state'),
              description: localize('editor.lock.show_state_desc', lang, 'Display locked / unlocked text'),
              hass,
              data: { show_state: lock.show_state !== false },
              schema: [this.booleanField('show_state')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_state: e.detail.value?.show_state ?? true });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.lock.show_lock_buttons', lang, 'Show lock / unlock buttons'),
              description: localize(
                'editor.lock.show_lock_buttons_desc',
                lang,
                'Show the Lock and Unlock buttons (the compact layout shows one toggle button). Without them, set the tap action to Toggle to lock and unlock by tapping the card.'
              ),
              hass,
              data: { show_lock_buttons: lock.show_lock_buttons !== false },
              schema: [this.booleanField('show_lock_buttons')],
              onChange: (e: CustomEvent) => {
                updateModule({ show_lock_buttons: e.detail.value?.show_lock_buttons ?? true });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.lock.show_open_button', lang, 'Show open button'),
              description: canOpen
                ? localize(
                    'editor.lock.show_open_button_desc',
                    lang,
                    'Show Open when the lock supports unlatch (OPEN feature)'
                  )
                : localize(
                    'editor.lock.show_open_button_unsupported',
                    lang,
                    "This lock can't unlatch (no Open feature), so there's no Open button to show"
                  ),
              hass,
              data: { show_open_button: lock.show_open_button !== false },
              schema: [{ ...this.booleanField('show_open_button'), disabled: !canOpen }],
              onChange: (e: CustomEvent) => {
                updateModule({ show_open_button: e.detail.value?.show_open_button ?? true });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        ${this.renderSettingsSection(
          localize('editor.lock.behavior_section', lang, 'Behavior'),
          localize('editor.lock.behavior_desc', lang, 'Safety options for lock actions.'),
          [
            {
              title: localize('editor.lock.require_confirmation', lang, 'Confirm unlock / open'),
              description: localize(
                'editor.lock.require_confirmation_desc',
                lang,
                'Ask for confirmation before unlocking or opening'
              ),
              hass,
              data: { require_confirmation: lock.require_confirmation !== false },
              schema: [this.booleanField('require_confirmation')],
              onChange: (e: CustomEvent) => {
                updateModule({ require_confirmation: e.detail.value?.require_confirmation ?? true });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.lock.unlock_style', lang, 'Unlock with'),
              description: localize(
                'editor.lock.unlock_style_desc',
                lang,
                'Slide replaces the Unlock and Open buttons with sliders, so a stray tap can\'t unlock (Hero and Standard layouts; elsewhere it asks for confirmation). Pattern and PIN are checked in the card before unlocking.'
              ),
              hass,
              data: { unlock_style: lock.unlock_style || 'buttons' },
              schema: [
                this.selectField('unlock_style', [
                  { value: 'buttons', label: localize('editor.lock.unlock_style_buttons', lang, 'Buttons') },
                  { value: 'slide', label: localize('editor.lock.unlock_style_slide', lang, 'Slide to unlock') },
                  { value: 'pattern', label: localize('editor.lock.unlock_style_pattern', lang, 'Draw a pattern') },
                  { value: 'pin', label: localize('editor.lock.unlock_style_pin', lang, 'Enter a PIN') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ unlock_style: e.detail.value?.unlock_style || 'buttons' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
            {
              title: localize('editor.lock.ask_code', lang, 'Ask for PIN code'),
              description: localize(
                'editor.lock.ask_code_desc',
                lang,
                'Shows a keypad and sends the code to the lock. Automatic asks when the lock needs a code. Choose Never if you set a default code for the lock in Home Assistant.'
              ),
              hass,
              data: { ask_code: lock.ask_code || 'auto' },
              schema: [
                this.selectField('ask_code', [
                  { value: 'auto', label: localize('editor.lock.ask_code_auto', lang, 'Automatic') },
                  { value: 'always', label: localize('editor.lock.ask_code_always', lang, 'Always') },
                  { value: 'never', label: localize('editor.lock.ask_code_never', lang, 'Never') },
                ]),
              ],
              onChange: (e: CustomEvent) => {
                updateModule({ ask_code: e.detail.value?.ask_code || 'auto' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}

        ${lock.unlock_style === 'pattern' ? this.renderPatternRecorder(lock, updateModule, lang) : nothing}
        ${lock.unlock_style === 'pin' ? this.renderPinSetting(lock, hass, updateModule, lang) : nothing}

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
            {
              title: localize('editor.lock.alignment', lang, 'Alignment'),
              description: localize('editor.lock.alignment_desc', lang, 'Align content'),
              hass,
              data: { alignment: lock.alignment || 'center' },
              schema: [this.selectField('alignment', [
                { value: 'left', label: localize('editor.lock.align_left', lang, 'Left') },
                // Standard and compact rows spread across the card by default, so their
                // "center" value keeps that look under a clearer name.
                {
                  value: 'center',
                  label:
                    (lock.layout || 'standard') === 'hero'
                      ? localize('editor.lock.align_center', lang, 'Center')
                      : localize('editor.lock.align_spread', lang, 'Spread out'),
                },
                { value: 'right', label: localize('editor.lock.align_right', lang, 'Right') },
              ])],
              onChange: (e: CustomEvent) => {
                updateModule({ alignment: e.detail.value?.alignment || 'center' });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              },
            },
          ]
        )}
      </div>
    `;
  }

  /** Editor block where the unlock pattern is drawn and saved. */
  private renderPatternRecorder(
    lock: LockModuleConfig,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const saved = lock.unlock_pattern || '';
    const hasPattern = saved.length >= 4;
    const savedText = hasPattern
      ? localize('editor.lock.pattern_saved', lang, 'Pattern saved. Draw again to change it.')
      : localize('editor.lock.pattern_none', lang, 'No pattern yet, so unlocking uses the normal confirmation.');
    const onComplete = (e: CustomEvent<{ pattern: string }>) => {
      const pad = e.currentTarget as HTMLElement & { status: string; clear: () => void };
      const msg = pad.parentElement?.querySelector('.uc-lock-pattern-msg');
      const pattern = e.detail.pattern;
      if (pattern.length < 4) {
        pad.status = 'error';
        if (msg) msg.textContent = localize('editor.lock.pattern_too_short', lang, 'Connect at least 4 dots');
        setTimeout(() => {
          pad.clear();
          pad.status = '';
          if (msg) msg.textContent = savedText;
        }, 900);
        return;
      }
      pad.clear();
      updateModule({ unlock_pattern: pattern });
      setTimeout(() => this.triggerPreviewUpdate(), 50);
    };
    return html`
      <div
        class="settings-section"
        style="background: var(--secondary-background-color); border-radius: 8px; padding: 16px; margin-bottom: 32px;"
      >
        <div
          class="section-title"
          style="font-size: 18px; font-weight: 700; text-transform: uppercase; color: color-mix(in srgb, var(--primary-color) 60%, var(--primary-text-color)); margin-bottom: 16px; letter-spacing: 0.5px;"
        >
          ${localize('editor.lock.pattern_title', lang, 'Unlock pattern')}
        </div>
        <div
          style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 16px; opacity: 0.8; line-height: 1.4;"
        >
          ${localize(
            'editor.lock.pattern_desc',
            lang,
            "Draw the pattern that unlocks and opens this lock. It's saved in the dashboard, so it stops accidental unlocks but isn't a real password."
          )}
        </div>
        <uc-pattern-pad .pattern=${saved} @pattern-complete=${onComplete}></uc-pattern-pad>
        <div
          class="uc-lock-pattern-msg"
          style="font-size: 13px; text-align: center; margin-top: 12px; color: var(--secondary-text-color);"
        >
          ${savedText}
        </div>
      </div>
    `;
  }

  /** Editor block where the card's own unlock PIN is set. */
  private renderPinSetting(
    lock: LockModuleConfig,
    hass: HomeAssistant,
    updateModule: (updates: Partial<CardModule>) => void,
    lang: string
  ): TemplateResult {
    const pin = lock.unlock_pin || '';
    const status =
      pin.length >= 4
        ? localize('editor.lock.pin_saved', lang, 'PIN saved.')
        : localize('editor.lock.pin_none', lang, 'Enter at least 4 digits. Until then, unlocking uses the normal confirmation.');
    return html`
      ${this.renderSettingsSection(
        localize('editor.lock.pin_title', lang, 'Unlock PIN'),
        localize(
          'editor.lock.pin_desc',
          lang,
          "The PIN that unlocks and opens this lock. It's checked in the card and saved in the dashboard, so it stops accidental unlocks but isn't a real password. It is not sent to the lock."
        ),
        [
          {
            title: localize('editor.lock.pin_field', lang, 'PIN'),
            description: status,
            hass,
            data: { unlock_pin: pin },
            schema: [this.textField('unlock_pin')],
            onChange: (e: CustomEvent) => {
              const digits = String(e.detail.value?.unlock_pin ?? '').replace(/\D/g, '');
              updateModule({ unlock_pin: digits });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            },
          },
        ]
      )}
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
        <div
          class="uc-lock-wrapper"
          data-uc-role="pane"
          style="background: var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))); border-radius: var(--uc-r-16, 16px); overflow: hidden;"
        >
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
    const showLockBtns = lockCfg.show_lock_buttons !== false;
    const hasActions = showLockBtns || showOpen;

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
    const unlockedIcon = lockCfg.icon_unlocked?.trim();
    const showsUnlocked = isUnlocked || stateStr === 'unlocking' || stateStr === 'open' || stateStr === 'opening';
    const iconName = (showsUnlocked && unlockedIcon) || iconOverride || defaultIcon;

    // PIN code: 'auto' asks when the lock reports a code format, like HA's own dialog.
    const codeFormat = typeof attrs.code_format === 'string' ? attrs.code_format : undefined;
    const askCode = lockCfg.ask_code || 'auto';
    const needsCode = askCode === 'always' || (askCode === 'auto' && !!codeFormat);
    const slideMode = lockCfg.unlock_style === 'slide' && layout !== 'compact';
    // Until a pattern of at least 4 dots is saved, unlock falls back to the normal confirmation.
    const unlockPattern = lockCfg.unlock_pattern || '';
    const patternMode = lockCfg.unlock_style === 'pattern' && unlockPattern.length >= 4;
    // Same fallback for the card's own PIN.
    const unlockPin = lockCfg.unlock_pin || '';
    const pinMode = lockCfg.unlock_style === 'pin' && unlockPin.length >= 4;

    const actionLabel = (service: LockPendingAction) =>
      service === 'open'
        ? localize('editor.lock.action_open', lang, 'Open')
        : service === 'unlock'
          ? localize('editor.lock.action_unlock', lang, 'Unlock')
          : localize('editor.lock.action_lock', lang, 'Lock');

    /** Returns the code to send, '' when none is needed, or null when the user cancelled. */
    const getCode = async (service: LockPendingAction): Promise<string | null> => {
      if (!needsCode) return '';
      return promptForCode({
        title: `${actionLabel(service)} ${name}`,
        codeFormat,
        confirmText: actionLabel(service),
        cancelText: localize('editor.lock.cancel', lang, 'Cancel'),
        clearLabel: localize('editor.lock.code_clear', lang, 'Clear'),
        placeholder: localize('editor.lock.code_placeholder', lang, 'Code'),
      });
    };

    const call = (service: LockPendingAction, code: string) => {
      hass.callService('lock', service, code ? { entity_id: entityId, code } : { entity_id: entityId });
    };

    const setPending = (action: LockPendingAction) => {
      this._lockPending.set(entityId, action);
      this.triggerPreviewUpdate(true);
    };

    // Unlock/open are security-sensitive: confirm before calling unless disabled.
    // `fromSlider` is true only when a slider was completed; a tap elsewhere in slide mode
    // (e.g. the tap action with the buttons hidden) still has to be confirmed.
    const confirmSensitive = async (
      service: 'unlock' | 'open',
      fromSlider = false
    ): Promise<boolean> => {
      if (patternMode) {
        return promptForPattern({
          title: `${actionLabel(service)} ${name}`,
          expected: unlockPattern,
          hint: localize('editor.lock.pattern_prompt', lang, 'Draw your pattern'),
          wrongText: localize('editor.lock.pattern_wrong', lang, 'Wrong pattern, try again'),
          cancelText: localize('editor.lock.cancel', lang, 'Cancel'),
        });
      }
      if (pinMode) {
        const entered = await promptForCode({
          title: `${actionLabel(service)} ${name}`,
          confirmText: actionLabel(service),
          cancelText: localize('editor.lock.cancel', lang, 'Cancel'),
          clearLabel: localize('editor.lock.code_clear', lang, 'Clear'),
          placeholder: localize('editor.lock.pin_prompt', lang, 'Enter your PIN'),
          expected: unlockPin,
          wrongText: localize('editor.lock.pin_wrong', lang, 'Wrong PIN, try again'),
        });
        return entered !== null;
      }
      // Typing the code or completing the slide is already a deliberate step.
      if (fromSlider || needsCode) return true;
      // Slide mode exists to stop stray taps, so a tap outside the slider always confirms.
      if (lockCfg.require_confirmation === false && !slideMode) return true;
      ucActionConfirmationService.setHass(hass);
      return ucActionConfirmationService.showConfirmation(
        { action: 'perform-action', perform_action: `lock.${service}`, entity: entityId },
        {
          confirmText:
            service === 'open'
              ? localize('editor.lock.action_open', lang, 'Open')
              : localize('editor.lock.action_unlock', lang, 'Unlock'),
          cancelText: localize('editor.lock.cancel', lang, 'Cancel'),
        }
      );
    };

    const onLock = async () => {
      const code = await getCode('lock');
      if (code === null) return;
      setPending('lock');
      call('lock', code);
    };
    const onUnlock = async (fromSlider = false) => {
      if (!(await confirmSensitive('unlock', fromSlider))) return;
      const code = await getCode('unlock');
      if (code === null) return;
      setPending('unlock');
      call('unlock', code);
    };
    const onOpen = async (fromSlider = false) => {
      if (!(await confirmSensitive('open', fromSlider))) return;
      const code = await getCode('open');
      if (code === null) return;
      setPending('open');
      call('open', code);
    };

    const controlsDisabled = isUnavailable || isBusy;

    // The module's own tap / hold / double-tap actions. "Toggle" goes through the same
    // unlock checks as the buttons (pattern, PIN, confirmation), so hiding the buttons and
    // tapping the card can't skip them. Unset actions do nothing, as before.
    const onToggle = () => {
      if (controlsDisabled) return;
      void (isLocked ? onUnlock() : onLock());
    };
    const gestures = this.createGestureHandlers(
      `${module.id}-lock`,
      {
        tap_action: lockCfg.tap_action || { action: 'nothing' },
        hold_action: lockCfg.hold_action || { action: 'nothing' },
        double_tap_action: lockCfg.double_tap_action || { action: 'nothing' },
        entity: entityId,
        module,
        onToggle,
      },
      hass,
      config,
      ['.uc-lock-btn', '.uc-lock-chip-btn', 'uc-slide-confirm']
    );

    const lockedVisual = isLocked || stateStr === 'locking';

    const lockIconEl = (px: number) => html`
      <ha-icon
        class="uc-lock-ha-icon ${lockedVisual ? 'uc-lock-ha-icon--locked' : ''}"
        style="--mdc-icon-size: ${px}px; color: var(--uc-lock-accent, var(--primary-color));"
        icon="${iconName}"
      ></ha-icon>
    `;

    // Slide mode: unlock / open become sliders under the controls; Lock stays a button.
    const slideControls = () =>
      slideMode && hasActions
        ? html`<div class="uc-lock__slides">
            ${showLockBtns && !isUnlocked
              ? html`<uc-slide-confirm
                  .label=${localize('editor.lock.slide_to_unlock', lang, 'Slide to unlock')}
                  .icon=${'mdi:lock'}
                  .doneIcon=${'mdi:lock-open-variant'}
                  ?disabled=${controlsDisabled}
                  @confirmed=${() => onUnlock(true)}
                ></uc-slide-confirm>`
              : nothing}
            ${showOpen
              ? html`<uc-slide-confirm
                  .label=${localize('editor.lock.slide_to_open', lang, 'Slide to open')}
                  .icon=${'mdi:door-closed'}
                  .doneIcon=${'mdi:door-open'}
                  ?disabled=${controlsDisabled}
                  @confirmed=${() => onOpen(true)}
                ></uc-slide-confirm>`
              : nothing}
          </div>`
        : nothing;

    const actionBtns = () => slideMode
      ? html`${showLockBtns && isUnlocked
          ? html`<button
              type="button"
              class="uc-lock-btn"
              @click=${onLock}
              ?disabled=${controlsDisabled}
            >
              <ha-icon style="--mdc-icon-size: 18px;" icon="mdi:lock"></ha-icon>
              ${localize('editor.lock.action_lock', lang, 'Lock')}
            </button>`
          : nothing}`
      : html`
      ${showLockBtns
        ? html`<button
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
      </button>`
        : nothing}
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

    // Design tab text settings: colour and font go to the name and state, and a text
    // alignment of left / center / right moves the content like the Alignment option.
    const styled = lockCfg as LockWithDesign;
    const design: LockDesignText = { ...styled, ...(styled.design || {}) };
    const designAlign =
      design.text_align === 'left' || design.text_align === 'center' || design.text_align === 'right'
        ? design.text_align
        : '';
    const alignment = designAlign || lockCfg.alignment || 'center';
    const alignClass = alignment === 'center' ? '' : `uc-lock--align-${alignment}`;

    if (layout === 'hero') {
      content = html`
        <div class="uc-lock uc-lock--hero ${alignClass}">
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
          ${hasActions
            ? html`<div class="uc-lock__actions" role="group">${actionBtns()}</div>`
            : nothing}
          ${slideControls()}
        </div>
      `;
    } else if (layout === 'compact') {
      content = html`
        <div class="uc-lock uc-lock--compact ${alignClass}">
          <div class="uc-lock-compact__row">
            ${showIcon
              ? html`<div class="uc-lock-icon-well ${lockedVisual ? 'uc-lock-icon-well--locked' : ''} ${isJammed ? 'uc-lock-icon-well--jammed' : ''}">
                  ${lockIconEl(18)}
                </div>`
              : nothing}
            <span class="uc-lock-chip-label">
              ${showTitle
                ? html`<span class="uc-lock-chip-name">${name}</span>`
                : showState
                  ? html`<span class="uc-lock-chip-name">${stateLabel}</span>`
                  : nothing}
              ${showTitle && showState
                ? html`<span class="uc-lock-chip-state">${stateLabel}</span>`
                : nothing}
            </span>
            ${showLockBtns
              ? html`<button
                  type="button"
                  class="uc-lock-chip-btn ${lockedVisual ? '' : 'uc-lock-chip-btn--active'}"
                  @click=${isLocked ? onUnlock : onLock}
                  ?disabled=${controlsDisabled}
                >
                  ${isLocked
                    ? localize('editor.lock.action_unlock', lang, 'Unlock')
                    : localize('editor.lock.action_lock', lang, 'Lock')}
                </button>`
              : nothing}
          </div>
        </div>
      `;
    } else {
      content = html`
        <div class="uc-lock uc-lock--standard ${alignClass}">
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
            ${hasActions
              ? html`<div class="uc-lock-std__actions" role="group">${actionBtns()}</div>`
              : nothing}
          </div>
          ${slideControls()}
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

    const stateColor = lockedVisual ? lockCfg.locked_color : lockCfg.unlocked_color;
    const sizeValue = (v: unknown) => (/^\d+(\.\d+)?$/.test(String(v)) ? `${v}px` : String(v));
    const cssVars = [
      stateColor ? `--uc-lock-accent: ${stateColor}` : '',
      design.color ? `--uc-lock-text: ${design.color}` : '',
      design.font_size ? `--uc-lock-title-size: ${sizeValue(design.font_size)}` : '',
      design.font_weight ? `--uc-lock-title-weight: ${design.font_weight}` : '',
      design.font_family ? `--uc-lock-font: ${design.font_family}` : '',
    ]
      .filter(Boolean)
      .join('; ');

    return html`
      ${this.injectLockStyles()}
      <div
        class="uc-lock-wrapper ${hoverClass} ${isJammed ? 'uc-lock-wrapper--jammed' : ''} ${gestures.isActionable ? 'uc-lock-wrapper--actionable' : ''}"
        data-uc-role="pane"
        @pointerdown=${gestures.onPointerDown}
        @pointermove=${gestures.onPointerMove}
        @pointerup=${gestures.onPointerUp}
        @pointerleave=${gestures.onPointerLeave}
        @pointercancel=${gestures.onPointerCancel}
        @keydown=${gestures.onKeyDown}
        role=${gestures.isActionable ? 'button' : nothing}
        tabindex=${gestures.isActionable ? '0' : nothing}
        style="background: var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))); border: var(--uc-pane-border, none); box-shadow: var(--uc-pane-shadow, none); border-radius: var(--uc-r-18, 18px); overflow: hidden; ${cssVars}; ${styleStr}"
      >
        ${this.wrapWithAnimation(content, module, hass)}
      </div>
    `;
  }

  getStyles(): string {
    return `
      .uc-lock-wrapper { box-sizing: border-box; }
      .uc-lock-wrapper--actionable { cursor: pointer; }
      /* Sliders follow the locked / unlocked colour like the buttons do */
      .uc-lock-wrapper uc-slide-confirm { --uc-slide-accent: var(--uc-lock-accent, var(--primary-color)); }
      .uc-lock {
        box-sizing: border-box;
        color: var(--uc-lock-text, var(--primary-text-color));
        font-family: var(--uc-lock-font, inherit);
      }

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
        background: radial-gradient(circle, color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 12%, transparent) 0%, transparent 70%);
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
          color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 12%, var(--card-background-color, var(--ha-card-background))) 0%,
          color-mix(in srgb, var(--card-background-color, var(--ha-card-background)) 92%, var(--uc-lock-accent, var(--primary-color))) 100%
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
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 35%, transparent);
        box-shadow: inset 0 2px 16px rgba(0,0,0,0.14), 0 0 40px color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 12%, transparent);
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
      .uc-lock__slides {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
      }
      .uc-lock--hero .uc-lock__slides {
        max-width: 340px;
      }
      .uc-lock--hero .uc-lock__actions:empty {
        display: none;
      }
      .uc-lock--standard .uc-lock__slides {
        margin-top: 12px;
      }
      .uc-lock--hero.uc-lock--align-left { align-items: flex-start; }
      .uc-lock--hero.uc-lock--align-left .uc-lock__identity { align-items: flex-start; text-align: left; }
      .uc-lock--hero.uc-lock--align-right { align-items: flex-end; }
      .uc-lock--hero.uc-lock--align-right .uc-lock__identity { align-items: flex-end; text-align: right; }

      /* ═══ STANDARD (single row) ══════════════════ */
      .uc-lock--standard { padding: 14px 16px; }
      .uc-lock-std__row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
      }
      /* 140px basis: when the title can't get that much room (narrow cards), the
         action buttons wrap onto their own line instead of truncating the title. */
      .uc-lock-std__meta { flex: 1 1 140px; min-width: 0; overflow: hidden; }
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
      .uc-lock-title--std {
        font-size: var(--uc-lock-title-size, 0.9375rem);
        font-weight: var(--uc-lock-title-weight, 700);
      }
      .uc-lock-subtitle {
        margin: 3px 0 0;
        font-size: 0.8125rem;
        line-height: 1.35;
        color: var(--uc-lock-text, var(--secondary-text-color));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Left / Right pack the row to one side; the default spreads it across the card */
      .uc-lock--standard.uc-lock--align-left .uc-lock-std__meta,
      .uc-lock--standard.uc-lock--align-right .uc-lock-std__meta { flex: 0 1 auto; }
      .uc-lock--standard.uc-lock--align-right .uc-lock-std__row { justify-content: flex-end; }
      .uc-lock--standard.uc-lock--align-right .uc-lock-std__meta { text-align: right; }
      .uc-lock--compact.uc-lock--align-left .uc-lock-chip-label,
      .uc-lock--compact.uc-lock--align-right .uc-lock-chip-label { flex: 0 1 auto; }
      .uc-lock--compact.uc-lock--align-right .uc-lock-compact__row { justify-content: flex-end; }
      .uc-lock--compact.uc-lock--align-right .uc-lock-chip-label { text-align: right; }

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
        display: flex;
        flex-direction: column;
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--uc-lock-text, var(--primary-text-color));
        white-space: nowrap;
        overflow: hidden;
      }
      .uc-lock-chip-name {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .uc-lock-chip-state {
        font-size: 0.6875rem;
        font-weight: 500;
        color: var(--secondary-text-color);
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
        background: color-mix(in srgb, var(--divider-color) 8%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--primary-text-color);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s, color 0.15s;
      }
      .uc-lock-chip-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .uc-lock-chip-btn:focus-visible {
        outline: 2px solid var(--uc-lock-accent, var(--primary-color));
        outline-offset: 2px;
      }
      .uc-lock-chip-btn--active {
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 50%, transparent);
        background: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 14%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--uc-lock-accent, var(--primary-color));
      }

      /* ═══ SHARED ═════════════════════════════════ */
      .uc-lock-icon-well {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 8%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        border: 1px solid color-mix(in srgb, var(--divider-color) 55%, transparent);
        transition: box-shadow 0.2s ease, border-color 0.2s ease;
      }
      .uc-lock--compact .uc-lock-icon-well {
        width: 28px; height: 28px;
        background: transparent;
        border: none;
      }
      .uc-lock-icon-well--locked {
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 38%, transparent);
        box-shadow: 0 2px 14px color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 12%, transparent);
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
        font-size: var(--uc-lock-title-size, 1.25rem);
        font-weight: var(--uc-lock-title-weight, 800);
        letter-spacing: -0.02em;
        line-height: 1.25;
        color: var(--uc-lock-text, var(--primary-text-color));
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
        background: color-mix(in srgb, var(--divider-color) 15%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--secondary-text-color);
        border: 1px solid color-mix(in srgb, var(--divider-color) 35%, transparent);
      }
      .uc-lock-badge--locked {
        background: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 12%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--uc-lock-accent, var(--primary-color));
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 25%, transparent);
      }
      .uc-lock-badge--jammed {
        background: color-mix(in srgb, var(--error-color, #db4437) 12%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--error-color, #db4437);
        border-color: color-mix(in srgb, var(--error-color, #db4437) 25%, transparent);
      }
      .uc-lock-badge--unavail { opacity: 0.6; }
      .uc-lock-status-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--uc-lock-accent, var(--primary-color));
        box-shadow: 0 0 6px color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 60%, transparent);
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
        border-radius: var(--uc-r-14, 14px);
        cursor: pointer;
        border: 1.5px solid color-mix(in srgb, var(--divider-color) 60%, transparent);
        background: color-mix(in srgb, var(--divider-color) 6%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--primary-text-color);
        white-space: nowrap;
        transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s, transform 0.1s;
      }
      .uc-lock-btn:active:not(:disabled) { transform: scale(0.97); }
      .uc-lock-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .uc-lock-btn--active {
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 50%, transparent);
        background: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 14%, var(--uc-pane-bg, var(--card-background-color, var(--ha-card-background))));
        color: var(--uc-lock-accent, var(--primary-color));
      }
      .uc-lock-btn:hover:not(:disabled) {
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 30%, transparent);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 10%, transparent);
      }
      .uc-lock-btn:focus-visible {
        border-color: color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 30%, transparent);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--uc-lock-accent, var(--primary-color)) 10%, transparent);
        outline: 2px solid var(--uc-lock-accent, var(--primary-color));
        outline-offset: 2px;
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
