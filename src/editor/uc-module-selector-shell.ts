/**
 * Module selector popup shell: overlay, header, tab bar, and slot for body.
 * Lazy-loaded when "Add Module" is opened to reduce initial layout-tab bundle.
 */
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type ModuleSelectorTab = 'modules' | 'cards' | 'presets' | 'favorites';

@customElement('uc-module-selector-shell')
export class UcModuleSelectorShell extends LitElement {
  @property({ type: Boolean }) isAddingToLayoutModule = false;
  @property() activeTab: ModuleSelectorTab = 'modules';

  @state() private _dragState: {
    isDragging: boolean;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  } = { isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 };

  @state() private _resizeState: {
    active: boolean;
    startY: number;
    startHeight: number;
  } = { active: false, startY: 0, startHeight: 0 };

  private _popupEl: HTMLElement | null = null;
  private _boundDragMove = (e: MouseEvent) => this._onDragMove(e);
  private _boundDragEnd = () => this._onDragEnd();
  private _boundResizeMove = (e: MouseEvent) => this._onResizeMove(e);
  private _boundResizeEnd = () => this._onResizeEnd();

  static override styles = css`
    .module-selector-popup {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .module-selector-popup > * {
      pointer-events: auto;
    }
    .popup-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      pointer-events: auto;
      cursor: default;
    }
    .selector-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      width: min(90vw, 720px);
      max-height: min(85vh, 700px);
      background: var(--card-background-color, #fff);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      pointer-events: auto;
    }
    .selector-content.popup-dragging {
      cursor: grabbing;
    }
    .selector-header-wrapper {
      flex-shrink: 0;
    }
    .selector-header {
      padding: 16px;
      cursor: grab;
      user-select: none;
    }
    .selector-header:active {
      cursor: grabbing;
    }
    .selector-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .selector-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 4px;
      color: var(--secondary-text-color);
    }
    .close-button:hover {
      color: var(--primary-text-color);
    }
    .selector-subtitle {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .module-selector-tabs {
      display: flex;
      gap: 4px;
      padding: 0 16px 12px;
    }
    .tab-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
      border-radius: 8px;
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
    }
    .tab-button:hover {
      background: var(--secondary-background-color);
    }
    .tab-button.active {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
      color: var(--primary-color);
    }
    .tab-button ha-icon {
      --mdc-icon-size: 18px;
    }
    .selector-body {
      flex: 1;
      overflow-y: auto;
      padding: 0 16px 16px;
      min-height: 200px;
    }
    .resize-handle {
      flex-shrink: 0;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: ns-resize;
      background: var(--secondary-background-color, #f5f5f5);
      color: var(--secondary-text-color);
    }
    .resize-handle ha-icon {
      --mdc-icon-size: 16px;
    }
  `;

  private _dispatchClose(): void {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _dispatchTabChange(tab: ModuleSelectorTab): void {
    this.dispatchEvent(
      new CustomEvent('tab-change', {
        detail: { tab },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _startDrag(e: MouseEvent): void {
    this._popupEl = (e.target as HTMLElement).closest('.selector-content') as HTMLElement;
    if (!this._popupEl) return;
    e.preventDefault();
    const rect = this._popupEl.getBoundingClientRect();
    this._popupEl.style.marginLeft = '0';
    this._popupEl.style.marginTop = '0';
    this._popupEl.style.left = `${rect.left}px`;
    this._popupEl.style.top = `${rect.top}px`;
    this._dragState = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
    };
    document.addEventListener('mousemove', this._boundDragMove);
    document.addEventListener('mouseup', this._boundDragEnd);
    this._popupEl.classList.add('popup-dragging');
  }

  private _onDragMove(e: MouseEvent): void {
    if (!this._dragState.isDragging || !this._popupEl?.isConnected) {
      this._onDragEnd();
      return;
    }
    const dx = e.clientX - this._dragState.startX;
    const dy = e.clientY - this._dragState.startY;
    const newLeft = this._dragState.initialLeft + dx;
    const newTop = this._dragState.initialTop + dy;
    const maxLeft = window.innerWidth - this._popupEl.offsetWidth;
    const maxTop = window.innerHeight - this._popupEl.offsetHeight;
    this._popupEl.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
    this._popupEl.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
  }

  private _onDragEnd(): void {
    this._popupEl?.classList.remove('popup-dragging');
    this._popupEl = null;
    this._dragState = { isDragging: false, startX: 0, startY: 0, initialLeft: 0, initialTop: 0 };
    document.removeEventListener('mousemove', this._boundDragMove);
    document.removeEventListener('mouseup', this._boundDragEnd);
  }

  private _startResize(e: MouseEvent): void {
    const popup = (e.target as HTMLElement).closest('.selector-content') as HTMLElement;
    if (!popup) return;
    e.preventDefault();
    e.stopPropagation();
    this._resizeState = {
      active: true,
      startY: e.clientY,
      startHeight: popup.offsetHeight,
    };
    document.addEventListener('mousemove', this._boundResizeMove);
    document.addEventListener('mouseup', this._boundResizeEnd);
  }

  private _onResizeMove(e: MouseEvent): void {
    if (!this._resizeState.active) return;
    const popup = this.shadowRoot?.querySelector('.selector-content') as HTMLElement;
    if (!popup) return;
    const dy = e.clientY - this._resizeState.startY;
    const newHeight = Math.max(200, this._resizeState.startHeight + dy);
    popup.style.maxHeight = `${newHeight}px`;
  }

  private _onResizeEnd(): void {
    this._resizeState = { active: false, startY: 0, startHeight: 0 };
    document.removeEventListener('mousemove', this._boundResizeMove);
    document.removeEventListener('mouseup', this._boundResizeEnd);
  }

  override render() {
    return html`
      <div class="module-selector-popup">
        <div
          class="popup-overlay"
          @click=${this._dispatchClose}
        ></div>
        <div class="selector-content draggable-popup" id="module-selector-popup">
          <div class="selector-header-wrapper">
            <div
              class="selector-header"
              @mousedown=${(e: MouseEvent) => this._startDrag(e)}
            >
              <div class="selector-header-top">
                <h3>Add Module</h3>
                <button
                  class="close-button"
                  title="Close"
                  @mousedown=${(e: Event) => e.stopPropagation()}
                  @click=${this._dispatchClose}
                >
                  ×
                </button>
              </div>
              ${this.isAddingToLayoutModule
                ? html`<p class="selector-subtitle">
                    Adding to layout module (content modules and layout modules allowed up to 2
                    levels deep)
                  </p>`
                : ''}
            </div>
            <div class="module-selector-tabs">
              <button
                class="tab-button ${this.activeTab === 'modules' ? 'active' : ''}"
                @click=${() => this._dispatchTabChange('modules')}
              >
                <ha-icon icon="mdi:puzzle"></ha-icon>
                <span>Modules</span>
              </button>
              <button
                class="tab-button ${this.activeTab === 'cards' ? 'active' : ''}"
                @click=${() => this._dispatchTabChange('cards')}
              >
                <ha-icon icon="mdi:card-multiple"></ha-icon>
                <span>Cards</span>
              </button>
              <button
                class="tab-button ${this.activeTab === 'presets' ? 'active' : ''}"
                @click=${() => this._dispatchTabChange('presets')}
              >
                <ha-icon icon="mdi:palette"></ha-icon>
                <span>Presets</span>
              </button>
              <button
                class="tab-button ${this.activeTab === 'favorites' ? 'active' : ''}"
                @click=${() => this._dispatchTabChange('favorites')}
              >
                <ha-icon icon="mdi:heart"></ha-icon>
                <span>Favorites</span>
              </button>
            </div>
          </div>
          <div class="selector-body">
            <slot></slot>
          </div>
          <div
            class="resize-handle"
            @mousedown=${(e: MouseEvent) => this._startResize(e)}
            title="Drag to resize"
          >
            <ha-icon icon="mdi:resize-bottom-right"></ha-icon>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'uc-module-selector-shell': UcModuleSelectorShell;
  }
}
