import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uc-lock-overlay')
export class UcLockOverlay extends LitElement {
  @property({ type: String }) message: string = 'Pro Feature';

  static styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      z-index: 10;
      pointer-events: all;
      user-select: none;
    }
    .msg {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 10px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    ha-icon {
      --mdc-icon-size: 18px;
      color: white;
    }
  `;

  render() {
    return html`
      <div class="msg">
        <ha-icon icon="mdi:lock"></ha-icon>
        <span>${this.message}</span>
      </div>
    `;
  }
}
