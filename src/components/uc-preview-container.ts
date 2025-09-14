import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('uc-preview-container')
export class UcPreviewContainer extends LitElement {
  @property({ type: String }) alignment: 'left' | 'center' | 'right' = 'center';
  @property({ type: Number }) minHeight: number = 160;
  @property({ type: Number }) height: number = 200;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .container {
      width: 100%;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .inner {
      width: 100%;
      height: 100%;
      display: block;
    }
    .slot-wrapper {
      width: 100%;
      height: 100%;
      display: flex; /* Align slotted content horizontally */
      align-items: center; /* Vertical centering */
      justify-content: inherit; /* Defer to outer container's alignment */
    }
    ::slotted(*) {
      max-width: 100%;
    }
  `;

  private getJustify(): string {
    switch (this.alignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      default:
        return 'center';
    }
  }

  render() {
    const style = `height:${Math.max(this.height, this.minHeight)}px;`;
    const justify = this.getJustify();
    return html`
      <div class="container" style=${style}>
        <div class="inner">
          <div class="slot-wrapper" style="justify-content:${justify}">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-preview-container': UcPreviewContainer;
  }
}
