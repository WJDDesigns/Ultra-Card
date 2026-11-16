import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * `<uc-spinner>` — loading indicator that works on every Home Assistant version.
 *
 * Replaces `<ha-circular-progress>`, which Home Assistant removed from its
 * frontend in 2026 (it became `<ha-spinner>`), so loading states rendered as
 * nothing on current HA.
 */
export class UcSpinner extends LitElement {
  @property({ reflect: true }) size: 'tiny' | 'small' | 'medium' | 'large' = 'medium';

  static override styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      --uc-spinner-size: 36px;
    }
    :host([size='tiny']) {
      --uc-spinner-size: 16px;
    }
    :host([size='small']) {
      --uc-spinner-size: 24px;
    }
    :host([size='large']) {
      --uc-spinner-size: 48px;
    }
    span {
      display: block;
      box-sizing: border-box;
      width: var(--uc-spinner-size);
      height: var(--uc-spinner-size);
      border-radius: 50%;
      border: calc(var(--uc-spinner-size) / 8) solid
        var(--uc-spinner-track-color, rgba(127, 127, 127, 0.25));
      border-top-color: var(--uc-spinner-color, var(--primary-color, #03a9f4));
      animation: uc-spin 0.9s linear infinite;
    }
    @keyframes uc-spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      span {
        animation-duration: 2.5s;
      }
    }
  `;

  protected override render() {
    return html`<span role="progressbar" aria-label="Loading"></span>`;
  }
}

if (!customElements.get('uc-spinner')) {
  customElements.define('uc-spinner', UcSpinner);
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-spinner': UcSpinner;
  }
}
