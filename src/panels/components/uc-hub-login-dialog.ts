/**
 * Ultra Card Hub — Login / Register dialog
 * Shown from the sidebar header. Offers integration CTA, direct JWT login, and register link.
 */

import { LitElement, html, css, TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { ucCloudAuthService, CloudUser } from '../../services/uc-cloud-auth-service';

export class UcHubLoginDialog extends LitElement {
  @state() private _username = '';
  @state() private _password = '';
  @state() private _loading = false;
  @state() private _error = '';

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

    .login-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .login-field label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }

    .login-field input {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.2));
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      box-sizing: border-box;
    }

    .login-field input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .login-submit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 6px;
      border: none;
      background: var(--primary-color);
      color: var(--primary-text-color);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 4px;
    }

    .login-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-submit ha-icon {
      --mdc-icon-size: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-spin {
      animation: spin 0.8s linear infinite;
    }

    .login-error {
      font-size: 12px;
      color: var(--error-color, #db4437);
      margin-top: 4px;
    }

    .login-register {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    .login-register a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }

    .login-register a:hover {
      text-decoration: underline;
    }
  `;

  private _close() {
    this._username = '';
    this._password = '';
    this._error = '';
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _handleSubmit(e: Event) {
    e.preventDefault();
    if (!this._username.trim() || !this._password) {
      this._error = 'Please enter username and password';
      return;
    }

    this._loading = true;
    this._error = '';

    try {
      const user = await ucCloudAuthService.login({
        username: this._username.trim(),
        password: this._password,
      });
      this._username = '';
      this._password = '';
      this.dispatchEvent(
        new CustomEvent('auth-success', {
          detail: { user },
          bubbles: true,
          composed: true,
        })
      );
      this._close();
    } catch (err) {
      this._error = err instanceof Error ? err.message : 'Login failed';
    } finally {
      this._loading = false;
    }
  }

  protected render(): TemplateResult {
    return html`
      <ha-dialog open @closed=${this._close} .heading=${'Sign in to Ultra Card'}>
        <div class="login-dialog-content">
          <div class="login-section">
            <p class="login-section-title">Recommended</p>
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

          <form class="login-section" @submit=${this._handleSubmit}>
            <p class="login-section-title">Sign in directly</p>
            <div class="login-field">
              <label for="uc-hub-login-username">Username or email</label>
              <input
                id="uc-hub-login-username"
                type="text"
                .value=${this._username}
                @input=${(e: Event) => {
                  this._username = (e.target as HTMLInputElement).value;
                  this._error = '';
                }}
                autocomplete="username"
                ?disabled=${this._loading}
              />
            </div>
            <div class="login-field">
              <label for="uc-hub-login-password">Password</label>
              <input
                id="uc-hub-login-password"
                type="password"
                .value=${this._password}
                @input=${(e: Event) => {
                  this._password = (e.target as HTMLInputElement).value;
                  this._error = '';
                }}
                autocomplete="current-password"
                ?disabled=${this._loading}
              />
            </div>
            ${this._error ? html`<p class="login-error">${this._error}</p>` : ''}
            <button type="submit" class="login-submit" ?disabled=${this._loading}>
              ${this._loading
                ? html`<ha-icon icon="mdi:loading" class="login-spin"></ha-icon> Signing in…`
                : html`<ha-icon icon="mdi:login"></ha-icon> Sign In`}
            </button>
          </form>

          <div class="login-divider"></div>

          <p class="login-register">
            New here?
            <a href="https://ultracard.io/register" target="_blank" rel="noopener">Create an account</a>
            at ultracard.io
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
