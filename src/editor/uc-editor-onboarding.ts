import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { localize } from '../localize/localize';
import {
  ONBOARDING_STEPS,
  OnboardingStepId,
  OnboardingState,
  ucEditorOnboardingService,
} from '../services/uc-editor-onboarding-service';

export type OnboardingAction =
  | 'add_row'
  | 'add_module'
  | 'pick_entity'
  | 'preview_breakpoints'
  | 'dismiss'
  | 'open_presets';

@customElement('uc-editor-onboarding')
export class UcEditorOnboarding extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public state: OnboardingState = ucEditorOnboardingService.getState();

  static override styles = css`
    :host {
      display: block;
      margin: 8px 4px 4px 12px;
    }

    .banner {
      padding: 14px 16px;
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      border: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-text-color);
    }

    .dismiss {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      color: var(--secondary-text-color);
      border-radius: 4px;
    }

    .steps {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--primary-text-color);
    }

    .step.done {
      color: var(--secondary-text-color);
      text-decoration: line-through;
      opacity: 0.75;
    }

    .step-icon {
      --mdc-icon-size: 18px;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .step.done .step-icon {
      color: var(--success-color, #4caf50);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      background: var(--primary-color);
      color: var(--text-primary-color, white);
    }

    .action-btn.secondary {
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      border: 1px solid var(--divider-color);
    }

    .action-btn ha-icon {
      --mdc-icon-size: 16px;
    }

    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.4;
    }
  `;

  private _lang(): string {
    return this.hass?.locale?.language || 'en';
  }

  private _emit(action: OnboardingAction): void {
    this.dispatchEvent(
      new CustomEvent('onboarding-action', {
        detail: { action },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _stepLabel(id: OnboardingStepId): string {
    const lang = this._lang();
    const map: Record<OnboardingStepId, [string, string]> = {
      add_row: ['editor.onboarding.step_add_row', 'Add a row'],
      add_module: ['editor.onboarding.step_add_module', 'Add a module'],
      pick_entity: ['editor.onboarding.step_pick_entity', 'Pick an entity (optional)'],
      preview_breakpoints: [
        'editor.onboarding.step_preview_breakpoints',
        'Preview breakpoints',
      ],
    };
    const [key, fallback] = map[id];
    return localize(key, lang, fallback);
  }

  private _nextAction(): { action: OnboardingAction; label: string; icon: string } | null {
    const lang = this._lang();
    for (const step of ONBOARDING_STEPS) {
      if (this.state.completedSteps.includes(step.id)) continue;
      switch (step.id) {
        case 'add_row':
          return {
            action: 'add_row',
            label: localize('editor.onboarding.action_add_row', lang, 'Add Row'),
            icon: 'mdi:plus-circle-outline',
          };
        case 'add_module':
          return {
            action: 'add_module',
            label: localize('editor.onboarding.action_add_module', lang, 'Add Module'),
            icon: 'mdi:puzzle-plus-outline',
          };
        case 'pick_entity':
          return {
            action: 'pick_entity',
            label: localize('editor.onboarding.action_pick_entity', lang, 'Open Module Settings'),
            icon: 'mdi:eye-outline',
          };
        case 'preview_breakpoints':
          return {
            action: 'preview_breakpoints',
            label: localize(
              'editor.onboarding.action_preview_breakpoints',
              lang,
              'Try Breakpoint Preview'
            ),
            icon: 'mdi:responsive',
          };
      }
    }
    return null;
  }

  protected override render(): TemplateResult {
    const lang = this._lang();
    const next = this._nextAction();

    return html`
      <div class="banner" role="region" aria-label=${localize('editor.onboarding.title', lang, 'Getting Started')}>
        <div class="header">
          <span class="title">${localize('editor.onboarding.title', lang, 'Getting Started')}</span>
          <button
            class="dismiss"
            @click=${() => this._emit('dismiss')}
            aria-label=${localize('editor.onboarding.dismiss', lang, "Don't show again")}
            title=${localize('editor.onboarding.dismiss', lang, "Don't show again")}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>

        <p class="hint">
          ${localize(
            'editor.onboarding.subtitle',
            lang,
            'Follow these steps to build your first Ultra Card layout.'
          )}
        </p>

        <ul class="steps">
          ${ONBOARDING_STEPS.map(step => {
            const done = this.state.completedSteps.includes(step.id);
            return html`
              <li class="step ${done ? 'done' : ''}">
                <ha-icon
                  class="step-icon"
                  icon=${done ? 'mdi:check-circle' : 'mdi:circle-outline'}
                ></ha-icon>
                <span>${this._stepLabel(step.id)}</span>
              </li>
            `;
          })}
        </ul>

        <div class="actions">
          ${next
            ? html`
                <button class="action-btn" @click=${() => this._emit(next.action)}>
                  <ha-icon icon=${next.icon}></ha-icon>
                  ${next.label}
                </button>
              `
            : ''}
          <button class="action-btn secondary" @click=${() => this._emit('open_presets')}>
            <ha-icon icon="mdi:palette-swatch-variant"></ha-icon>
            ${localize('editor.onboarding.action_preset', lang, 'Start from a Preset')}
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-editor-onboarding': UcEditorOnboarding;
  }
}
