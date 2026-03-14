/**
 * Ultra Card Hub — Login / Register dialog
 * Routes users to the Ultra Card Connect integration or the hub Account tab only.
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import '../../services/uc-cloud-auth-service';

export class UcHubLoginDialog extends LitElement {

  static styles = css`
    .login-dialog-content {
      padding: 8px 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .login-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .login-section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--secondary-text-color);
      margin: 0 0 4px 0;
    }

    .login-section-desc {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .login-cta-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      background: var(--primary-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.15s ease;
    }

    .login-cta-btn:hover {
      opacity: 0.9;
    }

    .login-cta-btn ha-icon {
      --mdc-icon-size: 18px;
    }

    .login-divider {
      height: 1px;
      background: var(--divider-color, rgba(0, 0, 0, 0.08));
      margin: 4px 0;
    }

    .login-note {
      font-size: 13px;
      color: var(--secondary-text-color);
      line-height: 1.5;
      margin: 0;
    }

    .login-note a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .login-note a:hover {
      text-decoration: underline;
    }
  `;

  private _close() {
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    return html`
      <ha-dialog open @closed=${this._close} .heading=${'Sign in to Ultra Card'}>
        <div class="login-dialog-content">
          <div class="login-section">
            <p class="login-section-title">Connect with Ultra Card Connect</p>
            <p class="login-section-desc">
              The fastest way to connect — installs in 30 seconds. Syncs across all your devices.
            </p>
            <a
              class="login-cta-btn"
              href="/config/integrations/integration/ultra_card_pro_cloud"
              target="_top"
            >
              <ha-icon icon="mdi:cog"></ha-icon>
              Configure Ultra Card Connect
            </a>
          </div>

          <div class="login-divider"></div>

          <p class="login-note">
            Already have the integration? Open the <strong>Account</strong> tab in the Ultra Card hub to sign in or create an account.
          </p>
        </div>
      </ha-dialog>
    `;
  }
}

// Guard against double-registration: this component is shared between
// ultra-card.js (main card bundle) and ultra-card-panel.js (sidebar panel bundle).
// Without the guard, the second bundle to load throws a DOMException that crashes
// the custom elements registry and shows "Configuration error" on every card.
if (!customElements.get('uc-hub-login-dialog')) {
  customElements.define('uc-hub-login-dialog', UcHubLoginDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-hub-login-dialog': UcHubLoginDialog;
  }
}
