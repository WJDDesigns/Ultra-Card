/**
 * Ultra Card Pro Cloud Connection Indicator
 *
 * Shows animated connection status when Ultra Card Pro Cloud integration is detected
 *
 * States:
 * - connecting: Animated dots flowing from HA icon to cloud
 * - connected: Green checkmark on cloud with success animation
 * - disconnected: Cloud icon with X overlay
 */

import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('uc-connection-indicator')
export class UcConnectionIndicator extends LitElement {
  @property({ type: String }) status: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  @property({ type: Boolean }) compact = false;

  @state() private _showSuccess = false;

  static styles = css`
    :host {
      display: inline-block;
      --indicator-primary: var(--primary-color, #03a9f4);
      --indicator-success: var(--success-color, #4caf50);
      --indicator-error: var(--error-color, #f44336);
      --indicator-text: var(--primary-text-color, #212121);
    }

    .indicator-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .indicator-container.compact {
      padding: 8px 12px;
      gap: 6px;
    }

    .icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon.compact {
      width: 20px;
      height: 20px;
    }

    .icon svg {
      width: 100%;
      height: 100%;
    }

    .ha-icon {
      fill: var(--indicator-primary);
    }

    .cloud-icon {
      fill: var(--indicator-text);
    }

    .cloud-icon.connected {
      fill: var(--indicator-success);
    }

    .cloud-icon.disconnected {
      fill: var(--indicator-error);
    }

    .dots-container {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: var(--indicator-primary);
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 0.3;
        transform: scale(0.8);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
    }

    .status-text {
      font-size: 14px;
      font-weight: 500;
      color: var(--indicator-text);
    }

    .status-text.compact {
      font-size: 12px;
    }

    .checkmark {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--indicator-success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      top: -2px;
      right: -2px;
      animation: pop 0.3s ease-out;
    }

    @keyframes pop {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }

    .checkmark svg {
      width: 8px;
      height: 8px;
      fill: white;
    }

    .icon-wrapper {
      position: relative;
    }

    .glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      background: radial-gradient(circle, var(--indicator-success) 0%, transparent 70%);
      border-radius: 50%;
      opacity: 0;
      animation: glow 2s ease-out;
    }

    @keyframes glow {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
      }
      50% {
        opacity: 0.6;
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.5);
      }
    }
  `;

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('status') && this.status === 'connected') {
      this._showSuccess = true;
      setTimeout(() => {
        this._showSuccess = false;
      }, 2000);
    }
  }

  render(): TemplateResult {
    return html`
      <div class="indicator-container ${this.compact ? 'compact' : ''}">
        ${this._renderIcon('ha')} ${this._renderConnection()} ${this._renderIcon('cloud')}
        ${!this.compact
          ? html`<span class="status-text ${this.compact ? 'compact' : ''}"
              >${this._getStatusText()}</span
            >`
          : ''}
      </div>
    `;
  }

  private _renderIcon(type: 'ha' | 'cloud'): TemplateResult {
    const iconClass = `icon ${this.compact ? 'compact' : ''}`;

    if (type === 'ha') {
      return html`
        <div class="${iconClass}">
          <svg class="ha-icon" viewBox="0 0 24 24">
            <path d="M12,3L2,12H5V20H19V12H22L12,3M11,8H13V11H16V13H13V16H11V13H8V11H11V8Z" />
          </svg>
        </div>
      `;
    }

    // Cloud icon with status
    const cloudClass = `cloud-icon ${this.status}`;
    const showCheckmark = this.status === 'connected' && this._showSuccess;

    return html`
      <div class="icon-wrapper ${iconClass}">
        ${showCheckmark ? html`<div class="glow"></div>` : ''}
        <svg class="${cloudClass}" viewBox="0 0 24 24">
          <path
            d="M19.35,10.04C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.04C2.34,8.36 0,10.91 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.04Z"
          />
        </svg>
        ${showCheckmark
          ? html`
              <div class="checkmark">
                <svg viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
              </div>
            `
          : ''}
        ${this.status === 'disconnected'
          ? html`
              <div class="checkmark" style="background: var(--indicator-error);">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                  />
                </svg>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _renderConnection(): TemplateResult {
    if (this.status === 'connecting') {
      return html`
        <div class="dots-container">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      `;
    }

    return html`<div style="width: 24px;"></div>`;
  }

  private _getStatusText(): string {
    switch (this.status) {
      case 'connecting':
        return 'Connecting to Cloud...';
      case 'connected':
        return 'Cloud Connected';
      case 'disconnected':
        return 'Not Connected';
      default:
        return '';
    }
  }
}
