import { TemplateResult, html } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { BaseUltraModule, ModuleMetadata } from './base-module';
import { CardModule, TimerModule, UltraCardConfig, TimerDisplayStyle } from '../types';
import { localize } from '../localize/localize';
import { timerStateService } from '../services/timer-state-service';
import '../components/ultra-color-picker';

const DEFAULT_PRESETS = [300, 600, 900, 1800, 3600]; // 5m, 10m, 15m, 30m, 1h

function formatRemaining(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export class UltraTimerModule extends BaseUltraModule {
  metadata: ModuleMetadata = {
    type: 'timer',
    title: 'Timer',
    description: 'Countdown timer with optional action when time runs out',
    author: 'WJD Designs',
    version: '1.0.0',
    icon: 'mdi:timer-outline',
    category: 'interactive',
    tags: ['timer', 'countdown', 'kitchen', 'automation'],
  };

  createDefault(id?: string, hass?: HomeAssistant): TimerModule {
    return {
      id: id || this.generateId('timer'),
      type: 'timer',
      title: '',
      icon: 'mdi:timer-outline',
      duration_seconds: 300, // 5 min
      preset_durations: DEFAULT_PRESETS,
      style: 'circle',
      on_expire_action: { action: 'nothing' },
      show_snooze_dismiss: false,
      snooze_seconds: 300,
      tap_action: { action: 'nothing' },
      hold_action: { action: 'nothing' },
      double_tap_action: { action: 'nothing' },
      display_mode: 'always',
      display_conditions: [],
    };
  }

  private getStyleOptions(lang: string): Array<{ value: TimerDisplayStyle; label: string }> {
    return [
      { value: 'circle', label: localize('editor.timer.style.circle', lang, 'Circle') },
      { value: 'progress_bar', label: localize('editor.timer.style.progress_bar', lang, 'Progress Bar') },
      { value: 'digital', label: localize('editor.timer.style.digital', lang, 'Digital') },
      { value: 'background_fill', label: localize('editor.timer.style.background_fill', lang, 'Background Fill') },
    ];
  }

  renderGeneralTab(
    module: CardModule,
    hass: HomeAssistant,
    config: UltraCardConfig,
    updateModule: (updates: Partial<CardModule>) => void
  ): TemplateResult {
    const timerModule = module as TimerModule;
    const lang = hass?.locale?.language || 'en';

    return html`
      ${this.injectUcFormStyles()}
      <div class="general-tab">
        <!-- Basic -->
        ${this.renderSettingsSection(
          localize('editor.timer.basic.title', lang, 'Basic'),
          localize('editor.timer.basic.desc', lang, 'Title and icon for the timer.'),
          [
            {
              title: localize('editor.timer.title', lang, 'Title'),
              description: localize('editor.timer.title_desc', lang, 'Optional label (e.g. Kitchen, Door close)'),
              hass,
              data: { title: timerModule.title || '' },
              schema: [this.textField('title')],
              onChange: (e: CustomEvent) => updateModule({ ...e.detail.value }),
            },
            {
              title: localize('editor.timer.icon', lang, 'Icon'),
              description: localize('editor.timer.icon_desc', lang, 'Icon for the timer'),
              hass,
              data: { icon: timerModule.icon || 'mdi:timer-outline' },
              schema: [this.iconField('icon')],
              onChange: (e: CustomEvent) => updateModule({ ...e.detail.value }),
            },
          ]
        )}

        <!-- Duration -->
        <div class="settings-section">
          <div class="section-title">${localize('editor.timer.duration.title', lang, 'Duration')}</div>
          <div class="section-description" style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;">
            ${localize('editor.timer.duration.desc', lang, 'Default duration when Start is pressed.')}
          </div>
          ${this.renderFieldSection(
            localize('editor.timer.duration_seconds', lang, 'Default duration (seconds)'),
            localize('editor.timer.duration_seconds_desc', lang, 'e.g. 300 = 5 minutes'),
            hass,
            { duration_seconds: timerModule.duration_seconds ?? 300 },
            [this.numberField('duration_seconds', 1, 86400)],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
        </div>

        <!-- When timer ends -->
        <div class="settings-section">
          <div class="section-title">${localize('editor.timer.on_expire.title', lang, 'When timer ends')}</div>
          <div class="section-description" style="margin-bottom: 16px; color: var(--secondary-text-color); font-size: 14px;">
            ${localize('editor.timer.on_expire.desc', lang, 'Action to run when the countdown reaches zero (e.g. turn off light, close cover).')}
          </div>
          <ha-form
            .hass=${hass}
            .data=${{ on_expire_action: timerModule.on_expire_action || { action: 'nothing' } }}
            .schema=${[{ name: 'on_expire_action', selector: { ui_action: {} } }]}
            .computeLabel=${(schema: { name: string }) =>
              hass.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`) || 'Action'}
            @value-changed=${(e: CustomEvent) => {
              const val = e.detail.value?.on_expire_action;
              if (val) updateModule({ on_expire_action: val });
              setTimeout(() => this.triggerPreviewUpdate(), 50);
            }}
          ></ha-form>
        </div>

        <!-- Display style -->
        ${this.renderFieldSection(
          localize('editor.timer.style.title', lang, 'Display style'),
          localize('editor.timer.style.desc', lang, 'How the timer is shown'),
          hass,
          { style: timerModule.style || 'circle' },
          [this.selectField('style', this.getStyleOptions(lang))],
          (e: CustomEvent) => {
            updateModule(e.detail.value);
            setTimeout(() => this.triggerPreviewUpdate(), 50);
          }
        )}

        <!-- Advanced -->
        <div class="settings-section">
          <div class="section-title">${localize('editor.timer.advanced.title', lang, 'Advanced')}</div>
          ${this.renderFieldSection(
            localize('editor.timer.timer_entity', lang, 'Timer entity'),
            localize('editor.timer.timer_entity_desc', lang, 'Optional Home Assistant timer entity to sync with'),
            hass,
            { timer_entity: timerModule.timer_entity || '' },
            [this.entityField('timer_entity')],
            (e: CustomEvent) => updateModule(e.detail.value)
          )}
          <div style="margin-top: 16px;">
            <div class="field-title" style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">
              ${localize('editor.timer.show_snooze_dismiss', lang, 'Show Snooze / Dismiss when expired')}
            </div>
            <div class="field-description" style="font-size: 13px; color: var(--secondary-text-color); margin-bottom: 8px;">
              ${localize('editor.timer.show_snooze_dismiss_desc', lang, 'When the timer ends, show Snooze (restart) and Dismiss buttons.')}
            </div>
            <ha-switch
              .checked=${!!timerModule.show_snooze_dismiss}
              @change=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                updateModule({ show_snooze_dismiss: target.checked });
                setTimeout(() => this.triggerPreviewUpdate(), 50);
              }}
            ></ha-switch>
          </div>
          ${timerModule.show_snooze_dismiss
            ? this.renderFieldSection(
                localize('editor.timer.snooze_seconds', lang, 'Snooze duration (seconds)'),
                localize('editor.timer.snooze_seconds_desc', lang, 'Restart countdown for this many seconds when Snooze is tapped'),
                hass,
                { snooze_seconds: timerModule.snooze_seconds ?? 300 },
                [this.numberField('snooze_seconds', 1, 3600)],
                (e: CustomEvent) => updateModule(e.detail.value)
              )
            : ''}
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
    const timerModule = module as TimerModule;
    const state = timerStateService.getState(timerModule.id);
    const status = state?.status ?? 'idle';
    const remaining = state?.remaining_seconds ?? 0;
    const duration = Math.max(1, timerModule.duration_seconds ?? 300);
    const presets = timerModule.preset_durations ?? DEFAULT_PRESETS;
    const style = timerModule.style || 'circle';
    const icon = timerModule.icon || 'mdi:timer-outline';
    const title = timerModule.title || localize('editor.timer.default_title', hass?.locale?.language || 'en', 'Timer');
    const showSnoozeDismiss = !!timerModule.show_snooze_dismiss;
    const snoozeSeconds = timerModule.snooze_seconds ?? 300;

    const onExpire = () => {
      const action = timerModule.on_expire_action;
      const actionType = (action as { action?: string })?.action;
      if (action && actionType !== 'nothing' && actionType !== 'none') {
        this.handleModuleAction(action as any, hass, undefined, config, undefined, module);
      }
    };

    const start = (seconds: number) => {
      timerStateService.start(timerModule.id, seconds, onExpire);
    };

    const content = (() => {
      if (status === 'expired') {
        return html`
          <div class="uc-timer uc-timer-expired" style="padding: 16px; text-align: center;">
            <ha-icon icon="${icon}" style="font-size: 48px; color: var(--primary-color); margin-bottom: 8px;"></ha-icon>
            <div class="uc-timer-title" style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 16px; color: var(--primary-color); margin-bottom: 16px;">
              ${localize('editor.timer.times_up', hass?.locale?.language || 'en', "Time's up!")}
            </div>
            ${showSnoozeDismiss
              ? html`
                  <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <ha-button
                      @click=${() => {
                        timerStateService.snooze(timerModule.id, snoozeSeconds);
                      }}
                    >
                      ${localize('editor.timer.snooze', hass?.locale?.language || 'en', 'Snooze')}
                    </ha-button>
                    <ha-button
                      outlined
                      @click=${() => timerStateService.dismiss(timerModule.id)}
                    >
                      ${localize('editor.timer.dismiss', hass?.locale?.language || 'en', 'Dismiss')}
                    </ha-button>
                  </div>
                `
              : html`
                  <ha-button outlined @click=${() => timerStateService.dismiss(timerModule.id)}>
                    ${localize('editor.timer.dismiss', hass?.locale?.language || 'en', 'Dismiss')}
                  </ha-button>
                `}
          </div>
        `;
      }

      if (status === 'idle') {
        return html`
          <div class="uc-timer uc-timer-idle" style="padding: 16px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
              <ha-icon icon="${icon}" style="font-size: 28px; color: var(--primary-color);"></ha-icon>
              <span class="uc-timer-title" style="font-size: 16px; font-weight: 600;">${title}</span>
            </div>
            <div style="font-size: 24px; font-weight: 600; margin-bottom: 16px; color: var(--primary-text-color);">
              ${formatRemaining(duration)}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; justify-content: center;">
              ${presets.map(
                sec =>
                  html`
                    <ha-button
                      dense
                      @click=${() => start(sec)}
                    >
                      ${sec < 3600 ? `${sec / 60}m` : `${sec / 3600}h`}
                    </ha-button>
                  `
              )}
            </div>
            <ha-button raised style="width: 100%;" @click=${() => start(duration)}>
              ${localize('editor.timer.start', hass?.locale?.language || 'en', 'Start')}
            </ha-button>
          </div>
        `;
      }

      // running or paused
      const progress = duration > 0 ? 1 - remaining / duration : 0;
      const progressPct = Math.min(1, Math.max(0, progress)) * 100;

      return html`
        <div class="uc-timer uc-timer-running" style="padding: 16px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
            <ha-icon icon="${icon}" style="font-size: 24px; color: var(--primary-color);"></ha-icon>
            <span class="uc-timer-title" style="font-size: 14px; font-weight: 600;">${title}</span>
          </div>
          ${status === 'paused'
            ? html`<div style="font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px;">${localize('editor.timer.paused', hass?.locale?.language || 'en', 'Paused')}</div>`
            : ''}

          ${style === 'circle'
            ? html`
                <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 16px;">
                  <svg viewBox="0 0 36 36" style="width: 100%; height: 100%; transform: rotate(-90deg);">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--divider-color)" stroke-width="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="var(--primary-color)"
                      stroke-width="3"
                      stroke-dasharray="${100} ${100}"
                      stroke-dashoffset="${100 - progressPct}"
                      stroke-linecap="round"
                      style="transition: stroke-dashoffset 0.3s ease;"
                    />
                  </svg>
                  <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: var(--primary-text-color);">
                    ${formatRemaining(remaining)}
                  </div>
                </div>
              `
            : style === 'progress_bar'
              ? html`
                  <div style="margin-bottom: 16px;">
                    <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">
                      ${formatRemaining(remaining)}
                    </div>
                    <div style="height: 12px; background: var(--divider-color); border-radius: 6px; overflow: hidden;">
                      <div
                        style="height: 100%; width: ${progressPct}%; background: var(--primary-color); border-radius: 6px; transition: width 0.3s ease;"
                      ></div>
                    </div>
                  </div>
                `
              : style === 'background_fill'
                ? html`
                    <div
                      style="
                        position: relative;
                        min-height: 80px;
                        border-radius: 12px;
                        background: var(--divider-color);
                        overflow: hidden;
                        margin-bottom: 16px;
                      "
                    >
                      <div
                        style="
                          position: absolute;
                          bottom: 0;
                          left: 0;
                          right: 0;
                          height: ${progressPct}%;
                          background: var(--primary-color);
                          opacity: 0.4;
                          transition: height 0.3s ease;
                        "
                      ></div>
                      <div style="position: relative; padding: 16px; font-size: 28px; font-weight: 700; color: var(--primary-text-color);">
                        ${formatRemaining(remaining)}
                      </div>
                    </div>
                  `
                : html`
                    <div style="font-size: 36px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px; text-align: center;">
                      ${formatRemaining(remaining)}
                    </div>
                  `}

          <div style="display: flex; gap: 8px; justify-content: center;">
            ${status === 'running'
              ? html`
                  <ha-button outlined @click=${() => timerStateService.pause(timerModule.id)}>
                    ${localize('editor.timer.pause', hass?.locale?.language || 'en', 'Pause')}
                  </ha-button>
                `
              : html`
                  <ha-button @click=${() => timerStateService.resume(timerModule.id)}>
                    ${localize('editor.timer.resume', hass?.locale?.language || 'en', 'Resume')}
                  </ha-button>
                `}
            <ha-button outlined @click=${() => timerStateService.reset(timerModule.id)}>
              ${localize('editor.timer.cancel', hass?.locale?.language || 'en', 'Cancel')}
            </ha-button>
          </div>
        </div>
      `;
    })();

    return html`
      <div class="uc-timer-wrapper" style="background: var(--card-background-color); border-radius: 12px; overflow: hidden;">
        ${content}
      </div>
    `;
  }

  validate(module: CardModule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!module.id) errors.push('Module ID is required');
    if (!module.type || module.type !== 'timer') errors.push('Module type must be timer');
    const tm = module as TimerModule;
    if (tm.duration_seconds !== undefined && (tm.duration_seconds < 1 || tm.duration_seconds > 86400)) {
      errors.push('Duration must be between 1 and 86400 seconds');
    }
    return { valid: errors.length === 0, errors };
  }
}
