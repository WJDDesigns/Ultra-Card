import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant } from 'custom-card-helpers';
import { localize } from '../localize/localize';

/**
 * A dedicated component for bar module left/right side actions.
 * This isolates the ha-form with ui_action selector to prevent
 * re-render issues that cause browser freezes.
 */
@customElement('bar-side-actions')
export class BarSideActions extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public side!: 'left' | 'right';
  @property({ attribute: false }) public tapAction: any = { action: 'nothing' };
  @property({ attribute: false }) public holdAction: any = { action: 'nothing' };
  @property({ attribute: false }) public doubleTapAction: any = { action: 'nothing' };

  @state() private _tapAction: any = { action: 'nothing' };
  @state() private _holdAction: any = { action: 'nothing' };
  @state() private _doubleTapAction: any = { action: 'nothing' };

  static styles = css`
    :host {
      display: block;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(var(--rgb-primary-color, 3, 169, 244), 0.2);
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--primary-color);
    }

    .section-description {
      font-size: 12px;
      margin-bottom: 12px;
      color: var(--secondary-text-color);
    }

    .action-field {
      margin-bottom: 12px;
    }

    .action-field:last-child {
      margin-bottom: 0;
    }
  `;

  protected willUpdate(changedProps: Map<string, unknown>): void {
    // Sync internal state when props change from parent
    if (changedProps.has('tapAction')) {
      this._tapAction = this.tapAction || { action: 'nothing' };
    }
    if (changedProps.has('holdAction')) {
      this._holdAction = this.holdAction || { action: 'nothing' };
    }
    if (changedProps.has('doubleTapAction')) {
      this._doubleTapAction = this.doubleTapAction || { action: 'nothing' };
    }
  }

  private _fireUpdate(updates: Record<string, any>): void {
    this.dispatchEvent(
      new CustomEvent('actions-changed', {
        detail: { side: this.side, updates },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleTapActionChanged(e: CustomEvent): void {
    e.stopPropagation();
    const key = `${this.side}_tap_action`;
    const newAction = e.detail.value[key];
    this._tapAction = newAction;
    this.requestUpdate();
    this._fireUpdate({ [`${this.side}_tap_action`]: newAction });
  }

  private _handleHoldActionChanged(e: CustomEvent): void {
    e.stopPropagation();
    const key = `${this.side}_hold_action`;
    const newAction = e.detail.value[key];
    this._holdAction = newAction;
    this.requestUpdate();
    this._fireUpdate({ [`${this.side}_hold_action`]: newAction });
  }

  private _handleDoubleTapActionChanged(e: CustomEvent): void {
    e.stopPropagation();
    const key = `${this.side}_double_tap_action`;
    const newAction = e.detail.value[key];
    this._doubleTapAction = newAction;
    this.requestUpdate();
    this._fireUpdate({ [`${this.side}_double_tap_action`]: newAction });
  }

  protected render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    const lang = this.hass.locale?.language || 'en';
    const sideKey = this.side === 'left' ? 'left' : 'right';
    const tapKey = `${this.side}_tap_action`;
    const holdKey = `${this.side}_hold_action`;
    const doubleTapKey = `${this.side}_double_tap_action`;

    return html`
      <div class="section-title">
        ${localize(
          `editor.bar.${sideKey}.actions`,
          lang,
          `${this.side === 'left' ? 'Left' : 'Right'} Side Actions`
        )}
      </div>
      <div class="section-description">
        ${localize(
          `editor.bar.${sideKey}.actions_desc`,
          lang,
          `Configure what happens when tapping the ${this.side} side info`
        )}
      </div>

      <div class="action-field">
        <ha-form
          .hass=${this.hass}
          .data=${{ [tapKey]: this._tapAction }}
          .schema=${[
            {
              name: tapKey,
              selector: { ui_action: {} },
            },
          ]}
          .computeLabel=${() =>
            this.hass.localize('ui.panel.lovelace.editor.card.generic.tap_action')}
          @value-changed=${this._handleTapActionChanged}
        ></ha-form>
      </div>

      <div class="action-field">
        <ha-form
          .hass=${this.hass}
          .data=${{ [holdKey]: this._holdAction }}
          .schema=${[
            {
              name: holdKey,
              selector: { ui_action: {} },
            },
          ]}
          .computeLabel=${() =>
            this.hass.localize('ui.panel.lovelace.editor.card.generic.hold_action')}
          @value-changed=${this._handleHoldActionChanged}
        ></ha-form>
      </div>

      <div class="action-field">
        <ha-form
          .hass=${this.hass}
          .data=${{ [doubleTapKey]: this._doubleTapAction }}
          .schema=${[
            {
              name: doubleTapKey,
              selector: { ui_action: {} },
            },
          ]}
          .computeLabel=${() =>
            this.hass.localize('ui.panel.lovelace.editor.card.generic.double_tap_action')}
          @value-changed=${this._handleDoubleTapActionChanged}
        ></ha-form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bar-side-actions': BarSideActions;
  }
}
